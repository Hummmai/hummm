import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Loader2, Download, Play, CheckCircle, AlertTriangle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AgentRow {
  id: string;
  agent_name: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  notes: string | null;
  scraped_at: string;
}

export default function ScrapeAgents() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate("/auth");
        return;
      }
      fetchAgents();
    });
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("uk_estate_agents" as any)
      .select("*")
      .order("agent_name");
    setAgents((data as any as AgentRow[]) || []);
    setLoading(false);
  };

  const runScrape = async () => {
    setScraping(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke(
        "scrape-uk-estate-agents",
        { body: {} }
      );
      if (error) throw error;
      setResult(data);
      toast({
        title: `Scrape complete ✓`,
        description: `${data.scraped} agents scraped, ${data.saved} saved. ${data.errors} errors.`,
      });
      fetchAgents();
    } catch (err: any) {
      toast({
        title: "Scrape failed",
        description: err.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setScraping(false);
    }
  };

  const exportCSV = () => {
    if (!agents.length) return;
    const headers = [
      "Agent Name",
      "Email",
      "Phone",
      "Address",
      "Website",
      "Notes",
      "Scraped At",
    ];
    const rows = agents.map((a) => [
      a.agent_name,
      a.email || "",
      a.phone || "",
      a.address || "",
      a.website || "",
      a.notes || "",
      a.scraped_at,
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uk-estate-agents-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV downloaded ✓" });
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast({ title: "Email copied ✓" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="UK Estate Agent Scraper | Hummm"
        description="Scrape and manage UK estate agent contact details"
        canonical="/scrape-agents"
      />
      <Navbar />

      <div className="pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              UK Estate Agent Scraper
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Firecrawl-powered tool to extract agent contact details from major
              UK estate agency websites. Ethical, rate-limited, and robots.txt
              respectful.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={runScrape}
              disabled={scraping}
              className="gap-2"
            >
              {scraping ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Play size={16} />
              )}
              {scraping ? "Scraping…" : "Scrape UK Agents"}
            </Button>
            <Button
              variant="outline"
              onClick={exportCSV}
              disabled={!agents.length}
              className="gap-2"
            >
              <Download size={16} />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Scrape result summary */}
        {result && (
          <Card className="p-4 mb-6 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-3 flex-wrap text-sm">
              <CheckCircle size={18} className="text-primary" />
              <span className="font-bold">Scrape Summary:</span>
              <span>
                {result.scraped}/{result.total_targets} scraped
              </span>
              <span>•</span>
              <span>{result.saved} saved to database</span>
              {result.errors > 0 && (
                <>
                  <span>•</span>
                  <span className="text-destructive flex items-center gap-1">
                    <AlertTriangle size={14} />
                    {result.errors} error(s)
                  </span>
                </>
              )}
            </div>
            {result.error_details?.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                {result.error_details.map((e: string, i: number) => (
                  <div key={i}>• {e}</div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Progress indicator */}
        {scraping && (
          <Card className="p-6 mb-6 text-center">
            <Loader2 size={32} className="animate-spin text-primary mx-auto mb-3" />
            <p className="font-semibold">Scraping in progress…</p>
            <p className="text-sm text-muted-foreground mt-1">
              This may take 30–60 seconds. Each site is scraped with a 2-second
              delay to respect rate limits.
            </p>
          </Card>
        )}

        {/* Agents table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : agents.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              No agents scraped yet. Click "Scrape UK Agents" to start.
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="hidden lg:table-cell">Notes</TableHead>
                  <TableHead>Scraped</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-semibold whitespace-nowrap">
                      {a.agent_name}
                    </TableCell>
                    <TableCell>
                      {a.email ? (
                        <button
                          onClick={() => copyEmail(a.email!)}
                          className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                        >
                          {a.email}
                          <Copy size={12} />
                        </button>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {a.phone || "—"}
                    </TableCell>
                    <TableCell>
                      {a.website ? (
                        <a
                          href={a.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs"
                        >
                          Visit
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                      {a.notes || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(a.scraped_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="px-4 py-3 border-t text-xs text-muted-foreground">
              {agents.length} agent(s) in database
            </div>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}
