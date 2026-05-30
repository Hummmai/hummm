import ComingSoonService from "@/components/ComingSoonService";
import SEOHead from "@/components/SEOHead";
import { Brain, Key, Shield } from "lucide-react";

export default function LetMyProperty() {
  return (
    <ComingSoonService
      serviceName="Let For Me"
      seoTitle="Let For Me — Coming Soon · Hummm AI"
      seoDescription="Full AI letting service launching soon. In the meantime, get a free AI valuation or let Hummm negotiate your tenancy — first one free."
      canonical="/let-my-property"
      waitlistInterest="Let For Me"
      headline={<>Let For Me — <span className="text-gradient">launching shortly.</span></>}
      subheading="We're putting the finishing touches on full AI-managed letting. While we get ready, our two flagship services are live and ready to help today."
      pills={[
        { icon: Brain, label: "AI Rent Valuation" },
        { icon: Key, label: "Tenant Matching" },
        { icon: Shield, label: "Compliance Built-in" },
      ]}
      bullets={[
        "Premium listings across major rental portals",
        "AI tenant sourcing, vetting & referencing",
        "Negotiation on rent, terms & break clauses",
        "Tenancy agreement, deposit protection & move-in",
        "Built-in Renters' Rights Act compliance",
      ]}
    />
  );
}