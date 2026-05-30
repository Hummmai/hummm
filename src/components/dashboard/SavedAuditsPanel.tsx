import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Trash2, CheckSquare, Square, MapPin, Star, BarChart3, X, Bed, Bath, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SavedAudit {
  id: string;
  property_url: string;
  address: string | null;
  postcode: string | null;
  asking_price: number | null;
  currency: string | null;
  humm_fair_value: number | null;
  ai_score: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  property_type: string | null;
  images: string[] | null;
  status: string;
  created_at: string;
}

function formatPrice(amount: number, currency = "GBP") {
  const s: Record<string, string> = { GBP: "£", USD: "$", SGD: "S$", EUR: "€" };
  return `${s[currency] || currency + " "}${amount.toLocaleString()}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

interface Props { onOpenAudit?: (url: string) => void; maxAudits?: number; }

export default function SavedAuditsPanel({ onOpenAudit, maxAudits }: Props) {
  const { toast } = useToast();
  const [audits, setAudits] = useState<SavedAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => { fetchAudits(); }, []);

  const fetchAudits = async () => {
    setLoading(true);
    const { data } = await supabase.from("saved_audits").select("*").order("created_at", { ascending: false });
    if (data) setAudits(data as SavedAudit[]);
    setLoading(false);
  };

  const filtered = audits.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.address?.toLowerCase().includes(q) || a.postcode?.toLowerCase().includes(q);
  });

  const displayAudits = maxAudits ? filtered.slice(0, maxAudits) : filtered;
  const isLimited = maxAudits != null && filtered.length > maxAudits;

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleDelete = async (ids: string[]) => {
    for (const id of ids) await supabase.from("saved_audits").delete().eq("id", id);
    setAudits(p => p.filter(a => !ids.includes(a.id)));
    setSelected(new Set());
    toast({ title: "Removed", description: `${ids.length} audit(s) deleted.` });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20">
        <Loader2 size={28} className="animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading saved audits…</p>
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="flex-1">
          <h2 className="text-lg font-black">Saved Audits</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{audits.length} propert{audits.length === 1 ? "y" : "ies"} audited</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by address or postcode…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Multi-select toolbar (hidden for free tier) */}
      {!maxAudits && selected.size >= 2 && (
        <div className="mb-6 p-4 rounded-2xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in duration-200">
          <p className="text-sm font-bold flex-1">{selected.size} properties selected</p>
          <div className="flex gap-3">
            <button onClick={() => setShowCompare(true)} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-2">
              <BarChart3 size={14} /> Compare Selected
            </button>
            <button onClick={() => handleDelete(Array.from(selected))} className="px-5 py-2.5 rounded-xl border border-destructive/30 text-destructive text-xs font-bold hover:bg-destructive/10 transition-colors flex items-center gap-2">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Compare overlay */}
      {showCompare && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black">Compare Properties</h2>
                <p className="text-xs text-muted-foreground mt-1">{selected.size} properties selected</p>
              </div>
              <button onClick={() => setShowCompare(false)} className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-4">
              {audits.filter(a => selected.has(a.id)).map(a => (
                <div key={a.id} className="w-[280px] shrink-0 rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="h-40 bg-muted/30">
                    {a.images?.[0] ? <img src={a.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><MapPin size={28} /></div>}
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="text-sm font-black truncate">{a.address || "Property"}</h3>
                    {a.postcode && <p className="text-[11px] text-muted-foreground">{a.postcode}</p>}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-border/50"><span className="text-muted-foreground">Asking</span><span className="font-bold">{a.asking_price ? formatPrice(a.asking_price, a.currency || "GBP") : "—"}</span></div>
                      <div className="flex justify-between py-1.5 border-b border-border/50"><span className="text-muted-foreground">Fair Value</span><span className="font-bold text-primary">{a.humm_fair_value ? formatPrice(a.humm_fair_value, a.currency || "GBP") : "—"}</span></div>
                      <div className="flex justify-between py-1.5 border-b border-border/50"><span className="text-muted-foreground">AI Score</span><span className="font-bold">{a.ai_score ?? "—"}/100</span></div>
                      <div className="flex justify-between py-1.5 border-b border-border/50"><span className="text-muted-foreground">Beds</span><span className="font-bold">{a.bedrooms ?? "—"}</span></div>
                      <div className="flex justify-between py-1.5"><span className="text-muted-foreground">Baths</span><span className="font-bold">{a.bathrooms ?? "—"}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl">
          <MapPin size={40} className="mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-sm font-bold mb-1">{audits.length === 0 ? "No saved audits yet" : "No results found"}</p>
          <p className="text-xs text-muted-foreground">Drop a property link to start auditing.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayAudits.map((a) => (
              <div
                key={a.id}
                onClick={() => onOpenAudit?.(a.property_url)}
                className={`relative rounded-2xl border overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-[0_8px_30px_-8px_hsl(168_100%_45%/0.15)] ${selected.has(a.id) ? "border-primary/60 ring-1 ring-primary/20" : "border-border bg-card"}`}
              >
                {!maxAudits && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelect(a.id); }}
                    className="absolute top-3 left-3 z-10 w-8 h-8 rounded-lg border border-border bg-background/80 backdrop-blur-sm flex items-center justify-center hover:border-primary/50 transition-colors"
                  >
                    {selected.has(a.id) ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} className="text-muted-foreground" />}
                  </button>
                )}

                {a.ai_score != null && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-black backdrop-blur-sm ${a.ai_score >= 80 ? "text-emerald-400 border-emerald-400/30 bg-emerald-950/80" : a.ai_score >= 60 ? "text-amber-400 border-amber-400/30 bg-amber-950/80" : "text-red-400 border-red-400/30 bg-red-950/80"}`}>
                      <Star size={10} /> {a.ai_score}
                    </span>
                  </div>
                )}

                <div className="h-44 bg-muted/30 overflow-hidden">
                  {a.images?.[0] ? (
                    <img src={a.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/20"><MapPin size={32} /></div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-sm font-black truncate mb-0.5">{a.address || "Property"}</h3>
                  {a.postcode && <p className="text-[11px] text-muted-foreground mb-3">{a.postcode}</p>}
                  <div className="flex items-center gap-3 text-xs mb-3">
                    {a.asking_price != null && a.asking_price > 0 && <span className="font-bold">{formatPrice(a.asking_price, a.currency || "GBP")}</span>}
                    {a.humm_fair_value != null && <span className="text-primary font-bold">FV: {formatPrice(a.humm_fair_value, a.currency || "GBP")}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      {a.bedrooms != null && <span className="flex items-center gap-1"><Bed size={12} />{a.bedrooms}</span>}
                      {a.bathrooms != null && <span className="flex items-center gap-1"><Bath size={12} />{a.bathrooms}</span>}
                      {a.property_type && <span className="capitalize">{a.property_type}</span>}
                    </div>
                    <span className="text-[10px] text-muted-foreground/60">{formatDate(a.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isLimited && (
            <div className="mt-6 text-center py-6 rounded-2xl border border-dashed border-primary/30 bg-primary/[0.03]">
              <p className="text-sm font-bold text-foreground mb-1">
                Showing {maxAudits} of {filtered.length} saved audits
              </p>
              <p className="text-xs text-muted-foreground">
                Upgrade to Expert or Pro to view all your saved properties.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
