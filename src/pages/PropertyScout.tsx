import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Search, Bed, Bath, Maximize, MapPin, Sparkles, Mail, Target,
  ArrowRight, SlidersHorizontal, House, Building,
  Loader2, ChevronDown, CheckCircle, TrendingUp, Zap,
  Heart, BookmarkPlus, Grid3X3, Map as MapIcon, Star, Shield,
  MessageSquare, X, Train, GraduationCap, CalendarDays, BadgeCheck,
} from "lucide-react";
import NegotiationWizard from "@/components/NegotiationWizard";
import ViewingRequestModal from "@/components/ViewingRequestModal";
import TubeStatusTicker from "@/components/TubeStatusTicker";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddressLookup from "@/components/AddressLookup";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PropertyAuditFlow from "@/components/PropertyAuditFlow";
import AuditStickyCTA from "@/components/AuditStickyCTA";

/* ── Fix leaflet default icon ── */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/* ── Types ── */
type Listing = {
  id: string;
  address: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  property_type: string;
  date: string | null;
  source: string;
  postcode: string;
  image?: string;
  belowMarket?: boolean;
  country?: string;
  currency?: string;
};

type SearchFilters = {
  postcode: string;
  address: string;
  radius: number;
  listingType: "sale" | "rent";
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  propertyType: string;
  workPostcode: string;
  showSchools: boolean;
};

type LifeMetricsData = {
  transport: { nearestStation: { name: string; walkMinutes: number } | null; commuteMinutes: number | null; commuteDestination: string | null } | null;
  schools: { name: string; ofsted: string; distance: number | null }[];
  summary: { education: string; connectivity: string; commute: string | null; area: string };
} | null;

/* ── Fallback property images ── */
const PROPERTY_IMAGES = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
  "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600&q=80",
];

const SOURCE_COLORS: Record<string, string> = {
  "Land Registry": "bg-primary/10 text-primary border-primary/20",
  "Rightmove": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Zoopla": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "Zillow": "bg-blue-600/10 text-blue-700 border-blue-600/20",
  "PropertyGuru": "bg-red-500/10 text-red-600 border-red-500/20",
  "Redfin": "bg-rose-500/10 text-rose-600 border-rose-500/20",
  "Domain": "bg-teal-500/10 text-teal-600 border-teal-500/20",
  "Agent Site": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Marketplace": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

const RADIUS_OPTIONS = [1, 3, 5, 10];
const PROPERTY_TYPES = ["Any", "Detached", "Semi-Detached", "Terraced", "Flat", "Bungalow"];

const PropertyScout = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    postcode: "",
    address: "",
    radius: 5,
    listingType: "sale",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    propertyType: "",
    workPostcode: "",
    showSchools: false,
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [marketContext, setMarketContext] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [savingSearch, setSavingSearch] = useState(false);
  const [searchSaved, setSearchSaved] = useState(false);
  const [negotiateListing, setNegotiateListing] = useState<Listing | null>(null);
  const [viewingListing, setViewingListing] = useState<Listing | null>(null);
  const [lifeMetrics, setLifeMetrics] = useState<LifeMetricsData>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // London postcodes start with E, EC, N, NW, SE, SW, W, WC, BR, CR, DA, EN, HA, IG, KT, RM, SM, TW, UB, WD
  const isLondonSearch = useMemo(() => {
    const pc = filters.postcode.toUpperCase().replace(/\s/g, "");
    return /^(E|EC|N|NW|SE|SW|W|WC|BR|CR|DA|EN|HA|IG|KT|RM|SM|TW|UB|WD)\d/.test(pc);
  }, [filters.postcode]);

  const handleSearch = async () => {
    if (!filters.postcode) {
      toast({ title: "Enter a postcode", description: "Use the address finder to set your search location.", variant: "destructive" });
      return;
    }
    setSearching(true);
    setHasSearched(true);
    setSearchSaved(false);
    setVisibleCount(12);

    try {
      const { data, error } = await supabase.functions.invoke("fetch-market-data", {
        body: {
          postcode: filters.postcode,
          radius_miles: filters.radius,
          listing_type: filters.listingType,
          min_price: filters.minPrice || undefined,
          max_price: filters.maxPrice || undefined,
          bedrooms: filters.bedrooms || undefined,
          property_type: filters.propertyType && filters.propertyType !== "Any" ? filters.propertyType : undefined,
        },
      });

      if (error) throw new Error(error.message);

      const enriched = (data.listings || []).map((l: any, i: number) => ({
        ...l,
        image: PROPERTY_IMAGES[i % PROPERTY_IMAGES.length],
        belowMarket: data.market_context?.avg_price ? l.price < data.market_context.avg_price * 0.9 : false,
      }));

      setListings(enriched);
      setMarketContext(data.market_context || null);
    } catch (err: any) {
      console.error("Search error:", err);
      toast({ title: "Search Error", description: err.message || "Failed to fetch listings.", variant: "destructive" });
    } finally {
      setSearching(false);
    }

    // Fetch life metrics in background
    setLoadingMetrics(true);
    supabase.functions
      .invoke("life-metrics", {
        body: {
          postcode: filters.postcode,
          work_postcode: filters.workPostcode || undefined,
        },
      })
      .then(({ data }) => {
        if (data && !data.error) setLifeMetrics(data);
      })
      .catch(() => {})
      .finally(() => setLoadingMetrics(false));
  };

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < listings.length) {
          setVisibleCount((c) => Math.min(c + 12, listings.length));
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleCount, listings.length]);

  const handleSaveSearch = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      toast({ title: "Sign in required", description: "Create an account to save searches.", variant: "destructive" });
      navigate("/auth");
      return;
    }

    setSavingSearch(true);
    try {
      const { error } = await supabase.from("saved_searches" as any).insert({
        user_id: session.session.user.id,
        postcode: filters.postcode,
        radius_miles: filters.radius,
        listing_type: filters.listingType,
        min_price: filters.minPrice ? parseInt(filters.minPrice) : null,
        max_price: filters.maxPrice ? parseInt(filters.maxPrice) : null,
        bedrooms: filters.bedrooms ? parseInt(filters.bedrooms) : null,
        property_type: filters.propertyType || null,
        label: `${filters.postcode} · ${filters.listingType === "sale" ? "Buy" : "Rent"}`,
      } as any);

      if (error) throw error;
      setSearchSaved(true);
      toast({ title: "Search Saved! ✨", description: "We'll notify you when new properties match." });
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to save search.", variant: "destructive" });
    } finally {
      setSavingSearch(false);
    }
  };

  const formatPrice = (price: number, type: "sale" | "rent", currency?: string) => {
    const sym = currency === "USD" ? "$" : currency === "SGD" ? "S$" : "£";
    if (type === "rent") return `${sym}${price.toLocaleString()} pcm`;
    return `${sym}${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="The Most Powerful Property Auditor | Hummm"
        description="Drop any property link and get the most comprehensive, accurate property audit available — fair value, comparables, yield, risks, and renovation insights."
        canonical="/property-scout"
      />
      <Navbar />

      {/* ── Hero ── */}
      <div className="pt-24 sm:pt-32 pb-10 sm:pb-14 section-padding">
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/30 bg-primary/5 rounded-full mb-5">
            <Target size={14} className="text-primary" />
            <span className="text-xs font-medium tracking-wider uppercase text-primary">Property Audit</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance leading-tight">
            The Most Powerful <span className="text-gradient">Property Auditor</span>
          </h1>
          <p className="text-lg sm:text-xl font-semibold text-foreground/90 mb-3">
            Get the best property report in the world
          </p>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Drop any property link or postcode and receive the most comprehensive, accurate, and insightful property audit available — far beyond what any agent or portal can give you.
          </p>
        </div>

        {/* Drop a Link - Audit Flow */}
        <div className="max-w-3xl mx-auto mb-10">
          <PropertyAuditFlow />
        </div>

        {/* ── Benefit Highlights ── */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-10">
          {[
            { icon: MapPin, title: "Deep Local Intelligence", desc: "Street-level data, neighbourhood analysis, transport links, and amenities — all in one place." },
            { icon: TrendingUp, title: "Accurate Valuations", desc: "Fair value estimate with detailed comparable sales analysis and price-per-sqft benchmarks." },
            { icon: Zap, title: "Yield, Risks & Opportunities", desc: "Rental yield projections, risk flags, renovation ROI simulator, and investment insights." },
          ].map((b) => (
            <div key={b.title} className="glass-surface rounded-2xl p-5 sm:p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <b.icon size={22} className="text-primary" />
              </div>
              <h3 className="text-sm font-bold mb-1.5">{b.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="max-w-3xl mx-auto flex items-center gap-4 mb-8">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Or search by area</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* ── Search Card ── */}
        <div className="max-w-3xl mx-auto">
          <div className="glass-surface rounded-2xl p-5 sm:p-8 space-y-5">

            {/* Buy / Rent Toggle */}
            <div className="flex gap-1 bg-muted rounded-xl p-1">
              {(["sale", "rent"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilters(f => ({ ...f, listingType: t }))}
                  className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
                    filters.listingType === t
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "sale" ? "I'm Buying" : "I'm Renting"}
                </button>
              ))}
            </div>

            {/* Address Lookup */}
            <AddressLookup
              value={filters.address}
              onChange={(val) => setFilters(f => ({ ...f, address: val }))}
              onAddressSelected={(addr) => {
                setFilters(f => ({ ...f, address: addr }));
                const pc = addr.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i)?.[0];
                if (pc) setFilters(f => ({ ...f, postcode: pc.trim().toUpperCase() }));
              }}
              onPostcodeFound={(pc) => setFilters(f => ({ ...f, postcode: pc }))}
              label="Search by location"
              required
            />

            {/* Radius Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">Search Radius</label>
                <span className="text-sm font-bold text-primary">{filters.radius} miles</span>
              </div>
              <div className="flex gap-2">
                {RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setFilters(f => ({ ...f, radius: r }))}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-all ${
                      filters.radius === r
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {r} mi
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <SlidersHorizontal size={14} />
              {showFilters ? "Hide Filters" : "More Filters"}
              <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Min Price</label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                    placeholder={filters.listingType === "sale" ? "e.g. 200000" : "e.g. 800"}
                    className="w-full px-4 py-3 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Max Price</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                    placeholder={filters.listingType === "sale" ? "e.g. 500000" : "e.g. 2000"}
                    className="w-full px-4 py-3 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Bedrooms</label>
                  <div className="flex gap-1.5">
                    {["", "1", "2", "3", "4", "5"].map((b) => (
                      <button
                        key={b}
                        onClick={() => setFilters(f => ({ ...f, bedrooms: b }))}
                        className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                          filters.bedrooms === b
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {b || "Any"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Property Type</label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) => setFilters(f => ({ ...f, propertyType: e.target.value }))}
                    className="w-full px-4 py-3 text-sm bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {PROPERTY_TYPES.map((t) => <option key={t} value={t === "Any" ? "" : t}>{t}</option>)}
                  </select>
                </div>

                {/* Life Metrics Filters */}
                <div className="sm:col-span-2 pt-2 border-t border-border mt-2 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Sparkles size={11} className="text-primary" /> Life Metrics
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-muted-foreground flex items-center gap-1">
                        <Train size={11} /> Commute to (postcode)
                      </label>
                      <input
                        type="text"
                        value={filters.workPostcode}
                        onChange={(e) => setFilters(f => ({ ...f, workPostcode: e.target.value.toUpperCase() }))}
                        placeholder="e.g. EC2R 8AH"
                        className="w-full px-4 py-3 text-sm bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => setFilters(f => ({ ...f, showSchools: !f.showSchools }))}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl border transition-all w-full justify-center ${
                          filters.showSchools
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        <GraduationCap size={14} />
                        {filters.showSchools ? "Schools: On" : "Show Schools"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={searching || !filters.postcode}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 sm:py-3.5 text-base sm:text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all rounded-full shadow-lg shadow-primary/25 humm-pulse min-h-[52px]"
            >
              {searching ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Searching Rightmove, Zillow, PropertyGuru & global portals...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Search All Properties
                </>
              )}
            </button>

            {/* Trust */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <Shield size={12} className="text-primary shrink-0" />
              <span className="text-[10px] text-muted-foreground">
                Powered by <span className="font-semibold text-foreground/70">PropertyData</span>, <span className="font-semibold text-foreground/70">Land Registry</span> & global portals · UK · USA · SE Asia
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      {hasSearched && (
        <div className="section-padding pb-20">
          <div className="max-w-7xl mx-auto">

            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  {searching ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={20} className="animate-spin text-primary" />
                      Searching...
                    </span>
                  ) : (
                    <>
                      <span className="text-primary tabular-nums">{listings.length}</span> properties found across all major portals
                    </>
                  )}
                </h2>
                {marketContext?.avg_price && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Average market value in area: <span className="font-semibold text-foreground">£{marketContext.avg_price.toLocaleString()}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("map")}
                    className={`p-2 rounded-md transition-all ${viewMode === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    <MapIcon size={16} />
                  </button>
                </div>

                {/* Save Search */}
                <button
                  onClick={handleSaveSearch}
                  disabled={savingSearch || searchSaved}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-full border transition-all ${
                    searchSaved
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {searchSaved ? (
                    <><CheckCircle size={14} /> Saved!</>
                  ) : savingSearch ? (
                    <><Loader2 size={14} className="animate-spin" /> Saving...</>
                  ) : (
                    <><BookmarkPlus size={14} /> Save This Scout</>
                  )}
                </button>
              </div>
            </div>

            {/* Loading State */}
            {searching && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-muted" />
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <Search size={24} className="absolute inset-0 m-auto text-primary" />
                </div>
                <p className="text-lg font-semibold mb-2">Aggregating global listings...</p>
                <p className="text-sm text-muted-foreground">Searching Rightmove, Zillow, PropertyGuru, Zoopla, Redfin, Domain and every major portal</p>
              </div>
            )}

            {/* Empty State */}
            {!searching && listings.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-2">No properties found</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Try expanding your search radius or adjusting filters. The market data may be limited for this specific area.
                </p>
                <button
                  onClick={() => setFilters(f => ({ ...f, radius: 10, minPrice: "", maxPrice: "", bedrooms: "", propertyType: "" }))}
                  className="px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all"
                >
                  Expand Search to 10 Miles
                </button>
              </div>
            )}

            {/* Grid View */}
            {!searching && listings.length > 0 && viewMode === "grid" && (
              <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.slice(0, visibleCount).map((listing) => (
                  <div
                    key={listing.id}
                    className="glass-surface rounded-xl overflow-hidden group hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={listing.image}
                        alt={listing.address}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Source Badge */}
                      <div className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border backdrop-blur-sm ${SOURCE_COLORS[listing.source] || "bg-muted text-foreground border-border"}`}>
                        {listing.source}
                      </div>
                      {/* Below Market Badge */}
                      {listing.belowMarket && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/90 text-white border border-emerald-400/50 flex items-center gap-1">
                          <TrendingUp size={10} />
                          Below Market
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <p className="text-lg font-bold tabular-nums mb-1">
                        {formatPrice(listing.price, filters.listingType, listing.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex items-start gap-1.5">
                        <MapPin size={13} className="text-primary mt-0.5 shrink-0" />
                        {listing.address}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                        {listing.bedrooms && (
                          <span className="flex items-center gap-1">
                            <Bed size={12} /> {listing.bedrooms} bed
                          </span>
                        )}
                        {listing.bathrooms && (
                          <span className="flex items-center gap-1">
                            <Bath size={12} /> {listing.bathrooms} bath
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <House size={12} /> {listing.property_type}
                        </span>
                      </div>

                      {/* Life Metrics Badges */}
                      {lifeMetrics && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {lifeMetrics.transport?.nearestStation && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-semibold bg-primary/5 text-primary border border-primary/15 rounded-full">
                              <Train size={9} />
                              {lifeMetrics.transport.nearestStation.walkMinutes} min walk to {lifeMetrics.transport.nearestStation.name}
                            </span>
                          )}
                          {lifeMetrics.summary?.commute && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-semibold bg-amber-500/5 text-amber-600 border border-amber-500/15 rounded-full">
                              <MapPin size={9} />
                              {lifeMetrics.summary.commute}
                            </span>
                          )}
                          {filters.showSchools && lifeMetrics.schools?.[0] && (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-[9px] font-semibold rounded-full ${
                              lifeMetrics.schools[0].ofsted === "Outstanding"
                                ? "bg-emerald-500/5 text-emerald-600 border border-emerald-500/15"
                                : "bg-blue-500/5 text-blue-600 border border-blue-500/15"
                            }`}>
                              <GraduationCap size={9} />
                              {lifeMetrics.schools[0].name} ({lifeMetrics.schools[0].ofsted})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Hummm Analysis */}
                      {listing.belowMarket && marketContext?.avg_price && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg mb-4">
                          <Sparkles size={12} className="text-emerald-500 shrink-0" />
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Hummm Analysis: {Math.round((1 - listing.price / marketContext.avg_price) * 100)}% below market average
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewingListing(listing)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg transition-transform hover:scale-105 animate-humm-pulse"
                        >
                          <CalendarDays size={12} />
                          Request Viewing
                        </button>
                        <button
                          onClick={() => setNegotiateListing(listing)}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold border border-border rounded-lg hover:border-primary/30 hover:text-primary transition-transform hover:scale-105"
                        >
                          <MessageSquare size={12} />
                          Negotiate
                        </button>
                        <Link
                          to={`/negotiate?address=${encodeURIComponent(listing.address)}&action=email`}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold border border-border rounded-lg hover:border-primary/30 hover:text-primary transition-transform hover:scale-105"
                        >
                          <Mail size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Infinite scroll sentinel + progress */}
              {visibleCount < listings.length && (
                <div className="flex flex-col items-center py-8 gap-3">
                  <Loader2 size={20} className="animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground tabular-nums">
                    Showing {visibleCount} of {listings.length} properties
                  </p>
                </div>
              )}
              <div ref={loadMoreRef} className="h-1" />

              {visibleCount >= listings.length && listings.length > 12 && (
                <p className="text-center text-xs text-muted-foreground py-6">
                  All {listings.length} properties loaded
                </p>
              )}
              </>
            )}

            {/* Map View */}
            {!searching && listings.length > 0 && viewMode === "map" && (
              <div className="rounded-xl overflow-hidden border border-border h-[500px]">
                <MapContainer
                  center={[51.5074, -0.1278]}
                  zoom={12}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                </MapContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Negotiation Modal */}
      {negotiateListing && (
        <NegotiationWizard
          listing={negotiateListing}
          listingType={filters.listingType}
          onClose={() => setNegotiateListing(null)}
          lifeMetrics={lifeMetrics}
        />
      )}

      {/* Viewing Request Modal */}
      {viewingListing && (
        <ViewingRequestModal
          listing={{ address: viewingListing.address, price: viewingListing.price }}
          onClose={() => setViewingListing(null)}
        />
      )}

      {/* Tube Status Ticker for London searches */}
      {isLondonSearch && <TubeStatusTicker />}

      <Footer />
    </div>
  );
};

export default PropertyScout;
