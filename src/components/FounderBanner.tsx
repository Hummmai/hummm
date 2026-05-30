import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const FOUNDER_LIMIT = 500;
const MINT = "#72F1B8";

const FounderBanner = () => {
  const [founderCount, setFounderCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => setFounderCount(count || 0));
  }, []);

  if (dismissed || founderCount >= FOUNDER_LIMIT) return null;

  return (
    <div className="sticky top-0 left-0 right-0 w-full z-[60]" style={{ backgroundColor: "#0a0f1a", borderBottom: `1px solid ${MINT}20` }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-center gap-2 sm:gap-3">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: MINT }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: MINT }} />
        </span>
        <p className="text-[10px] sm:text-xs font-bold tracking-wide text-white/90 truncate">
          LIVE: Hummm Founder Access |{" "}
          <span className="tabular-nums" style={{ color: MINT }}>{FOUNDER_LIMIT - founderCount}</span>{" "}
          / {FOUNDER_LIMIT} Slots Available at{" "}
          <span style={{ color: MINT }}>£0</span>
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="ml-auto shrink-0 p-1 rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
          aria-label="Dismiss banner"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default FounderBanner;
