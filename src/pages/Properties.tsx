import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import AnimatedSection from "@/components/AnimatedSection";
import { Search, BedDouble, Bath, Maximize, Sparkles, LayoutGrid, Map, ArrowRight, MapPin, TreePine, Car, SlidersHorizontal, X, Zap, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

import prop1 from "@/assets/properties/property-1.jpg";
import prop2 from "@/assets/properties/property-2.jpg";
import prop3 from "@/assets/properties/property-3.jpg";
import prop4 from "@/assets/properties/property-4.jpg";
import prop5 from "@/assets/properties/property-5.jpg";
import prop6 from "@/assets/properties/property-6.jpg";
import prop7 from "@/assets/properties/property-7.jpg";
import prop8 from "@/assets/properties/property-8.jpg";
import prop9 from "@/assets/properties/property-9.jpg";

type ListingType = "sale" | "rent";
type SortOption = "newest" | "price-asc" | "price-desc";

interface Property {
  id: number;
  image: string;
  price: number;
  address: string;
  location: string;
  beds: number;
  baths: number;
  sqft: number;
  type: string;
  listingType: ListingType;
  isPerMonth?: boolean;
  hasGarden?: boolean;
  hasParking?: boolean;
  isNewBuild?: boolean;
  epcRating?: string;
}

const properties: Property[] = [
  { id: 1, image: prop1, price: 425000, address: "14 Oakwood Drive, Didsbury", location: "Manchester, M20 2TG", beds: 4, baths: 2, sqft: 1850, type: "Detached", listingType: "sale", hasGarden: true, hasParking: true, epcRating: "B" },
  { id: 2, image: prop2, price: 1450, address: "Apt 12, The Quarter, Deansgate", location: "Manchester, M3 4LQ", beds: 2, baths: 2, sqft: 920, type: "Flat", listingType: "rent", isPerMonth: true, hasParking: true, epcRating: "C" },
  { id: 3, image: prop3, price: 685000, address: "27 Victoria Terrace, Clapham", location: "London, SW4 6HT", beds: 3, baths: 2, sqft: 1420, type: "Terraced", listingType: "sale", hasGarden: true, epcRating: "C" },
  { id: 4, image: prop4, price: 375000, address: "8 Birch Lane, Edgbaston", location: "Birmingham, B15 3ES", beds: 4, baths: 3, sqft: 2100, type: "Semi-Detached", listingType: "sale", hasGarden: true, hasParking: true, epcRating: "B" },
  { id: 5, image: prop5, price: 289950, address: "Plot 7, Millbrook Gardens", location: "Leeds, LS6 3HN", beds: 3, baths: 2, sqft: 1100, type: "Townhouse", listingType: "sale", hasParking: true, isNewBuild: true, epcRating: "A" },
  { id: 6, image: prop6, price: 550000, address: "Rose Cottage, Mill Lane", location: "Cotswolds, GL54 1AB", beds: 3, baths: 1, sqft: 1350, type: "House", listingType: "sale", hasGarden: true, epcRating: "D" },
  { id: 7, image: prop7, price: 3200, address: "Penthouse 1, Sky Tower", location: "London, E14 5AB", beds: 3, baths: 2, sqft: 1800, type: "Flat", listingType: "rent", isPerMonth: true, hasParking: true, epcRating: "B" },
  { id: 8, image: prop8, price: 265000, address: "Sunnyside, Park Avenue", location: "Solihull, B91 3QT", beds: 2, baths: 1, sqft: 950, type: "Bungalow", listingType: "sale", hasGarden: true, hasParking: true, epcRating: "C" },
  { id: 9, image: prop9, price: 495000, address: "12 Elm Road, West Bridgford", location: "Nottingham, NG2 7PL", beds: 4, baths: 2, sqft: 1650, type: "Detached", listingType: "sale", hasGarden: true, hasParking: true, isNewBuild: true, epcRating: "A" },
];

const typeOptions = ["House", "Flat", "Bungalow", "Terraced", "Semi-Detached", "Detached", "Townhouse"];
const epcOptions = ["A", "B", "C", "D", "E"];

const fmt = (price: number, pm?: boolean) =>
  pm ? `£${price.toLocaleString()} pcm` : `£${price.toLocaleString()}`;

const SALE_PRICE_MAX = 1000000;
const RENT_PRICE_MAX = 5000;

const Properties = () => {
  const [q, setQ] = useState("");
  const [listing, setListing] = useState<ListingType>("sale");
  const [types, setTypes] = useState<string[]>([]);
  const [beds, setBeds] = useState(0);
  const [baths, setBaths] = useState(0);
  const [sort, setSort] = useState<SortOption>("newest");
  const [view, setView] = useState<"grid" | "map">("grid");
  const [garden, setGarden] = useState(false);
  const [parking, setParking] = useState(false);
  const [newBuild, setNewBuild] = useState(false);
  const [epc, setEpc] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const maxPrice = listing === "sale" ? SALE_PRICE_MAX : RENT_PRICE_MAX;
  const priceStep = listing === "sale" ? 25000 : 100;

  const toggle = (t: string) => setTypes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const toggleEpc = (r: string) => setEpc(p => p.includes(r) ? p.filter(x => x !== r) : [...p, r]);

  const activeCount = types.length + (beds > 0 ? 1 : 0) + (baths > 0 ? 1 : 0) + (garden ? 1 : 0) + (parking ? 1 : 0) + (newBuild ? 1 : 0) + epc.length + (priceMin > 0 ? 1 : 0) + (priceMax > 0 ? 1 : 0);

  const clearAll = () => {
    setTypes([]); setBeds(0); setBaths(0); setGarden(false); setParking(false); setNewBuild(false); setEpc([]); setPriceMin(0); setPriceMax(0);
  };

  const results = useMemo(() => {
    let r = [...properties.filter(p => p.listingType === listing)];
    if (q.trim()) { const s = q.toLowerCase(); r = r.filter(p => p.address.toLowerCase().includes(s) || p.location.toLowerCase().includes(s)); }
    if (types.length) r = r.filter(p => types.includes(p.type));
    if (beds > 0) r = r.filter(p => p.beds >= beds);
    if (baths > 0) r = r.filter(p => p.baths >= baths);
    if (garden) r = r.filter(p => p.hasGarden);
    if (parking) r = r.filter(p => p.hasParking);
    if (newBuild) r = r.filter(p => p.isNewBuild);
    if (epc.length) r = r.filter(p => p.epcRating && epc.includes(p.epcRating));
    if (priceMin > 0) r = r.filter(p => p.price >= priceMin);
    if (priceMax > 0) r = r.filter(p => p.price <= priceMax);
    if (sort === "price-asc") r.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") r.sort((a, b) => b.price - a.price);
    return r;
  }, [q, listing, types, beds, baths, sort, garden, parking, newBuild, epc, priceMin, priceMax]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Properties For Sale & To Let | Hummm — Property Powered by AI."
        description="Browse AI-priced properties for sale and to let across the UK. Smart search powered by Hummm — property powered by AI."
        canonical="/properties"
      />
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-10 md:pt-36 md:pb-14 overflow-hidden" style={{ backgroundColor: "#0A1428" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 90% 60% at 50% -15%, rgba(0,229,204,0.12) 0%, transparent 65%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 40% at 80% 80%, rgba(0,229,204,0.04) 0%, transparent 60%)" }} />

        <div className="relative z-10 section-padding max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5" style={{ border: "1px solid rgba(0,229,204,0.2)", backgroundColor: "rgba(0,229,204,0.06)" }}>
              <Sparkles size={13} className="text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">AI-Powered Search</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] mb-3 text-balance text-foreground">
              Discover Properties with Hummm
            </h1>
            <p className="text-sm md:text-base max-w-lg mb-8 text-muted-foreground">
              Smart search powered by AI. Find homes for sale and to let across the UK.
            </p>
          </AnimatedSection>

          {/* Search bar */}
          <AnimatedSection delay={80}>
            <div className="max-w-2xl">
              <div className="flex rounded-2xl overflow-hidden border border-border" style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.35)" }}>
                <div className="flex-1 flex items-center gap-3 px-5 py-4 bg-card/60">
                  <Search size={18} className="text-primary shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by location or postcode (e.g. Manchester M20 or London SW1)"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
                <button className="px-8 text-sm font-bold shrink-0 transition-all hover:brightness-110 bg-primary text-primary-foreground">
                  Search
                </button>
              </div>
            </div>
          </AnimatedSection>

          {/* ── Filter bar ── */}
          <AnimatedSection delay={140}>
            <div className="mt-6 rounded-2xl bg-card/30 border border-border/50 p-4" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
              {/* Top row */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Sale / Rent toggle */}
                <div className="inline-flex rounded-xl overflow-hidden border border-border">
                  {(["sale", "rent"] as ListingType[]).map(t => (
                    <button key={t} onClick={() => { setListing(t); setPriceMin(0); setPriceMax(0); }}
                      className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all ${listing === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                      {t === "sale" ? "For Sale" : "To Let"}
                    </button>
                  ))}
                </div>

                <span className="w-px h-5 hidden md:block bg-border" />

                {/* Beds */}
                <div className="inline-flex rounded-xl overflow-hidden border border-border">
                  {[{ l: "Beds", v: 0 }, { l: "1+", v: 1 }, { l: "2+", v: 2 }, { l: "3+", v: 3 }, { l: "4+", v: 4 }].map(o => (
                    <button key={o.v} onClick={() => setBeds(o.v)}
                      className={`px-3.5 py-2.5 text-[11px] font-semibold transition-all ${beds === o.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                      {o.l}
                    </button>
                  ))}
                </div>

                {/* Baths */}
                <div className="inline-flex rounded-xl overflow-hidden border border-border">
                  {[{ l: "Baths", v: 0 }, { l: "1+", v: 1 }, { l: "2+", v: 2 }, { l: "3+", v: 3 }].map(o => (
                    <button key={o.v} onClick={() => setBaths(o.v)}
                      className={`px-3.5 py-2.5 text-[11px] font-semibold transition-all ${baths === o.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                      {o.l}
                    </button>
                  ))}
                </div>

                <span className="w-px h-5 hidden md:block bg-border" />

                {/* More filters toggle */}
                <button onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-semibold rounded-xl transition-all border ${showFilters ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground border-border hover:text-foreground"}`}>
                  <SlidersHorizontal size={13} /> Filters {activeCount > 0 && <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">{activeCount}</span>}
                </button>

                {/* Sort — pushed right */}
                <select value={sort} onChange={e => setSort(e.target.value as SortOption)}
                  className="ml-auto px-4 py-2.5 text-[11px] font-medium rounded-xl outline-none cursor-pointer bg-card/60 text-muted-foreground border border-border">
                  <option value="newest" className="bg-card">Newest First</option>
                  <option value="price-asc" className="bg-card">Price: Low–High</option>
                  <option value="price-desc" className="bg-card">Price: High–Low</option>
                </select>
              </div>

              {/* Expandable filters panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-border/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Property type chips */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Property Type</p>
                    <div className="flex flex-wrap gap-2">
                      {typeOptions.map(t => (
                        <button key={t} onClick={() => toggle(t)}
                          className={`px-4 py-1.5 text-[11px] font-semibold rounded-full transition-all border ${types.includes(t) ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price range */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Min Price</p>
                      <div className="flex items-center gap-3">
                        <input type="range" min={0} max={maxPrice} step={priceStep} value={priceMin}
                          onChange={e => setPriceMin(Number(e.target.value))}
                          className="flex-1 h-1.5 rounded-full appearance-none bg-border accent-primary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(0,229,204,0.4)]" />
                        <span className="text-xs font-semibold text-foreground tabular-nums min-w-[80px] text-right">
                          {priceMin === 0 ? "Any" : `£${priceMin.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Max Price</p>
                      <div className="flex items-center gap-3">
                        <input type="range" min={0} max={maxPrice} step={priceStep} value={priceMax}
                          onChange={e => setPriceMax(Number(e.target.value))}
                          className="flex-1 h-1.5 rounded-full appearance-none bg-border accent-primary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(0,229,204,0.4)]" />
                        <span className="text-xs font-semibold text-foreground tabular-nums min-w-[80px] text-right">
                          {priceMax === 0 ? "Any" : `£${priceMax.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle filters */}
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setGarden(!garden)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold rounded-xl transition-all border ${garden ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground border-border hover:text-foreground"}`}>
                      <TreePine size={13} /> Garden
                    </button>
                    <button onClick={() => setParking(!parking)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold rounded-xl transition-all border ${parking ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground border-border hover:text-foreground"}`}>
                      <Car size={13} /> Parking
                    </button>
                    <button onClick={() => setNewBuild(!newBuild)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold rounded-xl transition-all border ${newBuild ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground border-border hover:text-foreground"}`}>
                      <Zap size={13} /> New Build
                    </button>

                    <span className="w-px h-8 bg-border hidden sm:block" />

                    {/* EPC chips */}
                    <div className="flex items-center gap-1.5">
                      <Leaf size={13} className="text-muted-foreground" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-1">EPC</span>
                      {epcOptions.map(r => (
                        <button key={r} onClick={() => toggleEpc(r)}
                          className={`w-7 h-7 text-[11px] font-bold rounded-lg transition-all border ${epc.includes(r) ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:text-foreground"}`}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeCount > 0 && (
                    <button onClick={clearAll} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                      <X size={12} /> Clear all filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Results ── */}
      <section className="section-padding max-w-5xl mx-auto py-10 md:py-14">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground tabular-nums">{results.length}</span>{" "}
            {listing === "sale" ? "properties for sale" : "properties to let"}
          </p>

          <div className="inline-flex rounded-xl overflow-hidden border border-border" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
            {([{ m: "grid" as const, icon: LayoutGrid, label: "Grid" }, { m: "map" as const, icon: Map, label: "Map" }]).map(({ m, icon: I, label }) => (
              <button key={m} onClick={() => setView(m)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold transition-colors ${view === m ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>
                <I size={15} /> {label}
              </button>
            ))}
          </div>
        </div>

        {view === "map" ? (
          <div className="rounded-2xl border border-border bg-card/40 flex items-center justify-center" style={{ height: 520 }}>
            <div className="text-center">
              <Map size={52} className="mx-auto mb-4 text-muted-foreground/25" />
              <p className="text-sm font-medium text-muted-foreground">Map view coming soon</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Interactive map with property pins is in development</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map(p => (
              <div key={p.id} className="group rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-[0_4px_32px_rgba(0,229,204,0.08)]"
                style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.18)" }}>
                {/* Image */}
                <div className="relative aspect-[16/11] overflow-hidden">
                  {/* Badges */}
                  <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest rounded-lg bg-primary text-primary-foreground" style={{ boxShadow: "0 0 16px rgba(0,229,204,0.35)" }}>
                      <Sparkles size={11} /> AI Priced
                    </span>
                    {p.isNewBuild && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-foreground/90 text-background">
                        <Zap size={10} /> New
                      </span>
                    )}
                  </div>
                  {/* Price */}
                  <span className="absolute top-3.5 right-3.5 z-10 text-[1.35rem] font-black tabular-nums text-foreground" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.7), 0 0 4px rgba(0,0,0,0.4)" }}>
                    {fmt(p.price, p.isPerMonth)}
                  </span>
                  {/* EPC badge */}
                  {p.epcRating && (
                    <span className="absolute bottom-3 right-3 z-10 w-7 h-7 flex items-center justify-center text-[10px] font-black rounded-lg bg-primary/90 text-primary-foreground">
                      {p.epcRating}
                    </span>
                  )}
                  <img src={p.image} alt={`${p.type} property ${p.listingType === "sale" ? "for sale" : "to let"} at ${p.address} – ${p.beds} bedrooms, AI-priced by Hummm`} loading="lazy" width={768} height={512}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
                </div>

                {/* Body */}
                <div className="p-5 pt-4">
                  <h3 className="text-[0.9rem] font-bold text-foreground leading-snug mb-1">{p.address}</h3>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                    <MapPin size={12} className="text-primary shrink-0" /> {p.location}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-1 text-[11px] text-muted-foreground mb-5 pb-4 border-b border-border">
                    <span className="inline-flex items-center gap-1"><BedDouble size={13} className="text-primary" /> {p.beds} Beds</span>
                    <span className="text-border mx-1">•</span>
                    <span className="inline-flex items-center gap-1"><Bath size={13} className="text-primary" /> {p.baths} Baths</span>
                    <span className="text-border mx-1">•</span>
                    <span className="inline-flex items-center gap-1"><Maximize size={13} className="text-primary" /> {p.sqft.toLocaleString()} sq ft</span>
                    {p.hasGarden && <><span className="text-border mx-1">•</span><span className="inline-flex items-center gap-1"><TreePine size={13} className="text-primary" /> Garden</span></>}
                    {p.hasParking && <><span className="text-border mx-1">•</span><span className="inline-flex items-center gap-1"><Car size={13} className="text-primary" /> Parking</span></>}
                  </div>

                  <Link to={`/properties/${p.id}`} className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all duration-200 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_20px_rgba(0,229,204,0.3)]">
                    View Details <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && view === "grid" && (
          <div className="text-center py-24">
            <Search size={44} className="mx-auto mb-4 text-muted-foreground/20" />
            <p className="text-lg font-semibold text-foreground">No properties found</p>
            <p className="text-sm text-muted-foreground mt-1">Try broadening your search or adjusting filters.</p>
          </div>
        )}
      </section>

      {/* ── AI CTA ── */}
      <section className="section-padding max-w-5xl mx-auto pb-20">
        <AnimatedSection>
          <div className="relative rounded-3xl overflow-hidden px-8 py-16 md:px-16 md:py-20 text-center" style={{ backgroundColor: "#0A1428" }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(0,229,204,0.1) 0%, transparent 70%)" }} />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 border border-primary/25 bg-primary/5">
                <Sparkles size={14} className="text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary">AI Property Matching</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 text-balance text-foreground">
                Can't Find What You're Looking For?
              </h2>
              <p className="text-sm md:text-base max-w-md mx-auto mb-10 leading-relaxed text-muted-foreground">
                Let our AI find hidden gems and negotiate the best deal for you.
              </p>
              <Link to="/negotiate-for-me"
                className="inline-flex items-center gap-2.5 px-10 py-4 text-sm font-bold rounded-full transition-all hover:brightness-110 bg-primary text-primary-foreground shadow-[0_0_40px_rgba(0,229,204,0.3)]">
                <Sparkles size={16} /> Get AI Property Matches <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Properties;
