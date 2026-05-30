import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ShieldCheck, Loader2, UserCheck, AlertTriangle, CheckCircle2,
  XCircle, Sparkles, FileText, X, Plus, TrendingUp,
} from "lucide-react";

type Reference = {
  id: string;
  applicant_name: string;
  applicant_email: string;
  property_address: string | null;
  status: string;
  risk_score: number | null;
  recommendation: string | null;
  credit_score: number | null;
  affordability_ratio: number | null;
  fraud_flag: boolean | null;
  aml_flag: boolean | null;
  sanctions_flag: boolean | null;
  right_to_rent_status: string | null;
  income_verified: boolean | null;
  red_flags: any;
  positives: any;
  summary: string | null;
  created_at: string;
};

interface Props {
  listingId?: string;
  propertyAddress?: string;
  compact?: boolean;
}

export default function TenantReferencingPanel({ listingId, propertyAddress, compact }: Props) {
  const [refs, setRefs] = useState<Reference[]>([]);
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [selected, setSelected] = useState<Reference | null>(null);
  const [form, setForm] = useState({
    applicant_name: "", applicant_email: "", applicant_phone: "",
    applicant_dob: "", employment_status: "Employed",
    annual_income: "", proposed_rent: "",
    current_address: "",
  });

  const load = async () => {
    let q = supabase.from("tenant_references").select("*").order("created_at", { ascending: false });
    if (listingId) q = q.eq("listing_id", listingId);
    const { data } = await q;
    setRefs((data as any) || []);
  };

  useEffect(() => { load(); }, [listingId]);

  const runScreening = async () => {
    if (!form.applicant_name || !form.applicant_email) {
      toast.error("Name and email are required");
      return;
    }
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("tenant-screening", {
        body: {
          listing_id: listingId,
          property_address: propertyAddress,
          applicant_name: form.applicant_name,
          applicant_email: form.applicant_email,
          applicant_phone: form.applicant_phone,
          applicant_dob: form.applicant_dob || null,
          employment_status: form.employment_status,
          annual_income: form.annual_income ? parseInt(form.annual_income) : null,
          proposed_rent: form.proposed_rent ? parseInt(form.proposed_rent) : null,
          address_history: form.current_address ? [{ address: form.current_address, current: true }] : [],
        },
      });
      if (error) throw error;
      toast.success("AI Tenant Screening complete");
      setOpen(false);
      setSelected(data.reference);
      setForm({ applicant_name: "", applicant_email: "", applicant_phone: "", applicant_dob: "", employment_status: "Employed", annual_income: "", proposed_rent: "", current_address: "" });
      await load();
    } catch (e: any) {
      toast.error(e.message || "Screening failed");
    } finally {
      setRunning(false);
    }
  };

  const recColor = (rec: string | null) =>
    rec === "Accept" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
    : rec === "Reject" ? "text-red-400 bg-red-500/10 border-red-500/30"
    : "text-amber-400 bg-amber-500/10 border-amber-500/30";

  return (
    <div className={compact ? "" : "rounded-2xl border border-primary/20 bg-card/40 backdrop-blur-sm p-6"}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <ShieldCheck size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="font-black text-lg">AI Tenant Referencing</h3>
            <p className="text-xs text-muted-foreground">Credit · AML · Affordability · Right-to-Rent</p>
          </div>
        </div>
        <Button onClick={() => setOpen(true)} size="sm" className="bg-primary text-primary-foreground gap-2">
          <Sparkles size={14} /> Run Screening
        </Button>
      </div>

      {refs.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-border/50 rounded-xl">
          <UserCheck size={28} className="mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No applicants screened yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {refs.map((r) => (
            <button key={r.id} onClick={() => setSelected(r)}
              className="w-full text-left p-4 rounded-xl border border-border/50 hover:border-primary/40 bg-background/40 transition-all flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{r.applicant_name}</span>
                  {r.recommendation && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${recColor(r.recommendation)}`}>
                      {r.recommendation}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{r.applicant_email}</p>
              </div>
              {r.risk_score !== null && (
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground">Risk</div>
                  <div className="font-black text-sm">{r.risk_score}</div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={() => !running && setOpen(false)}>
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black flex items-center gap-2"><ShieldCheck size={20} className="text-primary" /> Run AI Tenant Screening</h3>
              <button onClick={() => setOpen(false)} disabled={running}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name *" value={form.applicant_name} onChange={(v) => setForm({ ...form, applicant_name: v })} />
              <Field label="Email *" type="email" value={form.applicant_email} onChange={(v) => setForm({ ...form, applicant_email: v })} />
              <Field label="Phone" value={form.applicant_phone} onChange={(v) => setForm({ ...form, applicant_phone: v })} />
              <Field label="Date of Birth" type="date" value={form.applicant_dob} onChange={(v) => setForm({ ...form, applicant_dob: v })} />
              <Field label="Employment Status" value={form.employment_status} onChange={(v) => setForm({ ...form, employment_status: v })} />
              <Field label="Annual Income (£)" type="number" value={form.annual_income} onChange={(v) => setForm({ ...form, annual_income: v })} />
              <Field label="Proposed Rent (£/mo)" type="number" value={form.proposed_rent} onChange={(v) => setForm({ ...form, proposed_rent: v })} />
              <div className="col-span-2">
                <Field label="Current Address" value={form.current_address} onChange={(v) => setForm({ ...form, current_address: v })} />
              </div>
            </div>
            <Button onClick={runScreening} disabled={running} className="w-full mt-5 bg-primary text-primary-foreground gap-2">
              {running ? (<><Loader2 size={16} className="animate-spin" /> Running 6 checks…</>) : (<><Sparkles size={16} /> Generate AI Report</>)}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-3">Credit · Affordability · Fraud · AML · Sanctions · Right-to-Rent</p>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={() => setSelected(null)}>
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">Hummm AI · Tenant Reference Report</p>
                <h3 className="text-2xl font-black">{selected.applicant_name}</h3>
                <p className="text-sm text-muted-foreground">{selected.applicant_email}</p>
              </div>
              <button onClick={() => setSelected(null)}><X size={18} /></button>
            </div>

            {selected.recommendation && (
              <div className={`rounded-xl border p-4 mb-5 ${recColor(selected.recommendation)}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest">Recommendation</span>
                  <span className="text-2xl font-black">{selected.recommendation}</span>
                </div>
                <p className="text-sm mt-2 opacity-90">{selected.summary}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-5">
              <Stat label="Risk Score" value={selected.risk_score ?? "—"} suffix="/100" tone={selected.risk_score && selected.risk_score < 30 ? "good" : selected.risk_score && selected.risk_score < 60 ? "warn" : "bad"} />
              <Stat label="Credit Score" value={selected.credit_score ?? "—"} tone={selected.credit_score && selected.credit_score > 700 ? "good" : "warn"} />
              <Stat label="Affordability" value={selected.affordability_ratio?.toFixed(1) ?? "—"} suffix="x" tone={selected.affordability_ratio && selected.affordability_ratio >= 2.5 ? "good" : "warn"} />
            </div>

            <div className="space-y-2 mb-5">
              <Check label="AML Check" passed={!selected.aml_flag} />
              <Check label="Sanctions Check" passed={!selected.sanctions_flag} />
              <Check label="Fraud Check" passed={!selected.fraud_flag} />
              <Check label="Right to Rent" passed={selected.right_to_rent_status === "verified"} />
              <Check label="Income Verified" passed={!!selected.income_verified} />
            </div>

            {Array.isArray(selected.red_flags) && selected.red_flags.length > 0 && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 mb-3">
                <p className="text-xs font-bold text-red-400 mb-2 flex items-center gap-2"><AlertTriangle size={12} /> RED FLAGS</p>
                <ul className="text-sm space-y-1">
                  {selected.red_flags.map((f: string, i: number) => <li key={i}>• {f}</li>)}
                </ul>
              </div>
            )}
            {Array.isArray(selected.positives) && selected.positives.length > 0 && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <p className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-2"><CheckCircle2 size={12} /> POSITIVES</p>
                <ul className="text-sm space-y-1">
                  {selected.positives.map((f: string, i: number) => <li key={i}>• {f}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1" />
    </div>
  );
}

function Stat({ label, value, suffix, tone }: { label: string; value: any; suffix?: string; tone?: "good" | "warn" | "bad" }) {
  const c = tone === "good" ? "text-emerald-400" : tone === "bad" ? "text-red-400" : tone === "warn" ? "text-amber-400" : "text-foreground";
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-xl font-black mt-1 ${c}`}>{value}{suffix && <span className="text-sm">{suffix}</span>}</div>
    </div>
  );
}

function Check({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/40 border border-border/40">
      <span className="text-sm">{label}</span>
      {passed ? <CheckCircle2 size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-red-400" />}
    </div>
  );
}