import { useState } from "react";
import { Send, Sparkles, Lock, ArrowRight, Mail, Bold, Italic, List, Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useHumm } from "@/contexts/HummContext";
import { conversionAnalytics } from "@/lib/analytics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NegotiationCTAProps {
  onStartNegotiation: () => void;
  onUpgrade: () => void;
  onSendEmail: (draft: { to: string; subject: string; body: string }) => Promise<void>;
  isPro: boolean;
  isSending?: boolean;
  className?: string;
}

/**
 * NegotiationCTA (Phase 2 refactor)
 * 
 * The sticky / prominent call-to-action section after an audit.
 * Contains:
 * - Start Free Negotiation button
 * - Upgrade prompt for non-Pro users
 * - Quick email drafting UI
 * 
 * Preserves the original dark navy + teal premium aesthetic.
 */
export default function NegotiationCTA({
  onStartNegotiation,
  onUpgrade,
  onSendEmail,
  isPro,
  isSending = false,
  className = "",
}: NegotiationCTAProps) {
  const { isLoggedIn } = useHumm();
  const [showEmailDraft, setShowEmailDraft] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [selectedTemplate, setSelectedTemplate] = useState("initial_interest");
  const [selectedTone, setSelectedTone] = useState("professional");

  const [emailDraft, setEmailDraft] = useState({
    to: "",
    subject: "Offer on [Property Address]",
    body: "Dear Agent,\n\nI am writing to express my interest in the property at the above address.\n\nHaving reviewed the details, I believe my offer of £[AMOUNT] represents fair market value based on recent comparables.\n\nI am in a strong position to proceed quickly with no chain.\n\nI look forward to your response.\n\nBest regards,\n[Your Name]",
  });

  const templates = {
    initial_interest: {
      label: "Initial Interest / Strong Offer",
      subject: "Serious Offer on [Property Address]",
      body: "Dear Agent,\n\nI am writing to express strong interest in the property.\n\nBased on my analysis of recent comparable sales in the area, I would like to submit an offer of £[AMOUNT]. This reflects current market conditions while offering a clean, chain-free transaction.\n\nI am ready to move quickly and can provide proof of funds immediately.\n\nI look forward to discussing this further.\n\nKind regards,\n[Your Name]",
    },
    lowball: {
      label: "Strategic Low Offer",
      subject: "Initial Offer – [Property Address]",
      body: "Dear Agent,\n\nThank you for the details on the property.\n\nAfter careful consideration of the condition, location factors, and recent sales data, I would like to put forward an initial offer of £[AMOUNT].\n\nI am flexible and open to negotiation. I am a serious buyer in a strong position.\n\nPlease let me know your thoughts.\n\nBest regards,\n[Your Name]",
    },
    viewing_request: {
      label: "Viewing + Soft Interest",
      subject: "Request to View – [Property Address]",
      body: "Dear Agent,\n\nI am very interested in the property at the above address.\n\nI would like to arrange a viewing at your earliest convenience. I am particularly keen to understand the layout and any recent updates.\n\nPlease let me know suitable times.\n\nThank you,\n[Your Name]",
    },
  };

  const tones = {
    professional: "Professional & Measured",
    assertive: "Assertive & Confident",
    collaborative: "Collaborative & Friendly",
    polite: "Polite & Courteous",
  };

  const applyTemplate = (templateKey: string) => {
    const template = templates[templateKey as keyof typeof templates];
    if (template) {
      setEmailDraft(prev => ({
        ...prev,
        subject: template.subject,
        body: template.body,
      }));
      setSelectedTemplate(templateKey);
    }
  };

  const applyTone = (toneKey: string) => {
    setSelectedTone(toneKey);
    // In a real implementation this could rewrite the body using AI
    // For now we just track the selection for UX
  };

  const formatText = (format: "bold" | "italic" | "list") => {
    const textarea = document.getElementById("email-body") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = emailDraft.body.substring(start, end);

    let formatted = selectedText;

    if (format === "bold") formatted = `**${selectedText}**`;
    if (format === "italic") formatted = `*${selectedText}*`;
    if (format === "list") formatted = selectedText.split('\n').map(line => `- ${line}`).join('\n');

    const newBody = emailDraft.body.substring(0, start) + formatted + emailDraft.body.substring(end);
    setEmailDraft(prev => ({ ...prev, body: newBody }));
  };

  const getPreviewBody = () => {
    return emailDraft.body
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  const handleSend = async () => {
    if (!emailDraft.to.trim()) return;
    await onSendEmail(emailDraft);
    setShowEmailDraft(false);
    setViewMode("edit");
  };

  const handleStartNegotiation = () => {
    conversionAnalytics.negotiationInitiated("negotiation_cta");
    onStartNegotiation();
  };

  const handleUpgrade = () => {
    conversionAnalytics.upgradeClicked("negotiation_cta");
    onUpgrade();
  };

  return (
    <div className={`rounded-2xl border border-primary/20 bg-card/60 p-4 sm:p-6 lg:p-8 ${className}`}>
      {/* Mobile-first sticky-friendly layout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="text-primary" size={18} />
            <h3 className="font-semibold text-lg">Ready to negotiate?</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Let Hummm handle the back-and-forth or send a professional opening email.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto mt-3 sm:mt-0">
          {!isPro && (
            <Button 
              onClick={handleUpgrade}
              variant="outline"
              className="border-primary/40 hover:bg-primary/10"
            >
              <Lock size={14} className="mr-2" /> Upgrade to Pro
            </Button>
          )}

          <Button 
            onClick={handleStartNegotiation}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
          >
            Start Free Negotiation <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>

      {/* Quick Email Draft Section */}
      <div className="mt-6 pt-6 border-t border-border/60">
        {!showEmailDraft ? (
          <button
            onClick={() => setShowEmailDraft(true)}
            className="text-sm flex items-center gap-2 text-primary hover:underline"
          >
            <Mail size={15} /> Or send a quick email to the agent
          </button>
        ) : (
          <div className="space-y-5">
            {/* Header with View Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-primary" />
                <span className="font-semibold">Professional Email Composer</span>
              </div>
              <div className="flex items-center bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode("edit")}
                  className={`px-3 py-1 text-xs rounded-md flex items-center gap-1 transition ${viewMode === "edit" ? "bg-background shadow" : ""}`}
                >
                  <Edit3 size={13} /> Edit
                </button>
                <button
                  onClick={() => setViewMode("preview")}
                  className={`px-3 py-1 text-xs rounded-md flex items-center gap-1 transition ${viewMode === "preview" ? "bg-background shadow" : ""}`}
                >
                  <Eye size={13} /> Preview
                </button>
              </div>
            </div>

            {/* Template & Tone Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Template</div>
                <Select value={selectedTemplate} onValueChange={(val) => applyTemplate(val)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(templates).map(([key, t]) => (
                      <SelectItem key={key} value={key}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Tone</div>
                <Select value={selectedTone} onValueChange={(val) => applyTone(val)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(tones).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Select>
            </div>

            {viewMode === "edit" ? (
              <>
                {/* Editor */}
                <div className="space-y-3">
                  <Input
                    placeholder="Agent email address"
                    value={emailDraft.to}
                    onChange={(e) => setEmailDraft(d => ({ ...d, to: e.target.value }))}
                  />
                  <Input
                    value={emailDraft.subject}
                    onChange={(e) => setEmailDraft(d => ({ ...d, subject: e.target.value }))}
                    placeholder="Subject line"
                  />

                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-1 border border-border rounded-md p-1 bg-muted/30">
                    <Button variant="ghost" size="sm" onClick={() => formatText("bold")} className="h-7 w-7 p-0"><Bold size={14} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => formatText("italic")} className="h-7 w-7 p-0"><Italic size={14} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => formatText("list")} className="h-7 w-7 p-0"><List size={14} /></Button>
                    <div className="flex-1" />
                    <span className="text-[10px] text-muted-foreground pr-2">{emailDraft.body.length} chars</span>
                  </div>

                  <Textarea
                    id="email-body"
                    rows={8}
                    value={emailDraft.body}
                    onChange={(e) => setEmailDraft(d => ({ ...d, body: e.target.value }))}
                    className="font-mono text-sm resize-y"
                    placeholder="Write your message here..."
                  />
                </div>
              </>
            ) : (
              /* Preview Pane */
              <div className="border border-border rounded-xl p-5 bg-background/50 min-h-[220px] text-sm leading-relaxed">
                <div className="text-xs text-muted-foreground mb-2">PREVIEW — How the recipient will see it</div>
                <div className="font-semibold mb-3">{emailDraft.subject || "(No subject)"}</div>
                <div dangerouslySetInnerHTML={{ __html: getPreviewBody() }} className="prose prose-sm max-w-none" />
                <div className="mt-4 pt-3 border-t text-muted-foreground text-xs">
                  Sent from: [Your Name] &lt;you@email.com&gt;
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                onClick={handleSend} 
                disabled={!emailDraft.to.trim() || isSending}
                className="flex-1 sm:flex-none"
              >
                {isSending ? "Sending..." : "Send Email"} <Send size={14} className="ml-2" />
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => { setShowEmailDraft(false); setViewMode("edit"); }}
              >
                Cancel
              </Button>
            </div>

            {!isLoggedIn && (
              <p className="text-[11px] text-muted-foreground text-center">
                You’ll be asked to sign in before the email is sent.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
