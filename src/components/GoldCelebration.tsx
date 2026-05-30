import { useState, useEffect } from "react";
import { Bird, Sparkles } from "lucide-react";

const MINT = "#72F1B8";
const MINT_DARK = "#2FD1B5";

interface GoldCelebrationProps {
  show: boolean;
  onComplete: () => void;
}

const GoldCelebration = ({ show, onComplete }: GoldCelebrationProps) => {
  const [phase, setPhase] = useState<"fly" | "text" | "fade">("fly");

  useEffect(() => {
    if (!show) return;
    setPhase("fly");
    const t1 = setTimeout(() => setPhase("text"), 1200);
    const t2 = setTimeout(() => setPhase("fade"), 3500);
    const t3 = setTimeout(onComplete, 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-700 ${
        phase === "fade" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ background: "radial-gradient(ellipse at center, rgba(10,20,40,0.97) 0%, rgba(5,10,20,0.99) 100%)" }}
    >
      <div className="absolute" style={{ animation: "Hummm AI-fly 1.2s cubic-bezier(0.22,1,0.36,1) forwards" }}>
        <span
          className="inline-flex items-center justify-center rounded-full volt-pulse"
          style={{ background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`, padding: 16 }}
        >
          <Bird size={48} style={{ color: "#0A1428", transform: "scaleX(-1) rotate(-15deg)", filter: `drop-shadow(0 0 8px ${MINT}99)` }} strokeWidth={2} />
          <span className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)" }} />
        </span>
      </div>

      <div className={`text-center transition-all duration-700 ${phase === "text" || phase === "fade" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles size={20} style={{ color: MINT }} />
          <h2
            className="text-3xl sm:text-4xl font-black tracking-tight"
            style={{ background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            Hummm Status Active
          </h2>
          <Sparkles size={20} style={{ color: MINT }} />
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          You have unlocked the <strong style={{ color: MINT }}>Professional Strategy Hub</strong>.
          AI coaching, tactical templates, and live market intelligence — at your command.
        </p>
      </div>

      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: i % 2 === 0 ? MINT : "#00E5CC",
            animation: `gold-particle ${1.5 + Math.random()}s ease-out ${Math.random() * 0.5}s forwards`,
            left: `${30 + Math.random() * 40}%`,
            top: `${40 + Math.random() * 20}%`,
          }}
        />
      ))}
    </div>
  );
};

export default GoldCelebration;
