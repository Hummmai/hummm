import { useState, useRef } from "react";
import { X, Upload, Sparkles, ArrowRight, ArrowLeft, CheckCircle, Camera, Loader2, Home } from "lucide-react";

interface ListingFormProps {
  open: boolean;
  onClose: () => void;
}

const propertyTypes = ["Detached", "Semi-Detached", "Terraced", "Flat", "Bungalow", "Townhouse", "Cottage", "Other"];

const ListingForm = ({ open, onClose }: ListingFormProps) => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 1
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [propType, setPropType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [sqft, setSqft] = useState("");
  const [askingPrice, setAskingPrice] = useState("");

  // Step 2
  const [photos, setPhotos] = useState<File[]>([]);
  const [description, setDescription] = useState("");

  // Step 3
  const [agreed, setAgreed] = useState(false);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setPhotos(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const removePhoto = (i: number) => setPhotos(prev => prev.filter((_, idx) => idx !== i));

  const generateDescription = () => {
    setGenerating(true);
    setTimeout(() => {
      setDescription(
        `A stunning ${bedrooms || "3"}-bedroom ${propType || "property"} located in the heart of ${postcode || "a desirable area"}. This beautifully presented home features ${bathrooms || "2"} bathrooms, ${sqft ? sqft + " sq ft of" : "generous"} living space, and is finished to a high standard throughout. The property benefits from excellent transport links and local amenities, making it an ideal family home or investment opportunity.`
      );
      setGenerating(false);
    }, 1500);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const reset = () => {
    setStep(1);
    setSubmitted(false);
    setAddress("");
    setPostcode("");
    setPropType("");
    setBedrooms("");
    setBathrooms("");
    setSqft("");
    setAskingPrice("");
    setPhotos([]);
    setDescription("");
    setAgreed(false);
    onClose();
  };

  if (!open) return null;

  const inputClass = "w-full px-4 py-3 text-sm rounded-xl border border-border bg-background text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50";
  const labelClass = "text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={reset} />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl" style={{ scrollbarWidth: "thin" }}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-card/95 backdrop-blur-sm rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary/10">
              <Home size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">List Your Property</h2>
              {!submitted && <p className="text-[11px] text-muted-foreground">Step {step} of 3</p>}
            </div>
          </div>
          <button onClick={reset} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        {!submitted && (
          <div className="h-1 bg-secondary">
            <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
        )}

        <div className="p-6">
          {submitted ? (
            /* Success */
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-black mb-3 text-foreground">Property Received!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto mb-6">
                Thank you! Your property has been received. Our AI is preparing the listing. We'll list it on <span className="text-primary font-semibold">Rightmove</span>, <span className="text-primary font-semibold">Zoopla</span> and more shortly and contact you with the links.
              </p>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground mb-6">
                <span className="font-semibold text-primary">What happens next:</span> Our team will review your submission, prepare professional listing materials, and publish across all major portals within 24 hours.
              </div>
              <button onClick={reset} className="px-8 py-3 text-sm font-bold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                Done
              </button>
            </div>
          ) : step === 1 ? (
            /* Step 1: Property Basics */
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Property Basics</h3>
                <p className="text-xs text-muted-foreground mb-5">Tell us about the property you'd like to list.</p>
              </div>
              <div>
                <label className={labelClass}>Full Address</label>
                <input type="text" className={inputClass} placeholder="e.g. 14 Oakwood Drive, Didsbury" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Postcode</label>
                  <input type="text" className={inputClass} placeholder="e.g. M20 2TG" value={postcode} onChange={e => setPostcode(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Property Type</label>
                  <select className={inputClass} value={propType} onChange={e => setPropType(e.target.value)}>
                    <option value="">Select type</option>
                    {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Bedrooms</label>
                  <select className={inputClass} value={bedrooms} onChange={e => setBedrooms(e.target.value)}>
                    <option value="">—</option>
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Bathrooms</label>
                  <select className={inputClass} value={bathrooms} onChange={e => setBathrooms(e.target.value)}>
                    <option value="">—</option>
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Size (sq ft)</label>
                  <input type="text" className={inputClass} placeholder="e.g. 1200" value={sqft} onChange={e => setSqft(e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Asking Price (or AI Valuation Ref)</label>
                <input type="text" className={inputClass} placeholder="e.g. £425,000 or VAL-12345" value={askingPrice} onChange={e => setAskingPrice(e.target.value)} />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!address.trim()}
                className="w-full flex items-center justify-center gap-2 mt-2 py-3.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          ) : step === 2 ? (
            /* Step 2: Photos & Description */
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Photos & Description</h3>
                <p className="text-xs text-muted-foreground mb-5">Upload photos and let our AI write the listing description.</p>
              </div>

              {/* Photo upload */}
              <div>
                <label className={labelClass}>Property Photos</label>
                <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleFiles} className="hidden" />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex flex-col items-center gap-2 py-8 rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-secondary/30 transition-colors cursor-pointer"
                >
                  <Camera size={28} className="text-muted-foreground/50" />
                  <span className="text-sm font-medium text-muted-foreground">Click to upload photos</span>
                  <span className="text-[11px] text-muted-foreground/60">JPG, PNG up to 10MB each</span>
                </button>
                {photos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {photos.map((f, i) => (
                      <div key={i} className="relative group">
                        <img src={URL.createObjectURL(f)} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />
                        <button onClick={() => removePhoto(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelClass}>Listing Description</label>
                  <button
                    onClick={generateDescription}
                    disabled={generating}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {generating ? "Generating…" : "Generate with AI"}
                  </button>
                </div>
                <textarea
                  className={`${inputClass} min-h-[120px] resize-none`}
                  placeholder="Write a description or let our AI generate one for you…"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(1)} className="flex-1 py-3.5 text-sm font-semibold rounded-xl border border-border hover:bg-secondary transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={() => setStep(3)} className="flex-[2] py-3.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            /* Step 3: Confirmation */
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Confirm & Submit</h3>
                <p className="text-xs text-muted-foreground mb-5">Review and submit your property for listing.</p>
              </div>

              {/* Summary */}
              <div className="rounded-xl bg-secondary/40 border border-border p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span className="font-medium text-foreground text-right max-w-[60%]">{address || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium text-foreground">{propType || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Beds / Baths</span><span className="font-medium text-foreground">{bedrooms || "—"} / {bathrooms || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Price</span><span className="font-medium text-foreground">{askingPrice || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Photos</span><span className="font-medium text-foreground">{photos.length} uploaded</span></div>
              </div>

              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-xs text-muted-foreground leading-relaxed">
                Once submitted, our team will review and automatically list your property on <span className="text-primary font-semibold">Rightmove</span>, <span className="text-primary font-semibold">Zoopla</span>, and other major portals within 24 hours.
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-border accent-primary" />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I agree to instruct Hummm as my agent and accept the <span className="text-primary font-medium">terms of service</span>.
                </span>
              </label>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-3.5 text-sm font-semibold rounded-xl border border-border hover:bg-secondary transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!agreed}
                  className="flex-[2] py-3.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Upload size={16} /> Submit & List My Property
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingForm;
