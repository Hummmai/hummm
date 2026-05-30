import ServiceLaunchPage from "@/components/ServiceLaunchPage";
import {
  Brain,
  Megaphone,
  Shield,
  Target,
  Camera,
  HandCoins,
  Clock,
  FileCheck,
  Users,
} from "lucide-react";

export default function SellForMe() {
  return (
    <ServiceLaunchPage
      serviceName="Sell For Me"
      headlineLead="Sell For Me —"
      headlineAccent="just 0.75%"
      subheading="Your full AI estate agent. Pricing, marketing, enquiries, viewings and offer negotiation — all handled, at a fraction of high-street fees."
      seoTitle="Sell For Me — Premium AI Estate Agent · Hummm AI"
      seoDescription="Sell your property for just 0.75% with Hummm AI. Full-service AI property consultancy launching shortly. First negotiation free today."
      canonical="/sell-for-me"
      waitlistInterest="Sell For Me"
      pills={[
        { icon: Brain, label: "AI Pricing & Strategy" },
        { icon: Megaphone, label: "Multi-portal Launch" },
        { icon: Shield, label: "You approve every step" },
      ]}
      benefits={[
        { icon: HandCoins, title: "Flat 0.75% fee", body: "No tie-ins, no hidden marketing costs. Pay only when your property completes." },
        { icon: Brain, title: "Savant AI pricing", body: "Optimised listing price based on 14 markets of comparable data — sold prices, demand, velocity." },
        { icon: Megaphone, title: "Premium portal launch", body: "Rightmove, Zoopla and OnTheMarket — with AI-written copy that converts." },
        { icon: Camera, title: "Pro photography (optional)", body: "Book editorial-grade photography and floorplans directly from your dashboard." },
        { icon: Target, title: "Buyer qualification", body: "Every enquiry vetted by AI — proof of funds, chain status, mortgage agreement." },
        { icon: Shield, title: "Negotiation built in", body: "Offers handled by our Negotiation Agent — designed to push every offer 6–9% higher." },
      ]}
      steps={[
        { title: "Free AI valuation", body: "30-second instant valuation from our Savant engine. No commitment, no sign-up." },
        { title: "Approve your listing", body: "We draft pricing, photos, copy and marketing plan. You tap to approve before it goes live." },
        { title: "AI handles enquiries & viewings", body: "Qualified buyers only. Viewings coordinated automatically with your calendar." },
        { title: "We negotiate. You complete.", body: "Offers managed by Hummm Negotiator. You approve the final number — we handle the rest to completion." },
      ]}
    />
  );
}