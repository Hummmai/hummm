import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "valid" | "already" | "invalid" | "done" | "error">("loading");

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    const validate = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`, {
          headers: { apikey: anonKey },
        });
        const data = await res.json();
        if (!res.ok) { setStatus("invalid"); return; }
        if (data.valid === false && data.reason === "already_unsubscribed") { setStatus("already"); return; }
        setStatus("valid");
      } catch { setStatus("error"); }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    setStatus("loading");
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", { body: { token } });
      if (error) { setStatus("error"); return; }
      if (data?.reason === "already_unsubscribed") { setStatus("already"); return; }
      setStatus("done");
    } catch { setStatus("error"); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <SEOHead title="Unsubscribe | Hummm" description="Manage your email preferences for Hummm property communications." />
      <div className="max-w-md w-full text-center space-y-6">
        <Sparkles size={28} className="text-primary mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Email Preferences</h1>

        {status === "loading" && <Loader2 className="animate-spin mx-auto text-primary" size={32} />}

        {status === "valid" && (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">Click below to unsubscribe from future emails from Hummm.</p>
            <Button onClick={handleUnsubscribe} className="rounded-full">Confirm Unsubscribe</Button>
          </div>
        )}

        {status === "done" && (
          <div className="space-y-3">
            <CheckCircle className="text-primary mx-auto" size={40} />
            <p className="text-foreground font-medium">You've been unsubscribed.</p>
            <p className="text-muted-foreground text-sm">You won't receive further emails from us.</p>
          </div>
        )}

        {status === "already" && (
          <div className="space-y-3">
            <CheckCircle className="text-muted-foreground mx-auto" size={40} />
            <p className="text-foreground font-medium">Already unsubscribed</p>
            <p className="text-muted-foreground text-sm">This email address has already been unsubscribed.</p>
          </div>
        )}

        {(status === "invalid" || status === "error") && (
          <div className="space-y-3">
            <XCircle className="text-destructive mx-auto" size={40} />
            <p className="text-foreground font-medium">Invalid or expired link</p>
            <p className="text-muted-foreground text-sm">This unsubscribe link is no longer valid. Contact hello@hummm.pro for help.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
