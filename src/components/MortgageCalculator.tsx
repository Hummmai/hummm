import { useState, useMemo } from "react";
import { Banknote, Sparkles, TrendingDown, Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MortgageCalculatorProps {
  propertyPrice: number;
  isRental?: boolean;
}

const HUMM_RATE = 4.5;
const HIGH_STREET_RATE = 5.0;

const MortgageCalculator = ({ propertyPrice, isRental }: MortgageCalculatorProps) => {
  const [deposit, setDeposit] = useState(Math.round(propertyPrice * 0.1));
  const [termYears, setTermYears] = useState(25);

  const monthly = useMemo(() => {
    const principal = propertyPrice - deposit;
    if (principal <= 0 || termYears <= 0) return 0;
    const r = HUMM_RATE / 100 / 12;
    const n = termYears * 12;
    return Math.round(principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  }, [propertyPrice, deposit, termYears]);

  const highStreetMonthly = useMemo(() => {
    const principal = propertyPrice - deposit;
    if (principal <= 0 || termYears <= 0) return 0;
    const r = HIGH_STREET_RATE / 100 / 12;
    const n = termYears * 12;
    return Math.round(principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  }, [propertyPrice, deposit, termYears]);

  const saving = highStreetMonthly - monthly;
  const depositPct = propertyPrice > 0 ? Math.round((deposit / propertyPrice) * 100) : 0;

  if (isRental) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}>
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Calculator size={16} className="text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold">Monthly Cost</h3>
          <p className="text-[10px] text-muted-foreground">Hummm Mortgage Suite</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            Deposit ({depositPct}%)
          </Label>
          <Input
            type="number"
            value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value))}
            min={0}
            max={propertyPrice}
            step={1000}
            className="text-sm font-bold tabular-nums mt-1"
          />
          <input
            type="range"
            min={0}
            max={propertyPrice}
            step={1000}
            value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value))}
            className="w-full h-1.5 mt-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
            style={{ accentColor: "hsl(168 100% 45%)" }}
          />
        </div>

        <div>
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            Term (Years)
          </Label>
          <div className="flex gap-2 mt-1">
            {[15, 20, 25, 30, 35].map((y) => (
              <button
                key={y}
                onClick={() => setTermYears(y)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                  y === termYears
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="rounded-xl bg-muted/30 border border-border p-4 text-center">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Estimated Monthly Payment</p>
        <p className="text-3xl font-black tabular-nums text-foreground">
          £{monthly.toLocaleString()}<span className="text-sm font-semibold text-muted-foreground">/mo</span>
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">at {HUMM_RATE}% fixed · {termYears}-year term</p>
      </div>

      {/* Hummm advantage badge */}
      {saving > 0 && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl border border-primary/20 bg-primary/5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black rounded-full bg-primary/15 text-primary border border-primary/30 humm-pulse">
            <Sparkles size={9} /> HUMM
          </span>
          <p className="text-xs text-foreground">
            <span className="font-bold text-primary">£{saving}/mo less</span>{" "}
            <span className="text-muted-foreground">than high-street average ({HIGH_STREET_RATE}%)</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default MortgageCalculator;
