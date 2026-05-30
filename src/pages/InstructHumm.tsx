import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import InstructWizard from "@/components/InstructWizard";

const InstructHumm = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Instruct Hummm | AI Property Representation"
        description="Authorize Hummm to represent you. We find elite agents, negotiate fees, and manage communications on your behalf."
      />
      <Navbar />
      <main className="pt-24 pb-16">
        <InstructWizard />
      </main>
      <Footer />
    </div>
  );
};

export default InstructHumm;
