import { useState } from "react";
import { FileText, Copy, Check, ChevronDown } from "lucide-react";

const TEMPLATES = [
  {
    id: "firm-fair",
    name: "The Firm But Fair",
    category: "Standard Offer",
    subject: "Formal Offer — [PROPERTY ADDRESS]",
    body: `Dear [AGENT/SELLER NAME],

I am writing to make a formal offer of £[AMOUNT] for the property at [PROPERTY ADDRESS].

I am a [chain-free/first-time buyer/cash buyer] and have a Mortgage Decision in Principle confirmed at £[DIP AMOUNT] with [LENDER NAME]. My solicitor, [SOLICITOR NAME], is already instructed and ready to proceed immediately.

My deposit of £[DEPOSIT] is verified and accessible. I am flexible on completion dates and can work to your preferred timeline.

I would welcome the opportunity to discuss this offer and look forward to hearing from you.

Kind regards,
[YOUR NAME]`,
  },
  {
    id: "gazump-protector",
    name: "The Gazump Protector",
    category: "Exclusivity Request",
    subject: "Exclusivity Agreement Request — [PROPERTY ADDRESS]",
    body: `Dear [AGENT/SELLER NAME],

Further to our accepted offer of £[AMOUNT] on [PROPERTY ADDRESS], I would like to formally request a period of exclusivity.

Given that I am proceeding with full commitment — DIP confirmed, solicitor instructed, and searches ordered — I believe it is fair to request that the property be taken off the market for a period of [14/21/28] days while we proceed to exchange.

This protects both parties: you have the certainty of a committed buyer, and I have the assurance that the significant costs I am incurring (survey, searches, legal fees) are not at risk of gazumping.

I am prepared to exchange within [TIMEFRAME] and would welcome a brief lock-out agreement to formalise this arrangement.

Kind regards,
[YOUR NAME]`,
  },
  {
    id: "emotional-connection",
    name: "The Emotional Connection",
    category: "Letter to Sellers",
    subject: "A Note About Why We Love Your Home",
    body: `Dear [SELLER NAME],

I wanted to write to you personally, beyond the formal offer, to share why your home means so much to us.

When we walked through [PROPERTY ADDRESS], we could immediately see the love and care you've put into it. [SPECIFIC DETAIL — e.g., "The way the light comes through the kitchen in the morning" or "The beautiful garden you've clearly nurtured for years"] really spoke to us.

We're [BRIEF PERSONAL CONTEXT — e.g., "a young family looking for our forever home" or "relocating to be closer to family"]. We can see our future here — [PERSONAL VISION — e.g., "our children growing up in this neighbourhood" or "hosting family gatherings in that wonderful living room"].

We want you to know that if you choose us, your home will be cherished. We are serious, committed buyers with everything in place to proceed quickly and smoothly.

Thank you for the opportunity to view your beautiful home.

Warm regards,
[YOUR NAME]`,
  },
];

const TemplateLibrary = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const selected = TEMPLATES.find((t) => t.id === selectedId);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <FileText size={18} className="text-amber-400" />
        Battle-Tested Templates
      </h3>

      {/* Dropdown */}
      <div className="relative mb-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left flex items-center justify-between p-3.5 rounded-xl border border-amber-500/20 bg-card/40 hover:border-amber-500/40 transition-all"
        >
          <span className="text-sm font-semibold">
            {selected ? selected.name : "Choose a template..."}
          </span>
          <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute z-20 w-full mt-1 rounded-xl border border-border bg-card shadow-xl overflow-hidden animate-fade-in">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => { setSelectedId(t.id); setIsOpen(false); }}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-all border-b border-border last:border-0 ${
                  selectedId === t.id ? "bg-amber-500/5" : ""
                }`}
              >
                <FileText size={14} className="text-amber-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.category}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Template preview */}
      {selected && (
        <div className="rounded-2xl border border-amber-500/20 bg-card/40 p-5 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">{selected.category}</p>
              <p className="text-sm font-bold mt-0.5">Subject: {selected.subject}</p>
            </div>
            <button
              onClick={() => handleCopy(`Subject: ${selected.subject}\n\n${selected.body}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg border border-primary/20 text-primary hover:bg-primary/10 transition-all"
            >
              {copied ? <Check size={10} /> : <Copy size={10} />}
              {copied ? "Copied" : "Copy All"}
            </button>
          </div>
          <div className="rounded-xl bg-muted/20 border border-border p-4 max-h-64 overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed text-muted-foreground">{selected.body}</pre>
          </div>
          <p className="text-[9px] text-muted-foreground">
            Replace [BRACKETED] fields with your details before sending.
          </p>
        </div>
      )}
    </div>
  );
};

export default TemplateLibrary;
