import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHumm } from "@/contexts/HummContext";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft, Shield, CheckCircle, Square, CheckSquare, AlertTriangle, Info } from "lucide-react";

const CHECKLIST = [
  {
    category: "Deposit Protection",
    items: [
      { id: "dep1", label: "Your deposit is protected in a government-approved scheme (TDS, DPS, or MyDeposits)", detail: "Landlords must protect your deposit within 30 days of receiving it. If they don't, you may be entitled to compensation of 1-3x the deposit amount." },
      { id: "dep2", label: "You received the Prescribed Information within 30 days", detail: "Your landlord must provide details of where your deposit is held, how to apply for its return, and what to do if there's a dispute." },
      { id: "dep3", label: "You have a copy of the deposit certificate", detail: "Keep this safe — you'll need it at the end of your tenancy." },
    ],
  },
  {
    category: "Notice Periods",
    items: [
      { id: "not1", label: "Section 21 'no-fault' eviction — being abolished under the Renters' Rights Act 2025", detail: "Under the new law, landlords can no longer evict tenants without a valid reason. Existing Section 21 notices may still apply to older tenancies during the transition period." },
      { id: "not2", label: "Section 8 — landlord must prove grounds (e.g., rent arrears of 2+ months)", detail: "Your landlord can only use Section 8 if they have valid grounds such as significant rent arrears, antisocial behaviour, or property damage." },
      { id: "not3", label: "You must give at least 1 month's notice on a periodic tenancy", detail: "If you're on a rolling (periodic) tenancy, you need to give at least 1 calendar month's notice ending on the rent due date." },
    ],
  },
  {
    category: "Repairs & Conditions",
    items: [
      { id: "rep1", label: "Landlord is responsible for structural repairs, heating, and water", detail: "Under Section 11 of the Landlord & Tenant Act 1985, your landlord must keep in repair the structure, exterior, and installations for water, gas, electricity, and heating." },
      { id: "rep2", label: "Property meets the Decent Homes Standard", detail: "From 2025, the Decent Homes Standard applies to private rentals. Properties must be free of serious hazards and in reasonable repair." },
      { id: "rep3", label: "No illegal retaliatory eviction after reporting disrepair", detail: "If you report a legitimate repair issue and your landlord tries to evict you in response, this is illegal retaliatory eviction." },
    ],
  },
  {
    category: "Illegal Fees",
    items: [
      { id: "fee1", label: "No admin fees charged (banned under Tenant Fees Act 2019)", detail: "Landlords and agents cannot charge you admin fees, referencing fees, credit check fees, or inventory fees. They can only charge: rent, a refundable deposit (max 5 weeks), a holding deposit (max 1 week), and fees for contract changes or early termination if agreed." },
      { id: "fee2", label: "Deposit does not exceed 5 weeks' rent", detail: "For annual rent under £50,000, the deposit cap is 5 weeks' rent. Above £50,000, it's 6 weeks." },
      { id: "fee3", label: "No excessive contract amendment fees", detail: "If your tenancy agreement allows for amendment fees, these must be reasonable and reflect the landlord's actual costs." },
    ],
  },
];

export default function RightsCheck() {
  const navigate = useNavigate();
  const { isLoggedIn } = useHumm();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { if (!isLoggedIn) { navigate("/auth?redirect=/rights"); } }, [isLoggedIn]);

  const toggle = (id: string) => {
    setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const totalItems = CHECKLIST.reduce((s, c) => s + c.items.length, 0);
  const checkedCount = checked.size;
  const pct = Math.round((checkedCount / totalItems) * 100);

  return (
    <>
      <SEOHead title="Tenant Rights Check | Hummm" description="Know your rights as a tenant in England." noindex />
      <div className="min-h-screen bg-[hsl(222,47%,5%)] text-foreground">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">Tenant Rights Check</h1>
              <p className="text-sm text-muted-foreground mt-1">Interactive guide to your legal protections in England.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-lg font-black ${
                pct === 100 ? "border-emerald-500 text-emerald-400" : pct >= 50 ? "border-amber-500 text-amber-400" : "border-white/20 text-muted-foreground"
              }`}>
                {pct}%
              </div>
              <span className="text-[10px] text-muted-foreground mt-1">{checkedCount}/{totalItems}</span>
            </div>
          </div>

          <div className="space-y-6">
            {CHECKLIST.map((cat) => (
              <div key={cat.category} className="rounded-2xl border border-white/[0.08] bg-[hsl(222,47%,9%)]/80 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={16} className="text-purple-400" />
                  <h2 className="text-sm font-bold">{cat.category}</h2>
                </div>
                <div className="space-y-3">
                  {cat.items.map((item) => {
                    const isChecked = checked.has(item.id);
                    const isExpanded = expandedId === item.id;
                    return (
                      <div key={item.id} className="rounded-xl border border-white/[0.06] overflow-hidden">
                        <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => toggle(item.id)}>
                          {isChecked ? <CheckSquare size={18} className="text-emerald-400 shrink-0 mt-0.5" /> : <Square size={18} className="text-muted-foreground/40 shrink-0 mt-0.5" />}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium ${isChecked ? "text-emerald-400 line-through opacity-70" : "text-foreground"}`}>{item.label}</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : item.id); }}
                            className="text-muted-foreground hover:text-primary shrink-0">
                            <Info size={14} />
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="px-4 pb-4 pl-11">
                            <p className="text-[11px] text-muted-foreground leading-relaxed bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                              {item.detail}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
