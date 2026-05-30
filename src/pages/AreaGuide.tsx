import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import ChatWidget from "@/components/ChatWidget";
import { supabase } from "@/integrations/supabase/client";
import {
  MapPin, TrendingUp, GraduationCap, Star, ArrowRight,
  Sparkles, House, Train, BarChart3, Users, Loader2
} from "lucide-react";
import "leaflet/dist/leaflet.css";

/* ── Leaflet icon fix ── */
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const tealIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#00E5CC;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const schoolIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#f59e0b;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:10px">🎓</div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const stationIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#3b82f6;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:10px">🚉</div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

/* ── helpers ── */

function slugToPostcode(slug: string): string {
  const parts = slug.split("-");
  return (parts[parts.length - 1] || "").toUpperCase();
}

function slugToName(slug: string): string {
  const parts = slug.split("-");
  return parts
    .slice(0, -1)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* ── component ── */

const AreaGuide = () => {
  const { slug } = useParams<{ slug: string }>();
  const postcode = slugToPostcode(slug || "");
  const areaName = slugToName(slug || "");

  const dynamicTitle = `Living in ${areaName} ${postcode}: Schools, Commute & Property Insights | Hummm`;
  const dynamicDesc = `Discover ${areaName} (${postcode}) — live AI property valuations, Ofsted-rated schools, commute times & demand data. Your complete area guide by Hummmingbird AI.`;

  // 1. Pull avg valuation + demand from our DB
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["area-stats", postcode],
    enabled: !!postcode,
    queryFn: async () => {
      const { data: valuations } = await supabase
        .from("ai_valuations")
        .select("valuation_low, valuation_high, confidence")
        .ilike("postcode", `${postcode}%`)
        .not("valuation_low", "is", null);

      let avgValuation = 0;
      let avgConfidence = 0;
      let count = 0;

      if (valuations && valuations.length > 0) {
        valuations.forEach((v) => {
          if (v.valuation_low && v.valuation_high) {
            avgValuation += (v.valuation_low + v.valuation_high) / 2;
            avgConfidence += v.confidence || 0;
            count++;
          }
        });
        avgValuation = Math.round(avgValuation / count);
        avgConfidence = Math.round(avgConfidence / count);
      }

      const { count: demandCount } = await supabase
        .from("ai_valuations")
        .select("id", { count: "exact", head: true })
        .ilike("postcode", `${postcode}%`);

      const demandScore =
        (demandCount || 0) > 10 ? "High" : (demandCount || 0) > 3 ? "Stable" : "Emerging";

      return { avgValuation, avgConfidence, demandScore, count };
    },
  });

  // 2. Life metrics (schools, transport, vibe)
  const { data: lifeMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["area-life-metrics", postcode],
    enabled: !!postcode,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("life-metrics", {
        body: { postcode },
      });
      if (error) throw error;
      return data;
    },
  });

  const outstandingSchools =
    lifeMetrics?.schools?.filter((s: any) => s.ofsted === "Outstanding") || [];
  const goodSchools =
    lifeMetrics?.schools?.filter((s: any) => s.ofsted === "Good") || [];
  const topSchools = [...outstandingSchools, ...goodSchools].slice(0, 3);

  const isLoading = statsLoading || metricsLoading;
  const currentMonth = new Date().toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  // Map center from vibe data
  const mapLat = lifeMetrics?.vibe?.latitude;
  const mapLng = lifeMetrics?.vibe?.longitude;
  const station = lifeMetrics?.transport?.nearestStation;

  // JSON-LD Schema
  const jsonLdSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: `Hummm Property Consultants — ${areaName} ${postcode}`,
      description: dynamicDesc,
      url: `https://hummm.pro/area/${slug}`,
      areaServed: {
        "@type": "PostalAddress",
        postalCode: postcode,
        addressRegion: lifeMetrics?.vibe?.region || "England",
        addressLocality: lifeMetrics?.vibe?.district || areaName,
        addressCountry: "GB",
      },
      ...(stats?.avgValuation
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: stats.demandScore === "High" ? "4.8" : stats.demandScore === "Stable" ? "4.2" : "3.8",
              bestRating: "5",
              ratingCount: String(Math.max(stats.count, 1)),
            },
          }
        : {}),
    },
    ...(stats?.avgValuation
      ? [
          {
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            name: `Properties in ${areaName} ${postcode}`,
            description: `Average AI valuation: £${stats.avgValuation.toLocaleString()}. Demand: ${stats.demandScore}.`,
            url: `https://hummm.pro/area/${slug}`,
            contentLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                postalCode: postcode,
                addressLocality: areaName,
                addressCountry: "GB",
              },
            },
            offers: {
              "@type": "Offer",
              priceCurrency: "GBP",
              price: String(stats.avgValuation),
              priceSpecification: {
                "@type": "PriceSpecification",
                priceCurrency: "GBP",
                price: String(stats.avgValuation),
              },
            },
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title={dynamicTitle}
        description={dynamicDesc}
        canonical={`/area/${slug}`}
        jsonLd={jsonLdSchemas}
      />
      <Navbar />

      {/* Hero */}
      <section
        className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden"
        style={{ backgroundColor: "#0A1428" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 30% 80%, rgba(0,229,204,0.12) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6">
          <AnimatedSection>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5"
              style={{
                border: "1px solid rgba(0,229,204,0.3)",
                backgroundColor: "rgba(0,229,204,0.08)",
              }}
            >
              <MapPin size={13} style={{ color: "#00E5CC" }} />
              <span
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "#00E5CC" }}
              >
                Area Guide
              </span>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-balance"
              style={{ color: "#fff" }}
            >
              Living in {areaName}{" "}
              <span style={{ color: "#00E5CC" }}>{postcode}</span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <p
              className="text-sm sm:text-lg max-w-2xl leading-relaxed mb-6"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Schools, commute times & property insights —
              updated {currentMonth}.
            </p>
          </AnimatedSection>

          {/* Quick stat pills */}
          {!isLoading && stats && (
            <AnimatedSection delay={300}>
              <div className="flex flex-wrap gap-3">
                {stats.avgValuation > 0 && (
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: "rgba(0,229,204,0.1)",
                      border: "1px solid rgba(0,229,204,0.25)",
                      color: "#00E5CC",
                    }}
                  >
                    <House size={14} />
                    Avg. £{(stats.avgValuation / 1000).toFixed(0)}k
                  </div>
                )}
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor:
                      stats.demandScore === "High"
                        ? "rgba(0,229,204,0.15)"
                        : "rgba(255,255,255,0.06)",
                    border: `1px solid ${stats.demandScore === "High" ? "rgba(0,229,204,0.35)" : "rgba(255,255,255,0.12)"}`,
                    color:
                      stats.demandScore === "High"
                        ? "#00E5CC"
                        : "rgba(255,255,255,0.6)",
                  }}
                >
                  <TrendingUp size={14} />
                  Demand: {stats.demandScore}
                </div>
                {stats.count > 0 && (
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    <BarChart3 size={14} />
                    {stats.count} valuations
                  </div>
                )}
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-12 sm:py-20 space-y-16">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading area data…</span>
          </div>
        ) : (
          <>
            {/* Live Stats Section */}
            <AnimatedSection>
              <div className="grid sm:grid-cols-3 gap-5">
                <StatCard
                  icon={<House size={20} />}
                  label="Average Valuation"
                  value={
                    stats?.avgValuation
                      ? `£${stats.avgValuation.toLocaleString()}`
                      : "No data yet"
                  }
                  sub={
                    stats?.avgConfidence
                      ? `${stats.avgConfidence}% AI confidence`
                      : "Be the first to value here"
                  }
                />
                <StatCard
                  icon={<TrendingUp size={20} />}
                  label="Demand Score"
                  value={stats?.demandScore || "Emerging"}
                  sub={`Based on ${stats?.count || 0} Hummm valuations`}
                  highlight={stats?.demandScore === "High"}
                />
                <StatCard
                  icon={<Train size={20} />}
                  label="Nearest Station"
                  value={
                    lifeMetrics?.transport?.nearestStation?.name || "Checking…"
                  }
                  sub={
                    lifeMetrics?.transport?.nearestStation?.walkMinutes
                      ? `${lifeMetrics.transport.nearestStation.walkMinutes}-min walk`
                      : ""
                  }
                />
              </div>
            </AnimatedSection>

            {/* Hummm Pulse Map */}
            {mapLat && mapLng && (
              <AnimatedSection>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-6 flex items-center gap-2">
                  <MapPin size={22} className="text-primary" />
                  Hummm Pulse Map
                </h2>
                <div className="rounded-2xl overflow-hidden border border-border" style={{ height: 320 }}>
                  <MapContainer
                    center={[mapLat, mapLng]}
                    zoom={14}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={false}
                    dragging={false}
                    zoomControl={false}
                    doubleClickZoom={false}
                    touchZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />
                    {/* Center pin */}
                    <Marker position={[mapLat, mapLng]} icon={tealIcon}>
                      <Popup><strong>{postcode}</strong> — Area centre</Popup>
                    </Marker>
                    {/* Station */}
                    {station && mapLat && mapLng && (
                      <Marker
                        position={[
                          mapLat + (station.distance ? station.distance / 111000 * 0.7 : 0.003),
                          mapLng + (station.distance ? station.distance / 111000 * 0.7 : 0.003),
                        ]}
                        icon={stationIcon}
                      >
                        <Popup>🚉 <strong>{station.name}</strong> — {station.walkMinutes}-min walk</Popup>
                      </Marker>
                    )}
                    {/* Schools */}
                    {topSchools.map((s: any, i: number) => {
                      const offsetLat = mapLat + ((i - 1) * 0.003);
                      const offsetLng = mapLng - 0.004 + (i * 0.002);
                      return (
                        <Marker key={i} position={[offsetLat, offsetLng]} icon={schoolIcon}>
                          <Popup>🎓 <strong>{s.name}</strong><br />Ofsted: {s.ofsted}</Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  Hummm Verified locations · Schools & stations approximate
                </p>
              </AnimatedSection>
            )}

            {/* Top Schools */}
            <AnimatedSection>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-6 flex items-center gap-2">
                <GraduationCap size={22} className="text-primary" />
                Top Schools Near {postcode}
              </h2>
              {topSchools.length > 0 ? (
                <div className="grid sm:grid-cols-3 gap-4">
                  {topSchools.map((school: any, i: number) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-border bg-card p-5 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm font-bold leading-snug">
                          {school.name}
                        </h3>
                        <span
                          className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            school.ofsted === "Outstanding"
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {school.ofsted}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {school.distance && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} />
                            {school.distance}m away
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star size={11} />
                          {school.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No school data available for this area yet.
                </p>
              )}
            </AnimatedSection>

            {/* Area Vibe */}
            {lifeMetrics?.vibe && (
              <AnimatedSection>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-6 flex items-center gap-2">
                  <Users size={22} className="text-primary" />
                  About {areaName}
                </h2>
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">District:</span>{" "}
                    {lifeMetrics.vibe.district}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Region:</span>{" "}
                    {lifeMetrics.vibe.region}
                  </p>
                  {lifeMetrics.vibe.ward && (
                    <p>
                      <span className="font-semibold text-foreground">Ward:</span>{" "}
                      {lifeMetrics.vibe.ward}
                    </p>
                  )}
                  {lifeMetrics.summary?.connectivity && (
                    <p>
                      <span className="font-semibold text-foreground">Transport:</span>{" "}
                      {lifeMetrics.summary.connectivity}
                    </p>
                  )}
                </div>
              </AnimatedSection>
            )}

            {/* Big CTA */}
            <AnimatedSection>
              <div
                className="relative overflow-hidden rounded-2xl p-8 sm:p-12 text-center"
                style={{ backgroundColor: "#0A1428" }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 100%, rgba(0,229,204,0.15) 0%, transparent 60%)",
                  }}
                />
                <div className="relative z-10">
                  <Sparkles
                    size={28}
                    className="mx-auto mb-4"
                    style={{ color: "#00E5CC" }}
                  />
                  <h2
                    className="text-2xl sm:text-3xl font-black mb-3 text-balance"
                    style={{ color: "#fff" }}
                  >
                    Buying in {postcode}?
                  </h2>
                  <p
                    className="text-sm sm:text-base mb-8 max-w-lg mx-auto"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    Use the Hummm Negotiator to win your dream home — AI-powered
                    offers, strategic counter-moves, and real-time deal tracking.
                  </p>
                  <Link
                    to={`/propertyscout?postcode=${encodeURIComponent(postcode)}`}
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4 sm:py-5 text-sm sm:text-base font-bold rounded-full transition-all hover:brightness-110 animate-pulse-glow"
                    style={{
                      backgroundColor: "#00E5CC",
                      color: "#0A1428",
                      boxShadow: "0 0 30px rgba(0,229,204,0.3)",
                    }}
                  >
                    <Sparkles size={16} />
                    Use the Hummm Negotiator
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </AnimatedSection>

            {/* Freshness note */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Data updated {currentMonth}. Powered by Hummm, Postcodes.io &
                OpenStreetMap.
              </p>
            </div>
          </>
        )}
      </div>

      <Footer />
      <ChatWidget />
    </div>
  );
};

/* ── Stat Card sub-component ── */

function StatCard({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 space-y-2 ${
        highlight
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-card"
      }`}
    >
      <div className={`${highlight ? "text-primary" : "text-muted-foreground"}`}>
        {icon}
      </div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-xl font-black tracking-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default AreaGuide;
