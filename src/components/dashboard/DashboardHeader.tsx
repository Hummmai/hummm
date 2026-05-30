import { Link2, Menu, ChevronDown } from "lucide-react";
import { useHumm } from "@/contexts/HummContext";
import { useState, useRef, useEffect } from "react";
import HummLogo from "@/components/HummLogo";

const ROLES = [
  { key: "buyer", label: "Buyer", emoji: "🏠" },
  { key: "seller", label: "Seller", emoji: "📈" },
  { key: "investor", label: "Investor", emoji: "💎" },
  { key: "renter", label: "Renter", emoji: "🔑" },
  { key: "landlord", label: "Landlord", emoji: "🏢" },
];

interface Props {
  onDropLink: () => void;
  onMobileMenuToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function DashboardHeader({ onDropLink, onMobileMenuToggle, activeTab, onTabChange }: Props) {
  const { currentRole, switchRole, userEmail } = useHumm();
  const [roleOpen, setRoleOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentRoleData = ROLES.find(r => r.key === currentRole) || ROLES[0];

  const TAB_LABELS: Record<string, string> = {
    overview: "Command Centre",
    audits: "My Audits",
    negotiations: "Hummm Along",
    assistant: "AI Assistant",
    email: "Email Writer",
    mortgage: "Mortgage Tools",
  };

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-[72px] px-4 sm:px-8">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Menu size={20} className="text-muted-foreground" />
          </button>
          <div className="lg:hidden flex items-center gap-2">
            <HummLogo logoHeight="h-12" />
          </div>

          <h2 className="hidden lg:block text-lg font-bold text-foreground">
            {TAB_LABELS[activeTab] || "Command Centre"}
          </h2>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Role switcher */}
          <div className="relative" ref={roleRef}>
            <button
              onClick={() => setRoleOpen(!roleOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-muted/30 text-sm font-medium text-foreground hover:border-primary/30 hover:bg-muted/50 transition-all"
            >
              <span className="text-base">{currentRoleData.emoji}</span>
              <span className="hidden sm:inline">{currentRoleData.label}</span>
              <ChevronDown size={14} className={`text-muted-foreground transition-transform ${roleOpen ? "rotate-180" : ""}`} />
            </button>
            {roleOpen && (
              <div className="absolute top-full mt-2 right-0 z-50 w-48 rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {ROLES.map(r => (
                  <button
                    key={r.key}
                    onClick={() => { switchRole(r.key); setRoleOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors flex items-center gap-3 ${
                      currentRole === r.key ? "text-primary font-semibold bg-primary/5" : "text-foreground/70"
                    }`}
                  >
                    <span className="text-base">{r.emoji}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Drop link */}
          <button
            onClick={onDropLink}
            className="btn-press inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-[0_2px_16px_-3px_hsl(168_80%_48%/0.4)]"
          >
            <Link2 size={16} />
            <span className="hidden sm:inline">Drop New Link</span>
          </button>
        </div>
      </div>

      {/* Mobile tab bar */}
      <div className="lg:hidden flex overflow-x-auto border-t border-border px-2 no-scrollbar">
        {[
          { id: "overview", label: "Overview" },
          { id: "audits", label: "Audits" },
          { id: "negotiations", label: "Hummm Along" },
          { id: "assistant", label: "AI" },
          { id: "email", label: "Email" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
              activeTab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </header>
  );
}
