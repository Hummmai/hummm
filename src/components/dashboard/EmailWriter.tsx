import { useState } from "react";
import { Send, Copy, Check, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  audits: any[];
}

export default function EmailWriter({ audits }: Props) {
  const { toast } = useToast();
  const [selectedAudit, setSelectedAudit] = useState<string>("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const audit = audits.find((a) => a.id === selectedAudit);

  const handleSelectAudit = (id: string) => {
    setSelectedAudit(id);
    const a = audits.find((x) => x.id === id);
    if (a) {
      setRecipientEmail(a.agent_email || "");
      setSubject(`Enquiry about ${a.address || "property"}`);
      setBody(
        `Dear ${a.agent_name || "Agent"},\n\nI am writing to enquire about the property at ${a.address || "the above address"}${a.asking_price ? `, currently listed at £${a.asking_price.toLocaleString()}` : ""}.\n\nI would appreciate any further information and would like to arrange a viewing at your earliest convenience.\n\nKind regards`
      );
    }
  };

  const handleGenerate = async () => {
    if (!audit) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("draft-opening-email", {
        body: {
          address: audit.address,
          askingPrice: audit.asking_price,
          agentName: audit.agent_name,
          role: "buyer",
        },
      });
      if (error) throw error;
      if (data?.subject) setSubject(data.subject);
      if (data?.body) setBody(data.body);
    } catch (error) {
      console.error("Error generating email:", error);
      toast({
        title: "Error",
        description: "Failed to generate email. Please try again.",
        variant: "destructive",
      });
    }
    setGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Email Writer</h2>
        <p className="text-sm text-gray-500">Draft and send professional emails to agents.</p>
      </div>

      {/* Select property */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
          Select Property
        </label>
        <select
          value={selectedAudit}
          onChange={(e) => handleSelectAudit(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:border-primary focus:outline-none transition-colors"
        >
          <option value="">Choose a property...</option>
          {audits.map((a) => (
            <option key={a.id} value={a.id}>
              {a.address || a.property_url}
            </option>
          ))}
        </select>
      </div>

      {selectedAudit && (
        <>
          {/* Recipient */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
              Agent Email
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="agent@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
              Subject
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Message
              </label>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
              >
                {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                AI Draft
              </button>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:border-primary focus:outline-none transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors active:scale-[0.98]"
            >
              {copied ? <Check size={16} className="text-primary" /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <a
              href={`mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors active:scale-[0.98] shadow-sm"
            >
              <Send size={16} />
              Open in Email
            </a>
          </div>
        </>
      )}
    </div>
  );
}
