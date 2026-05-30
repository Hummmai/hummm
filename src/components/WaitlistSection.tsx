import { useState } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import GDPRConsent from "@/components/GDPRConsent";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const interestOptions = [
  "Selling my property",
  "Taking over my property management",
  "Letting my property",
  "Just curious / early access",
];

const WaitlistSection = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) {
      toast.error("Please enter your name and email.");
      return;
    }
    if (!gdprConsent) {
      toast.error("Please consent to our Privacy Policy to continue.");
      return;
    }

    setLoading(true);
    try {
      const id = crypto.randomUUID();

      const { error } = await supabase.from("waitlist_signups").insert({
        id,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        interests,
      });

      if (error) throw error;

      // Send welcome email to user
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "waitlist-welcome",
          recipientEmail: email.trim().toLowerCase(),
          idempotencyKey: `waitlist-welcome-${id}`,
          templateData: { name: fullName.trim(), interests },
        },
      });

      // Send admin notification
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "notify-waitlist",
          recipientEmail: "hello@hummm.pro",
          idempotencyKey: `notify-waitlist-${id}`,
          templateData: {
            name: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim() || null,
            interests,
          },
        },
      });

      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="py-20 section-padding">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <div
              className="relative overflow-hidden rounded-2xl p-10 md:p-16 text-center"
              style={{ backgroundColor: "#0A1428" }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 50%, rgba(0,229,204,0.12) 0%, transparent 65%)",
                }}
              />
              <div className="relative z-10">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: "rgba(0,229,204,0.15)" }}
                >
                  <CheckCircle size={32} style={{ color: "#00E5CC" }} />
                </div>
                <h3
                  className="text-2xl md:text-3xl font-black mb-4 text-balance"
                  style={{ color: "#fff" }}
                >
                  You're on the list!
                </h3>
                <p
                  className="text-base leading-relaxed max-w-md mx-auto"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Thank you! You're now on the early access list. We'll contact
                  you as soon as we're ready for you.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 section-padding">
      <div className="max-w-3xl mx-auto">
        <AnimatedSection>
          <div
            className="relative overflow-hidden rounded-2xl p-8 md:p-14"
            style={{ backgroundColor: "#0A1428" }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 30% 20%, rgba(0,229,204,0.1) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(0,229,204,0.06) 0%, transparent 50%)",
              }}
            />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5"
                  style={{
                    border: "1px solid rgba(0,229,204,0.3)",
                    backgroundColor: "rgba(0,229,204,0.08)",
                  }}
                >
                  <Sparkles size={13} style={{ color: "#00E5CC" }} />
                  <span
                    className="text-[11px] font-bold uppercase tracking-widest"
                    style={{ color: "#00E5CC" }}
                  >
                    Early Access
                  </span>
                </div>
                <h2
                  className="text-2xl md:text-4xl font-black tracking-tight mb-3 text-balance"
                  style={{ color: "#fff" }}
                >
                  Be Among the First to Experience AI Property
                </h2>
                <p
                  className="text-sm md:text-base leading-relaxed max-w-xl mx-auto"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  Join the waitlist for early access to our AI-powered property
                  services — smarter valuations, seamless sales, and fully
                  compliant lettings under the new Renters' Rights Act.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 rounded-xl text-sm font-medium outline-none transition-all"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                    }}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 rounded-xl text-sm font-medium outline-none transition-all"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                    }}
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl text-sm font-medium outline-none transition-all"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                    }}
                  />
                </div>

                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    What are you interested in?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {interestOptions.map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all text-sm"
                        style={{
                          backgroundColor: interests.includes(opt)
                            ? "rgba(0,229,204,0.12)"
                            : "rgba(255,255,255,0.04)",
                          border: interests.includes(opt)
                            ? "1px solid rgba(0,229,204,0.4)"
                            : "1px solid rgba(255,255,255,0.08)",
                          color: interests.includes(opt)
                            ? "#00E5CC"
                            : "rgba(255,255,255,0.6)",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={interests.includes(opt)}
                          onChange={() => toggleInterest(opt)}
                          className="sr-only"
                        />
                        <div
                          className="w-4 h-4 rounded shrink-0 flex items-center justify-center"
                          style={{
                            border: interests.includes(opt)
                              ? "2px solid #00E5CC"
                              : "2px solid rgba(255,255,255,0.25)",
                            backgroundColor: interests.includes(opt)
                              ? "#00E5CC"
                              : "transparent",
                          }}
                        >
                          {interests.includes(opt) && (
                            <CheckCircle size={10} style={{ color: "#0A1428" }} />
                          )}
                        </div>
                        <span className="font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !gdprConsent}
                  className="w-full flex items-center justify-center gap-2.5 px-8 py-4 text-sm font-bold rounded-full transition-all hover:brightness-110 disabled:opacity-60"
                  style={{
                    backgroundColor: "#00E5CC",
                    color: "#0A1428",
                    boxShadow: "0 0 30px rgba(0,229,204,0.25)",
                  }}
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  {loading ? "Joining..." : "Join the Early Access List"}
                </button>

                <GDPRConsent checked={gdprConsent} onChange={setGdprConsent} variant="dark" />

                <p
                  className="text-center text-[11px]"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  No spam, ever. We'll only contact you about our services.
                </p>
              </form>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default WaitlistSection;
