import { useState } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import { Bath, Bed, MapPin, Maximize, Sparkles } from "lucide-react";

import prop1 from "@/assets/property-1.jpg";
import prop2 from "@/assets/property-2.jpg";
import prop3 from "@/assets/property-3.jpg";
import prop4 from "@/assets/property-4.jpg";
import prop5 from "@/assets/property-5.jpg";
import prop6 from "@/assets/property-6.jpg";

const properties = [
  { id: 1, img: prop1, title: "Georgian Townhouse", location: "Kensington, London", price: "£1,850,000", beds: 4, baths: 3, sqft: "2,800", type: "sale", aiScore: 94 },
  { id: 2, img: prop2, title: "Sky Penthouse", location: "Deansgate, Manchester", price: "£875,000", beds: 3, baths: 2, sqft: "1,600", type: "sale", aiScore: 91 },
  { id: 3, img: prop3, title: "The Glass Tower Apartment", location: "Colmore Row, Birmingham", price: "£2,200/mo", beds: 2, baths: 2, sqft: "1,200", type: "lettings", aiScore: 88 },
  { id: 4, img: prop4, title: "Contemporary Villa", location: "Hampstead, London", price: "£3,250,000", beds: 5, baths: 4, sqft: "4,100", type: "sale", aiScore: 97 },
  { id: 5, img: prop5, title: "Warehouse Conversion", location: "Ancoats, Manchester", price: "£1,450/mo", beds: 2, baths: 1, sqft: "950", type: "lettings", aiScore: 85 },
  { id: 6, img: prop6, title: "Modern Family Home", location: "Harborne, Birmingham", price: "£425,000", beds: 3, baths: 2, sqft: "1,400", type: "sale", aiScore: 89 },
];

const filters = ["All", "Sales", "Lettings"];

const PropertiesSection = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = properties.filter((p) => {
    if (activeFilter === "Sales") return p.type === "sale";
    if (activeFilter === "Lettings") return p.type === "lettings";
    return true;
  });

  return (
    <section id="properties" className="section-spacing section-padding">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
                Portfolio
              </p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
                Featured Properties
              </h2>
              <p className="text-muted-foreground">AI-curated selection across the UK's most desirable locations.</p>
            </div>
            <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
                    activeFilter === f
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filtered.map((p, i) => (
            <AnimatedSection key={p.id} delay={i * 80}>
              <div className="group border border-border rounded-lg overflow-hidden bg-card hover-lift cursor-pointer">
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    width={800}
                    height={600}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground rounded-sm">
                      {p.type === "sale" ? "For Sale" : "To Let"}
                    </span>
                    <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider bg-card/90 text-primary border border-primary/30 rounded-sm flex items-center gap-1">
                      <Sparkles size={8} />
                      AI-Priced
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 bg-primary/90 text-primary-foreground text-[10px] font-semibold rounded-sm">
                    <Sparkles size={10} />
                    AI Score: {p.aiScore}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <MapPin size={12} />
                    {p.location}
                  </div>
                  <h3 className="text-base font-semibold mb-3">{p.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Bed size={12} />{p.beds}</span>
                    <span className="flex items-center gap-1"><Bath size={12} />{p.baths}</span>
                    <span className="flex items-center gap-1"><Maximize size={12} />{p.sqft} sq ft</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary tabular-nums">{p.price}</span>
                    <span className="text-xs text-muted-foreground hover:text-primary transition-colors">
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertiesSection;