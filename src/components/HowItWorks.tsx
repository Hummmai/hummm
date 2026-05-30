import { useInView } from "@/hooks/use-in-view";
import { Link } from "react-router-dom";
import { Link2, FileSearch, Zap, ArrowRight } from "lucide-react";

const STEPS = [
  { icon: Link2, num: "01", title: "Drop a Link", desc: "Paste any property listing URL or postcode into Hummm." },
  { icon: FileSearch, num: "02", title: "Get Your Report", desc: "AI scrapes, analyses, and values the property in seconds." },
  { icon: Zap, num: "03", title: "Act with Hummm", desc: "Draft emails, negotiate, and make confident decisions." },
];

const HowItWorks = () => {
  const { ref, isInView } = useInView(0.15);

  return (
    <section id="how-it-works" className="relative py-28 sm:py-36 lg:py-44 section-padding overflow-hidden" ref={ref}>
      {/* Ambient backdrop glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full blur-[120px] opacity-[0.08] transition-opacity duration-[1500ms]"
          style={{ background: "radial-gradient(closest-side, hsl(168 80% 48%), transparent)", opacity: isInView ? 0.1 : 0 }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_70%)]" />
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20 sm:mb-24">
          <p
            className="text-[10px] font-medium tracking-[0.3em] uppercase text-primary/60 mb-4 transition-[opacity,transform] duration-700"
            style={{ opacity: isInView ? 1 : 0, transform: isInView ? "translateY(0)" : "translateY(12px)" }}
          >
            How it works
          </p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent transition-[opacity,transform] duration-700 delay-100"
            style={{ opacity: isInView ? 1 : 0, transform: isInView ? "translateY(0)" : "translateY(16px)" }}
          >
            Three steps to property mastery
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-6 relative">
          {/* Animated connecting line */}
          <div className="hidden md:block absolute top-14 left-[16.67%] right-[16.67%] h-px overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-transparent via-primary/30 to-transparent transition-[width] duration-[1400ms] delay-500"
              style={{ width: isInView ? "100%" : "0%", transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
            />
            {/* Travelling pulse */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-[2px] w-24 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent blur-[1px]"
              style={{
                animation: isInView ? "hiw-travel 3.5s cubic-bezier(0.4,0,0.2,1) 1.4s infinite" : "none",
                opacity: isInView ? 1 : 0,
              }}
            />
          </div>

          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="relative group text-center transition-[opacity,transform] duration-[800ms]"
              style={{
                opacity: isInView ? 1 : 0,
                transform: isInView ? "translateY(0)" : "translateY(30px)",
                transitionDelay: `${300 + i * 180}ms`,
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <div className="relative mx-auto w-28 h-28 mb-8 flex items-center justify-center">
                {/* Outer pulse rings */}
                <span
                  className="absolute inset-0 rounded-full border border-primary/20"
                  style={{
                    animation: isInView ? `hiw-pulse 3s ease-out ${0.8 + i * 0.4}s infinite` : "none",
                  }}
                />
                <span
                  className="absolute inset-0 rounded-full border border-primary/10"
                  style={{
                    animation: isInView ? `hiw-pulse 3s ease-out ${1.6 + i * 0.4}s infinite` : "none",
                  }}
                />
                {/* Glow */}
                <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                {/* Glass disc */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/[0.08] to-primary/[0.02] backdrop-blur-sm border border-primary/20 shadow-[inset_0_1px_0_0_hsl(168_80%_60%/0.15)] group-hover:border-primary/40 group-hover:shadow-[0_0_40px_-10px_hsl(168_80%_48%/0.5)] transition-[border-color,box-shadow,transform] duration-500 group-hover:scale-105" />
                {/* Rotating conic accent */}
                <div
                  className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-700"
                  style={{
                    background: "conic-gradient(from 0deg, transparent 70%, hsl(168 80% 48% / 0.6), transparent)",
                    mask: "radial-gradient(circle, transparent 58%, black 60%)",
                    WebkitMask: "radial-gradient(circle, transparent 58%, black 60%)",
                    animation: "hiw-spin 4s linear infinite",
                  }}
                />
                <step.icon
                  size={30}
                  strokeWidth={1.75}
                  className="text-primary relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 drop-shadow-[0_0_12px_hsl(168_80%_48%/0.4)]"
                />
              </div>

              <span className="text-[10px] font-medium tracking-[0.4em] uppercase text-primary/50 mb-3 block tabular-nums">
                Step {step.num}
              </span>
              <h3 className="text-lg font-semibold text-foreground mb-3 tracking-tight">{step.title}</h3>
              <p className="text-sm text-white/55 leading-relaxed max-w-[260px] mx-auto text-balance">{step.desc}</p>
            </div>
          ))}
        </div>

        <div
          className="text-center mt-20 sm:mt-24 transition-[opacity,transform] duration-700 delay-700"
          style={{ opacity: isInView ? 1 : 0, transform: isInView ? "translateY(0)" : "translateY(16px)" }}
        >
          <Link
            to="/ai-valuation"
            className="btn-press group/cta inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-8px_hsl(168_80%_48%/0.5)]"
          >
            Try it free
            <ArrowRight size={15} className="transition-transform duration-300 group-hover/cta:translate-x-1" />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes hiw-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          80% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes hiw-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes hiw-travel {
          0% { left: -10%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { left: 110%; opacity: 0; }
        }
      `}</style>
    </section>
  );
};

export default HowItWorks;
