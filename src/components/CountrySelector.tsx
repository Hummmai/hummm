import { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe, Check } from "lucide-react";
import { PRICING, type CountryCode } from "@/lib/pricing";

interface Props {
  value: CountryCode;
  onChange: (c: CountryCode) => void;
  className?: string;
}

const CountrySelector = ({ value, onChange, className = "" }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = PRICING[value];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn-press inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-primary/25 bg-card/60 backdrop-blur-md hover:border-primary/50 hover:bg-card/80 transition-all text-[12px] font-semibold text-foreground/90"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe size={13} className="text-primary" />
        <span className="text-base leading-none" aria-hidden="true">{current.flag}</span>
        <span className="tracking-wide">{current.code} · {current.currency}</span>
        <ChevronDown size={13} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-56 z-40 rounded-2xl border border-border bg-popover/95 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in"
        >
          {(Object.values(PRICING)).map((c) => {
            const active = c.code === value;
            return (
              <button
                key={c.code}
                onClick={() => { onChange(c.code); setOpen(false); }}
                role="option"
                aria-selected={active}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                  active ? "bg-primary/10 text-foreground" : "text-foreground/85 hover:bg-foreground/[0.04]"
                }`}
              >
                <span className="text-lg leading-none" aria-hidden="true">{c.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold leading-tight">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">{c.currency}</p>
                </div>
                {active && <Check size={14} className="text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CountrySelector;