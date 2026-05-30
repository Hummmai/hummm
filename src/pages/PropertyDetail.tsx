import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import AnimatedSection from "@/components/AnimatedSection";
import SEOHead from "@/components/SEOHead";
import MortgageCalculator from "@/components/MortgageCalculator";
import MortgageQualificationModal from "@/components/MortgageQualificationModal";
import { ArrowLeft, BedDouble, Bath, Maximize, MapPin, TreePine, Car, Zap, Sparkles, Leaf, ArrowRight, Phone, Mail, CalendarDays } from "lucide-react";
import LifestyleCard from "@/components/LifestyleCard";
import CommuteTimeline from "@/components/CommuteTimeline";

import prop1 from "@/assets/properties/property-1.jpg";
import prop2 from "@/assets/properties/property-2.jpg";
import prop3 from "@/assets/properties/property-3.jpg";
import prop4 from "@/assets/properties/property-4.jpg";
import prop5 from "@/assets/properties/property-5.jpg";
import prop6 from "@/assets/properties/property-6.jpg";
import prop7 from "@/assets/properties/property-7.jpg";
import prop8 from "@/assets/properties/property-8.jpg";
import prop9 from "@/assets/properties/property-9.jpg";

const properties = [
  { id: 1, image: prop1, price: 425000, address: "14 Oakwood Drive, Didsbury", location: "Manchester, M20 2TG", beds: 4, baths: 2, sqft: 1850, type: "Detached", listingType: "sale" as const, hasGarden: true, hasParking: true, epcRating: "B", description: "A beautifully presented four-bedroom detached family home in the heart of Didsbury. This property features a spacious open-plan kitchen/diner, a large south-facing garden, off-street parking for two vehicles, and a modern family bathroom. Situated within walking distance of excellent schools, boutique shops, and transport links to Manchester city centre." },
  { id: 2, image: prop2, price: 1450, address: "Apt 12, The Quarter, Deansgate", location: "Manchester, M3 4LQ", beds: 2, baths: 2, sqft: 920, type: "Flat", listingType: "rent" as const, isPerMonth: true, hasParking: true, epcRating: "C", description: "A stunning two-bedroom apartment in the vibrant Deansgate district. Features floor-to-ceiling windows, a sleek open-plan living area, two contemporary en-suite bathrooms, and a secure underground parking space. Residents benefit from a 24-hour concierge, gym, and rooftop terrace with panoramic city views." },
  { id: 3, image: prop3, price: 685000, address: "27 Victoria Terrace, Clapham", location: "London, SW4 6HT", beds: 3, baths: 2, sqft: 1420, type: "Terraced", listingType: "sale" as const, hasGarden: true, epcRating: "C", description: "A charming Victorian terraced house in the sought-after Clapham area. Retaining many period features including original fireplaces and cornicing, this home offers three generous bedrooms, a modern eat-in kitchen, a private rear garden, and excellent transport links via Clapham Common tube station." },
  { id: 4, image: prop4, price: 375000, address: "8 Birch Lane, Edgbaston", location: "Birmingham, B15 3ES", beds: 4, baths: 3, sqft: 2100, type: "Semi-Detached", listingType: "sale" as const, hasGarden: true, hasParking: true, epcRating: "B", description: "A substantial four-bedroom semi-detached home in the prestigious Edgbaston neighbourhood. This property boasts a large reception room, a separate dining room, a fully fitted kitchen, three bathrooms, a generous rear garden, and a driveway with space for multiple vehicles. Close to local amenities, parks, and the city centre." },
  { id: 5, image: prop5, price: 289950, address: "Plot 7, Millbrook Gardens", location: "Leeds, LS6 3HN", beds: 3, baths: 2, sqft: 1100, type: "Townhouse", listingType: "sale" as const, hasParking: true, isNewBuild: true, epcRating: "A", description: "A brand-new three-bedroom townhouse on the highly anticipated Millbrook Gardens development. Built to the highest standards with underfloor heating, a designer kitchen with integrated appliances, two modern bathrooms, allocated parking, and a landscaped communal garden. Energy efficient with an EPC rating of A." },
  { id: 6, image: prop6, price: 550000, address: "Rose Cottage, Mill Lane", location: "Cotswolds, GL54 1AB", beds: 3, baths: 1, sqft: 1350, type: "House", listingType: "sale" as const, hasGarden: true, epcRating: "D", description: "A quintessential Cotswold stone cottage brimming with character and charm. Rose Cottage offers three cosy bedrooms, exposed beams throughout, a country kitchen with Aga, a picturesque cottage garden, and views over rolling countryside. Located in a peaceful hamlet yet close to village amenities." },
  { id: 7, image: prop7, price: 3200, address: "Penthouse 1, Sky Tower", location: "London, E14 5AB", beds: 3, baths: 2, sqft: 1800, type: "Flat", listingType: "rent" as const, isPerMonth: true, hasParking: true, epcRating: "B", description: "An exceptional penthouse apartment atop the iconic Sky Tower in Canary Wharf. This luxurious three-bedroom residence features a wraparound terrace with breathtaking Thames views, a bespoke kitchen, underfloor heating, two designer bathrooms, and a private parking bay. Access to exclusive residents' facilities including pool, spa, and cinema room." },
  { id: 8, image: prop8, price: 265000, address: "Sunnyside, Park Avenue", location: "Solihull, B91 3QT", beds: 2, baths: 1, sqft: 950, type: "Bungalow", listingType: "sale" as const, hasGarden: true, hasParking: true, epcRating: "C", description: "A well-maintained two-bedroom bungalow in a quiet residential street in Solihull. Ideal for downsizers or first-time buyers, the property features a bright lounge, a fitted kitchen, a modern bathroom, a private rear garden, and a driveway with garage. Within easy reach of Solihull town centre, parks, and excellent schools." },
  { id: 9, image: prop9, price: 495000, address: "12 Elm Road, West Bridgford", location: "Nottingham, NG2 7PL", beds: 4, baths: 2, sqft: 1650, type: "Detached", listingType: "sale" as const, hasGarden: true, hasParking: true, isNewBuild: true, epcRating: "A", description: "A stunning new-build four-bedroom detached home in the desirable West Bridgford area. This energy-efficient property features a contemporary open-plan living space, a high-specification kitchen, two luxurious bathrooms, a south-facing garden, and a double driveway. Close to excellent schools, shops, and the Trent Bridge sports quarter." },
];

const fmt = (price: number, pm?: boolean) =>
  pm ? `£${price.toLocaleString()} pcm` : `£${price.toLocaleString()}`;

const PropertyDetail = () => {
  const { id } = useParams();
  const property = properties.find(p => p.id === Number(id));
  const [showMortgageGate, setShowMortgageGate] = useState(false);
  const [mortgageGateAction, setMortgageGateAction] = useState<"viewing" | "offer">("viewing");

  const triggerWithGate = (action: "viewing" | "offer") => {
    setMortgageGateAction(action);
    setShowMortgageGate(true);
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40">
          <h1 className="text-2xl font-bold mb-2">Property Not Found</h1>
          <p className="text-muted-foreground mb-6">This listing may have been removed or doesn't exist.</p>
          <Link to="/properties" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl bg-primary text-primary-foreground">
            <ArrowLeft size={16} /> Back to Properties
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const keyFeatures = [
    `${property.beds} Bedroom${property.beds > 1 ? "s" : ""}`,
    `${property.baths} Bathroom${property.baths > 1 ? "s" : ""}`,
    `${property.sqft.toLocaleString()} sq ft`,
    property.type,
    ...(property.hasGarden ? ["Private Garden"] : []),
    ...(property.hasParking ? ["Parking"] : []),
    ...(property.isNewBuild ? ["New Build"] : []),
    ...(property.epcRating ? [`EPC Rating ${property.epcRating}`] : []),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title={`${property.address} | ${fmt(property.price, property.isPerMonth)} | Hummm`}
        description={`${property.type} ${property.listingType === "sale" ? "for sale" : "to let"} at ${property.address}, ${property.location}. ${property.beds} beds, ${property.baths} baths, ${property.sqft} sq ft. AI-priced by Hummm.`}
        canonical={`/properties/${property.id}`}
      />
      <Navbar />

      {/* Back link */}
      <div className="pt-24 pb-4 section-padding max-w-5xl mx-auto">
        <Link to="/properties" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={16} /> Back to Properties
        </Link>
      </div>

      <div className="section-padding max-w-5xl mx-auto pb-8">
        <AnimatedSection>
          {/* Hero image */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-8" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest rounded-lg bg-primary text-primary-foreground" style={{ boxShadow: "0 0 16px rgba(0,229,204,0.35)" }}>
                <Sparkles size={11} /> AI Priced
              </span>
              {property.isNewBuild && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-foreground/90 text-background">
                  <Zap size={10} /> New Build
                </span>
              )}
            </div>
            <img src={property.image} alt={`${property.address} - ${property.type} ${property.listingType === "sale" ? "for sale" : "to let"}`}
              className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatedSection delay={60}>
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-balance">{property.address}</h1>
                  <span className="text-2xl sm:text-3xl font-black text-primary tabular-nums whitespace-nowrap">
                    {fmt(property.price, property.isPerMonth)}
                  </span>
                </div>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin size={14} className="text-primary shrink-0" /> {property.location}
                </p>
              </div>
            </AnimatedSection>

            {/* Specs bar */}
            <AnimatedSection delay={100}>
              <div className="flex flex-wrap gap-6 p-5 rounded-2xl border border-border bg-card/40" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.12)" }}>
                <div className="flex items-center gap-2">
                  <BedDouble size={18} className="text-primary" />
                  <div><p className="text-lg font-bold tabular-nums">{property.beds}</p><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Beds</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Bath size={18} className="text-primary" />
                  <div><p className="text-lg font-bold tabular-nums">{property.baths}</p><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Baths</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize size={18} className="text-primary" />
                  <div><p className="text-lg font-bold tabular-nums">{property.sqft.toLocaleString()}</p><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Sq Ft</p></div>
                </div>
                {property.epcRating && (
                  <div className="flex items-center gap-2">
                    <Leaf size={18} className="text-primary" />
                    <div><p className="text-lg font-bold">{property.epcRating}</p><p className="text-[10px] uppercase tracking-widest text-muted-foreground">EPC</p></div>
                  </div>
                )}
                {property.hasGarden && (
                  <div className="flex items-center gap-2">
                    <TreePine size={18} className="text-primary" />
                    <div><p className="text-sm font-bold">Yes</p><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Garden</p></div>
                  </div>
                )}
                {property.hasParking && (
                  <div className="flex items-center gap-2">
                    <Car size={18} className="text-primary" />
                    <div><p className="text-sm font-bold">Yes</p><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Parking</p></div>
                  </div>
                )}
              </div>
            </AnimatedSection>

            {/* Description */}
            <AnimatedSection delay={140}>
              <div>
                <h2 className="text-lg font-bold mb-3">About This Property</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{property.description}</p>
              </div>
            </AnimatedSection>

            {/* Key features */}
            <AnimatedSection delay={180}>
              <div>
                <h2 className="text-lg font-bold mb-3">Key Features</h2>
                <ul className="grid grid-cols-2 gap-2">
                  {keyFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AnimatedSection delay={120}>
              <div className="rounded-2xl border border-border bg-card p-6 space-y-5" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}>
                <h3 className="text-base font-bold">Interested in this property?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Get in touch with Hummm to arrange a viewing or ask a question about this property.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => triggerWithGate("viewing")}
                    className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_20px_rgba(0,229,204,0.2)]"
                  >
                    <CalendarDays size={14} /> Request Viewing
                  </button>
                  <button
                    onClick={() => triggerWithGate("offer")}
                    className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all border border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Sparkles size={14} /> Make an Offer
                  </button>
                  <Link to="/negotiate-for-me" className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all border border-border text-muted-foreground hover:text-foreground hover:border-primary/30">
                    <ArrowRight size={14} /> Hummm
                  </Link>
                </div>
              </div>
            </AnimatedSection>

            {/* Mortgage Calculator */}
            {property.listingType === "sale" && (
              <AnimatedSection delay={140}>
                <MortgageCalculator propertyPrice={property.price} />
              </AnimatedSection>
            )}

            <AnimatedSection delay={160}>
              <div className="rounded-2xl border border-border bg-card/40 p-6 text-center" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.12)" }}>
                <Sparkles size={24} className="mx-auto mb-3 text-primary" />
                <h3 className="text-sm font-bold mb-1">Hummm</h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  Your AI companion — strategy, emails, and data to help you make confident decisions.
                </p>
                <Link to="/negotiate-for-me" className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                  Hummm <ArrowRight size={14} />
                </Link>
              </div>
            </AnimatedSection>

            {/* Commute Timeline */}
            {property.location && (
              <AnimatedSection delay={200}>
                <CommuteTimeline
                  postcode={property.location.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i)?.[0] || ""}
                />
              </AnimatedSection>
            )}

            {/* Hummm Lifestyle Card */}
            {property.location && (
              <AnimatedSection delay={240}>
                <LifestyleCard
                  postcode={property.location.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i)?.[0] || ""}
                />
              </AnimatedSection>
            )}
          </div>
        </div>
      </div>

      {/* Mortgage Qualification Gate */}
      {showMortgageGate && (
        <MortgageQualificationModal
          propertyAddress={property.address}
          propertyPrice={property.price}
          postcode={property.location.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i)?.[0]}
          onClose={() => setShowMortgageGate(false)}
          onQualified={() => {
            setShowMortgageGate(false);
            if (mortgageGateAction === "viewing") {
              window.location.href = "/negotiate-for-me";
            } else {
              window.location.href = "/negotiate-for-me";
            }
          }}
        />
      )}

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default PropertyDetail;
