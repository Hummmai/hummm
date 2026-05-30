import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import PropertyAuditFlow from "@/components/PropertyAuditFlow";
import NegotiateForMeCTA from "@/components/NegotiateForMeCTA";
import SalesAgentIntro from "@/components/SalesAgentIntro";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const SavedAuditReport = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <>
      <SEOHead title="Audit Report | Hummm" description="Your saved property audit report." canonical={`/dashboard/audit/${id}`} />
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 pb-32 sm:pb-28">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard?tab=audits")}
            className="mb-3 sm:mb-4 gap-2 text-muted-foreground hover:text-foreground rounded-xl min-h-[44px]"
          >
            <ChevronLeft size={16} /> Back to Command Centre
          </Button>
          <div className="space-y-5 sm:space-y-6 mb-6 sm:mb-8">
            <NegotiateForMeCTA variant="hero" />
            <SalesAgentIntro />
          </div>
          <PropertyAuditFlow savedAuditId={id} />
          <div className="mt-10 sm:mt-14 space-y-6 sm:space-y-8">
            <NegotiateForMeCTA variant="hero" />
            <NegotiateForMeCTA variant="bar" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SavedAuditReport;
