import { useEffect, lazy, Suspense, ComponentType } from "react";

// Global smooth scroll handler for hash links (footer, etc.)
const useSmoothHashScroll = () => {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href*="#"]') as HTMLAnchorElement;
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || !href.includes('#')) return;

      const hash = href.split('#')[1];
      if (!hash) return;

      const element = document.getElementById(hash);
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update URL without reload
        history.pushState(null, '', `#${hash}`);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
};

function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(() =>
    factory().catch((err) => {
      // If chunk fetch fails (stale deploy), reload once
      const key = "chunk-reload";
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
      }
      throw err;
    })
  );
}
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HummProvider } from "@/contexts/HummContext";
import { Skeleton } from "@/components/ui/skeleton";

/* ── Critical path (not lazy) ── */
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";

/* ── Lazy-loaded routes ── */
const Index = lazyWithRetry(() => import("./pages/Index.tsx"));
const NegotiateForMe = lazyWithRetry(() => import("./pages/NegotiateForMe.tsx"));
const NegotiateForMeAI = lazyWithRetry(() => import("./pages/NegotiateForMeAI.tsx"));
const NegotiationWizard = lazyWithRetry(() => import("./pages/NegotiationWizard.tsx"));
const Sell = lazyWithRetry(() => import("./pages/Sell.tsx"));
const FindAgent = lazyWithRetry(() => import("./pages/FindAgent.tsx"));
const Let = lazyWithRetry(() => import("./pages/Let.tsx"));
const RentNegotiation = lazyWithRetry(() => import("./pages/RentNegotiation.tsx"));
const AIValuation = lazyWithRetry(() => import("./pages/AIValuation.tsx"));
const FreeValuation = lazyWithRetry(() => import("./pages/FreeValuation.tsx"));
const RentalReformAudit = lazyWithRetry(() => import("./pages/RentalReformAudit.tsx"));
const Properties = lazyWithRetry(() => import("./pages/Properties.tsx"));
const PropertyDetail = lazyWithRetry(() => import("./pages/PropertyDetail.tsx"));
const Unsubscribe = lazyWithRetry(() => import("./pages/Unsubscribe.tsx"));
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard.tsx"));
const DashboardValuations = lazyWithRetry(() => import("./pages/DashboardValuations.tsx"));
const DashboardDealRoom = lazyWithRetry(() => import("./pages/DashboardDealRoom.tsx"));
const PrivacyPolicy = lazyWithRetry(() => import("./pages/PrivacyPolicy.tsx"));
const PropertyScout = lazyWithRetry(() => import("./pages/PropertyScout.tsx"));
const NegotiatorDashboard = lazyWithRetry(() => import("./pages/NegotiatorDashboard.tsx"));
const AreaGuide = lazyWithRetry(() => import("./pages/AreaGuide.tsx"));
const LandlordReform = lazyWithRetry(() => import("./pages/LandlordReform.tsx"));
const LandlordDashboard = lazyWithRetry(() => import("./pages/LandlordDashboard.tsx"));
const LandlordContracts = lazyWithRetry(() => import("./pages/LandlordContracts.tsx"));
const Management = lazyWithRetry(() => import("./pages/Management.tsx"));
const HummRent = lazyWithRetry(() => import("./pages/HummRent.tsx"));


const SavedAuditsDashboard = lazyWithRetry(() => import("./pages/SavedAuditsDashboard.tsx"));
const InstructHumm = lazyWithRetry(() => import("./pages/InstructHumm.tsx"));
const Pricing = lazyWithRetry(() => import("./pages/Pricing.tsx"));
const NegotiationRoom = lazyWithRetry(() => import("./pages/NegotiationRoom.tsx"));
const ScrapeAgents = lazyWithRetry(() => import("./pages/ScrapeAgents.tsx"));
const SavedAuditReport = lazyWithRetry(() => import("./pages/SavedAuditReport.tsx"));
const OwnerAccess = lazyWithRetry(() => import("./pages/OwnerAccess.tsx"));
const InviteRedeem = lazyWithRetry(() => import("./pages/InviteRedeem.tsx"));
const AccessCode = lazyWithRetry(() => import("./pages/AccessCode.tsx"));
const ComplianceDashboard = lazyWithRetry(() => import("./pages/ComplianceDashboard.tsx"));
const YieldAnalysis = lazyWithRetry(() => import("./pages/YieldAnalysis.tsx"));
const TenantTools = lazyWithRetry(() => import("./pages/TenantTools.tsx"));
const RightsCheck = lazyWithRetry(() => import("./pages/RightsCheck.tsx"));
const BudgetCalculator = lazyWithRetry(() => import("./pages/BudgetCalculator.tsx"));
const SavedSearches = lazyWithRetry(() => import("./pages/SavedSearches.tsx"));
const ViewingsCalendar = lazyWithRetry(() => import("./pages/ViewingsCalendar.tsx"));
const SellerValuation = lazyWithRetry(() => import("./pages/SellerValuation.tsx"));
const SellerOffers = lazyWithRetry(() => import("./pages/SellerOffers.tsx"));
const SellerListingPrep = lazyWithRetry(() => import("./pages/SellerListingPrep.tsx"));
const RoleBuyerDashboard = lazyWithRetry(() => import("./pages/RoleBuyerDashboard.tsx"));
const RoleSellerDashboard = lazyWithRetry(() => import("./pages/RoleSellerDashboard.tsx"));
const RoleRenterDashboard = lazyWithRetry(() => import("./pages/RoleRenterDashboard.tsx"));
const SellMyProperty = lazyWithRetry(() => import("./pages/SellMyProperty.tsx"));
const LetMyProperty = lazyWithRetry(() => import("./pages/LetMyProperty.tsx"));
const SellForMe = lazyWithRetry(() => import("./pages/SellForMe.tsx"));
const LetForMe = lazyWithRetry(() => import("./pages/LetForMe.tsx"));
const ManageForMe = lazyWithRetry(() => import("./pages/ManageForMe.tsx"));
const ForInvestors = lazyWithRetry(() => import("./pages/ForInvestors.tsx"));
const AgentsDashboard = lazyWithRetry(() => import("./pages/AgentsDashboard.tsx"));
const AgentChat = lazyWithRetry(() => import("./pages/AgentChat.tsx"));
const RevenueDashboard = lazyWithRetry(() => import("./pages/RevenueDashboard.tsx"));
const LuminaEstates = lazyWithRetry(() => import("./pages/LuminaEstates.tsx"));
const LuminaSell = lazyWithRetry(() => import("./pages/LuminaSell.tsx"));
const LuminaLet = lazyWithRetry(() => import("./pages/LuminaLet.tsx"));
const LuminaManage = lazyWithRetry(() => import("./pages/LuminaManage.tsx"));
const AreasWeCover = lazyWithRetry(() => import("./pages/AreasWeCover.tsx"));
const MyHumm = lazyWithRetry(() => import("./pages/MyHumm.tsx"));

import CookieConsent from "./components/CookieConsent.tsx";
import RouteGuard from "@/components/RouteGuard";
import ProPaywall from "@/components/ProPaywall";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md px-6">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  </div>
);

const App = () => {
  useSmoothHashScroll();

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="site-bg" aria-hidden="true">
        <div className="site-bg__grid" />
        <div className="site-bg__nodes" />
        <div className="site-bg__orb" />
        <div className="site-bg__veil" />
      </div>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <HummProvider>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              <Route path="/access-code" element={<AccessCode />} />

              {/* Protected routes using RouteGuard (replaces old no-op DemoGate) */}
              <Route path="/invite" element={<InviteRedeem />} />
              <Route path="/negotiate-for-me" element={<NegotiateForMe />} />
              <Route path="/negotiate-for-me-ai" element={<NegotiateForMeAI />} />
              <Route path="/sell-your-property" element={<Sell />} />
              <Route path="/find-an-agent" element={<FindAgent />} />
              <Route path="/humm-rent" element={<HummRent />} />
              <Route path="/let-your-property" element={<Let />} />
              <Route path="/ai-valuation" element={<AIValuation />} />
              <Route path="/free-valuation" element={<FreeValuation />} />
              <Route path="/rental-reform-audit" element={<RentalReformAudit />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />

              {/* Core dashboards — require authentication */}
              <Route path="/dashboard" element={<RouteGuard level="auth"><Dashboard /></RouteGuard>} />
              <Route path="/dashboard/valuations" element={<RouteGuard level="auth"><DashboardValuations /></RouteGuard>} />
              <Route path="/dashboard/deal-room" element={<RouteGuard level="auth"><DashboardDealRoom /></RouteGuard>} />
              <Route path="/property-scout" element={<RouteGuard level="auth"><PropertyScout /></RouteGuard>} />
              <Route path="/negotiator" element={<RouteGuard level="auth"><NegotiatorDashboard /></RouteGuard>} />
              <Route path="/area/:slug" element={<RouteGuard level="auth"><AreaGuide /></RouteGuard>} />
              <Route path="/renters-rights-act" element={<RouteGuard level="auth"><LandlordReform /></RouteGuard>} />
              <Route path="/dashboard/landlord" element={<RouteGuard level="auth"><LandlordDashboard /></RouteGuard>} />
              <Route path="/dashboard/landlord/contracts" element={<RouteGuard level="auth"><LandlordContracts /></RouteGuard>} />
              <Route path="/dashboard/buyer" element={<RouteGuard level="auth"><RoleBuyerDashboard /></RouteGuard>} />
              <Route path="/dashboard/seller" element={<RouteGuard level="auth"><RoleSellerDashboard /></RouteGuard>} />
              <Route path="/dashboard/tenant" element={<RouteGuard level="auth"><RoleRenterDashboard /></RouteGuard>} />
              <Route path="/dashboard/renter" element={<RouteGuard level="auth"><RoleRenterDashboard /></RouteGuard>} />
              <Route path="/humm-ai-negotiator" element={<RouteGuard level="auth"><RentNegotiation /></RouteGuard>} />
              <Route path="/property-management" element={<RouteGuard level="auth"><Management /></RouteGuard>} />
              {/* High-value Pro features — protected with RouteGuard level="pro" */}
              <Route
                path="/instruct-humm"
                element={
                  <RouteGuard
                    level="pro"
                    proTitle="Instruct Hummm — Pro only"
                    proDescription="Instructing Hummm to act as your autonomous property agent (Sell, Let or Manage) is included with Hummm Pro."
                  >
                    <InstructHumm />
                  </RouteGuard>
                }
              />

              <Route path="/my-dashboard" element={<RouteGuard level="auth"><SavedAuditsDashboard /></RouteGuard>} />
              <Route path="/negotiation-room" element={<RouteGuard level="pro"><NegotiationRoom /></RouteGuard>} />
              <Route path="/scrape-agents" element={<RouteGuard level="auth"><ScrapeAgents /></RouteGuard>} />
              <Route path="/owner-access" element={<RouteGuard level="auth"><OwnerAccess /></RouteGuard>} />
              <Route path="/dashboard/audit/:id" element={<RouteGuard level="auth"><SavedAuditReport /></RouteGuard>} />

              <Route path="/compliance" element={<RouteGuard level="auth"><ComplianceDashboard /></RouteGuard>} />
              <Route path="/yield" element={<RouteGuard level="auth"><YieldAnalysis /></RouteGuard>} />
              <Route path="/tenants" element={<RouteGuard level="auth"><TenantTools /></RouteGuard>} />
              <Route path="/rights" element={<RouteGuard level="auth"><RightsCheck /></RouteGuard>} />
              <Route path="/budget" element={<RouteGuard level="auth"><BudgetCalculator /></RouteGuard>} />
              <Route path="/saved-searches" element={<RouteGuard level="auth"><SavedSearches /></RouteGuard>} />
              <Route path="/viewings" element={<RouteGuard level="auth"><ViewingsCalendar /></RouteGuard>} />
              <Route path="/seller/valuation" element={<RouteGuard level="auth"><SellerValuation /></RouteGuard>} />
              <Route path="/seller/offers" element={<RouteGuard level="auth"><SellerOffers /></RouteGuard>} />
              <Route path="/seller/listing-prep" element={<RouteGuard level="auth"><SellerListingPrep /></RouteGuard>} />

              {/* Full autonomous execution flows — require Pro */}
              <Route path="/sell-my-property" element={<RouteGuard level="pro"><SellMyProperty /></RouteGuard>} />
              <Route path="/let-my-property" element={<RouteGuard level="pro"><LetMyProperty /></RouteGuard>} />
              <Route path="/for-investors" element={<ForInvestors />} />
              <Route path="/agents" element={<AgentsDashboard />} />
              <Route path="/agents/:agentId" element={<AgentChat />} />
              <Route path="/revenue-dashboard" element={<RevenueDashboard />} />

              {/* Hummm Home — premium luxury AI agency (public marketing) */}
              <Route path="/hummm-home" element={<LuminaEstates />} />
              <Route path="/hummm-home-sell" element={<LuminaSell />} />
              <Route path="/hummm-home-let" element={<LuminaLet />} />
              <Route path="/hummm-home-manage" element={<LuminaManage />} />

              {/* Rebrand aliases — The Intelligent Property Consultants */}
              <Route path="/sell-with-hummm" element={<LuminaSell />} />
              <Route path="/let-with-hummm" element={<LuminaLet />} />
              <Route path="/manage-with-hummm" element={<LuminaManage />} />
              <Route path="/hummm-negotiator" element={<NegotiateForMe />} />
              <Route path="/areas" element={<AreasWeCover />} />

              {/* My Hummm — flagship Pro autonomous command centre */}
              <Route
                path="/my-hummm"
                element={
                  <RouteGuard
                    level="pro"
                    proTitle="My Hummm — your autonomous agent"
                    proDescription="The central command centre for your properties, negotiations and autonomy controls is a Hummm Pro feature."
                  >
                    <MyHumm />
                  </RouteGuard>
                }
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <CookieConsent />
        </HummProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

  );
};

export default App;
