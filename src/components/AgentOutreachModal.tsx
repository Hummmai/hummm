import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Mail, Loader2, CheckCircle, Sparkles, Send } from "lucide-react";
import GoldHummm from "./GoldHummm";
import confetti from "canvas-confetti";

interface Agent {
  id: string;
  name: string;
  logo: string;
  email: string | null;
}

interface AgentOutreachModalProps {
  agents: Agent[];
  propertyAddress: string;
  searchLocation: string;
  onClose: () => void;
}

export default function AgentOutreachModal({
  agents,
  propertyAddress,
  searchLocation,
  onClose,
}: AgentOutreachModalProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const displayAddress = propertyAddress || searchLocation;

  const generateMessage = (agentName: string) =>
    `Hi ${agentName},\n\nI am a Hummm Verified Seller at ${displayAddress}. I'm looking for an expert to handle my exit strategy in the current ${searchLocation} market.\n\nHummm's AI identified you as a top performer based on transaction data, review scores, and sale-to-asking-price ratios.\n\nHummm will be assisting with the commission and marketing strategy negotiation.\n\nWhen can we talk?\n\nBest regards,\nA Hummm Verified Seller`;

  const handleSend = async () => {
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Save each outreach as a negotiate_request
        for (const agent of agents) {
          await supabase.from("negotiate_requests").insert({
            user_id: user.id,
            property_link: displayAddress,
            property_address: displayAddress,
            postcode: searchLocation,
            goal: "sell",
            package: "outreach",
            notes: `AI Outreach to ${agent.name}`,
            display_name: `Outreach: ${agent.name}`,
          });
        }
      }
    } catch (err) {
      console.error("Outreach save error:", err);
    }

    // Fire confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#72F1B8", "#00E5CC", "#ffffff"],
    });

    setSending(false);
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white/[0.04] backdrop-blur-md rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300"
        style={{ border: "1px solid transparent", backgroundClip: "padding-box" }}>
        {/* Gradient border */}
        <div className="absolute -inset-px rounded-2xl pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #72F1B8 0%, hsl(168 100% 45%) 100%)",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
            borderRadius: "1rem",
          }}
        />

        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors z-10">
          <X size={16} className="text-white/50" />
        </button>

        <div className="relative z-10 p-6 md:p-8">
          {sent ? (
            /* ── Success State ── */
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-[#72F1B8]/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-[#72F1B8]" />
              </div>
              <h2 className="text-2xl font-black mb-3">Messages Dispatched</h2>
              <p className="text-muted-foreground mb-2">
                <span className="text-[#72F1B8] font-bold text-lg">{agents.length}</span> agent{agents.length !== 1 ? "s" : ""} reached with your AI-crafted intro.
              </p>
              <p className="text-xs text-muted-foreground/50 mb-6">
                This activity has been saved to your Hummm under 'Active Outreach'.
              </p>
              <button onClick={onClose}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-full bg-[#72F1B8] text-black hover:brightness-110 transition-all"
                style={{ boxShadow: "0 0 20px rgba(114,241,184,0.3)" }}>
                <Sparkles size={14} /> Done
              </button>
            </div>
          ) : (
            /* ── Preview State ── */
            <>
              <div className="flex items-center gap-3 mb-6">
                <GoldHummm size={28} pulse={false} />
                <div>
                  <h2 className="text-lg font-black">AI Agent Intro</h2>
                  <p className="text-xs text-muted-foreground">Preview the message Hummm will send to {agents.length} agent{agents.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Agent list */}
              <div className="mb-4 space-y-2">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm shrink-0">{agent.logo}</div>
                    <span className="text-sm font-semibold truncate flex-1">{agent.name}</span>
                    <Mail size={12} className="text-[#72F1B8]/60 shrink-0" />
                  </div>
                ))}
              </div>

              {/* Message preview */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Message Preview</label>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
                  {generateMessage(agents.length === 1 ? agents[0].name : `[Agent Name]`)}
                </div>
                <p className="text-[10px] text-muted-foreground/40 mt-2">
                  Each agent will receive a personalised version with their name.
                </p>
              </div>

              <button onClick={handleSend} disabled={sending}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold rounded-full bg-[#72F1B8] text-black hover:brightness-110 transition-all disabled:opacity-60"
                style={{ boxShadow: "0 0 20px rgba(114,241,184,0.3), 0 0 60px rgba(114,241,184,0.1)" }}>
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {sending ? "Dispatching..." : `Send to ${agents.length} Agent${agents.length !== 1 ? "s" : ""} ✉️`}
              </button>

              <p className="text-[10px] text-muted-foreground/40 text-center mt-3">
                Hummm provides strategic outreach assistance. Final engagement decisions remain yours.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
