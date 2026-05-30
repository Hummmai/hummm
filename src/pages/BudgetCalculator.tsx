import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useHumm } from "@/contexts/HummContext";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft, PoundSterling, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

const BILL_ESTIMATES: Record<string, { gas: number; electric: number; water: number; broadband: number; councilTax: number }> = {
  default: { gas: 85, electric: 75, water: 35, broadband: 30, councilTax: 140 },
};

export default function BudgetCalculator() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useHumm();
  const [income, setIncome] = useState("");
  const [rent, setRent] = useState(location.state?.rent?.toString() || "");
  const [postcode, setPostcode] = useState("");

  useEffect(() => { if (!isLoggedIn) { navigate("/auth?redirect=/budget"); } }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) { navigate("/auth?redirect=/budget"); }
  }, [isLoggedIn]);

  const monthlyIncome = parseFloat(income) || 0;
  const monthlyRent = parseFloat(rent) || 0;
  const bills = BILL_ESTIMATES.default;
  const totalBills = bills.gas + bills.electric + bills.water + bills.broadband + bills.councilTax;
  const totalMonthlyCost = monthlyRent + totalBills;
  const rentPct = monthlyIncome > 0 ? Math.round((monthlyRent / monthlyIncome) * 100) : 0;
  const totalPct = monthlyIncome > 0 ? Math.round((totalMonthlyCost / monthlyIncome) * 100) : 0;
  const remaining = monthlyIncome - totalMonthlyCost;

  const verdict = rentPct <= 30 ? "affordable" : rentPct <= 40 ? "stretch" : "unaffordable";

  return (
    <>
      <SEOHead title="Budget Calculator | Hummm" description="Check if you can afford a rental property." noindex />
      <div className="min-h-screen bg-[hsl(222,47%,5%)] text-foreground">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <h1 className="text-2xl sm:text-3xl font-black mb-1">Rental Budget Calculator</h1>
          <p className="text-sm text-muted-foreground mb-8">Check affordability using the 30% rule and estimated bills.</p>

          {/* Inputs */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-2xl border border-white/[0.08] bg-[hsl(222,47%,9%)] p-5">
              <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block mb-2">Monthly Take-Home Pay</label>
              <div className="relative">
                <PoundSterling size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="2,500"
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.06] text-sm font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40" />
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-[hsl(222,47%,9%)] p-5">
              <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block mb-2">Monthly Rent</label>
              <div className="relative">
                <PoundSterling size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="number" value={rent} onChange={(e) => setRent(e.target.value)} placeholder="1,200"
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.06] text-sm font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40" />
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-[hsl(222,47%,9%)] p-5">
              <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block mb-2">Postcode (optional)</label>
              <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value.toUpperCase())} placeholder="SW1A 1AA"
                className="w-full px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.06] text-sm font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40" />
            </div>
          </div>

          {monthlyIncome > 0 && monthlyRent > 0 && (
            <>
              {/* Verdict */}
              <div className={`rounded-2xl border p-6 mb-6 ${
                verdict === "affordable" ? "border-emerald-500/20 bg-emerald-500/5" : verdict === "stretch" ? "border-amber-500/20 bg-amber-500/5" : "border-red-500/20 bg-red-500/5"
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  {verdict === "affordable" ? <CheckCircle size={24} className="text-emerald-400" /> : verdict === "stretch" ? <AlertTriangle size={24} className="text-amber-400" /> : <XCircle size={24} className="text-red-400" />}
                  <div>
                    <p className={`text-lg font-black ${verdict === "affordable" ? "text-emerald-400" : verdict === "stretch" ? "text-amber-400" : "text-red-400"}`}>
                      {verdict === "affordable" ? "Affordable ✅" : verdict === "stretch" ? "Stretch Budget ⚠️" : "Over Budget ❌"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Rent is {rentPct}% of your income {verdict === "affordable" ? "(under 30% — healthy)" : verdict === "stretch" ? "(30-40% — tight)" : "(over 40% — risky)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="rounded-2xl border border-white/[0.08] bg-[hsl(222,47%,9%)]/80 p-6 space-y-4">
                <h3 className="text-sm font-bold">Monthly Cost Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Rent</span><span className="font-bold">£{monthlyRent.toLocaleString()}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Gas (est.)</span><span className="font-medium">£{bills.gas}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Electric (est.)</span><span className="font-medium">£{bills.electric}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Water (est.)</span><span className="font-medium">£{bills.water}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Broadband (est.)</span><span className="font-medium">£{bills.broadband}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Council Tax (est. Band D)</span><span className="font-medium">£{bills.councilTax}</span></div>
                  <div className="border-t border-white/[0.06] pt-2 flex justify-between text-sm">
                    <span className="font-bold">Total Monthly Cost</span>
                    <span className="font-black text-primary">£{totalMonthlyCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className={`font-bold ${remaining >= 0 ? "text-emerald-400" : "text-red-400"}`}>£{remaining.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Total as % of income</span>
                    <span className="font-medium">{totalPct}%</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
