import { Award } from "lucide-react";
import GoldHummm from "./GoldHummm";

const MINT = "#72F1B8";

interface FounderBadgeProps {
  status: "founder" | "founder_gold" | null;
  size?: "sm" | "md";
}

export default function FounderBadge({ status, size = "sm" }: FounderBadgeProps) {
  if (!status) return null;

  const isVolt = status === "founder_gold";
  const px = size === "sm" ? "px-2.5 py-1" : "px-3 py-1.5";
  const text = size === "sm" ? "text-[10px]" : "text-xs";

  if (isVolt) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 ${px} rounded-full`}
        style={{ backgroundColor: `${MINT}15`, border: `1px solid ${MINT}40`, boxShadow: `0 0 12px ${MINT}20` }}
      >
        <GoldHummm size={size === "sm" ? 12 : 14} pulse={false} />
        <span
          className={`${text} font-black uppercase tracking-widest`}
          style={{ background: `linear-gradient(to right, #ffffff, ${MINT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          Founder
        </span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${px} rounded-full bg-primary/10 border border-primary/25`}
    >
      <Award size={size === "sm" ? 10 : 12} className="text-primary" />
      <span className={`${text} font-bold uppercase tracking-widest text-primary`}>
        Founder
      </span>
    </div>
  );
}
