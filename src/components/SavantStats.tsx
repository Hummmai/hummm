import { useState, useEffect, useRef } from "react";
import { TrendingUp, AlertTriangle, Globe } from "lucide-react";

const MINT = "#72F1B8";

const useCountUp = (target: number, duration = 2200) => {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return value;
};

const SavantStats = () => {
  const negotiated = useCountUp(15_200_000);
  const redFlags = useCountUp(6_840);
  const audits = useCountUp(12_400);

  return (
    <section
      className="relative w-full overflow-hidden bg-background"
      style={{ borderTop: `1px solid ${MINT}10`, borderBottom: `1px solid ${MINT}10` }}
    >
      <div className="max-w-5xl mx-auto px-5 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
          {/* Negotiated */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={14} style={{ color: MINT }} />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
                Negotiated
              </span>
            </div>
            <span
              className="text-2xl sm:text-3xl font-black tabular-nums"
              style={{
                background: `linear-gradient(to right, ${MINT}, #2FD1B5)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ${(negotiated / 1_000_000).toFixed(1)}M
            </span>
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>saved for clients globally</span>
          </div>

          {/* Red Flags */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={14} style={{ color: "#F59E0B" }} />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
                Red Flags
              </span>
            </div>
            <span className="text-2xl sm:text-3xl font-black tabular-nums" style={{ color: "#F59E0B" }}>
              {redFlags.toLocaleString()}
            </span>
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>spotted &amp; flagged</span>
          </div>

          {/* Global Audits */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Globe size={14} style={{ color: MINT }} />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
                Global Audits
              </span>
            </div>
            <span
              className="text-2xl sm:text-3xl font-black tabular-nums"
              style={{
                background: `linear-gradient(to right, ${MINT}, #2FD1B5)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {audits.toLocaleString()}+
            </span>
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>cross-border property audits</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SavantStats;
