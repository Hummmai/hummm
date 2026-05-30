import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import { Construction, ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  title: string;
  subtitle?: string;
  description?: string;
}

export default function ComingSoonGate({ title, subtitle, description }: Props) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlist = () => {
    if (!email) return;
    window.location.href = `mailto:hello@hummm.pro?subject=Waitlist: ${title}&body=Hi Humm team,%0D%0A%0D%0AI'd like to join the waitlist for ${title}.%0D%0A%0D%0AMy email: ${email}%0D%0A%0D%0AThanks!`;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title={`${title} — Coming Soon | Hummm`} description={description || `${title} is coming soon to Hummm.`} />
      <Navbar />

      <section className="flex items-center justify-center min-h-[80vh] px-5">
        <AnimatedSection>
          <div className="max-w-lg mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Construction size={28} className="text-primary" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-balance">{title}</h1>
              {subtitle && (
                <p className="text-lg sm:text-xl font-semibold text-primary">{subtitle}</p>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
              {description || "This feature is coming soon. Join the waitlist to be notified when it launches."}
            </p>

            {/* Waitlist */}
            {!submitted ? (
              <div className="max-w-sm mx-auto space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email..."
                    className="flex-1 px-4 py-3 rounded-xl text-sm bg-card border border-border/60 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-all"
                    onKeyDown={(e) => e.key === "Enter" && handleWaitlist()}
                  />
                  <button
                    onClick={handleWaitlist}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98] whitespace-nowrap"
                  >
                    <Mail size={16} />
                    Join Waitlist
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary font-medium">
                ✅ Thanks! We'll notify you when this launches.
              </div>
            )}

            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border border-border/40 text-foreground hover:bg-muted/20 transition-all active:scale-[0.98]"
              >
                <ArrowRight size={16} className="rotate-180" />
                Back to Home
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>

      <Footer />
    </div>
  );
}
