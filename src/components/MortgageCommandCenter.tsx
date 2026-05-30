import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import GoldHummm from "@/components/GoldHummm";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Calculator,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
} from "lucide-react";

const STANDARD_RATE = 5.2;
const GOLD_RATE = 4.3;
const STRESS_BUFFER = 2.0;

const RATE_TREND = [
  { month: "Oct 25", rate: 5.45 },
  { month: "Nov 25", rate: 5.38 },
  { month: "Dec 25", rate: 5.3 },
  { month: "Jan 26", rate: 5.25 },
  { month: "Feb 26", rate: 5.22 },
  { month: "Mar 26", rate: 5.2 },
];

const chartConfig = {
  rate: { label: "Avg Rate %", color: "hsl(var(--primary))" },
};

function calcMonthly(principal: number, annualRate: number, years: number) {
  if (principal <= 0 || years <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = years * 12;
  return Math.round(principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

interface Props {
  defaultPrice?: number;
  isGold?: boolean;
}

const MortgageCommandCenter = ({ defaultPrice = 450000, isGold = false }: Props) => {
  const navigate = useNavigate();
  const [price, setPrice] = useState(defaultPrice);
  const [depositPct, setDepositPct] = useState(10);
  const [term, setTerm] = useState(30);
  const [stressTest, setStressTest] = useState(false);

  const deposit = Math.round(price * (depositPct / 100));
  const principal = price - deposit;

  const standardMonthly = useMemo(() => calcMonthly(principal, STANDARD_RATE, term), [principal, term]);
  const goldMonthly = useMemo(() => calcMonthly(principal, GOLD_RATE, term), [principal, term]);
  const stressMonthly = useMemo(
    () => calcMonthly(principal, STANDARD_RATE + STRESS_BUFFER, term),
    [principal, term]
  );
  const goldSaving = standardMonthly - goldMonthly;

  const activeRate = stressTest ? STANDARD_RATE + STRESS_BUFFER : STANDARD_RATE;
  const activeMonthly = stressTest ? stressMonthly : standardMonthly;

  return (
    <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-6 space-y-6"
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Calculator size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="text-base font-bold">Mortgage Command Centre</h3>
            <p className="text-[10px] text-muted-foreground">2026 UK rates · Live calculator</p>
          </div>
        </div>
        {isGold && <GoldHummm size={20} />}
      </div>

      {/* Inputs */}
      <div className="space-y-5">
        {/* Property Price */}
        <div>
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            Property Price
          </Label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            min={50000}
            step={5000}
            className="text-sm font-bold tabular-nums mt-1"
          />
        </div>

        {/* Deposit Slider */}
        <div>
          <div className="flex justify-between items-baseline">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Deposit ({depositPct}%)
            </Label>
            <span className="text-xs font-bold tabular-nums text-foreground">
              £{deposit.toLocaleString()}
            </span>
          </div>
          <Slider
            value={[depositPct]}
            onValueChange={(v) => setDepositPct(v[0])}
            min={5}
            max={50}
            step={1}
            className="mt-2"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
            <span>5%</span><span>50%</span>
          </div>
        </div>

        {/* Term Selector */}
        <div>
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            Term (Years)
          </Label>
          <div className="flex gap-2 mt-1.5">
            {[25, 30, 35, 40].map((y) => (
              <button
                key={y}
                onClick={() => setTerm(y)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg border transition-all ${
                  y === term
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
      <div className="rounded-xl bg-muted/20 border border-border p-5 text-center">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          Monthly Repayment
        </p>
        <p className="text-4xl font-black tabular-nums text-primary">
          £{activeMonthly.toLocaleString()}
          <span className="text-sm font-semibold text-muted-foreground">/mo</span>
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          at {activeRate.toFixed(1)}% · {term}-year term · £{principal.toLocaleString()} borrowed
        </p>
      </div>

      {/* Gold Advantage */}
      {isGold && goldSaving > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
          <Sparkles size={16} className="text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold">
              <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                Hummm Gold Rate: {GOLD_RATE}%
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground">
              £{goldMonthly.toLocaleString()}/mo — saves you{" "}
              <span className="font-bold text-primary">£{goldSaving}/mo</span> vs standard
            </p>
          </div>
        </div>
      )}

      {/* Stress Test Toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/10">
        <div className="flex items-center gap-2">
          <ShieldAlert size={14} className={stressTest ? "text-red-400" : "text-muted-foreground"} />
          <div>
            <p className="text-xs font-bold">+2% Rate Shock</p>
            <p className="text-[9px] text-muted-foreground">
              {stressTest
                ? `At ${(STANDARD_RATE + STRESS_BUFFER).toFixed(1)}%: £${stressMonthly.toLocaleString()}/mo`
                : "Test affordability if rates spike"}
            </p>
          </div>
        </div>
        <Switch checked={stressTest} onCheckedChange={setStressTest} />
      </div>

      {/* Rate Trend Chart */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown size={12} className="text-primary" />
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            6-Month Rate Trend
          </p>
        </div>
        <ChartContainer config={chartConfig} className="h-[120px] w-full">
          <LineChart data={RATE_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 9 }}
              className="fill-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[4.9, 5.6]}
              tick={{ fontSize: 9 }}
              className="fill-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value) => [`${value}%`, "Avg Rate"]}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 3, fill: "hsl(var(--primary))" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      </div>

      {/* CTA */}
      <Button
        className="w-full bg-primary text-primary-foreground font-bold"
        onClick={() => navigate("/dashboard/deal-room")}
      >
        Secure This Rate via Hummm Partners
        <ArrowRight size={14} className="ml-2" />
      </Button>
    </div>
  );
};

export default MortgageCommandCenter;
