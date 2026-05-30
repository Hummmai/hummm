import { ReactNode, useState, useRef, useEffect } from "react";
import { useHumm } from "@/contexts/HummContext";
import { Link2, ChevronDown, Home, Key } from "lucide-react";

const roleConfig: Record<string, { label: string; icon: any; color: string }> = {
  buyer: { label: "Buyer", icon: Home, color: "text-emerald-400" },
  renter: { label: "Renter", icon: Key, color: "text-violet-400" },
};

interface Props {
  children: ReactNode;
  onDropLink: () => void;
}

export default function DashboardShell({ children, onDropLink }: Props) {
  const { currentRole, switchRole, userEmail } = useHumm();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowRoleMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const role = roleConfig[currentRole || "buyer"];
  const RoleIcon = role.icon;

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            My Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Viewing as</span>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 bg-primary/5 text-primary text-xs font-bold hover:bg-primary/10 transition-colors"
              >
                <RoleIcon size={14} />
                {role.label}
                <ChevronDown size={12} className={`transition-transform ${showRoleMenu ? "rotate-180" : ""}`} />
              </button>
              {showRoleMenu && (
                <div className="absolute top-full mt-2 left-0 z-50 w-48 rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {Object.entries(roleConfig).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => { switchRole(key); setShowRoleMenu(false); }}
                        className={`w-full text-left px-4 py-3 text-xs font-semibold hover:bg-muted/50 transition-colors flex items-center gap-3 ${currentRole === key ? "text-primary bg-primary/5" : "text-foreground"}`}
                      >
                        <Icon size={14} className={currentRole === key ? "text-primary" : "text-muted-foreground"} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {userEmail && (
              <span className="text-[11px] text-muted-foreground hidden sm:inline">({userEmail})</span>
            )}
          </div>
        </div>

        <button
          onClick={onDropLink}
          className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] shadow-[0_4px_20px_-4px_hsl(168_100%_45%/0.3)]"
        >
          <Link2 size={16} />
          Drop New Link
        </button>
      </div>

      {children}
    </div>
  );
}
