import { useState } from "react";
import { X, Phone, Mail, Send, CheckCircle, MapPin, Home } from "lucide-react";

interface ContactModalProps {
  agent: {
    name: string;
    logo: string;
    phone: string | null;
    email: string | null;
  };
  propertyAddress: string;
  onClose: () => void;
}

const ContactAgentModal = ({ agent, propertyAddress, onClose }: ContactModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    `Hi ${agent.name},\n\nI'm interested in discussing the sale/letting of my property at:\n\n${propertyAddress}\n\nCould you arrange a time to discuss?\n\nThank you.`
  );
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production this would send via an edge function
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-[#0f1f3a] border border-white/10 rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">{agent.logo}</div>
            <div>
              <h3 className="font-bold text-white">Contact {agent.name}</h3>
              <p className="text-xs text-white/40">We'll send your details directly to the agent</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <X size={16} className="text-white/50" />
          </button>
        </div>

        {sent ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#00E5CC]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-[#00E5CC]" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Message Sent!</h4>
            <p className="text-white/50 text-sm mb-6">{agent.name} will receive your enquiry about {propertyAddress}.</p>
            <button onClick={onClose} className="px-6 py-2.5 rounded-full text-sm font-semibold" style={{ backgroundColor: "#00E5CC", color: "#0A1428" }}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Pre-filled property */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-3">
              <Home size={16} className="text-[#00E5CC] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-0.5">Property Address</p>
                <p className="text-sm text-white/80">{propertyAddress}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1 block">Your Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#00E5CC]/50"
                  placeholder="John Smith" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1 block">Phone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#00E5CC]/50"
                  placeholder="07700 900000" />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1 block">Your Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#00E5CC]/50"
                placeholder="john@example.com" />
            </div>

            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1 block">Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#00E5CC]/50 resize-none" />
            </div>

            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold rounded-full"
              style={{ backgroundColor: "#00E5CC", color: "#0A1428" }}>
              <Send size={16} /> Send Enquiry to {agent.name}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactAgentModal;
