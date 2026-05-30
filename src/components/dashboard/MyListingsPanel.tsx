import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Home, Mail, Eye, Tag, Plus, Sparkles } from "lucide-react";

interface Listing {
  id: string;
  address: string;
  listing_intent: string;
  live_status: string;
  asking_price: string | null;
  enquiries_count: number;
  viewings_count: number;
  offers_count: number;
  created_at: string;
}

export default function MyListingsPanel() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("property_listings")
        .select("id,address,listing_intent,live_status,asking_price,enquiries_count,viewings_count,offers_count,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setListings((data as any) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Sparkles size={16} className="text-primary" /> My Listings
          </h3>
          <p className="text-xs text-muted-foreground">Properties Hummm AI is managing for you</p>
        </div>
        <div className="flex gap-2">
          <Link to="/sell-my-property" className="text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-full border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center gap-1.5">
            <Plus size={12} /> Sell
          </Link>
          <Link to="/let-my-property" className="text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-full border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center gap-1.5">
            <Plus size={12} /> Let
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : listings.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-border rounded-2xl">
          <Home size={28} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-semibold mb-1">No active listings yet</p>
          <p className="text-xs text-muted-foreground mb-4">Hummm AI can list and manage your property end-to-end.</p>
          <div className="flex gap-2 justify-center">
            <Link to="/sell-my-property" className="text-xs font-bold px-4 py-2 rounded-full bg-primary text-primary-foreground">Sell My Property</Link>
            <Link to="/let-my-property" className="text-xs font-bold px-4 py-2 rounded-full border border-primary/40 text-primary">Let My Property</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-border/60 bg-background/40 hover:border-primary/40 transition">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                    {l.listing_intent === "let" ? "To Let" : "For Sale"}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                    {l.live_status}
                  </span>
                </div>
                <p className="text-sm font-bold truncate">{l.address}</p>
                {l.asking_price && <p className="text-xs text-muted-foreground">{l.asking_price}</p>}
              </div>
              <div className="hidden sm:flex items-center gap-4 text-xs">
                <Stat icon={Mail} label="Enquiries" value={l.enquiries_count} />
                <Stat icon={Eye} label="Viewings" value={l.viewings_count} />
                <Stat icon={Tag} label="Offers" value={l.offers_count} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Icon size={12} className="text-primary" />
      <span className="font-bold text-foreground tabular-nums">{value}</span>
      <span className="hidden md:inline">{label}</span>
    </div>
  );
}