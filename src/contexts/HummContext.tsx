import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface HummContextType {
  isLoggedIn: boolean;
  isGold: boolean;
  currentRole: string | null;
  userEmail: string | null;
  userId: string | null;
  founderStatus: "founder" | "founder_gold" | null;
  isOwner: boolean;           // Phase 2: authoritative owner flag from subscription system
  setCurrentRole: (role: string) => void;
  switchRole: (roleKey: string) => Promise<void>;
  upgradeToFounderGold: () => Promise<void>;
  signOut: () => Promise<void>;
}

const HummContext = createContext<HummContextType | undefined>(undefined);

export const useHumm = () => {
  const ctx = useContext(HummContext);
  if (!ctx) throw new Error("useHumm must be used inside HummProvider");
  return ctx;
};

export const HummProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGold, setIsGold] = useState(false);
  const [currentRole, setCurrentRoleState] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [founderStatus, setFounderStatus] = useState<"founder" | "founder_gold" | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  const syncState = async (session: any) => {
    const loggedIn = !!session;
    setIsLoggedIn(loggedIn);
    setIsGold(!!localStorage.getItem("humm_dip_url"));
    setUserEmail(session?.user?.email || null);
    setUserId(session?.user?.id || null);
    if (loggedIn && session?.user?.id) {
      setCurrentRoleState(localStorage.getItem("humm_user_role") || "buyer");

      // Fetch founder status from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("founder_status")
        .eq("user_id", session.user.id)
        .single();
      const fs = (profile as any)?.founder_status;
      setFounderStatus(fs === "founder_gold" ? "founder_gold" : fs === "founder" ? "founder" : null);

      // Auto-assign 'founder' if new user with no founder_status
      if (!fs) {
        await supabase.from("profiles").update({ founder_status: "founder" } as any).eq("user_id", session.user.id);
        setFounderStatus("founder");
      }

      // Phase 2: Pull isOwner from subscription system (it will be set by useSubscription)
      // For now we read a small cache written by useSubscription
      const ownerCache = localStorage.getItem(`humm_is_owner:${session.user.id}`);
      setIsOwner(ownerCache === "1");
    } else {
      setCurrentRoleState(null);
      setFounderStatus(null);
      setIsOwner(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      syncState(session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => syncState(session));
    return () => subscription.unsubscribe();
  }, []);

  const setCurrentRole = (role: string) => {
    setCurrentRoleState(role);
    localStorage.setItem("humm_user_role", role);
  };

  const switchRole = async (roleKey: string) => {
    setCurrentRole(roleKey);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ user_role: roleKey }).eq("user_id", user.id);
    }
  };

  const upgradeToFounderGold = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ founder_status: "founder_gold" } as any).eq("user_id", user.id);
      setFounderStatus("founder_gold");
      setIsGold(true);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("humm_user_role");
    localStorage.removeItem("humm_dip_verified");
    localStorage.removeItem("humm_dip_url");
    setIsLoggedIn(false);
    setIsGold(false);
    setCurrentRoleState(null);
    setUserEmail(null);
    setUserId(null);
    setFounderStatus(null);
  };

  return (
    <HummContext.Provider value={{ 
      isLoggedIn, 
      isGold, 
      currentRole, 
      userEmail, 
      userId, 
      founderStatus, 
      isOwner,                    // Phase 2 addition
      setCurrentRole, 
      switchRole, 
      upgradeToFounderGold, 
      signOut 
    }}>
      {children}
    </HummContext.Provider>
  );
};
