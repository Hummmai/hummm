import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  FileText, PenTool, Shield, Lock, Unlock, Check, Loader2,
  ChevronLeft, Download, Send, Clock, AlertTriangle, Copy,
  ArrowLeft, Trash2, PawPrint,
} from "lucide-react";

/* ─── Template definitions ─── */
const TEMPLATES = [
  {
    id: "apt",
    name: "Assured Periodic Tenancy (APT)",
    description: "The new 2026 standard — no fixed end date, rolling periodic from day one.",
    badge: "Mandatory from May 1st",
    badgeColor: "bg-destructive/15 text-destructive border-destructive/30",
    prescribed: `ASSURED PERIODIC TENANCY AGREEMENT
(Housing Act 1988, as amended by the Renters' Rights Act 2026)

────────────────────────────────────
PRESCRIBED TERMS — CANNOT BE MODIFIED
────────────────────────────────────

1. TYPE OF TENANCY
This tenancy is an Assured Tenancy under Part I of the Housing Act 1988. It is periodic from the outset and has no fixed end date. The tenant may end this tenancy by giving two calendar months' notice in writing. The landlord may only end this tenancy using the grounds set out in Schedule 2 of the Housing Act 1988 (as amended).

2. POSSESSION AND EVICTION
Section 21 notices can no longer be served. The landlord must rely on Section 8 grounds for possession. The mandatory ground for rent arrears (Ground 8) requires at least 3 months of arrears at both the date of notice and the date of the hearing.

3. RENT AND RENT INCREASES
The initial rent is set out in the Particulars below. Rent may only be increased once per year using a Section 13 notice, giving the tenant at least 2 months' notice. The tenant may refer the proposed rent to the First-tier Tribunal.

4. REPAIRS AND MAINTENANCE
The landlord is responsible for keeping in repair the structure and exterior of the dwelling, and for keeping in proper working order the installations for water, gas, electricity, sanitation, and heating (Landlord and Tenant Act 1985, s.11). The property must meet the Decent Homes Standard.

5. TENANT'S RIGHT TO KEEP PETS
The tenant has the right to request permission to keep a pet. The landlord must respond within 28 days. Permission may only be refused on reasonable grounds. The landlord may require the tenant to take out pet damage insurance.

6. ANTI-DISCRIMINATION
The landlord shall not discriminate against any prospective or current tenant on the basis of their receipt of housing benefit or Universal Credit, their family status, or any other protected characteristic.

7. INFORMATION REQUIREMENTS
The landlord must provide the tenant with a written statement of the terms of the tenancy, an up-to-date Gas Safety Certificate, an Energy Performance Certificate (minimum rating C by 2030), and the Government's "How to Rent" guide. Failure to provide these documents may prevent the landlord from obtaining possession.`,
    editable: `SPECIAL CLAUSES — EDITABLE BY LANDLORD

8. GARDEN & OUTDOOR AREAS
The tenant shall maintain any garden areas in a reasonable condition and shall not make structural alterations without prior written consent.

9. DECORATION & ALTERATIONS
The tenant may carry out minor redecoration (painting, picture hooks) without consent. Any structural alterations require the landlord's prior written approval.

10. SUBLETTING
The tenant shall not sublet the whole or any part of the property without the landlord's prior written consent.

11. ADDITIONAL TERMS
[Add your own clauses here]`,
  },
  {
    id: "info-sheet",
    name: "2026 Information Sheet",
    description: "Mandatory information sheet for all existing tenants — deadline May 31st, 2026.",
    badge: "Deadline: May 31st",
    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    prescribed: `LANDLORD INFORMATION SHEET
(Required under the Renters' Rights Act 2026)

────────────────────────────────────
PRESCRIBED CONTENT — CANNOT BE MODIFIED
────────────────────────────────────

This document must be provided to all tenants by 31 May 2026.

1. YOUR RIGHTS AS A TENANT
• Your tenancy is now periodic — it has no fixed end date.
• Your landlord cannot evict you using a Section 21 'no-fault' notice.
• You have the right to request a pet. Your landlord must respond within 28 days.
• Your rent can only be increased once per year via a formal Section 13 notice.
• You have the right to refer any rent increase to the First-tier Tribunal.
• Your landlord must keep the property in good repair and meet the Decent Homes Standard.

2. HOW TO END YOUR TENANCY
You may end your tenancy at any time by giving at least 2 calendar months' written notice to your landlord.

3. YOUR LANDLORD'S OBLIGATIONS
Your landlord must:
• Provide a valid Gas Safety Certificate annually
• Provide a valid Energy Performance Certificate (minimum rating E, rising to C by 2030)
• Provide a valid Electrical Installation Condition Report (EICR) every 5 years
• Respond to repair requests within a reasonable time
• Register your tenancy deposit in a government-approved scheme within 30 days
• Not discriminate based on receipt of benefits or family status

4. WHERE TO GET HELP
• First-tier Tribunal (Property Chamber): For rent disputes and repair orders
• Local Council Housing Team: For hazard complaints and enforcement
• Citizens Advice: Free legal guidance on tenancy matters
• The Property Ombudsman (TPO): For complaints about letting agents

5. COMPLAINTS PROCEDURE
If you have a complaint, contact your landlord in writing first. If the issue is not resolved within 8 weeks, you may escalate to the relevant ombudsman or tribunal.`,
    editable: `ADDITIONAL PROPERTY-SPECIFIC INFORMATION

6. EMERGENCY CONTACTS
Gas Emergency: 0800 111 999
Electricity Emergency: 105
Water Emergency: [Your local water company number]
Landlord/Managing Agent: [Your contact details]

7. LOCAL INFORMATION
Nearest hospital A&E: [Address]
Council waste collection day: [Day]

8. ADDITIONAL NOTES
[Add property-specific information here]`,
  },
  {
    id: "section13",
    name: "Section 13 Rent Increase Notice",
    description: "The only legal method to increase rent from May 1st — once per year maximum.",
    badge: "Annual Use Only",
    badgeColor: "bg-primary/15 text-primary border-primary/30",
    prescribed: `NOTICE PROPOSING A NEW RENT
UNDER AN ASSURED PERIODIC TENANCY
(Housing Act 1988, Section 13, as amended)

────────────────────────────────────
PRESCRIBED FORM — CANNOT BE MODIFIED
────────────────────────────────────

To: [Tenant Name(s)]
Of: [Property Address]

1. NOTICE
This is to give notice that as from [Effective Date — must be at least 2 months from date of service], the new rent for the above property will be:

£[NEW RENT AMOUNT] per [week/month]

2. CURRENT RENT
The current rent is: £[CURRENT RENT] per [week/month]

3. LANDLORD DETAILS
Name of Landlord: [Landlord Name]
Address: [Landlord Address]

4. IMPORTANT INFORMATION FOR THE TENANT
• This notice must give you at least 2 months' notice before the new rent takes effect.
• Rent can only be increased once in any 12-month period.
• If you believe the proposed rent is above the market rate, you have the right to refer this notice to the First-tier Tribunal (Property Chamber) before the start date.
• If you refer to the Tribunal, the current rent will continue until the Tribunal makes its decision.
• The Tribunal will determine a market rent — this could be higher or lower than the amount proposed.

5. DATE RESTRICTIONS
This notice cannot take effect:
(a) Earlier than 2 months from the date it is served
(b) Within 12 months of a previous Section 13 increase
(c) Within 12 months of the start of the tenancy

Signed: ________________________________
Date: ________________________________`,
    editable: `SUPPORTING SCHEDULE — EDITABLE

JUSTIFICATION FOR RENT INCREASE
The proposed increase reflects the following market factors:

• Comparable properties in the area are currently achieving: £[AMOUNT] per month
• The current rent has been unchanged since: [DATE]
• Recent property improvements include: [LIST IMPROVEMENTS]
• The increase represents a [X]% rise, which is [below/in line with/above] the area average of [Y]%

ADDITIONAL NOTES
[Add any additional context for the tenant here]`,
  },
];

/* ─── Signature Pad ─── */
const SignaturePad = ({
  onSave,
  label,
}: {
  onSave: (dataUrl: string) => void;
  label: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDrawing(true);
    setHasDrawn(true);
    const ctx = canvasRef.current!.getContext("2d")!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const pos = getPos(e);
    ctx.strokeStyle = "hsl(168 100% 45%)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDraw = () => {
    setDrawing(false);
  };

  const clear = () => {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.clearRect(0, 0, 400, 120);
    setHasDrawn(false);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-bold">{label}</Label>
      <div className="rounded-xl border border-border bg-muted/20 p-1">
        <canvas
          ref={canvasRef}
          width={400}
          height={120}
          className="w-full rounded-lg cursor-crosshair touch-none"
          style={{ background: "hsl(220 45% 9%)" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={clear} className="text-xs">
          Clear
        </Button>
        {hasDrawn && (
          <Button
            size="sm"
            onClick={() => onSave(canvasRef.current!.toDataURL())}
            className="text-xs bg-primary text-primary-foreground"
          >
            <Check size={12} className="mr-1" /> Confirm
          </Button>
        )}
      </div>
    </div>
  );
};

/* ─── Main Page ─── */
const LandlordContracts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<any[]>([]);

  // Editor state
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [editableText, setEditableText] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [contractTitle, setContractTitle] = useState("");

  // Signing state
  const [showSigning, setShowSigning] = useState(false);
  const [landlordSig, setLandlordSig] = useState<string | null>(null);
  const [petAgreement, setPetAgreement] = useState(false);
  const [signing, setSigning] = useState(false);
  const [editingContractId, setEditingContractId] = useState<string | null>(null);

  // Auth check
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate("/auth");
        return;
      }
      setUserId(data.user.id);
      fetchContracts(data.user.id);
    });
  }, [navigate]);

  const fetchContracts = async (uid: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("landlord_contracts")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    setContracts(data || []);
    setLoading(false);
  };

  const template = TEMPLATES.find((t) => t.id === activeTemplate);

  const startFromTemplate = (id: string) => {
    const tmpl = TEMPLATES.find((t) => t.id === id)!;
    setActiveTemplate(id);
    setEditableText(tmpl.editable);
    setContractTitle(tmpl.name);
    setTenantName("");
    setTenantEmail("");
    setShowSigning(false);
    setLandlordSig(null);
    setPetAgreement(false);
    setEditingContractId(null);
  };

  const saveDraft = async () => {
    if (!userId || !template) return;
    setSigning(true);

    const payload = {
      user_id: userId,
      template_type: template.id,
      title: contractTitle || template.name,
      prescribed_clauses: template.prescribed,
      special_clauses: editableText,
      tenant_name: tenantName || null,
      tenant_email: tenantEmail || null,
      status: "draft",
      pet_agreement: petAgreement,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editingContractId) {
      ({ error } = await supabase
        .from("landlord_contracts")
        .update(payload)
        .eq("id", editingContractId));
    } else {
      const { data, error: err } = await supabase
        .from("landlord_contracts")
        .insert(payload)
        .select()
        .single();
      error = err;
      if (data) setEditingContractId(data.id);
    }

    setSigning(false);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Draft saved" });
      fetchContracts(userId);
    }
  };

  const signContract = async () => {
    if (!userId || !template || !landlordSig) return;
    setSigning(true);

    const certId = `HUMM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const now = new Date().toISOString();

    const payload = {
      user_id: userId,
      template_type: template.id,
      title: contractTitle || template.name,
      prescribed_clauses: template.prescribed,
      special_clauses: editableText,
      tenant_name: tenantName || null,
      tenant_email: tenantEmail || null,
      status: "signed_by_landlord",
      landlord_signature: landlordSig,
      signed_by_landlord_at: now,
      landlord_ip: "Recorded server-side",
      pet_agreement: petAgreement,
      certificate_id: certId,
      updated_at: now,
    };

    let error;
    if (editingContractId) {
      ({ error } = await supabase
        .from("landlord_contracts")
        .update(payload)
        .eq("id", editingContractId));
    } else {
      ({ error } = await supabase.from("landlord_contracts").insert(payload));
    }

    setSigning(false);
    if (error) {
      toast({ title: "Signing failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Contract signed!", description: `Certificate: ${certId}` });
      setActiveTemplate(null);
      fetchContracts(userId);
    }
  };

  const deleteContract = async (id: string) => {
    await supabase.from("landlord_contracts").delete().eq("id", id);
    if (userId) fetchContracts(userId);
    toast({ title: "Contract deleted" });
  };

  const openExistingContract = (c: any) => {
    const tmpl = TEMPLATES.find((t) => t.id === c.template_type);
    setActiveTemplate(c.template_type);
    setEditableText(c.special_clauses || tmpl?.editable || "");
    setContractTitle(c.title);
    setTenantName(c.tenant_name || "");
    setTenantEmail(c.tenant_email || "");
    setEditingContractId(c.id);
    setPetAgreement(c.pet_agreement || false);
    setLandlordSig(c.landlord_signature || null);
    setShowSigning(false);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="text-muted-foreground border-border text-[10px]">Draft</Badge>;
      case "signed_by_landlord":
        return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px]">Awaiting Tenant</Badge>;
      case "fully_signed":
        return <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">Fully Signed</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  /* ─── Editor View ─── */
  if (activeTemplate && template) {
    return (
      <>
        <SEOHead title="Contract Editor | Hummm" description="Draft and sign 2026 compliant tenancy contracts." />
        <Navbar />
        <main className="min-h-screen bg-background pt-20 pb-16 section-padding">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <button
              onClick={() => setActiveTemplate(null)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Contracts
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{template.name}</h1>
                <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={saveDraft} disabled={signing}>
                  {signing ? <Loader2 size={14} className="animate-spin mr-1" /> : <FileText size={14} className="mr-1" />}
                  Save Draft
                </Button>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground"
                  onClick={() => setShowSigning(!showSigning)}
                >
                  <PenTool size={14} className="mr-1" /> Sign Contract
                </Button>
              </div>
            </div>

            {/* Tenant Details */}
            <div className="rounded-2xl border border-border bg-card/60 p-5 mb-6">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Shield size={14} className="text-primary" /> Contract Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Contract Title</Label>
                  <Input
                    value={contractTitle}
                    onChange={(e) => setContractTitle(e.target.value)}
                    className="mt-1 h-9 text-sm"
                    placeholder="e.g. 14 Elm Street APT"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tenant Name</Label>
                  <Input
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    className="mt-1 h-9 text-sm"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tenant Email</Label>
                  <Input
                    value={tenantEmail}
                    onChange={(e) => setTenantEmail(e.target.value)}
                    className="mt-1 h-9 text-sm"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Prescribed Terms (Locked) */}
            <div className="rounded-2xl border border-destructive/20 bg-card/60 p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Lock size={14} className="text-destructive" />
                <h3 className="text-sm font-bold">Prescribed Legal Terms</h3>
                <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[9px] ml-auto">
                  Read-Only — Legally Required
                </Badge>
              </div>
              <div className="rounded-xl bg-muted/20 border border-border p-4 max-h-[420px] overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed text-muted-foreground select-text">
                  {template.prescribed}
                </pre>
              </div>
            </div>

            {/* Editable Clauses */}
            <div className="rounded-2xl border border-primary/20 bg-card/60 p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Unlock size={14} className="text-primary" />
                <h3 className="text-sm font-bold">Special Clauses</h3>
                <Badge className="bg-primary/15 text-primary border-primary/30 text-[9px] ml-auto">
                  Editable
                </Badge>
              </div>
              <textarea
                value={editableText}
                onChange={(e) => setEditableText(e.target.value)}
                className="w-full min-h-[280px] rounded-xl bg-muted/20 border border-border p-4 text-xs font-sans leading-relaxed text-foreground resize-y focus:outline-none focus:ring-1 focus:ring-primary/40"
                spellCheck
              />
            </div>

            {/* Pet Agreement Checkbox */}
            <div className="rounded-2xl border border-border bg-card/60 p-5 mb-6">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="pet-agree"
                  checked={petAgreement}
                  onCheckedChange={(c) => setPetAgreement(c === true)}
                  className="mt-0.5"
                />
                <div>
                  <Label htmlFor="pet-agree" className="text-sm font-bold cursor-pointer flex items-center gap-2">
                    <PawPrint size={14} className="text-primary" /> Pet Agreement Clause
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Under the Renters' Rights Act 2026, tenants may keep pets subject to landlord approval within 28 days.
                    Tick to include the standard pet damage insurance requirement clause.
                  </p>
                </div>
              </div>
            </div>

            {/* Signing Section */}
            {showSigning && (
              <div className="rounded-2xl border border-primary/30 bg-card/60 p-5 mb-6 animate-fade-in">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <PenTool size={16} className="text-primary" /> Signing Panel
                </h3>

                <div className="space-y-6">
                  <SignaturePad
                    label="Landlord Signature"
                    onSave={(url) => {
                      setLandlordSig(url);
                      toast({ title: "Signature captured" });
                    }}
                  />

                  {landlordSig && (
                    <div className="rounded-xl border border-primary/20 bg-muted/10 p-4">
                      <p className="text-[10px] text-muted-foreground mb-2 font-bold uppercase tracking-wider">Preview</p>
                      <img src={landlordSig} alt="Signature" className="h-16 object-contain" />
                    </div>
                  )}

                  <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-2">
                    <h4 className="text-xs font-bold flex items-center gap-2">
                      <Shield size={12} className="text-primary" /> Audit Trail
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      By clicking "Sign & Finalise", a Hummm Certificate of Authenticity will be generated recording:
                    </p>
                    <ul className="text-[10px] text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Your IP address and timestamp</li>
                      <li>The tenant's IP address and timestamp (when they countersign)</li>
                      <li>A unique certificate ID for legal reference</li>
                      <li>A SHA-256 hash of the final document content</li>
                    </ul>
                  </div>

                  <Button
                    onClick={signContract}
                    disabled={!landlordSig || signing}
                    className="w-full bg-primary text-primary-foreground"
                  >
                    {signing ? (
                      <Loader2 size={14} className="animate-spin mr-2" />
                    ) : (
                      <PenTool size={14} className="mr-2" />
                    )}
                    Sign & Finalise
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  /* ─── Main List View ─── */
  return (
    <>
      <SEOHead title="Contracts | Hummm Landlord" description="Create and sign 2026 compliant tenancy contracts." />
      <Navbar />
      <main className="min-h-screen bg-background pt-20 pb-16 section-padding">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <AnimatedSection className="mb-10">
            <button
              onClick={() => navigate("/dashboard/landlord")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Landlord Shield
            </button>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Contract Editor & Signer
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Draft, customise, and sign the 3 mandatory 2026 tenancy documents — with locked legal terms and a full audit trail.
            </p>
          </AnimatedSection>

          {/* Template Library */}
          <AnimatedSection className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              2026 Template Library
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => startFromTemplate(t.id)}
                  className="text-left rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/40 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <FileText size={20} className="text-primary" />
                    <Badge className={`${t.badgeColor} text-[9px]`}>{t.badge}</Badge>
                  </div>
                  <h3 className="text-sm font-bold group-hover:text-primary transition-colors">{t.name}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{t.description}</p>
                </button>
              ))}
            </div>
          </AnimatedSection>

          {/* Existing Contracts */}
          <AnimatedSection>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <PenTool size={18} className="text-primary" />
              Your Contracts
            </h2>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            ) : contracts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/30 p-12 text-center">
                <FileText size={32} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No contracts yet. Pick a template above to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contracts.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-border bg-card/60 p-4 flex items-center justify-between gap-4 hover:border-primary/30 transition-all cursor-pointer"
                    onClick={() => openExistingContract(c)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText size={16} className="text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{c.title || "Untitled"}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {c.tenant_name || "No tenant"} · {new Date(c.created_at).toLocaleDateString()}
                          {c.certificate_id && ` · ${c.certificate_id}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {statusBadge(c.status)}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteContract(c.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnimatedSection>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default LandlordContracts;
