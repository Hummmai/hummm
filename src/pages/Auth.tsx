import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import {
  Mail, Lock, User, Loader2, ArrowRight, Phone, MapPin,
  Home, Tag, Key, Building2, Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const smartRedirect = (navigate: ReturnType<typeof useNavigate>) => {
  const pendingAction = sessionStorage.getItem("humm_pending_action");
  const params = new URLSearchParams(window.location.search);

  // Honor ?next=/some/path — used by Negotiator / sticky CTA to bounce
  // the user straight back into the flow they came from after sign up / login.
  const next = params.get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    navigate(next, { replace: true });
    return;
  }

  if (pendingAction && params.get("redirect") === "checkout") {
    navigate("/?resume=checkout", { replace: true });
    return;
  }

  // Send brand new users straight to the Free Valuation, if requested
  const flow = sessionStorage.getItem("humm_signup_flow");
  if (flow === "valuation") {
    sessionStorage.removeItem("humm_signup_flow");
    navigate("/free-valuation", { replace: true });
    return;
  }

  navigate("/dashboard", { replace: true });
};

type RoleId = "buyer" | "seller" | "landlord" | "renter";

const ROLES: { id: RoleId; label: string; icon: any; blurb: string }[] = [
  { id: "buyer",    label: "I'm a Buyer",          icon: Key,        blurb: "Find & negotiate properties" },
  { id: "seller",   label: "I'm a Seller",         icon: Tag,        blurb: "Sell smarter, keep more" },
  { id: "landlord", label: "I'm a Landlord",       icon: Building2,  blurb: "Let, manage & comply" },
  { id: "renter",   label: "I'm a Renter / Tenant",icon: Home,       blurb: "Rent with confidence" },
];

const INTERESTS = ["Buying", "Selling", "Letting", "Managing"];

const Auth = () => {
  // If user arrives with ?next= (e.g. from "Start your first negotiation"
  // sticky CTA) default to sign-up — they're brand new to the product.
  const initialIsLogin = (() => {
    if (typeof window === "undefined") return true;
    const p = new URLSearchParams(window.location.search);
    if (p.get("next")) return false;
    if (p.get("mode") === "signup") return false;
    return true;
  })();
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [postcode, setPostcode] = useState("");
  const [role, setRole] = useState<RoleId | "">("");
  const [interest, setInterest] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // signup wizard step
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const welcomeByRole: Record<RoleId, string> = {
    buyer:    "Welcome — let's find your next home.",
    seller:   "Welcome — let's get your property sold.",
    landlord: "Welcome — let's let & manage smarter.",
    renter:   "Welcome — let's find a place you'll love.",
  };

  const signupProgress = useMemo(() => (step === 1 ? 50 : 100), [step]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        if (event === "SIGNED_IN") {
          const created = session.user?.created_at;
          const isNew = created && (Date.now() - new Date(created).getTime() < 60_000);
          if (isNew) {
            // Persist any extra signup details into profiles
            const pending = sessionStorage.getItem("humm_signup_extras");
            if (pending) {
              try {
                const extras = JSON.parse(pending);
                await supabase.from("profiles").update({
                  phone: extras.phone || null,
                  postcode: extras.postcode || null,
                  user_role: extras.role || null,
                  interest: extras.interest || null,
                  name: extras.name || session.user.user_metadata?.name || null,
                }).eq("user_id", session.user.id);
              } catch {}
              sessionStorage.removeItem("humm_signup_extras");
            }

            supabase.functions.invoke("send-transactional-email", {
              body: {
                templateName: "notify-signup",
                idempotencyKey: `notify-signup-${session.user.id}`,
                templateData: {
                  name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || "",
                  email: session.user.email,
                  provider: session.user.app_metadata?.provider || "email",
                },
              },
            }).catch(() => {});

            const r = (session.user.user_metadata?.role as RoleId) || (JSON.parse(sessionStorage.getItem("humm_signup_extras") || "{}").role as RoleId);
            if (r && welcomeByRole[r]) {
              toast({ title: "Account created!", description: welcomeByRole[r] });
            }
          }
        }
        smartRedirect(navigate);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) smartRedirect(navigate);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const friendlyError = (msg: string) => {
    if (/rate limit|after \d+ seconds/i.test(msg)) {
      return "We've sent too many requests in a short time. Please wait a moment and try again.";
    }
    if (/already registered|already exists/i.test(msg)) {
      return "An account with this email already exists. Try logging in instead.";
    }
    if (/invalid login/i.test(msg)) {
      return "Email or password is incorrect.";
    }
    return msg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && step === 1) {
      // Validate step 1 then move to step 2
      if (!name.trim() || !email.trim() || password.length < 6) {
        toast({ title: "Almost there", description: "Add your name, email and a 6+ character password.", variant: "destructive" });
        return;
      }
      setStep(2);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "Redirecting to your dashboard..." });
      } else {
        if (!role) {
          setLoading(false);
          toast({ title: "Pick a role", description: "Tell us what best describes you to personalise your dashboard.", variant: "destructive" });
          return;
        }

        sessionStorage.setItem("humm_signup_extras", JSON.stringify({
          name, phone, postcode, role, interest,
        }));

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, phone, postcode, role, interest },
            emailRedirectTo: window.location.origin + "/dashboard",
          },
        });
        if (error) throw error;
        toast({ title: "Account created!", description: welcomeByRole[role as RoleId] });
        supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "notify-signup",
            idempotencyKey: `notify-signup-${email}-${Date.now()}`,
            templateData: { name, email, provider: "email", role, phone, postcode },
          },
        }).catch(() => {});
        setTimeout(() => smartRedirect(navigate), 400);
      }
    } catch (err: any) {
      toast({ title: "Sign-up failed", description: friendlyError(err?.message || "Something went wrong."), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Sign In | Hummmingbird AI Global"
        description="Access your client dashboard to view valuation reports."
      />
      <Navbar />
      <div className="pt-28 pb-20 section-padding flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md">
          <div className="glass-surface rounded-2xl p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">
                {isLogin ? "Welcome Back" : "Create Your Account"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLogin
                  ? "Log in to access your valuation reports and dashboard."
                  : step === 1
                    ? "Step 1 of 2 — your account details."
                    : "Step 2 of 2 — tell us a little about you."}
              </p>
              {!isLogin && (
                <div className="mt-4 h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${signupProgress}%` }}
                  />
                </div>
              )}
            </div>

            {!isLogin && (
              <button
                type="button"
                onClick={async () => {
                  sessionStorage.setItem("humm_signup_flow", "valuation");
                  const { error } = await lovable.auth.signInWithOAuth("google", {
                    redirect_uri: window.location.origin + "/dashboard",
                  });
                  if (error) {
                    toast({ title: "Google sign-in failed", description: friendlyError(error.message), variant: "destructive" });
                  }
                }}
                className="w-full mb-5 flex items-center justify-center gap-3 py-3.5 bg-white text-gray-900 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all shadow-lg shadow-black/10"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l3.56-2.77z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            )}

            {!isLogin && (
              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted-foreground">or sign up with email</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && step === 1 && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>
              )}

              {(isLogin || step === 1) && (
              <>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              </>
              )}

              {!isLogin && step === 2 && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="For viewings & negotiations"
                        className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">What best describes you?</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLES.map((r) => {
                        const Icon = r.icon;
                        const active = role === r.id;
                        return (
                          <button
                            type="button"
                            key={r.id}
                            onClick={() => setRole(r.id)}
                            className={`text-left rounded-xl border p-3 transition-all ${
                              active
                                ? "border-primary bg-primary/10 ring-2 ring-primary/40"
                                : "border-border bg-muted/40 hover:bg-muted/60"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Icon size={16} className={active ? "text-primary" : "text-muted-foreground"} />
                              <span className="text-xs font-semibold text-foreground">{r.label}</span>
                            </div>
                            <span className="text-[11px] text-muted-foreground">{r.blurb}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Postcode / City</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        placeholder="e.g. SW1A 1AA or London"
                        className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Property interest <span className="text-muted-foreground/70">(optional)</span></label>
                    <div className="relative">
                      <Sparkles size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <select
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                      >
                        <option value="">Select an option</option>
                        {INTERESTS.map((i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-1">
                {!isLogin && step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="px-4 py-3.5 text-sm font-semibold rounded-xl border border-border bg-muted/40 hover:bg-muted/60 transition-all"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-all rounded-xl shadow-lg shadow-primary/25"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Please wait...</>
                  ) : isLogin ? (
                    <>Log In <ArrowRight size={16} /></>
                  ) : step === 1 ? (
                    <>Continue <ArrowRight size={16} /></>
                  ) : (
                    <>Create Account <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </form>

            {isLogin && (
            <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                const { error } = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: window.location.origin + "/dashboard",
                });
                if (error) {
                  toast({ title: "Error", description: error.message, variant: "destructive" });
                }
              }}
              className="w-full flex items-center justify-center gap-3 py-3 bg-muted/50 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l3.56-2.77z" fill="#FBBC05"/>  
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            </>
            )}
            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsLogin(!isLogin); setStep(1); }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="font-semibold text-primary">
                  {isLogin ? "Sign Up" : "Log In"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
