import ComingSoonService from "@/components/ComingSoonService";
import { Wallet, Wrench, ShieldCheck } from "lucide-react";

export default function Management() {
  return (
    <ComingSoonService
      serviceName="Property Management"
      seoTitle="Property Management — Coming Soon · Hummm AI"
      seoDescription="Fully automated AI property management launching soon. Get a free valuation today, or have Hummm negotiate your next deal — first one free."
      canonical="/management"
      waitlistInterest="Property Management"
      headline={<>Property Management — <span className="text-gradient">launching shortly.</span></>}
      subheading="Total peace of mind, fully automated. Rent collection, compliance, maintenance and tenant comms — we're polishing it for launch. Until then, our two flagship services are live today."
      pills={[
        { icon: Wallet, label: "Automated Rent" },
        { icon: Wrench, label: "Smart Maintenance" },
        { icon: ShieldCheck, label: "Compliance Engine" },
      ]}
      bullets={[
        "Automated rent collection & arrears chasing",
        "Live compliance tracking & document vault",
        "Vetted maintenance network on call 24/7",
        "AI tenant communication in your tone of voice",
        "Annual rent reviews, renewals & re-marketing",
      ]}
    />
  );
}