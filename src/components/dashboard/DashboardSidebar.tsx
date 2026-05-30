import { Home, Search, MessageSquare, Bot, Mail, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useHumm } from "@/contexts/HummContext";
import { useNavigate } from "react-router-dom";
import HummLogo from "@/components/HummLogo";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "audits", label: "My Audits", icon: Search },
  { id: "negotiations", label: "Hummm Along", icon: MessageSquare },
  { id: "assistant", label: "AI Assistant", icon: Bot },
  { id: "email", label: "Email Writer", icon: Mail },
];

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function DashboardSidebar({ activeTab, onTabChange, collapsed, onToggleCollapse }: Props) {
  const { signOut, userEmail } = useHumm();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 bg-sidebar text-sidebar-foreground transition-all duration-300 border-r border-border ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
      style={{ minHeight: "100vh" }}
    >
      {/* Logo area */}
      <div className={`flex items-center gap-3 px-5 h-[72px] border-b border-border ${collapsed ? "justify-center" : ""}`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <HummLogo className="h-7" />
          </div>
        )}
        {collapsed && <HummLogo className="h-6" />}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 ${
                collapsed ? "justify-center px-0 py-3" : "px-4 py-3"
              } ${
                isActive
                  ? "bg-primary/15 text-primary font-semibold shadow-[inset_0_0_0_1px_hsl(168_80%_48%/0.15)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon size={18} className={isActive ? "text-primary" : ""} />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-1">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </button>

        {!collapsed && userEmail && (
          <p className="px-4 pt-2 text-[11px] text-muted-foreground/60 truncate">{userEmail}</p>
        )}
      </div>
    </aside>
  );
}
