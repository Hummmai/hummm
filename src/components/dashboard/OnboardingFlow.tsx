import { useState } from "react";
import {
  Search, Shield, BarChart3, MessageSquare, Home, Key,
  ArrowRight, ArrowLeft, CheckCircle2, Sparkles,
  Building2, Users, Wrench, TrendingUp, Clock, FileText,
} from "lucide-react";

/* ── Role-specific step configs ── */
const BUYER_STEPS = [
  { title: "What are you looking for?" },
  { title: "How does it work?" },
  { title: "You're ready" },
];
const SELLER_STEPS = [
  { title: "Tell us about your property" },
  { title: "How we help sellers" },
  { title: "You're ready to sell smarter" },
];
const LANDLORD_STEPS = [
  { title: "Tell us about your portfolio" },
  { title: "What we track for you" },
  { title: "You're ready" },
];
const RENTER_STEPS = [
  { title: "What are you looking for?" },
  { title: "Your rights matter" },
  { title: "You're ready" },
];

const ROLE_LABELS: Record<string, string> = {
  buyer: "Buyer",
  seller: "Seller",
  landlord: "Landlord",
  renter: "Renter",
};

interface Props {
  role: string;
  userName: string | null;
  userId: string;
  onComplete: () => void;
}

export default function OnboardingFlow({ role, userName, userId, onComplete }: Props) {
  const [step, setStep] = useState(0);

  // Buyer prefs
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState(500000);
  const [propertyType, setPropertyType] = useState("any");

  // Seller prefs
  const [sellerPropertyType, setSellerPropertyType] = useState("house");
  const [sellerValueRange, setSellerValueRange] = useState("200-350k");
  const [sellerReason, setSellerReason] = useState("upsizing");

  // Landlord prefs
  const [portfolioSize, setPortfolioSize] = useState("1");
  const [concern, setConcern] = useState("compliance");

  // Renter prefs
  const [renterLocation, setRenterLocation] = useState("");
  const [maxRent, setMaxRent] = useState(1500);
  const [moveIn, setMoveIn] = useState("flexible");

  const steps = role === "seller" ? SELLER_STEPS : role === "landlord" ? LANDLORD_STEPS : role === "renter" ? RENTER_STEPS : BUYER_STEPS;

  const handleFinish = () => {
    const prefsKey = `humm_onboarding_prefs_${userId}`;
    if (role === "buyer") {
      localStorage.setItem(prefsKey, JSON.stringify({ location, budget, propertyType }));
    } else if (role === "seller") {
      localStorage.setItem(prefsKey, JSON.stringify({ propertyType: sellerPropertyType, valueRange: sellerValueRange, reason: sellerReason }));
    } else if (role === "landlord") {
      localStorage.setItem(prefsKey, JSON.stringify({ portfolioSize, concern }));
    } else {
      localStorage.setItem(prefsKey, JSON.stringify({ location: renterLocation, maxRent, moveIn }));
    }
    localStorage.setItem(`onboarding_complete_${userId}`, "true");
    onComplete();
  };

  const next = () => {
    if (step < 2) setStep(step + 1);
    else handleFinish();
  };
  const back = () => { if (step > 0) setStep(step - 1); };

  const formatCurrency = (v: number) => `£${v.toLocaleString()}`;

  const selectClasses = "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  /* ─── Step renderers ─── */
  const renderBuyerStep1 = () => (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Location</label>
        <input type="text" value={location} onChange={e => setLocation(e.target.value)}
          placeholder="e.g. Bristol, SW1, Manchester"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Max budget: {formatCurrency(budget)}</label>
        <input type="range" min={100000} max={2000000} step={25000} value={budget} onChange={e => setBudget(+e.target.value)}
          className="w-full accent-[hsl(var(--primary))]" />
        <div className="flex justify-between text-[10px] text-muted-foreground/50 mt-1"><span>£100k</span><span>£2m</span></div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Property type</label>
        <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className={selectClasses}>
          <option value="any">Any</option>
          <option value="house">House</option>
          <option value="flat">Flat</option>
          <option value="bungalow">Bungalow</option>
          <option value="land">Land</option>
        </select>
      </div>
    </div>
  );

  const renderBuyerStep2 = () => (
    <div className="space-y-4">
      {[
        { icon: Search, title: "Drop a link", desc: "Paste any property listing URL and our AI analyses it instantly." },
        { icon: BarChart3, title: "Get an AI audit", desc: "See fair value, risks, opportunities, and a Humm Score out of 100." },
        { icon: MessageSquare, title: "Negotiate with confidence", desc: "Our AI drafts opening emails and counter-offers for you." },
      ].map((item, i) => (
        <div key={i} className="flex gap-3.5 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <item.icon size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSellerStep1 = () => (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Property type</label>
        <select value={sellerPropertyType} onChange={e => setSellerPropertyType(e.target.value)} className={selectClasses}>
          <option value="flat">Flat</option>
          <option value="house">House</option>
          <option value="bungalow">Bungalow</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Approximate value range</label>
        <select value={sellerValueRange} onChange={e => setSellerValueRange(e.target.value)} className={selectClasses}>
          <option value="under-200k">Under £200k</option>
          <option value="200-350k">£200k – £350k</option>
          <option value="350-500k">£350k – £500k</option>
          <option value="500k-1m">£500k – £1m</option>
          <option value="over-1m">Over £1m</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Reason for selling</label>
        <select value={sellerReason} onChange={e => setSellerReason(e.target.value)} className={selectClasses}>
          <option value="upsizing">Upsizing</option>
          <option value="downsizing">Downsizing</option>
          <option value="relocating">Relocating</option>
          <option value="investment">Investment</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  );

  const renderSellerStep2 = () => (
    <div className="space-y-4">
      {[
        { icon: BarChart3, title: "AI valuation using real comparable sales data", desc: "We analyse recent sold prices near you to give an accurate estimate." },
        { icon: MessageSquare, title: "Offer tracking and counter-offer AI", desc: "Log offers, compare them, and let AI draft counter-proposals." },
        { icon: FileText, title: "Pre-sale checklist to maximise your sale price", desc: "Legal, compliance, and presentation steps before you go to market." },
      ].map((item, i) => (
        <div key={i} className="flex gap-3.5 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
            <item.icon size={18} className="text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLandlordStep1 = () => (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Number of properties</label>
        <select value={portfolioSize} onChange={e => setPortfolioSize(e.target.value)} className={selectClasses}>
          <option value="1">1 property</option>
          <option value="2-5">2–5 properties</option>
          <option value="6-10">6–10 properties</option>
          <option value="10+">10+ properties</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Primary concern</label>
        <select value={concern} onChange={e => setConcern(e.target.value)} className={selectClasses}>
          <option value="compliance">Compliance (Gas, EICR, EPC)</option>
          <option value="yield">Yield optimisation</option>
          <option value="tenant">Tenant management</option>
        </select>
      </div>
    </div>
  );

  const renderLandlordStep2 = () => (
    <div className="space-y-4">
      {[
        { icon: Shield, title: "Safety certificate alerts", desc: "Gas, EICR, and EPC expiry tracked and flagged automatically." },
        { icon: TrendingUp, title: "Rent vs market analysis", desc: "See how your rent compares and find uplift opportunities." },
        { icon: Users, title: "Tenant comms tools", desc: "Email templates, maintenance tracking, and document storage." },
      ].map((item, i) => (
        <div key={i} className="flex gap-3.5 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <item.icon size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderRenterStep1 = () => (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Location</label>
        <input type="text" value={renterLocation} onChange={e => setRenterLocation(e.target.value)}
          placeholder="e.g. East London, Birmingham, Leeds"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Max rent: {formatCurrency(maxRent)}/month</label>
        <input type="range" min={500} max={5000} step={50} value={maxRent} onChange={e => setMaxRent(+e.target.value)}
          className="w-full accent-[hsl(var(--primary))]" />
        <div className="flex justify-between text-[10px] text-muted-foreground/50 mt-1"><span>£500</span><span>£5,000</span></div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Move-in timeframe</label>
        <select value={moveIn} onChange={e => setMoveIn(e.target.value)} className={selectClasses}>
          <option value="asap">ASAP</option>
          <option value="1month">Within 1 month</option>
          <option value="3months">Within 3 months</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>
    </div>
  );

  const renderRenterStep2 = () => (
    <div className="space-y-4">
      {[
        { icon: Shield, title: "Deposit must be protected", desc: "Your landlord is legally required to protect your deposit in a government scheme." },
        { icon: MessageSquare, title: "Rent can be negotiated", desc: "Our AI analyses market rates and drafts negotiation emails for you." },
        { icon: Wrench, title: "Repairs are the landlord's responsibility", desc: "Structural issues, plumbing, and heating are your landlord's duty to fix." },
      ].map((item, i) => (
        <div key={i} className="flex gap-3.5 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <item.icon size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderReadyStep = () => {
    const isSeller = role === "seller";
    return (
      <div className="text-center space-y-5 py-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${isSeller ? "bg-amber-500/15" : "bg-primary/15"}`}>
          <CheckCircle2 size={32} className={isSeller ? "text-amber-400" : "text-primary"} />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{userName ? `Welcome, ${userName.split(" ")[0]}!` : "You're all set!"}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your <span className={`font-semibold ${isSeller ? "text-amber-400" : "text-primary"}`}>{ROLE_LABELS[role] || role}</span> dashboard is ready.
          </p>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    if (step === 2) return renderReadyStep();
    if (role === "seller") return step === 0 ? renderSellerStep1() : renderSellerStep2();
    if (role === "buyer") return step === 0 ? renderBuyerStep1() : renderBuyerStep2();
    if (role === "landlord") return step === 0 ? renderLandlordStep1() : renderLandlordStep2();
    return step === 0 ? renderRenterStep1() : renderRenterStep2();
  };

  const isSeller = role === "seller";

  return (
    <div className="fixed inset-0 z-50 bg-[hsl(222,47%,5%)]/95 backdrop-blur-sm flex items-center justify-center px-4">
      <div
        key={step}
        className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[hsl(222,47%,8%)] p-6 sm:p-8 shadow-2xl animate-fade-in"
      >
        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            Step {step + 1} of 3
          </p>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${
                i <= step ? `w-8 ${isSeller ? "bg-amber-400" : "bg-primary"}` : "w-4 bg-white/[0.08]"
              }`} />
            ))}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-foreground mb-5 text-balance">
          {steps[step].title}
        </h2>

        {/* Content */}
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-white/[0.06]">
          {step > 0 ? (
            <button onClick={back} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={14} /> Back
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={next}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold hover:brightness-110 active:scale-[0.97] transition-all ${
              isSeller ? "bg-amber-500 text-white" : "bg-primary text-primary-foreground"
            }`}
          >
            {step === 2 ? (
              <>
                <Sparkles size={14} /> Go to Dashboard
              </>
            ) : (
              <>
                Continue <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}