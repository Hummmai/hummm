import { Navigate } from "react-router-dom";
import { useHumm } from "@/contexts/HummContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const OWNER_EMAIL = "rpe976@gmail.com";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, userEmail } = useHumm();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);

      if (session?.user?.email) {
        const email = session.user.email.toLowerCase();
        // Owner always has access
        if (email === OWNER_EMAIL) {
          setHasAccess(true);
          setChecking(false);
          return;
        }
        // Check if user has an early access invite
        const { data: invite } = await supabase
          .from("early_access_invites")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (invite) {
          setHasAccess(true);
          setChecking(false);
          return;
        }

        // Check if user has an approved access code request
        const { data: accessReq } = await supabase
          .from("early_access_requests" as any)
          .select("id")
          .eq("email", email)
          .eq("status", "approved")
          .maybeSingle();

        if (accessReq) {
          setHasAccess(true);
          setChecking(false);
          return;
        }
      }

      // No localStorage fallback — access is always determined server-side
      // via the early_access_invites / early_access_requests tables above.
      setChecking(false);
    };

    check();
  }, [isLoggedIn, userEmail]);

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!hasSession && !isLoggedIn) {
    return <Navigate to="/auth?redirect=" replace />;
  }

  if (!hasAccess) {
    return <Navigate to="/access-code" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
