import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Home, Key, ShoppingBag, Building, Briefcase, Loader2, Radio } from "lucide-react";
import hummBird from "@/assets/humm-bird.png";

const ROLES = [
  {
    id: "buyer",
    label: "Buyer",
    description: "Negotiate Entry — Offers, chain analysis, survey audits",
    icon: ShoppingBag,
  },
  {
    id: "renter",
    label: "Renter",
    description: "Contract Audit — Repairs, pet requests, tenancy review",
    icon: Key,
  },
];

interface RolePickerProps {
  userId: string;
  onRoleSelected: (role: string) => void;
}

const RolePicker = ({ userId, onRoleSelected }: RolePickerProps) => {
  const { toast } = useToast();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ user_role: selected } as any)
      .eq("user_id", userId);
    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      onRoleSelected(selected);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="relative max-w-lg w-full mx-4 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-6 sm:p-8 shadow-[0_0_80px_rgba(114,241,184,0.06)]">
        {/* Decorative glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-[#72F1B8]/10 blur-3xl pointer-events-none" />

        <div className="text-center mb-6 relative">
          <div className="relative w-14 h-14 mx-auto mb-4">
            <img src={hummBird} alt="Hummm" className="w-14 h-14 object-contain" />
            <div className="absolute inset-0 rounded-full bg-[#72F1B8]/20 blur-xl animate-pulse" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Define Your AI Identity
          </h1>
          <p className="text-muted-foreground mt-1.5 text-xs flex items-center justify-center gap-1.5">
            <Radio size={10} className="text-[#72F1B8]" />
            Select your persona to unlock role-specific AI tools
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-6">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const active = selected === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelected(r.id)}
                className={`rounded-xl border p-3.5 text-left transition-all duration-200 ${
                  r.id === "agent" ? "col-span-2" : ""
                } ${
                  active
                    ? "border-[#72F1B8]/50 bg-[#72F1B8]/10 shadow-[0_0_25px_rgba(114,241,184,0.12)]"
                    : "border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    active ? "bg-[#72F1B8]/20" : "bg-white/[0.06]"
                  }`}>
                    <Icon size={16} className={active ? "text-[#72F1B8]" : "text-muted-foreground"} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-bold ${active ? "text-[#72F1B8]" : "text-foreground"}`}>
                      {r.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-1">
                      {r.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={confirm}
          disabled={!selected || saving}
          className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider bg-[#72F1B8] text-black hover:brightness-110 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          style={{
            boxShadow: selected ? "0 0 30px rgba(114,241,184,0.2)" : "none",
          }}
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Enter AI Dashboard
        </button>
        <p className="text-[10px] text-muted-foreground text-center mt-3">
          You can change your identity anytime from the dashboard.
        </p>
      </div>
    </div>
  );
};

export default RolePicker;
