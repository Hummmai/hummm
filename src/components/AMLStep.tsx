import { Shield, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import AddressLookup from "@/components/AddressLookup";

interface AMLStepProps {
  amlName: string;
  setAmlName: (v: string) => void;
  amlDob: string;
  setAmlDob: (v: string) => void;
  amlAddress: string;
  setAmlAddress: (v: string) => void;
  amlPostcode: string;
  setAmlPostcode: (v: string) => void;
  amlDocType: string;
  setAmlDocType: (v: string) => void;
  amlSubmitted: boolean;
  amlSubmitting: boolean;
  onSubmitAml: () => void;
  inputClass: string;
  labelClass: string;
}

const docTypes = [
  "UK Passport",
  "UK Driving Licence",
  "EU/EEA National ID Card",
  "Biometric Residence Permit",
  "Other Government-Issued Photo ID",
];

const AMLStep = ({
  amlName, setAmlName,
  amlDob, setAmlDob,
  amlAddress, setAmlAddress,
  amlPostcode, setAmlPostcode,
  amlDocType, setAmlDocType,
  amlSubmitted, amlSubmitting,
  onSubmitAml,
  inputClass, labelClass,
}: AMLStepProps) => {
  const canSubmit = amlName.trim() && amlDob && amlAddress.trim() && amlDocType;

  if (amlSubmitted) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-primary/10">
            <CheckCircle size={32} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">AML Check Submitted</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Your identity verification is being processed. This is required by UK law to prevent fraud and money laundering.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Loader2 size={14} className="text-amber-500 animate-spin" />
            <span className="text-xs font-semibold text-amber-600">AML check in progress — typically completes within 24 hours</span>
          </div>
        </div>

        <div className="rounded-xl bg-secondary/30 border border-border p-4 text-xs text-muted-foreground leading-relaxed">
          <div className="flex items-start gap-2">
            <Shield size={14} className="text-primary shrink-0 mt-0.5" />
            <p>
              Your data is securely processed in compliance with UK Anti-Money Laundering Regulations (MLR 2017) and GDPR.
              We never share your personal information with third parties without your consent.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-1">Identity Verification (AML)</h3>
        <p className="text-xs text-muted-foreground mb-2">
          For your protection and legal compliance, we perform AML checks on all listings.
        </p>
      </div>

      {/* Legal Notice */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Required by UK Law</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Under the Money Laundering, Terrorist Financing and Transfer of Funds (Information on the Payer) Regulations 2017,
            all estate agents must verify the identity of sellers and landlords before proceeding with a transaction.
          </p>
        </div>
      </div>

      <div>
        <label className={labelClass}>Full Legal Name</label>
        <input
          type="text"
          className={inputClass}
          placeholder="As it appears on your ID"
          value={amlName}
          onChange={e => setAmlName(e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>Date of Birth</label>
        <input
          type="date"
          className={inputClass}
          value={amlDob}
          onChange={e => setAmlDob(e.target.value)}
        />
      </div>

      <AddressLookup
        value={amlAddress}
        onChange={setAmlAddress}
        onPostcodeFound={setAmlPostcode}
        label="Current Residential Address"
        placeholder="Your home address or postcode"
      />

      <div>
        <label className={labelClass}>Postcode</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Auto-filled or type manually"
          value={amlPostcode}
          onChange={e => setAmlPostcode(e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>ID Document Type</label>
        <select
          className={inputClass}
          value={amlDocType}
          onChange={e => setAmlDocType(e.target.value)}
        >
          <option value="">Select ID type</option>
          {docTypes.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Trust Badges */}
      <div className="rounded-xl bg-secondary/30 border border-border p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-primary" />
          <span className="text-xs font-bold text-foreground">Your Data Is Protected</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
            <CheckCircle size={10} className="text-primary" /> GDPR Compliant
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
            <CheckCircle size={10} className="text-primary" /> MLR 2017 Compliant
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
            <CheckCircle size={10} className="text-primary" /> 256-bit Encryption
          </span>
        </div>
      </div>

      <button
        onClick={onSubmitAml}
        disabled={!canSubmit || amlSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {amlSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Submitting verification…
          </>
        ) : (
          <>
            <Shield size={16} />
            Submit Identity Verification
          </>
        )}
      </button>
    </div>
  );
};

export default AMLStep;
