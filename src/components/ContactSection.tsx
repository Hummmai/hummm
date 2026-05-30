import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AnimatedSection from "@/components/AnimatedSection";
import { Send, Sparkles, Phone, MapPin, Mail, Calendar } from "lucide-react";

const ContactSection = () => {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const [formType, setFormType] = useState<"consultation" | "list">("consultation");

  const formConfigs = {
    valuation: { title: "Instant Free AI Valuation", subtitle: "Get an AI-powered property valuation in seconds.", cta: "Get My Free Valuation" },
    consultation: { title: "Book a Free Strategy Call", subtitle: "Speak with our property experts about your strategy.", cta: "Book Strategy Call" },
    list: { title: "List Your Property", subtitle: "Start your journey with the smartest property consultants.", cta: "Submit Listing" },
  };

  const config = formConfigs[formType];

  return (
    <section id="contact" className="py-28 sm:py-36 section-padding">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <AnimatedSection>
              <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-primary/50 mb-4">Get Started</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-foreground/90">
                Ready to Experience{" "}
                <span className="text-gradient">Intelligent</span> Property?
              </h2>
              <p className="text-muted-foreground/50 text-base mb-14">
                Choose how you'd like to get started.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <div className="space-y-6">
                {[
                  { icon: Phone, label: "020 7946 0958", sub: "Mon–Sat, 8am–8pm" },
                  { icon: Mail, label: "hello@hummm.pro", sub: "We respond within 2 hours" },
                  { icon: MapPin, label: "128 City Road", sub: "London EC1V 2NX, United Kingdom" },
                  { icon: Calendar, label: "Book a free strategy call", sub: "30-minute video consultation" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-9 h-9 flex items-center justify-center bg-primary/[0.04] rounded-lg flex-shrink-0">
                      <item.icon size={16} className="text-primary/40" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground/70">{item.label}</p>
                      <p className="text-xs text-muted-foreground/35">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={200}>
            <div className="border border-border/15 rounded-2xl bg-card/15 p-8">
              <div className="flex gap-1 bg-secondary/30 rounded-xl p-1 mb-8">
                {(["valuation", "consultation", "list"] as const).map((t) =>
                  t === "valuation" ? (
                    <Link key={t} to="/ai-valuation" className="flex-1 px-3 py-2.5 text-xs font-medium rounded-lg transition-all text-center text-muted-foreground/50 hover:text-foreground/70">
                      AI Valuation →
                    </Link>
                  ) : (
                    <button
                      key={t}
                      onClick={() => setFormType(t)}
                      className={`flex-1 px-3 py-2.5 text-xs font-medium rounded-lg transition-all ${formType === t ? "bg-primary text-primary-foreground" : "text-muted-foreground/50 hover:text-foreground/70"}`}
                    >
                      {t === "consultation" ? "Strategy Call" : "List Property"}
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={15} className="text-primary/50" />
                <h3 className="text-base font-semibold text-foreground/80">{config.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground/40 mb-6">{config.subtitle}</p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);
                const fd = new FormData(e.currentTarget);
                try {
                  await supabase.functions.invoke("send-transactional-email", {
                    body: {
                      templateName: "notify-contact",
                      idempotencyKey: `notify-contact-${fd.get('email')}-${Date.now()}`,
                      templateData: { firstName: fd.get('firstName'), lastName: fd.get('lastName'), email: fd.get('email'), phone: fd.get('phone'), formType, interest: fd.get('interest'), message: fd.get('message') },
                    },
                  });
                  toast({ title: "Submitted!", description: "We'll be in touch within 2 hours." });
                  e.currentTarget.reset();
                } catch {
                  toast({ title: "Error", description: "Please try again.", variant: "destructive" });
                } finally {
                  setSubmitting(false);
                }
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input name="firstName" type="text" placeholder="First name" required className="w-full px-4 py-3 text-sm bg-secondary/30 border border-border/15 rounded-xl text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  <input name="lastName" type="text" placeholder="Last name" required className="w-full px-4 py-3 text-sm bg-secondary/30 border border-border/15 rounded-xl text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
                <input name="email" type="email" placeholder="Email address" required className="w-full px-4 py-3 text-sm bg-secondary/30 border border-border/15 rounded-xl text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <input name="phone" type="tel" placeholder="Phone number" className="w-full px-4 py-3 text-sm bg-secondary/30 border border-border/15 rounded-xl text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/30" />
                {formType === "list" && (
                  <select name="interest" className="w-full px-4 py-3 text-sm bg-secondary/30 border border-border/15 rounded-xl text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30">
                    <option value="">Property type</option>
                    <option>House - Detached</option>
                    <option>House - Semi-detached</option>
                    <option>House - Terraced</option>
                    <option>Flat / Apartment</option>
                    <option>Bungalow</option>
                  </select>
                )}
                {formType === "consultation" && (
                  <select name="interest" className="w-full px-4 py-3 text-sm bg-secondary/30 border border-border/15 rounded-xl text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30">
                    <option value="">What are you looking to do?</option>
                    <option>Sell my property</option>
                    <option>Let my property</option>
                    <option>Buy a property</option>
                    <option>Property investment advice</option>
                  </select>
                )}
                <textarea name="message" placeholder="Tell us about your property or requirements..." rows={3} className="w-full px-4 py-3 text-sm bg-secondary/30 border border-border/15 rounded-xl text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none" />
                <div className="flex items-start gap-3">
                  <input type="checkbox" name="gdpr_consent" required className="mt-1 accent-primary" />
                  <span className="text-[11px] text-muted-foreground/40 leading-relaxed">
                    I consent to processing my data as described in the{" "}
                    <Link to="/privacy-policy" target="_blank" className="text-primary/60 hover:underline font-medium">Privacy Policy</Link>.
                  </span>
                </div>
                <button type="submit" disabled={submitting} className="w-full btn-press flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-xl disabled:opacity-50 shadow-[0_4px_20px_-6px_hsl(168_80%_48%/0.2)]">
                  <Send size={15} />
                  {submitting ? 'Sending...' : config.cta}
                </button>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
