import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useHumm } from "@/contexts/HummContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search, Trash2, ExternalLink, Plus, Loader2, MapPin, Bed, Home, PoundSterling } from "lucide-react";

type SavedSearch = {
  id: string;
  label: string | null;
  postcode: string;
  max_price: number | null;
  bedrooms: number | null;
  property_type: string | null;
  created_at: string;
};

const PROPERTY_TYPES = ["any", "flat", "house", "hmo"];
const BEDROOM_OPTIONS = [1, 2, 3, 4, 5, 6];

export default function SavedSearches() {
  const { isLoggedIn, userId } = useHumm();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBedrooms, setMinBedrooms] = useState("1");
  const [propertyType, setPropertyType] = useState("any");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth?redirect=/saved-searches", { replace: true });
      return;
    }
    fetchSearches();
  }, [isLoggedIn]);

  const fetchSearches = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("saved_searches")
      .select("id, label, postcode, max_price, bedrooms, property_type, created_at")
      .order("created_at", { ascending: false });
    setSearches((data as SavedSearch[]) || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!location.trim()) {
      toast({ title: "Location required", variant: "destructive" });
      return;
    }
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase.from("saved_searches").insert({
      user_id: userId,
      label: name.trim() || location.trim(),
      postcode: location.trim(),
      max_price: maxPrice ? parseInt(maxPrice) : null,
      bedrooms: parseInt(minBedrooms),
      property_type: propertyType === "any" ? null : propertyType,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Search saved" });
      setName("");
      setLocation("");
      setMaxPrice("");
      setMinBedrooms("1");
      setPropertyType("any");
      fetchSearches();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("saved_searches").delete().eq("id", id);
    setSearches((prev) => prev.filter((s) => s.id !== id));
    toast({ title: "Search deleted" });
  };

  const handleFindMatches = (s: SavedSearch) => {
    const params = new URLSearchParams();
    if (s.postcode) params.set("location", s.postcode);
    if (s.max_price) params.set("max_price", s.max_price.toString());
    if (s.bedrooms) params.set("bedrooms", s.bedrooms.toString());
    if (s.property_type) params.set("property_type", s.property_type);
    navigate(`/properties?${params.toString()}`);
  };

  const summaryFor = (s: SavedSearch) => {
    const parts: string[] = [];
    if (s.postcode) parts.push(s.postcode);
    if (s.bedrooms) parts.push(`${s.bedrooms}+ bed`);
    if (s.property_type) parts.push(s.property_type);
    if (s.max_price) parts.push(`≤ £${s.max_price.toLocaleString()}`);
    return parts.join(" · ") || "All properties";
  };

  return (
    <>
      <SEOHead title="Saved Searches | Humm" description="Manage your property search alerts." noindex />
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-2xl font-bold text-foreground">Saved Searches</h1>

          {/* ── Create form ── */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">New Search</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Search name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Location / postcode *" value={location} onChange={(e) => setLocation(e.target.value)} />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">£</span>
                <Input type="number" placeholder="Max price" className="pl-7" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>
              <select
                value={minBedrooms}
                onChange={(e) => setMinBedrooms(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                {BEDROOM_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}+ bedrooms</option>
                ))}
              </select>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t === "any" ? "Any type" : t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>

            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Save Search
            </Button>
          </div>

          {/* ── List ── */}
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-primary" /></div>
          ) : searches.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No saved searches yet.</p>
          ) : (
            <div className="space-y-3">
              {searches.map((s) => (
                <div key={s.id} className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{s.label || "Untitled"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{summaryFor(s)}</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">
                      {new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleFindMatches(s)}>
                      <ExternalLink size={14} /> Find matches
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(s.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
