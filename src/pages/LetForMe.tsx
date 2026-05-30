import ServiceLaunchPage from "@/components/ServiceLaunchPage";
import {
  Brain,
  Key,
  Shield,
  Users,
  FileCheck,
  Sparkles,
  Camera,
  Building2,
  ClipboardCheck,
} from "lucide-react";

export default function LetForMe() {
  return (
    <ServiceLaunchPage
      serviceName="Let For Me"
      headlineLead="Let For Me —"
      headlineAccent="one month's rent"
      subheading="Full AI letting service. We market, vet, reference and sign — fully compliant with the Renters' Rights Act. You stay in the driver's seat."
      seoTitle="Let For Me — Premium AI Letting Service · Hummm AI"
      seoDescription="Let your property the smart way with Hummm AI. Tenant sourcing, vetting, referencing and compliance built in. Coming soon — join the waitlist."
      canonical="/let-for-me"
      waitlistInterest="Let For Me"
      pills={[
        { icon: Brain, label: "AI Rent Valuation" },
        { icon: Key, label: "Tenant Matching" },
        { icon: Shield, label: "Renters' Rights Compliant" },
      ]}
      benefits={[
        { icon: Brain, title: "Optimised rent pricing", body: "AI-tuned to maximise yield without sitting empty. Live comparables from your postcode." },
        { icon: Camera, title: "Premium listing launch", body: "Editorial photography, floorplan and AI copy — pushed to Rightmove, Zoopla and SpareRoom." },
        { icon: Users, title: "AI tenant matching", body: "Pre-qualified renters only. Affordability, employment and chain-of-references handled automatically." },
        { icon: ClipboardCheck, title: "Full referencing", body: "Right-to-rent, credit, employer and previous landlord — all bundled and verified." },
        { icon: FileCheck, title: "Tenancy agreement", body: "Compliant AST drafted, signed digitally, deposit protected through DPS — zero admin." },
        { icon: Shield, title: "Renters' Rights ready", body: "Built around the new Act. Periodic tenancies, rent rises and notice periods — handled correctly." },
      ]}
      steps={[
        { title: "Free AI rent valuation", body: "Instant valuation of achievable rent and time-to-let, based on your postcode and property type." },
        { title: "Approve your listing", body: "Review the photos, copy and rent. One tap to push it live across major rental portals." },
        { title: "AI sources & vets tenants", body: "Pre-qualified applicants only. Viewings booked automatically. Referencing in the background." },
        { title: "Sign, protect, hand over keys", body: "Compliant tenancy agreement, deposit protected, move-in coordinated — fully digital." },
      ]}
    />
  );
}