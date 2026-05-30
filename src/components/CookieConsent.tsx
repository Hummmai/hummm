import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

type ConsentState = "accepted" | "rejected" | "custom" | null;

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [personalisation, setPersonalisation] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem("humm_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (state: ConsentState) => {
    localStorage.setItem("humm_cookie_consent", JSON.stringify({
      state,
      analytics: state === "accepted" ? true : state === "rejected" ? false : analytics,
      personalisation: state === "accepted" ? true : state === "rejected" ? false : personalisation,
      timestamp: new Date().toISOString(),
    }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-4xl mx-auto rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Cookie size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground mb-1">We value your privacy</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We use cookies for essential site functionality, analytics to improve our services, and personalisation to
                enhance your experience. Read our{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </Link>{" "}
                for full details.
              </p>

              {showPrefs && (
                <div className="mt-4 space-y-3 rounded-xl bg-secondary/50 p-4">
                  <label className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-foreground">Essential cookies</p>
                      <p className="text-[11px] text-muted-foreground">Required for the site to function</p>
                    </div>
                    <div className="w-10 h-5 rounded-full bg-primary/30 relative cursor-not-allowed opacity-60">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-primary" />
                    </div>
                  </label>
                  <label className="flex items-center justify-between gap-3 cursor-pointer" onClick={() => setAnalytics(!analytics)}>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Analytics cookies</p>
                      <p className="text-[11px] text-muted-foreground">Help us understand how you use the site</p>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${analytics ? "bg-primary/30" : "bg-border"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${analytics ? "right-0.5 bg-primary" : "left-0.5 bg-muted-foreground"}`} />
                    </div>
                  </label>
                  <label className="flex items-center justify-between gap-3 cursor-pointer" onClick={() => setPersonalisation(!personalisation)}>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Personalisation cookies</p>
                      <p className="text-[11px] text-muted-foreground">Tailor content and recommendations to you</p>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${personalisation ? "bg-primary/30" : "bg-border"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${personalisation ? "right-0.5 bg-primary" : "left-0.5 bg-muted-foreground"}`} />
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mt-5 sm:justify-end">
            {!showPrefs && (
              <button
                onClick={() => setShowPrefs(true)}
                className="px-4 py-2.5 text-xs font-semibold rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Manage Preferences
              </button>
            )}
            <button
              onClick={() => saveConsent("rejected")}
              className="px-4 py-2.5 text-xs font-semibold rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Reject All
            </button>
            {showPrefs ? (
              <button
                onClick={() => saveConsent("custom")}
                className="px-6 py-2.5 text-xs font-bold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Save Preferences
              </button>
            ) : (
              <button
                onClick={() => saveConsent("accepted")}
                className="px-6 py-2.5 text-xs font-bold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Accept All
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
