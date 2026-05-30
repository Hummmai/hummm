import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHumm } from "@/contexts/HummContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import {
  Shield, AlertTriangle, CheckCircle, Clock, ArrowLeft,
  Home, Zap, Flame, FileText, Pencil, X, Loader2, Save,
} from "lucide-react";

const isExpiringSoon = (dateStr: string | null) => {
  if (!dateStr) return false;
  const diff = new Date(dateStr).getTime() - Date.now();
  return diff > 0 && diff < 60 * 24 * 60 * 60 * 1000;
};
const isExpired = (dateStr: string | null) => {
  if (!dateStr) return true;
  return new Date(dateStr).getTime() < Date.now();
};
const toInputDate = (dateStr: string | null) => {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
};

const EPC_RATINGS = ["A", "B", "C", "D", "E", "F", "G"];

type EditForm = {
  gas_cert_valid: boolean;
  gas_cert_expiry: string;
  electrical_cert_valid: boolean;
  electrical_cert_expiry: string;
  epc_rating: string;
  epc_expiry: string;
  decent_homes_compliant: boolean;
};

const emptyForm = (p: any): EditForm => ({
  gas_cert_valid: p.gas_cert_valid ?? false,
  gas_cert_expiry: toInputDate(p.gas_cert_expiry),
  electrical_cert_valid: p.electrical_cert_valid ?? false,
  electrical_cert_expiry: toInputDate(p.electrical_cert_expiry),
  epc_rating: p.epc_rating ?? "",
  epc_expiry: toInputDate(p.epc_expiry),
  decent_homes_compliant: p.decent_homes_compliant ?? false,
});

export default function ComplianceDashboard() {
  const navigate = useNavigate();
  const { isLoggedIn } = useHumm();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchProperties = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("landlord_properties")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setProperties(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!isLoggedIn) { navigate("/auth?redirect=/compliance"); return; }
    fetchProperties();
  }, [isLoggedIn]);

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setEditForm(emptyForm(p));
    setSaveError(null);
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setSaveError(null);
  };

  const handleSave = async (propertyId: string) => {
    if (!editForm) return;
    setSaving(true);
    setSaveError(null);

    const now = Date.now();
    const soon = 60 * 24 * 60 * 60 * 1000;
    const gasExp = editForm.gas_cert_expiry ? new Date(editForm.gas_cert_expiry).getTime() : 0;
    const elecExp = editForm.electrical_cert_expiry ? new Date(editForm.electrical_cert_expiry).getTime() : 0;

    let score = 0;
    if (editForm.gas_cert_valid && gasExp > now) score += 25;
    else if (gasExp > now && gasExp - now < soon) score += 12;
    if (editForm.electrical_cert_valid && elecExp > now) score += 25;
    else if (elecExp > now && elecExp - now < soon) score += 12;
    if (editForm.epc_rating && !["F", "G"].includes(editForm.epc_rating)) score += 25;
    else if (editForm.epc_rating) score += 10;
    if (editForm.decent_homes_compliant) score += 25;

    const complianceStatus = score >= 80 ? "green" : score >= 50 ? "amber" : "red";

    const { error } = await supabase
      .from("landlord_properties")
      .update({
        gas_cert_valid: editForm.gas_cert_valid,
        gas_cert_expiry: editForm.gas_cert_expiry || null,
        electrical_cert_valid: editForm.electrical_cert_valid,
        electrical_cert_expiry: editForm.electrical_cert_expiry || null,
        epc_rating: editForm.epc_rating || null,
        epc_expiry: editForm.epc_expiry || null,
        decent_homes_compliant: editForm.decent_homes_compliant,
        compliance_status: complianceStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", propertyId);

    if (error) {
      setSaveError(error.message);
      setSaving(false);
      return;
    }

    await fetchProperties();
    setSaving(false);
    closeEdit();
  };

  const overallScore = properties.length > 0
    ? Math.round(properties.reduce((sum, p) => {
        let s = 0;
        if (p.gas_cert_valid && !isExpired(p.gas_cert_expiry)) s += 25;
        else if (isExpiringSoon(p.gas_cert_expiry)) s += 12;
        if (p.electrical_cert_valid && !isExpired(p.electrical_cert_expiry)) s += 25;
        else if (isExpiringSoon(p.electrical_cert_expiry)) s += 12;
        if (p.epc_rating && !["F", "G"].includes(p.epc_rating)) s += 25;
        else if (p.epc_rating) s += 10;
        if (p.decent_homes_compliant) s += 25;
        return sum + s;
      }, 0) / properties.length)
    : 0;

  return (
    <>
      <SEOHead title="Compliance Dashboard | Hummm" description="Track property compliance across your portfolio." noindex />
      <div className="min-h-screen bg-[hsl(222,47%,5%)] text-foreground">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">Compliance Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Track EPC, gas safety, EICR, and Decent Homes across your portfolio.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-black ${
                overallScore >= 80 ? "border-emerald-500 text-emerald-400"
                  : overallScore >= 50 ? "border-amber-500 text-amber-400"
                  : "border-red-500 text-red-400"
              }`}>
                {overallScore}%
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 font-medium">Overall Score</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
              <Loader2 size={18} className="animate-spin" /> Loading...
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-[hsl(222,47%,9%)] p-12 text-center">
              <Home size={32} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm font-semibold mb-2">No properties in your portfolio</p>
              <p className="text-xs text-muted-foreground mb-5">Add a property to start tracking compliance.</p>
              <button onClick={() => navigate("/dashboard")} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold">
                Add Property
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {properties.map((p) => {
                const gasOk = p.gas_cert_valid && !isExpired(p.gas_cert_expiry);
                const gasWarn = p.gas_cert_valid ? isExpiringSoon(p.gas_cert_expiry) : false;
                const elecOk = p.electrical_cert_valid && !isExpired(p.electrical_cert_expiry);
                const elecWarn = p.electrical_cert_valid ? isExpiringSoon(p.electrical_cert_expiry) : false;
                const epcOk = p.epc_rating && !["F", "G"].includes(p.epc_rating);
                const isEditing = editingId === p.id;

                return (
                  <div key={p.id} className="rounded-2xl border border-white/[0.08] bg-[hsl(222,47%,9%)]/80 overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between p-6 pb-4">
                      <div>
                        <p className="text-sm font-bold">{p.address}</p>
                        <p className="text-xs text-muted-foreground">{p.postcode} · {p.bedrooms || "—"} bed · {p.property_type || "Property"}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          p.compliance_status === "green" ? "bg-emerald-500/15 text-emerald-400"
                            : p.compliance_status === "red" ? "bg-red-500/15 text-red-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}>{p.compliance_status?.toUpperCase() || "AMBER"}</span>
                        {!isEditing ? (
                          <button
                            onClick={() => openEdit(p)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all font-medium"
                          >
                            <Pencil size={11} /> Edit certs
                          </button>
                        ) : (
                          <button onClick={closeEdit} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status tiles */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 pb-5">
                      <div className={`rounded-xl p-4 border ${gasOk ? "border-emerald-500/20 bg-emerald-500/5" : gasWarn ? "border-amber-500/20 bg-amber-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                        <Flame size={16} className={gasOk ? "text-emerald-400" : gasWarn ? "text-amber-400" : "text-red-400"} />
                        <p className="text-xs font-bold mt-2">Gas Safety</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {p.gas_cert_expiry ? `Expires ${new Date(p.gas_cert_expiry).toLocaleDateString("en-GB")}` : "Not recorded"}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          {gasOk ? <CheckCircle size={12} className="text-emerald-400" /> : gasWarn ? <Clock size={12} className="text-amber-400" /> : <AlertTriangle size={12} className="text-red-400" />}
                          <span className="text-[10px] font-medium">{gasOk ? "Valid" : gasWarn ? "Expiring Soon" : "Expired / Missing"}</span>
                        </div>
                      </div>
                      <div className={`rounded-xl p-4 border ${elecOk ? "border-emerald-500/20 bg-emerald-500/5" : elecWarn ? "border-amber-500/20 bg-amber-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                        <Zap size={16} className={elecOk ? "text-emerald-400" : elecWarn ? "text-amber-400" : "text-red-400"} />
                        <p className="text-xs font-bold mt-2">EICR</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {p.electrical_cert_expiry ? `Expires ${new Date(p.electrical_cert_expiry).toLocaleDateString("en-GB")}` : "Not recorded"}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          {elecOk ? <CheckCircle size={12} className="text-emerald-400" /> : elecWarn ? <Clock size={12} className="text-amber-400" /> : <AlertTriangle size={12} className="text-red-400" />}
                          <span className="text-[10px] font-medium">{elecOk ? "Valid" : elecWarn ? "Expiring Soon" : "Expired / Missing"}</span>
                        </div>
                      </div>
                      <div className={`rounded-xl p-4 border ${epcOk ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                        <FileText size={16} className={epcOk ? "text-emerald-400" : "text-red-400"} />
                        <p className="text-xs font-bold mt-2">EPC Rating</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {p.epc_rating ? `Rating: ${p.epc_rating}` : "Not recorded"}
                          {p.epc_expiry && ` · Exp ${new Date(p.epc_expiry).toLocaleDateString("en-GB")}`}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          {epcOk ? <CheckCircle size={12} className="text-emerald-400" /> : <AlertTriangle size={12} className="text-red-400" />}
                          <span className="text-[10px] font-medium">{epcOk ? "Compliant" : p.epc_rating ? "Below Min (E)" : "Not recorded"}</span>
                        </div>
                      </div>
                      <div className={`rounded-xl p-4 border ${p.decent_homes_compliant ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5"}`}>
                        <Shield size={16} className={p.decent_homes_compliant ? "text-emerald-400" : "text-amber-400"} />
                        <p className="text-xs font-bold mt-2">Decent Homes</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Standard compliance</p>
                        <div className="flex items-center gap-1 mt-2">
                          {p.decent_homes_compliant ? <CheckCircle size={12} className="text-emerald-400" /> : <Clock size={12} className="text-amber-400" />}
                          <span className="text-[10px] font-medium">{p.decent_homes_compliant ? "Compliant" : "Review Needed"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Inline edit form */}
                    {isEditing && editForm && (
                      <div className="border-t border-white/[0.06] bg-[hsl(222,47%,7%)] px-6 py-5">
                        <p className="text-xs font-bold text-foreground mb-4">Update compliance details</p>
                        <div className="grid sm:grid-cols-2 gap-4">

                          {/* Gas */}
                          <div className="rounded-xl border border-white/[0.06] p-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <Flame size={13} className="text-amber-400" />
                              <p className="text-xs font-bold">Gas Safety Certificate</p>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input type="checkbox" checked={editForm.gas_cert_valid}
                                onChange={e => setEditForm(f => f ? { ...f, gas_cert_valid: e.target.checked } : f)}
                                className="w-4 h-4 rounded accent-primary" />
                              <span className="text-xs text-muted-foreground">Certificate is valid / held</span>
                            </label>
                            <div>
                              <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block mb-1">Expiry date</label>
                              <input type="date" value={editForm.gas_cert_expiry}
                                onChange={e => setEditForm(f => f ? { ...f, gas_cert_expiry: e.target.value } : f)}
                                className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.06] text-xs text-foreground focus:outline-none focus:border-primary/40" />
                            </div>
                          </div>

                          {/* EICR */}
                          <div className="rounded-xl border border-white/[0.06] p-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <Zap size={13} className="text-blue-400" />
                              <p className="text-xs font-bold">EICR (Electrical)</p>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input type="checkbox" checked={editForm.electrical_cert_valid}
                                onChange={e => setEditForm(f => f ? { ...f, electrical_cert_valid: e.target.checked } : f)}
                                className="w-4 h-4 rounded accent-primary" />
                              <span className="text-xs text-muted-foreground">Certificate is valid / held</span>
                            </label>
                            <div>
                              <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block mb-1">Expiry date</label>
                              <input type="date" value={editForm.electrical_cert_expiry}
                                onChange={e => setEditForm(f => f ? { ...f, electrical_cert_expiry: e.target.value } : f)}
                                className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.06] text-xs text-foreground focus:outline-none focus:border-primary/40" />
                            </div>
                          </div>

                          {/* EPC */}
                          <div className="rounded-xl border border-white/[0.06] p-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <FileText size={13} className="text-emerald-400" />
                              <p className="text-xs font-bold">EPC Rating</p>
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block mb-1.5">Rating (A = best, G = worst)</label>
                              <div className="flex gap-1.5">
                                {EPC_RATINGS.map(r => (
                                  <button key={r} onClick={() => setEditForm(f => f ? { ...f, epc_rating: r } : f)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                      editForm.epc_rating === r
                                        ? r <= "E" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                                        : "bg-white/[0.06] text-muted-foreground hover:bg-white/[0.1] hover:text-foreground"
                                    }`}>{r}</button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block mb-1">EPC expiry date</label>
                              <input type="date" value={editForm.epc_expiry}
                                onChange={e => setEditForm(f => f ? { ...f, epc_expiry: e.target.value } : f)}
                                className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.06] text-xs text-foreground focus:outline-none focus:border-primary/40" />
                            </div>
                          </div>

                          {/* Decent Homes */}
                          <div className="rounded-xl border border-white/[0.06] p-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <Shield size={13} className="text-purple-400" />
                              <p className="text-xs font-bold">Decent Homes Standard</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                              Free of Category 1 hazards, in reasonable repair, with modern facilities and effective heating. Applies to private rentals from 2025.
                            </p>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input type="checkbox" checked={editForm.decent_homes_compliant}
                                onChange={e => setEditForm(f => f ? { ...f, decent_homes_compliant: e.target.checked } : f)}
                                className="w-4 h-4 rounded accent-primary" />
                              <span className="text-xs text-muted-foreground">Property meets the Decent Homes Standard</span>
                            </label>
                          </div>
                        </div>

                        {saveError && (
                          <p className="text-xs text-red-400 mt-4 flex items-center gap-1.5">
                            <AlertTriangle size={12} /> {saveError}
                          </p>
                        )}

                        <div className="flex gap-3 mt-5">
                          <button onClick={closeEdit}
                            className="px-4 py-2.5 rounded-xl border border-white/[0.08] text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all font-medium">
                            Cancel
                          </button>
                          <button onClick={() => handleSave(p.id)} disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50">
                            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                            {saving ? "Saving..." : "Save changes"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
