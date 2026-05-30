import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "I nearly paid £35,000 over the odds. Hummm flagged the overpricing in seconds and gave me an exact opening offer. I saved £22,000.",
    name: "Sarah T.",
    role: "First-time buyer, Bristol",
    stars: 5,
  },
  {
    quote: "As a landlord with 8 properties, the compliance dashboard alone is worth it. I can see every cert expiry at a glance and the yield analysis is genuinely useful.",
    name: "Marcus L.",
    role: "Portfolio landlord, Manchester",
    stars: 5,
  },
  {
    quote: "My landlord tried to increase rent by 18%. The AI negotiator drafted a response citing local market data — we settled at 4%. Incredible.",
    name: "Priya K.",
    role: "Renter, London",
    stars: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-28 sm:py-36 section-padding">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2 text-balance">
            Trusted by property people across the UK
          </h2>
          <p className="text-sm font-semibold text-primary">
            4.9/5 from 2,400+ reviews
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl p-6 flex flex-col"
              style={{ background: "#111c30", border: "1px solid rgba(255,255,255,0.06)", borderLeft: "2px solid hsl(168, 80%, 48%)" }}
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-white/70 leading-relaxed italic flex-1 mb-5">
                "{t.quote}"
              </p>

              {/* Author */}
              <div>
                <p className="text-sm font-bold text-white">{t.name}</p>
                <p className="text-xs text-white/30">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
