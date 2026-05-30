import { useState, memo } from "react";
import { Hammer } from "lucide-react";
import type { RenovationItem } from "@/types/audit";

interface RenovationSimulatorProps {
  suggestions: RenovationItem[];
  currency: string;
  askingPrice: number;
  className?: string;
}

/**
 * RenovationSimulator (Phase 3 extraction)
 * 
 * Restores the original interactive renovation uplift calculator.
 * Users toggle renovations and see live impact on value.
 */
function RenovationSimulator({
  suggestions,
  currency,
  askingPrice,
  className = "",
}: RenovationSimulatorProps) {
  const [selected, setSelected] = useState<boolean[]>(suggestions.map(() => false));

  const toggle = (index: number) => {
    const next = [...selected];
    next[index] = !next[index];
    setSelected(next);
  };

  const parseRange = (s: string): number => {
    const nums = s.match(/[\d,]+/g)?.map(n => parseInt(n.replace(/,/g, ""), 10)) || [0];
    return nums[nums.length - 1] || 0;
  };

  const totalCost = suggestions.reduce((sum, r, i) => sum + (selected[i] ? parseRange(r.estimatedCost) : 0), 0);
  const totalUplift = suggestions.reduce((sum, r, i) => sum + (selected[i] ? parseRange(r.estimatedUplift) : 0), 0);
  const newValue = askingPrice + totalUplift;

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className={`rounded-2xl border border-primary/20 bg-card/60 p-4 sm:p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Hammer className="text-primary" size={16} />
        <h3 className="font-semibold text-base sm:text-lg">Renovation Uplift Simulator</h3>
      </div>

      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        {suggestions.map((r, i) => (
          <label 
            key={i} 
            className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-muted/40 border border-border/50 cursor-pointer hover:bg-muted/60 active:bg-muted/70 transition-colors touch-manipulation"
          >
            <input
              type="checkbox"
              checked={selected[i]}
              onChange={() => toggle(i)}
              className="mt-0.5 accent-primary w-4 h-4"
            />
            <div className="flex-1 text-xs sm:text-sm min-w-0">
              <div className="font-medium leading-tight">{r.item}</div>
              <div className="text-muted-foreground text-[10px] sm:text-xs mt-0.5 leading-tight">
                Cost: {r.estimatedCost} → Uplift: {r.estimatedUplift}
                {r.roiPercent && ` (${r.roiPercent} ROI)`}
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="pt-3 sm:pt-4 border-t border-border/60 text-xs sm:text-sm space-y-1">
        <div className="flex justify-between">
          <span>Total Investment</span>
          <span className="font-mono">{currency}{totalCost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-semibold text-sm sm:text-base">
          <span>Projected New Value</span>
          <span className="font-mono text-primary">{currency}{newValue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-[10px] sm:text-xs text-emerald-400">
          <span>Net Uplift</span>
          <span>+{currency}{totalUplift.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default memo(RenovationSimulator);
