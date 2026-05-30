import { useState, useRef, useEffect, lazy, Suspense, forwardRef } from "react";
import AddressLookup from "@/components/AddressLookup";
import ContactAgentModal from "@/components/ContactAgentModal";
import AgentOutreachModal from "@/components/AgentOutreachModal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import AnimatedSection from "@/components/AnimatedSection";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import WaitlistSection from "@/components/WaitlistSection";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, Star, TrendingUp, Clock, Home, Building2,
  Shield, CheckCircle, BarChart3, MessageSquare, Award,
  ChevronDown, Loader2, MapPin, Phone, Globe, ThumbsUp, Mail,
  Map, List, Sparkles, Zap, Send, Square, CheckSquare,
} from "lucide-react";

const AgentMap = lazy(() => import("@/components/AgentMap"));

const PROPERTY_TYPES = ["Detached House", "Semi-Detached", "Terraced", "Flat / Apartment", "Bungalow", "Cottage", "Other"];

const SCAN_STEPS = [
  "Searching transaction data...",
  "Fetching independent reviews...",
  "Analyzing sale-to-asking-price ratios...",
  "Ranking top-performing agents...",
];

interface Agent {
  id: string;
  name: string;
  logo: string;
  rating: number;
  stars: number;
  avg_days: number;
  price_achieved: string;
  properties_sold: number;
  review_score: number;
  strengths: string;
  reviews: string[];
  phone: string | null;
  email: string | null;
  website: string | null;
  postcode: string | null;
  latitude: number;
  longitude: number;
  distance_miles: number;
}

const FindAgent = () => {
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [listingType, setListingType] = useState<"sale" | "rent">("sale");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[] | null>(null);
  const [noResults, setNoResults] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const [searchLat, setSearchLat] = useState<number | null>(null);
  const [searchLng, setSearchLng] = useState<number | null>(null);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadName, setLeadName] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [contactAgent, setContactAgent] = useState<Agent | null>(null);
  const [scanStep, setScanStep] = useState(0);
  const [checkedAgentIds, setCheckedAgentIds] = useState<Set<string>>(new Set());
  const [showOutreach, setShowOutreach] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (selectedAgentId && cardRefs.current[selectedAgentId]) {
      cardRefs.current[selectedAgentId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedAgentId]);

  // Animate scan steps while loading
  useEffect(() => {
    if (!loading) { setScanStep(0); return; }
    const interval = setInterval(() => {
      setScanStep((s) => (s + 1) % SCAN_STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcode && !address) return;

    setLoading(true);
    setNoResults(false);
    setAgents(null);
    setSelectedAgentId(null);
    const searchPC = postcode || address.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i)?.[0] || address;
    setSearchLocation(searchPC);

    try {
      const { data, error } = await supabase.functions.invoke("geocode-postcode", {
        body: { postcode: searchPC, listing_type: listingType, radius_miles: 15 },
      });
      if (error) throw error;

      if (data.lat) setSearchLat(data.lat);
      if (data.lng) setSearchLng(data.lng);

      if (!data.agents || data.agents.length === 0) {
        setNoResults(true);
        setAgents(null);
      } else {
        setAgents(data.agents);
        // Pre-select top 3 agents for outreach
        setCheckedAgentIds(new Set(data.agents.slice(0, 3).map((a: Agent) => a.id)));
        setNoResults(false);
      }
    } catch (err) {
      console.error("Agent search error:", err);
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail || !leadName) return;
    try {
      await supabase.from("waitlist_signups").insert({
        email: leadEmail,
        full_name: leadName,
        interests: ["find-agent", searchLocation],
      });
      setLeadSubmitted(true);
    } catch (err) {
      console.error("Lead capture error:", err);
    }
  };

  const top3 = agents?.slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Find an Estate Agent Near You | Hummm"
        description="Our AI scans local transaction data, reviews, and sale-to-asking ratios to find the best agent for your property."
        canonical="/find-an-agent"
      />
      <Navbar />

      {contactAgent && (
        <ContactAgentModal
          agent={contactAgent}
          propertyAddress={address || searchLocation}
          onClose={() => setContactAgent(null)}
        />
      )}

      {showOutreach && agents && (
        <AgentOutreachModal
          agents={agents.filter((a) => checkedAgentIds.has(a.id))}
          propertyAddress={address}
          searchLocation={searchLocation}
          onClose={() => setShowOutreach(false)}
        />
      )}

      {/* Hero */}
      <section className="pt-32 pb-16 md:pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#72F1B8]/30 bg-[#72F1B8]/[0.08] rounded-full mb-8">
              <Zap size={14} className="text-[#72F1B8]" />
              <span className="text-xs font-bold tracking-widest uppercase text-[#72F1B8]">Live Market Scanner</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight mb-6 text-balance">
              Scan. Compare.{" "}
              <span className="bg-gradient-to-r from-[#72F1B8] to-primary bg-clip-text text-transparent">Dominate.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              Our AI scans every local transaction, review, and sale-to-asking ratio to find the top-performing agents in your area.
            </p>
          </AnimatedSection>

          {/* Search Form */}
          <AnimatedSection delay={200}>
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 space-y-5">
              <div className="text-left">
                <AddressLookup
                  value={address}
                  onChange={setAddress}
                  onPostcodeFound={setPostcode}
                  label="Property Address"
                  placeholder="Enter your full address or postcode (e.g. SW1A 1AA)"
                  required
                  variant="dark"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="text-left">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Property Type</label>
                  <div className="relative">
                    <Home size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                    <select required value={propertyType} onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground appearance-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 text-sm">
                      <option value="" className="bg-background">Select type...</option>
                      {PROPERTY_TYPES.map((t) => <option key={t} value={t} className="bg-background">{t}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
                  </div>
                </div>
                <div className="text-left">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Approximate {listingType === "sale" ? "Value" : "Rent"}</label>
                  <input type="text" value={price} onChange={(e) => setPrice(e.target.value)}
                    placeholder={listingType === "sale" ? "e.g. £450,000" : "e.g. £1,800 pcm"}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 text-sm" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <button type="button" onClick={() => setListingType("sale")}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${listingType === "sale" ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
                  For Sale
                </button>
                <button type="button" onClick={() => setListingType("rent")}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${listingType === "rent" ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
                  To Rent
                </button>
              </div>
              <button type="submit" disabled={loading || !address.trim()}
                className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold rounded-full transition-all disabled:opacity-60 bg-[#72F1B8] text-black hover:brightness-110"
                style={{ boxShadow: "0 0 30px rgba(114,241,184,0.25), 0 0 60px rgba(114,241,184,0.1)" }}>
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                {loading ? "Scanning Market..." : "Compare Top Agents ✨"}
              </button>
            </form>
          </AnimatedSection>
        </div>
      </section>

      {/* Market Scan Animation */}
      {loading && (
        <section className="pb-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-white/[0.04] backdrop-blur-md border border-[#72F1B8]/20 rounded-2xl p-10">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-[#72F1B8]/30 animate-ping" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap size={28} className="text-[#72F1B8] animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4">Scanning agents near <span className="text-[#72F1B8]">{searchLocation}</span></h3>
              <div className="space-y-2">
                {SCAN_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 justify-center transition-all duration-500 ${
                      i < scanStep ? "text-[#72F1B8]" : i === scanStep ? "text-foreground" : "text-muted-foreground/30"
                    }`}
                  >
                    {i < scanStep ? (
                      <CheckCircle size={14} className="text-[#72F1B8] shrink-0" />
                    ) : i === scanStep ? (
                      <Loader2 size={14} className="animate-spin shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-white/10 shrink-0" />
                    )}
                    <span className="text-sm font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* No Results */}
      {noResults && !loading && (
        <section className="px-4 pb-20">
          <div className="max-w-2xl mx-auto text-center">
            <AnimatedSection>
              <div className="bg-card/80 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 md:p-12">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <MapPin size={28} className="text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-3">Coming Soon to Your Area</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  We're expanding our agent database across the UK. Leave your details and we'll notify you when agents in <span className="text-primary font-semibold">{searchLocation}</span> are available.
                </p>
                {leadSubmitted ? (
                  <div className="flex items-center justify-center gap-2 text-primary font-semibold">
                    <CheckCircle size={20} />
                    <span>Thank you! We'll be in touch soon.</span>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="space-y-4 max-w-sm mx-auto">
                    <input type="text" value={leadName} onChange={(e) => setLeadName(e.target.value)}
                      placeholder="Your full name" required
                      className="w-full px-4 py-3.5 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-sm" />
                    <input type="email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="Your email address" required
                      className="w-full px-4 py-3.5 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-sm" />
                    <button type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all humm-pulse">
                      <Mail size={16} /> Notify Me When Available
                    </button>
                  </form>
                )}
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Results */}
      {agents && agents.length > 0 && !loading && (
        <>
          <section className="px-4 pb-6">
            <div className="max-w-7xl mx-auto">
              <AnimatedSection>
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <p className="text-[#72F1B8] text-sm font-semibold mb-1">{agents.length} agent{agents.length !== 1 ? "s" : ""} found near {searchLocation}</p>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight">Top Agents in Your Area</h2>
                  </div>
                  <p className="text-muted-foreground/60 text-xs max-w-sm">Sorted by proximity. Click a pin on the map or a card below to sync.</p>
                </div>
              </AnimatedSection>
            </div>
          </section>

          {/* Outreach CTA */}
          <section className="px-4 pb-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.04] backdrop-blur-md border border-[#72F1B8]/20 rounded-2xl px-6 py-4">
                <div className="flex items-center gap-3">
                  <Send size={18} className="text-[#72F1B8]" />
                  <div>
                    <p className="text-sm font-bold">{checkedAgentIds.size} agent{checkedAgentIds.size !== 1 ? "s" : ""} selected</p>
                    <p className="text-xs text-muted-foreground/50">Toggle checkboxes on cards to adjust</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOutreach(true)}
                  disabled={checkedAgentIds.size === 0}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-full bg-[#72F1B8] text-black hover:brightness-110 transition-all disabled:opacity-40"
                  style={{ boxShadow: checkedAgentIds.size > 0 ? "0 0 20px rgba(114,241,184,0.3)" : "none" }}
                >
                  <Mail size={16} /> Message Selected Agents with AI Intro ✉️
                </button>
              </div>
            </div>
          </section>

          {/* Map + List */}
          <section className="px-4 pb-12">
            <div className="max-w-7xl mx-auto">
              <div className="hidden md:grid md:grid-cols-5 gap-6" style={{ minHeight: 550 }}>
                <div className="col-span-3 sticky top-24" style={{ height: 550 }}>
                  <Suspense fallback={<div className="w-full h-full rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>}>
                    {searchLat && searchLng && (
                      <AgentMap agents={agents} searchLat={searchLat} searchLng={searchLng} selectedAgentId={selectedAgentId} onAgentSelect={(id) => setSelectedAgentId(id)} />
                    )}
                  </Suspense>
                </div>
                <div className="col-span-2 space-y-4 overflow-y-auto pr-1" style={{ maxHeight: 550 }}>
                  {agents.map((agent, i) => (
                    <AgentCard key={agent.id} agent={agent} index={i} listingType={listingType} isSelected={agent.id === selectedAgentId} onSelect={() => setSelectedAgentId(agent.id)} onContact={() => setContactAgent(agent)} checked={checkedAgentIds.has(agent.id)} onToggleCheck={() => { setCheckedAgentIds((prev) => { const next = new Set(prev); next.has(agent.id) ? next.delete(agent.id) : next.add(agent.id); return next; }); }} ref={(el) => { cardRefs.current[agent.id] = el; }} />
                  ))}
                </div>
              </div>

              {/* Mobile */}
              <div className="md:hidden">
                {mobileView === "map" && searchLat && searchLng ? (
                  <div style={{ height: "60vh" }}>
                    <Suspense fallback={<div className="w-full h-full rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>}>
                      <AgentMap agents={agents} searchLat={searchLat} searchLng={searchLng} selectedAgentId={selectedAgentId} onAgentSelect={(id) => { setSelectedAgentId(id); setMobileView("list"); }} />
                    </Suspense>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {agents.map((agent, i) => (
                      <AgentCard key={agent.id} agent={agent} index={i} listingType={listingType} isSelected={agent.id === selectedAgentId} onSelect={() => setSelectedAgentId(agent.id)} onContact={() => setContactAgent(agent)} checked={checkedAgentIds.has(agent.id)} onToggleCheck={() => { setCheckedAgentIds((prev) => { const next = new Set(prev); next.has(agent.id) ? next.delete(agent.id) : next.add(agent.id); return next; }); }} ref={(el) => { cardRefs.current[agent.id] = el; }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Mobile FAB */}
          <div className="md:hidden fixed bottom-6 right-6 z-40">
            <button onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-black/30 transition-transform active:scale-95 bg-primary text-primary-foreground">
              {mobileView === "list" ? <Map size={22} /> : <List size={22} />}
            </button>
            <span className="absolute -top-7 right-0 text-[10px] text-muted-foreground/60 whitespace-nowrap font-semibold">
              {mobileView === "list" ? "Map View" : "List View"}
            </span>
          </div>

          {/* Comparison Table */}
          {top3 && top3.length >= 2 && (
            <section className="px-4 pb-12">
              <div className="max-w-7xl mx-auto">
                <AnimatedSection>
                  <div className="bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-5 border-b border-white/10">
                      <h3 className="text-lg font-bold flex items-center gap-2"><BarChart3 size={18} className="text-[#72F1B8]" /> Top {top3.length} Agents — Side by Side</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-muted-foreground/60 text-xs uppercase tracking-wider">
                            <th className="text-left p-4 font-semibold">Metric</th>
                            {top3.map((a) => <th key={a.id} className="text-center p-4 font-semibold">{a.logo} {a.name}</th>)}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          <tr>
                            <td className="p-4 text-muted-foreground font-medium">Distance</td>
                            {top3.map((a) => <td key={a.id} className="p-4 text-center font-bold text-[#72F1B8]">{a.distance_miles.toFixed(1)} mi</td>)}
                          </tr>
                          <tr>
                            <td className="p-4 text-muted-foreground font-medium">Overall Rating</td>
                            {top3.map((a) => <td key={a.id} className="p-4 text-center"><span className="text-2xl font-black text-[#72F1B8]">{a.rating}</span><span className="text-muted-foreground/40 text-sm">/10</span></td>)}
                          </tr>
                          <tr>
                            <td className="p-4 text-muted-foreground font-medium">Avg Days on Market</td>
                            {top3.map((a) => <td key={a.id} className="p-4 text-center font-bold">{a.avg_days} days</td>)}
                          </tr>
                          <tr>
                            <td className="p-4 text-muted-foreground font-medium">Price Achieved vs Asking</td>
                            {top3.map((a) => <td key={a.id} className="p-4 text-center font-bold text-[#72F1B8]">{a.price_achieved}</td>)}
                          </tr>
                          <tr>
                            <td className="p-4 text-muted-foreground font-medium">Properties {listingType === "sale" ? "Sold" : "Let"}</td>
                            {top3.map((a) => <td key={a.id} className="p-4 text-center font-bold">{a.properties_sold}</td>)}
                          </tr>
                          <tr>
                            <td className="p-4 text-muted-foreground font-medium">Review Score</td>
                            {top3.map((a) => (
                              <td key={a.id} className="p-4 text-center">
                                <span className="font-bold">{a.review_score}</span>
                                <Star size={12} className="inline ml-1 text-[#72F1B8] fill-[#72F1B8]" />
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </section>
          )}

          {/* Data source */}
          <section className="px-4 pb-16">
            <div className="max-w-5xl mx-auto">
              <AnimatedSection>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-6 md:p-8 flex items-start gap-5">
                  <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-[#72F1B8]/10">
                    <Globe size={22} className="text-[#72F1B8]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold mb-1.5">How We Rank Agents</h3>
                    <p className="text-sm text-muted-foreground/60 leading-relaxed">
                      Our AI scans Rightmove, Zoopla, agent websites, and public reviews to give you the most accurate and up-to-date agent performance data. Rankings are updated daily and based on real transaction outcomes — not paid placements.
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </section>
        </>
      )}

      {/* Pre-search info cards */}
      {!agents && !noResults && !loading && (
        <section className="px-4 pb-20">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: BarChart3, title: "Data-Driven Rankings", desc: "Every agent ranked on real performance — properties sold, prices achieved, and time on market." },
                  { icon: MessageSquare, title: "Verified Reviews", desc: "Genuine customer reviews aggregated from Trustpilot, Google, and portal feedback." },
                  { icon: Shield, title: "Or Let Hummm Do It", desc: "Don't want to deal with agents? Let our AI negotiate and manage the entire process for you." },
                ].map((item, i) => (
                  <div key={i} className="bg-white/[0.04] border border-white/10 rounded-2xl p-7 hover:border-[#72F1B8]/30 transition-all">
                    <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#72F1B8]/10 mb-4">
                      <item.icon size={22} className="text-[#72F1B8]" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground/60 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      <WaitlistSection />
      <Footer />
      <ChatWidget persona="scout" />
    </div>
  );
};

// ─── Agent Card ───

interface AgentCardProps {
  agent: Agent;
  index: number;
  listingType: "sale" | "rent";
  isSelected: boolean;
  onSelect: () => void;
  onContact: () => void;
  checked?: boolean;
  onToggleCheck?: () => void;
}

const AgentCard = forwardRef<HTMLDivElement, AgentCardProps>(
  ({ agent, index, listingType, isSelected, onSelect, onContact, checked, onToggleCheck }, ref) => {
    const isPreferred = index < 2;

    return (
      <div
        ref={ref}
        onClick={onSelect}
        className={`relative bg-white/[0.04] backdrop-blur-md border rounded-2xl p-5 cursor-pointer transition-all ${
          isSelected ? "border-[#72F1B8]/60 ring-1 ring-[#72F1B8]/30 bg-[#72F1B8]/[0.03]" : "border-white/10 hover:border-[#72F1B8]/20"
        }`}
      >
        {/* Outreach checkbox */}
        {onToggleCheck && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleCheck(); }}
            className="absolute top-3 right-3 z-10 p-0.5 transition-colors"
            title={checked ? "Deselect for outreach" : "Select for outreach"}
          >
            {checked ? (
              <CheckSquare size={18} className="text-[#72F1B8]" />
            ) : (
              <Square size={18} className="text-white/20 hover:text-white/40" />
            )}
          </button>
        )}
        {/* Top badge */}
        {index === 0 && (
          <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-[#72F1B8] text-black text-[10px] font-black rounded-full uppercase tracking-wider">#1 Recommended</div>
        )}

        {/* Hummm Preferred badge */}
        {isPreferred && (
          <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 border border-[#72F1B8]/40 bg-[#72F1B8]/10 text-[#72F1B8] text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
            <CheckCircle size={8} /> Hummm Preferred
          </div>
        )}

        <div className="flex items-center gap-3 mb-3 mt-1">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg shrink-0">{agent.logo}</div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-black tracking-tight truncate">{agent.name}</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#72F1B8] font-bold tabular-nums">{agent.rating}/10</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} size={10} className={si < agent.stars ? "text-[#72F1B8] fill-[#72F1B8]" : "text-white/10"} />
                ))}
              </div>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-center px-3 py-1.5 rounded-xl bg-[#72F1B8]/10 border border-[#72F1B8]/20">
            <span className="text-sm font-black tabular-nums text-[#72F1B8]">{agent.distance_miles.toFixed(1)}</span>
            <span className="text-[8px] text-[#72F1B8]/60 uppercase tracking-wider font-semibold">miles</span>
          </div>
        </div>

        {/* Performance stat */}
        <div className="mb-3 px-3 py-2 rounded-lg bg-[#72F1B8]/[0.06] border border-[#72F1B8]/10">
          <p className="text-xs text-[#72F1B8]/90 font-medium">
            <TrendingUp size={11} className="inline mr-1.5" />
            {listingType === "sale" ? "Sold" : "Let"} {agent.properties_sold} similar properties • Avg {agent.avg_days} days on market
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { v: `${agent.avg_days}d`, l: "Speed" },
            { v: agent.price_achieved, l: "Price" },
            { v: agent.properties_sold, l: listingType === "sale" ? "Sold" : "Let" },
            { v: agent.review_score, l: "Score" },
          ].map((s) => (
            <div key={s.l} className="bg-white/5 rounded-lg p-2 text-center">
              <p className="text-sm font-black tabular-nums">{s.v}</p>
              <p className="text-[8px] text-muted-foreground/40 uppercase tracking-wider">{s.l}</p>
            </div>
          ))}
        </div>

        {agent.strengths && <p className="text-xs text-muted-foreground/50 leading-relaxed mb-3 line-clamp-2">{agent.strengths}</p>}

        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onContact(); }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-full bg-[#72F1B8] text-black hover:brightness-110 transition-all"
          >
            <Phone size={12} /> Contact
          </button>
          <Link
            to="/negotiate-for-me"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-full border border-[#72F1B8]/30 text-[#72F1B8] hover:bg-[#72F1B8]/10 transition-all"
          >
            <Sparkles size={12} /> Hummm
          </Link>
        </div>
      </div>
    );
  }
);

AgentCard.displayName = "AgentCard";

export default FindAgent;
