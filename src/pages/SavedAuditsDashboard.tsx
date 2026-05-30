import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useHumm } from "@/contexts/HummContext";
import EmailWriter from "@/components/dashboard/EmailWriter";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import PropertyAuditFlow from "@/components/PropertyAuditFlow";
import RoleSelector from "@/components/dashboard/RoleSelector";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import SavedAuditsPanel from "@/components/dashboard/SavedAuditsPanel";
import NegotiationInbox from "@/components/dashboard/NegotiationInbox";
import { ArrowLeft, Loader2 } from "lucide-react";

const ChatWithHistory = lazy(() => import("@/components/dashboard/ChatWithHistory"));
const MortgageCommandCenter = lazy(() => import("@/components/MortgageCommandCenter"));

export default function SavedAuditsDashboard() {
  const { isLoggedIn, userId, currentRole, switchRole, userEmail } = useHumm();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [needsRole, setNeedsRole] = useState(false);
  const [dropLinkMode, setDropLinkMode] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth?redirect=/dashboard");
      return;
    }
    if (!currentRole) setNeedsRole(true);
    setReady(true);
  }, [isLoggedIn, currentRole]);

  const handleRoleSelect = async (role: string) => {
    await switchRole(role);
    setNeedsRole(false);
  };

  const handleOpenAudit = (url: string) => {
    setDropLinkMode(true);
  };

  const userName = userEmail?.split("@")[0]?.replace(/[._-]/g, " ")?.replace(/\b\w/g, c => c.toUpperCase()) || "";

  if (!isLoggedIn) return null;

  if (dropLinkMode) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <button
            onClick={() => setDropLinkMode(false)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <PropertyAuditFlow initialUrl="" />
        </div>
      </div>
    );
  }

  if (needsRole) {
    return (
      <div className="min-h-screen bg-background">
        <RoleSelector onSelect={handleRoleSelect} />
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "audits":
        return <SavedAuditsPanel onOpenAudit={handleOpenAudit} />;
      case "negotiations":
        return <NegotiationInbox />;
      case "mortgage":
        return (
          <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>}>
            <MortgageCommandCenter />
          </Suspense>
        );
      case "assistant":
        return (
          <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>}>
            <ChatWithHistory />
          </Suspense>
        );
      case "email":
        return <EmailWriter audits={[]} />;
      default:
        return <DashboardOverview onOpenAudit={handleOpenAudit} onTabChange={setActiveTab} userName={userName} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <SEOHead title="Command Centre | Hummm" description="Your personalised property command centre." canonical="/dashboard" />

      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[260px] bg-sidebar animate-in slide-in-from-left duration-200">
            <DashboardSidebar
              activeTab={activeTab}
              onTabChange={(tab) => { setActiveTab(tab); setMobileMenuOpen(false); }}
              collapsed={false}
              onToggleCollapse={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          onDropLink={() => setDropLinkMode(true)}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
