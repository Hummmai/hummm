import { useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import {
  LUMINA_GOLD,
  LUMINA_GOLD_SOFT,
  LUMINA_CREAM,
  LUMINA_NAVY,
  LUMINA_NAVY_DEEP,
  luminaSerif,
  luminaSans,
} from "./LuminaShell";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export type WizardStep = {
  id: string;
  title: string;
  subtitle: string;
  fields?: { key: string; label: string; placeholder?: string; type?: "text" | "number" | "email" | "tel" | "textarea"; required?: boolean }[];
  narrative?: ReactNode; // pure informational
};

export default function LuminaWizard({
  steps,
  serviceName,
  serviceTag,
  completionMessage,
}: {
  steps: WizardStep[];
  serviceName: string;
  serviceTag: string;
  completionMessage: string;
}) {
  const [stepIdx, setStepIdx] = useState(0);
  const [data, setData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const step = steps[stepIdx];

  const update = (k: string, v: string) => setData((d) => ({ ...d, [k]: v }));

  const canAdvance = !step.fields || step.fields.every((f) => !f.required || (data[f.key] || "").trim().length > 0);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      // Fire and forget — keep submission lightweight
      supabase.functions.invoke("revenue-orchestrator", {
        body: {
          event_type: "lumina_instruction",
          email: data.email || null,
          source: serviceTag,
          property_address: data.address || null,
          metadata: data,
        },
      }).catch(() => {});
      setDone(true);
    } catch (err) {
      toast({ title: "Could not send", description: err instanceof Error ? err.message : String(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div
        className="max-w-2xl mx-auto p-12 text-center"
        style={{ border: `1px solid ${LUMINA_GOLD}44`, background: `${LUMINA_NAVY_DEEP}AA` }}
      >
        <div
          className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ border: `1px solid ${LUMINA_GOLD}`, color: LUMINA_GOLD }}
        ><Check size={28} /></div>
        <h3 className="text-3xl mb-4" style={{ ...luminaSerif, color: LUMINA_CREAM, fontWeight: 500 }}>
          Thank you. Your enquiry is received.
        </h3>
        <p className="mb-8" style={{ ...luminaSerif, color: `${LUMINA_CREAM}AA`, fontSize: 17, fontStyle: "italic" }}>
          {completionMessage}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigate("/hummm-home")}
            className="inline-flex items-center gap-2 px-6 py-3 uppercase"
            style={{
              ...luminaSans,
              background: `linear-gradient(135deg, ${LUMINA_GOLD_SOFT}, ${LUMINA_GOLD})`,
              color: LUMINA_NAVY_DEEP,
              fontSize: 11,
              letterSpacing: "0.22em",
              fontWeight: 600,
            }}
          >Return to Hummm Home</button>
          <button
            onClick={() => navigate("/free-valuation")}
            className="inline-flex items-center gap-2 px-6 py-3 uppercase"
            style={{
              ...luminaSans,
              border: `1px solid ${LUMINA_GOLD}66`,
              color: LUMINA_CREAM,
              fontSize: 11,
              letterSpacing: "0.22em",
            }}
          >Run AI Valuation</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <span style={{ ...luminaSans, color: LUMINA_GOLD, fontSize: 10, letterSpacing: "0.32em", fontWeight: 600 }} className="uppercase">
            {serviceName} · Step {stepIdx + 1} of {steps.length}
          </span>
          <span style={{ ...luminaSans, color: `${LUMINA_CREAM}66`, fontSize: 10, letterSpacing: "0.18em" }} className="uppercase">
            {Math.round(((stepIdx + 1) / steps.length) * 100)}%
          </span>
        </div>
        <div className="h-px relative" style={{ background: `${LUMINA_GOLD}22` }}>
          <div
            className="absolute left-0 top-0 h-px transition-all duration-500"
            style={{ width: `${((stepIdx + 1) / steps.length) * 100}%`, background: LUMINA_GOLD }}
          />
        </div>
      </div>

      {/* Step card */}
      <div
        className="p-8 sm:p-12"
        style={{ border: `1px solid ${LUMINA_GOLD}33`, background: `${LUMINA_NAVY_DEEP}AA` }}
      >
        <h3 className="text-3xl sm:text-4xl mb-3" style={{ ...luminaSerif, color: LUMINA_CREAM, fontWeight: 400, letterSpacing: "-0.01em" }}>
          {step.title}
        </h3>
        <p className="mb-8" style={{ ...luminaSerif, color: `${LUMINA_CREAM}AA`, fontSize: 16, fontStyle: "italic" }}>
          {step.subtitle}
        </p>

        {step.narrative && (
          <div className="mb-8" style={{ ...luminaSans, color: `${LUMINA_CREAM}CC`, fontSize: 14, lineHeight: 1.75 }}>
            {step.narrative}
          </div>
        )}

        {step.fields && (
          <div className="grid sm:grid-cols-2 gap-5">
            {step.fields.map((f) => (
              <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                <label
                  className="block mb-2 uppercase"
                  style={{ ...luminaSans, color: `${LUMINA_CREAM}99`, fontSize: 10, letterSpacing: "0.22em", fontWeight: 600 }}
                >{f.label}{f.required && <span style={{ color: LUMINA_GOLD }}> ·</span>}</label>
                {f.type === "textarea" ? (
                  <textarea
                    rows={4}
                    placeholder={f.placeholder}
                    value={data[f.key] || ""}
                    onChange={(e) => update(f.key, e.target.value)}
                    className="w-full px-4 py-3 outline-none focus:border-opacity-80 transition-colors"
                    style={{
                      ...luminaSans,
                      background: `${LUMINA_NAVY}66`,
                      color: LUMINA_CREAM,
                      border: `1px solid ${LUMINA_GOLD}33`,
                      fontSize: 14,
                    }}
                  />
                ) : (
                  <input
                    type={f.type === "number" ? "text" : f.type || "text"}
                    inputMode={f.type === "number" ? "numeric" : undefined}
                    placeholder={f.placeholder}
                    value={data[f.key] || ""}
                    onChange={(e) => update(f.key, e.target.value)}
                    className="w-full px-4 py-3 outline-none transition-colors"
                    style={{
                      ...luminaSans,
                      background: `${LUMINA_NAVY}66`,
                      color: LUMINA_CREAM,
                      border: `1px solid ${LUMINA_GOLD}33`,
                      fontSize: 14,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
          disabled={stepIdx === 0}
          className="inline-flex items-center gap-2 px-5 py-3 uppercase disabled:opacity-30 transition-opacity"
          style={{ ...luminaSans, color: `${LUMINA_CREAM}AA`, fontSize: 11, letterSpacing: "0.22em" }}
        >
          <ArrowLeft size={12} /> Back
        </button>

        {stepIdx < steps.length - 1 ? (
          <button
            onClick={() => canAdvance && setStepIdx((i) => i + 1)}
            disabled={!canAdvance}
            className="inline-flex items-center gap-2 px-7 py-3.5 uppercase disabled:opacity-40 transition-all hover:scale-[1.02]"
            style={{
              ...luminaSans,
              background: `linear-gradient(135deg, ${LUMINA_GOLD_SOFT}, ${LUMINA_GOLD})`,
              color: LUMINA_NAVY_DEEP,
              fontSize: 11,
              letterSpacing: "0.22em",
              fontWeight: 600,
              border: `1px solid ${LUMINA_GOLD}`,
            }}
          >Continue <ArrowRight size={12} /></button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canAdvance || submitting}
            className="inline-flex items-center gap-2 px-7 py-3.5 uppercase disabled:opacity-40 transition-all hover:scale-[1.02]"
            style={{
              ...luminaSans,
              background: `linear-gradient(135deg, ${LUMINA_GOLD_SOFT}, ${LUMINA_GOLD})`,
              color: LUMINA_NAVY_DEEP,
              fontSize: 11,
              letterSpacing: "0.22em",
              fontWeight: 600,
              border: `1px solid ${LUMINA_GOLD}`,
            }}
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={12} />}
            Instruct Hummm Home
          </button>
        )}
      </div>
    </div>
  );
}