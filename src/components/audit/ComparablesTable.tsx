import { memo } from "react";
import type { DetailedComp } from "@/types/audit";

interface ComparablesTableProps {
  comps: DetailedComp[];
  currency: string;
  showAll?: boolean;
  className?: string;
}

/**
 * ComparablesTable (Phase 3)
 * 
 * Restores a cleaner, more detailed comparables view.
 */
function ComparablesTable({ comps, currency, showAll = false, className = "" }: ComparablesTableProps) {
  const displayComps = showAll ? comps : comps.slice(0, 4);

  if (!comps || comps.length === 0) return null;

  return (
    <div className={`overflow-x-auto ${className}`}>
      {/* Desktop table */}
      <table className="w-full text-sm hidden sm:table">
        <thead>
          <tr className="border-b border-border/60 text-left text-muted-foreground text-xs">
            <th className="py-2 pr-4 font-normal">Address</th>
            <th className="py-2 px-4 font-normal text-right">Sale Price</th>
            <th className="py-2 px-4 font-normal">Date</th>
            <th className="py-2 pl-4 font-normal">Type</th>
          </tr>
        </thead>
        <tbody>
          {displayComps.map((c, i) => (
            <tr key={i} className="border-b border-border/30 last:border-0">
              <td className="py-2.5 pr-4">{c.address}</td>
              <td className="py-2.5 px-4 font-mono text-right">{currency}{c.price?.toLocaleString()}</td>
              <td className="py-2.5 px-4 text-muted-foreground">{c.date}</td>
              <td className="py-2.5 pl-4 text-muted-foreground">{c.type}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile stacked cards */}
      <div className="sm:hidden space-y-2">
        {displayComps.map((c, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-muted/30 p-3 text-xs">
            <div className="font-medium truncate mb-1">{c.address}</div>
            <div className="flex justify-between text-muted-foreground">
              <span>{c.date} • {c.type}</span>
              <span className="font-mono text-foreground">{currency}{c.price?.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(ComparablesTable);
