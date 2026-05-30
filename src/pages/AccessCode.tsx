import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import hummLogo from "@/assets/humm-logo-transparent.png";
import { Loader2, KeyRound, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const AccessCode = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setChecking(true);
    try {
      const { data, error } = await supabase.rpc("verify_access_code" as any, {
        p_code: trimmed,
      });
      const row = Array.isArray(data) ? data[0] : data;

      if (error || !row?.email) {
        toast.error("Invalid access code. Please check and try again.");
        setChecking(false);
        return;
      }

      // Remember the verified email for the auth step (no access grant by itself)
      localStorage.setItem("humm_early_access_email", row.email);
      toast.success("Access granted! Welcome to Hummm 🎉");
      navigate("/auth?access=granted", { replace: true });
    } catch {
      toast.error("Something went wrong. Please try again.");
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6">
      <SEOHead title="Enter Access Code | Hummm" description="Enter your early access code to unlock Hummm." />

      <span className="relative inline-flex items-center mb-8">
        <img src={hummLogo} alt="Hummm" className="h-20 sm:h-28 w-auto" />
      </span>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <KeyRound size={24} className="text-primary" />
          </div>
          <h1 className="text-2xl font-black mb-2">Enter Access Code</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Enter the unique code you received from the Hummm team to unlock full access.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="HUMM-XXXX"
            maxLength={12}
            className="w-full px-5 py-4 rounded-2xl bg-card border border-border/60 text-center text-lg font-mono font-bold tracking-[0.3em] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:shadow-[0_0_24px_-6px_hsl(168_100%_45%/0.25)] transition-all"
          />
          <button
            type="submit"
            disabled={checking || !code.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 text-sm font-bold rounded-2xl bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50 transition-all shadow-[0_4px_24px_-4px_hsl(168_100%_45%/0.35)] active:scale-[0.98]"
          >
            {checking ? (
              <><Loader2 size={16} className="animate-spin" /> Verifying…</>
            ) : (
              <><ArrowRight size={16} /> Unlock Access</>
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-muted-foreground/50 mt-6">
          Don't have a code?{" "}
          <a href="/" className="text-primary hover:underline">
            Request early access
          </a>
        </p>
      </div>
    </div>
  );
};

export default AccessCode;
