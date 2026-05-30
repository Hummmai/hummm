import ServiceLaunchPage from "@/components/ServiceLaunchPage";
import {
  Wallet,
  Wrench,
  ShieldCheck,
  MessageSquare,
  Bell,
  RefreshCcw,
  FileCheck,
  Clock,
  Building2,
} from "lucide-react";

export default function ManageForMe() {
  return (
    <ServiceLaunchPage
      serviceName="Manage For Me"
      headlineLead="Manage For Me —"
      headlineAccent="from £29/mo"
      subheading="Fully automated property management. Rent collection, compliance, maintenance and tenant comms — handled by AI, overseen by humans."
      seoTitle="Manage For Me — AI Property Management · Hummm AI"
      seoDescription="Hands-off AI property management from £29/mo. Rent collection, compliance, maintenance and tenant comms. Launching soon — join the waitlist."
      canonical="/manage-for-me"
      waitlistInterest="Manage For Me"
      pills={[
        { icon: Wallet, label: "Automated Rent" },
        { icon: Wrench, label: "Smart Maintenance" },
        { icon: ShieldCheck, label: "Compliance Engine" },
      ]}
      benefits={[
        { icon: Wallet, title: "Automated rent collection", body: "Rent in on time, every time. Arrears chased politely by AI, escalated only when needed." },
        { icon: ShieldCheck, title: "Live compliance vault", body: "Gas, EICR, EPC, HMO licences — tracked, renewed and stored in one tap-ready vault." },
        { icon: Wrench, title: "Vetted maintenance", body: "24/7 trusted contractor network. Issues triaged by AI, quotes approved by you." },
        { icon: MessageSquare, title: "AI tenant comms", body: "Tenants get instant, professional replies — in your tone of voice. You're only looped in when it matters." },
        { icon: RefreshCcw, title: "Renewals & rent reviews", body: "Annual rent reviews benchmarked to live market data. Renewals handled before you have to think about it." },
        { icon: Bell, title: "One dashboard. Total clarity.", body: "Every property, payment and ticket — at a glance. Mobile-first, audit-ready exports." },
      ]}
      steps={[
        { title: "Onboard your portfolio", body: "Add one property or fifty. AI imports documents, sets up compliance reminders and payment links." },
        { title: "Tenants opt in to AI comms", body: "Tenants chat with Hummm Assistant for routine queries — repairs, statements, rent dates." },
        { title: "AI runs the day-to-day", body: "Rent collection, compliance, contractor dispatch and renewals — all automated and logged." },
        { title: "You approve the big calls", body: "Major repairs, renewals or rent reviews surface in your inbox. One tap to approve, AI handles the rest." },
      ]}
    />
  );
}