import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useHumm } from "@/contexts/HummContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";
import { ArrowLeft, Home, Users, Wrench, FileText, Mail, Copy, Check, Pencil, X, Upload, Download, Trash2, Loader2, File } from "lucide-react";

const RAW_TEMPLATES = [
  { id: "repair", label: "Repair Acknowledgement", body: "Dear [Tenant Name],\n\nThank you for reporting the issue at [Property Address]. I have arranged for a contractor to attend on [DATE]. Please ensure access is available.\n\nKind regards,\n[Your Name]" },
  { id: "inspection", label: "Inspection Notice", body: "Dear [Tenant Name],\n\nI am writing to provide 24 hours' notice that I intend to inspect the property at [Property Address] on [DATE] at [TIME].\n\nAs per your tenancy agreement and the Housing Act 1988, I am required to give at least 24 hours' written notice before entry.\n\nPlease let me know if this time is inconvenient.\n\nKind regards,\n[Your Name]" },
  { id: "end", label: "End of Tenancy Notice", body: "Dear [Tenant Name],\n\nI am writing regarding the end of your tenancy at [Property Address].\n\nYour fixed-term tenancy is due to end on [DATE]. Please arrange a check-out inspection and ensure the property is returned in the condition outlined in your inventory.\n\nYour deposit of £[AMOUNT] is protected with [TDS/DPS/MyDeposits] and will be returned subject to the check-out inspection.\n\nKind regards,\n[Your Name]" },
];

const DOC_TYPES = ["Tenancy Agreement", "Inventory", "Gas Safety Certificate", "EICR", "EPC", "Insurance", "Other"];

function substituteTemplate(body: string, property: any | null): string {
  let result = body;
  if (property?.tenant_name) result = result.split("[Tenant Name]").join(property.tenant_name);
  if (property?.address) result = result.split("[Property Address]").join(property.address);
  return result;
}

export default function TenantTools() {
  const navigate = useNavigate();
  const { isLoggedIn, userId } = useHumm();
  const [properties, setProperties] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState("repair");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ tenant_name: "", tenant_email: "", tenancy_start_date: "", tenancy_end_date: "" });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Documents state
  const [documents, setDocuments] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [uploadDocType, setUploadDocType] = useState<Record<string, string>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fetchData = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const [propsRes, reqRes] = await Promise.all([
      supabase.from("landlord_properties").select("*").eq("user_id", userData.user.id),
      supabase.from("tenant_requests").select("*").eq("landlord_user_id", userData.user.id).order("created_at", { ascending: false }).limit(20),
    ]);
    setProperties(propsRes.data || []);
    setRequests(reqRes.data || []);
    setLoading(false);
  };

  const fetchDocuments = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    setDocsLoading(true);
    const { data } = await supabase
      .from("landlord_documents")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });
    setDocuments(data || []);
    setDocsLoading(false);
  };

  useEffect(() => {
    if (!isLoggedIn) { navigate("/auth?redirect=/tenants"); return; }
    fetchData();
    fetchDocuments();
  }, [isLoggedIn]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startEditing = (p: any) => {
    setEditingId(p.id);
    setEditError(null);
    setEditForm({
      tenant_name: p.tenant_name || "",
      tenant_email: p.tenant_email || "",
      tenancy_start_date: p.tenancy_start_date || "",
      tenancy_end_date: p.tenancy_end_date || "",
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    setEditError(null);
    const { error } = await supabase.from("landlord_properties").update({
      tenant_name: editForm.tenant_name || null,
      tenant_email: editForm.tenant_email || null,
      tenancy_start_date: editForm.tenancy_start_date || null,
      tenancy_end_date: editForm.tenancy_end_date || null,
    }).eq("id", editingId);
    setSaving(false);
    if (error) {
      setEditError(error.message);
      return;
    }
    toast.success("Tenant details updated");
    setEditingId(null);
    await fetchData();
  };

  const handleFileUpload = async (propertyId: string, file: globalThis.File) => {
    if (!userId) return;
    setUploadingFor(propertyId);
    setUploadError(null);

    const filePath = `${userId}/${propertyId}/${file.name}`;
    const docType = uploadDocType[propertyId] || "Other";

    const { error: storageError } = await supabase.storage
      .from("landlord-documents")
      .upload(filePath, file, { upsert: true });

    if (storageError) {
      setUploadError(storageError.message);
      setUploadingFor(null);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("landlord-documents")
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase.from("landlord_documents").insert({
      user_id: userId,
      property_id: propertyId,
      file_name: file.name,
      file_url: urlData.publicUrl,
      document_type: docType,
    });

    setUploadingFor(null);
    if (dbError) {
      setUploadError(dbError.message);
      return;
    }
    toast.success("Document uploaded");
    fetchDocuments();
  };

  const handleDeleteDoc = async (doc: any) => {
    // Extract storage path from URL
    const pathMatch = doc.file_url?.match(/landlord-documents\/(.+)$/);
    if (pathMatch) {
      await supabase.storage.from("landlord-documents").remove([pathMatch[1]]);
    }
    await supabase.from("landlord_documents").delete().eq("id", doc.id);
    toast.success("Document deleted");
    fetchDocuments();
  };

  const selectedProperty = properties.find(p => p.id === selectedPropertyId) || properties[0] || null;
  const template = RAW_TEMPLATES.find(t => t.id === activeTemplate) || RAW_TEMPLATES[0];
  const substitutedBody = substituteTemplate(template.body, selectedProperty);

  const docsForProperty = (pid: string) => documents.filter(d => d.property_id === pid);

  return (
    <>
      <SEOHead title="Tenant Tools | Hummm" description="Manage tenants, maintenance, and documents." noindex />
      <div className="min-h-screen bg-[hsl(222,47%,5%)] text-foreground">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <h1 className="text-2xl sm:text-3xl font-black mb-1">Tenant Tools</h1>
          <p className="text-sm text-muted-foreground mb-8">Manage tenants, maintenance requests, and communications.</p>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Maintenance Requests */}
            <div className="rounded-2xl border border-white/[0.08] bg-[hsl(222,47%,9%)]/80 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wrench size={16} className="text-amber-400" />
                <h2 className="text-base font-bold">Maintenance Requests</h2>
              </div>
              {loading ? (
                <p className="text-xs text-muted-foreground py-8 text-center">Loading...</p>
              ) : requests.length === 0 ? (
                <div className="text-center py-10 rounded-xl border border-dashed border-white/[0.06]">
                  <Wrench size={24} className="mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">No maintenance requests</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {requests.map((r) => (
                    <div key={r.id} className="rounded-xl border border-white/[0.06] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold">{r.request_type}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === "resolved" ? "bg-emerald-500/15 text-emerald-400"
                            : r.status === "in_progress" ? "bg-blue-500/15 text-blue-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}>{r.status}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{r.description}</p>
                      {r.tenant_name && <p className="text-[10px] text-muted-foreground/60 mt-1">From: {r.tenant_name}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Properties & Tenants */}
            <div className="rounded-2xl border border-white/[0.08] bg-[hsl(222,47%,9%)]/80 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users size={16} className="text-blue-400" />
                <h2 className="text-base font-bold">Properties & Tenants</h2>
              </div>
              {loading ? (
                <p className="text-xs text-muted-foreground py-8 text-center">Loading...</p>
              ) : properties.length === 0 ? (
                <div className="text-center py-10 rounded-xl border border-dashed border-white/[0.06]">
                  <Home size={24} className="mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground mb-3">No properties yet</p>
                  <button onClick={() => navigate("/dashboard")} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                    Add Property
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {properties.map((p) => (
                    <div key={p.id} className="rounded-xl border border-white/[0.06] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold">{p.address}</p>
                          <p className="text-[10px] text-muted-foreground">{p.postcode} · {p.bedrooms || "—"} bed · £{p.current_rent?.toLocaleString() || "—"} pcm</p>
                        </div>
                        {editingId !== p.id && (
                          <button onClick={() => startEditing(p)} className="flex items-center gap-1 text-[10px] text-primary font-medium hover:underline">
                            <Pencil size={10} /> Edit
                          </button>
                        )}
                      </div>
                      {p.tenant_name && (
                        <p className="text-[10px] text-muted-foreground/70 mt-1">Tenant: {p.tenant_name}{p.tenant_email ? ` · ${p.tenant_email}` : ""}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${p.tenancy_type === "periodic" ? "bg-blue-500/15 text-blue-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                          {p.tenancy_type === "periodic" ? "Periodic" : "Fixed Term"}
                        </span>
                        {p.tenancy_end_date && <span>Ends {new Date(p.tenancy_end_date).toLocaleDateString("en-GB")}</span>}
                      </div>

                      {/* Inline edit form */}
                      {editingId === p.id && (
                        <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-3 animate-fade-in">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-muted-foreground font-medium block mb-1">Tenant Name</label>
                              <input type="text" value={editForm.tenant_name} onChange={e => setEditForm(f => ({ ...f, tenant_name: e.target.value }))}
                                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
                                placeholder="John Smith" />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground font-medium block mb-1">Tenant Email</label>
                              <input type="email" value={editForm.tenant_email} onChange={e => setEditForm(f => ({ ...f, tenant_email: e.target.value }))}
                                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
                                placeholder="tenant@email.com" />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground font-medium block mb-1">Move-in Date</label>
                              <input type="date" value={editForm.tenancy_start_date} onChange={e => setEditForm(f => ({ ...f, tenancy_start_date: e.target.value }))}
                                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground font-medium block mb-1">Tenancy End Date</label>
                              <input type="date" value={editForm.tenancy_end_date} onChange={e => setEditForm(f => ({ ...f, tenancy_end_date: e.target.value }))}
                                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
                            </div>
                          </div>
                          {editError && <p className="text-[10px] text-red-400">{editError}</p>}
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
                              Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving}
                              className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold disabled:opacity-50 transition-all">
                              {saving ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Documents Panel */}
          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[hsl(222,47%,9%)]/80 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-violet-400" />
              <h2 className="text-base font-bold">Documents</h2>
            </div>

            {loading ? (
              <p className="text-xs text-muted-foreground py-8 text-center">Loading...</p>
            ) : properties.length === 0 ? (
              <div className="text-center py-10 rounded-xl border border-dashed border-white/[0.06]">
                <FileText size={24} className="mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">Add a property first to upload documents.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {properties.map((p) => {
                  const pDocs = docsForProperty(p.id);
                  return (
                    <div key={p.id} className="rounded-xl border border-white/[0.06] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold">{p.address}</p>
                        <div className="flex items-center gap-2">
                          <select
                            value={uploadDocType[p.id] || "Other"}
                            onChange={e => setUploadDocType(prev => ({ ...prev, [p.id]: e.target.value }))}
                            className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] text-foreground focus:outline-none"
                          >
                            {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <input
                            ref={el => { fileInputRefs.current[p.id] = el; }}
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.png"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(p.id, file);
                              e.target.value = "";
                            }}
                          />
                          <button
                            onClick={() => fileInputRefs.current[p.id]?.click()}
                            disabled={uploadingFor === p.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-[10px] font-bold hover:bg-primary/25 disabled:opacity-50 transition-all"
                          >
                            {uploadingFor === p.id ? <Loader2 size={10} className="animate-spin" /> : <Upload size={10} />}
                            {uploadingFor === p.id ? "Uploading…" : "Upload"}
                          </button>
                        </div>
                      </div>

                      {uploadError && uploadingFor === null && (
                        <p className="text-[10px] text-red-400 mb-2">{uploadError}</p>
                      )}

                      {docsLoading ? (
                        <div className="flex justify-center py-4"><Loader2 size={14} className="animate-spin text-muted-foreground" /></div>
                      ) : pDocs.length === 0 ? (
                        <div className="text-center py-6 rounded-lg border border-dashed border-white/[0.06]">
                          <File size={18} className="mx-auto text-muted-foreground/30 mb-1" />
                          <p className="text-[10px] text-muted-foreground">No documents uploaded yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {pDocs.map(doc => (
                            <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-white/[0.06] px-3 py-2">
                              <File size={14} className="text-muted-foreground shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-medium truncate">{doc.file_name}</p>
                                <p className="text-[10px] text-muted-foreground/60">
                                  {new Date(doc.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 text-[9px] font-bold shrink-0">
                                {doc.document_type}
                              </span>
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] text-primary font-medium hover:underline shrink-0">
                                <Download size={10} /> Download
                              </a>
                              <button onClick={() => handleDeleteDoc(doc)}
                                className="text-red-400 hover:text-red-300 shrink-0 transition-colors">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Email Templates */}
          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[hsl(222,47%,9%)]/80 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-primary" />
                <h2 className="text-base font-bold">Landlord Email Templates</h2>
              </div>
              {properties.length > 1 && (
                <select
                  value={selectedPropertyId || ""}
                  onChange={e => setSelectedPropertyId(e.target.value || null)}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] text-foreground focus:outline-none"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.address}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex gap-2 mb-4">
              {RAW_TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => setActiveTemplate(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTemplate === t.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-white/[0.06] p-4 relative">
              <button onClick={() => handleCopy(template.id, substitutedBody)}
                className="absolute top-3 right-3 flex items-center gap-1 text-[10px] text-primary font-medium hover:underline">
                {copiedId === template.id ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
              </button>
              <pre className="text-[12px] text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">{substitutedBody}</pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}