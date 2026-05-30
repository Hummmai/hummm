import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, XCircle } from "lucide-react";
import hummLogo from "@/assets/humm-logo-transparent.png";

const InviteRedeem = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "invalid" | "redirecting">("loading");
  const token = params.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const redeem = async () => {
      const { data, error } = await supabase.rpc("redeem_invite" as any, {
        p_token: token,
      });
      const row = Array.isArray(data) ? data[0] : data;
      if (error || !row?.email) {
        setStatus("invalid");
        return;
      }
      localStorage.setItem("humm_early_access_email", row.email);
      setStatus("redirecting");
      navigate("/auth?invite=true", { replace: true });
    };

    redeem();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6">
      <span className="relative inline-flex items-center mb-8">
        <img src={hummLogo} alt="Hummm" className="h-20 sm:h-28 w-auto" />
      </span>

      {status === "loading" && (
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Verifying your invite…</p>
        </div>
      )}

      {status === "redirecting" && (
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-bold mb-2">Welcome to Hummm! 🎉</p>
          <p className="text-sm text-muted-foreground">Redirecting you to sign in…</p>
        </div>
      )}

      {status === "invalid" && (
        <div className="text-center">
          <XCircle size={32} className="text-destructive mx-auto mb-4" />
          <p className="text-lg font-bold mb-2">Invalid Invite Link</p>
          <p className="text-sm text-muted-foreground mb-6">
            This invite link is invalid or has expired. Please contact the person who shared it.
          </p>
          <a href="/" className="text-sm font-bold text-primary hover:underline">
            Go to Homepage
          </a>
        </div>
      )}
    </div>
  );
};

export default InviteRedeem;
