import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Flame } from "lucide-react";

const MARKET_DATA = [
  { city: "LDN E14", growth: -0.1 },
  { city: "MCR M1", growth: 0.5, hot: true },
  { city: "LDS LS1", growth: 9.6, suffix: " Yield" },
  { city: "BHM B1", growth: 2.4 },
  { city: "NCL NE1", growth: 9.7, suffix: " Yield" },
  { city: "GLA G1", growth: 3.6 },
  { city: "LDN N1", growth: 1.2 },
  { city: "MCR M4", growth: 4.1, hot: true },
];

interface MarketTickerProps {
  pill?: boolean;
}

const MarketTicker = ({ pill }: MarketTickerProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!pill) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % MARKET_DATA.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [pill]);

  // Pill mode: rotating single item for navbar center
  if (pill) {
    const item = MARKET_DATA[index];
    const isPositive = item.growth > 0;
    const isNeutral = item.growth === 0;
    const colorClass = isPositive ? "text-emerald-400" : isNeutral ? "text-muted-foreground" : "text-red-400";
    const Icon = isPositive ? TrendingUp : isNeutral ? Minus : TrendingDown;

    return (
      <div className="flex items-center gap-1.5 text-[11px] font-medium tabular-nums tracking-tight transition-all duration-500">
        <span className="text-foreground/80 font-bold">{item.city}:</span>
        <Icon className={`h-3 w-3 ${colorClass}`} />
        <span className={`font-semibold ${colorClass} ${isPositive ? "animate-pulse" : ""}`}>
          {isPositive ? "+" : ""}{item.growth}%{item.suffix || ""}
        </span>
        {(item as any).hot && <Flame className="h-3 w-3 text-orange-400" />}
      </div>
    );
  }

  // Full ticker mode (used in mobile / standalone)
  return (
    <div className="w-full bg-[hsl(var(--card))] border-b border-border/40 overflow-hidden">
      <div className="flex items-center">
        <div className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-primary/10 border-r border-border/40">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-semibold text-primary tracking-widest uppercase">
            2026 Market
          </span>
        </div>
        <div className="overflow-hidden flex-1 relative">
          <div className="animate-ticker flex items-center gap-8 whitespace-nowrap py-2 pr-8">
            {[...MARKET_DATA, ...MARKET_DATA].map((item, i) => {
              const isPositive = item.growth > 0;
              const isNeutral = item.growth === 0;
              const Icon = isPositive ? TrendingUp : isNeutral ? Minus : TrendingDown;
              const colorClass = isPositive ? "text-emerald-400" : isNeutral ? "text-muted-foreground" : "text-red-400";
              return (
                <span key={`${item.city}-${i}`} className="inline-flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-foreground/90 tracking-wide">{item.city}:</span>
                  <Icon className={`h-3 w-3 ${colorClass}`} />
                  <span className={`font-semibold tabular-nums ${colorClass}`}>
                    {isPositive ? "+" : ""}{item.growth}%{item.suffix || ""}
                  </span>
                  {(item as any).hot && <Flame className="h-3 w-3 text-orange-400" />}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;
