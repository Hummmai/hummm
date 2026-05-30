import { useState, useRef, useCallback } from "react";
import AddressLookup from "@/components/AddressLookup";
import { X, Upload, Sparkles, ArrowRight, ArrowLeft, CheckCircle, Camera, Loader2, Home, ImagePlus, Globe, Megaphone, Video, TrendingUp, Shield, Eye, Wand2, Lightbulb, Star } from "lucide-react";
import AMLStep from "@/components/AMLStep";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ListingWizardProps {
  open: boolean;
  onClose: () => void;
}

const propertyTypes = ["Detached", "Semi-Detached", "Terraced", "Flat", "Bungalow", "Townhouse", "Cottage", "Other"];
const stepLabels = ["Property Details", "Photos & Description", "Pricing & Marketing", "AML Verification", "Confirm & Instruct"];

const ListingWizard = ({ open, onClose }: ListingWizardProps) => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Step 1
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [propType, setPropType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [sqft, setSqft] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2
  const [photos, setPhotos] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [aiEnhanced, setAiEnhanced] = useState(false);
  const [enhanceProgress, setEnhanceProgress] = useState(0);
  const [virtualStaging, setVirtualStaging] = useState(false);

  // Step 2 - Photography
  const [photoPackage, setPhotoPackage] = useState<"none" | "standard" | "premium">("none");

  // Step 3
  const [aiPrice, setAiPrice] = useState<number | null>(null);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [askingPrice, setAskingPrice] = useState("");
  const [mktRightmove, setMktRightmove] = useState(true);
  const [mktZoopla, setMktZoopla] = useState(true);
  const [mktSocial, setMktSocial] = useState(false);
  const [mktVirtualTour, setMktVirtualTour] = useState(false);

  // Step 4 - AML
  const [amlName, setAmlName] = useState("");
  const [amlDob, setAmlDob] = useState("");
  const [amlAddress, setAmlAddress] = useState("");
  const [amlPostcode, setAmlPostcode] = useState("");
  const [amlDocType, setAmlDocType] = useState("");
  const [amlSubmitted, setAmlSubmitted] = useState(false);
  const [amlSubmitting, setAmlSubmitting] = useState(false);

  // Step 5
  const [agreed, setAgreed] = useState(false);

  const photoPackagePrice = photoPackage === "premium" ? 249 : photoPackage === "standard" ? 149 : 0;

  const addFiles = useCallback((files: FileList | File[]) => {
    setPhotos(prev => [...prev, ...Array.from(files)]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removePhoto = (i: number) => setPhotos(prev => prev.filter((_, idx) => idx !== i));

  const [enhanceStage, setEnhanceStage] = useState(0);
  const enhanceStages = ["Improving lighting & exposure", "Enhancing colours & contrast", "Optimizing composition & sharpness"];

  const startEnhancement = (count: number) => {
    if (count === 0 || aiEnhancing) return;
    setAiEnhancing(true);
    setAiEnhanced(false);
    setEnhanceProgress(0);
    setEnhanceStage(0);
    let progress = 0;
    let stage = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 12 + 5;
      const newStage = progress < 33 ? 0 : progress < 66 ? 1 : 2;
      if (newStage !== stage) { stage = newStage; setEnhanceStage(stage); }
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setEnhanceProgress(100);
        setTimeout(() => { setAiEnhancing(false); setAiEnhanced(true); }, 600);
      } else {
        setEnhanceProgress(Math.round(progress));
      }
    }, 400);
  };

  const generateDescription = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-listing-description", {
        body: { address, postcode, property_type: propType, bedrooms, bathrooms, sqft },
      });
      if (error) throw error;
      if (data?.description) setDescription(data.description);
    } catch (e: any) {
      toast({ title: "AI generation failed", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  // Simulate AI price on entering step 3
  const enterStep3 = () => {
    if (!aiPrice) {
      const base = sqft ? parseInt(sqft) * 250 : 350000;
      const variance = Math.round(base * 0.05);
      setAiPrice(base + Math.round(Math.random() * variance));
      setAiConfidence(78 + Math.floor(Math.random() * 15));
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Upload photos
      const photoUrls: string[] = [];
      for (const file of photos) {
        const ext = file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("listing-photos").upload(path, file);
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("listing-photos").getPublicUrl(path);
          photoUrls.push(urlData.publicUrl);
        }
      }

      const listingId = crypto.randomUUID();
      const { error } = await supabase.from("property_listings").insert({
        id: listingId,
        address,
        postcode: postcode || null,
        property_type: propType || null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        sqft: sqft || null,
        description: description || null,
        photo_urls: photoUrls,
        ai_suggested_price: aiPrice,
        ai_confidence: aiConfidence,
        asking_price: askingPrice || null,
        market_rightmove: mktRightmove,
        market_zoopla: mktZoopla,
        market_social: mktSocial,
        market_virtual_tour: mktVirtualTour,
        name: name || null,
        email: email || null,
        phone: phone || null,
        status: "pending",
      });

      if (error) throw error;

      // Send confirmation email to user
      if (email) {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "sell-confirmation",
            recipientEmail: email,
            idempotencyKey: `sell-confirm-${listingId}`,
            templateData: { name, address },
          },
        });
      }
      // Send admin notification to hello@
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "notify-sell",
          idempotencyKey: `notify-sell-${listingId}`,
          templateData: {
            address, name, email, phone,
            propertyType: propType,
            bedrooms, bathrooms,
            askingPrice: askingPrice || 'Not set',
            photoCount: photos.length,
          },
        },
      });

      setSubmitted(true);
    } catch (e: any) {
      toast({ title: "Submission failed", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAmlSubmit = async () => {
    setAmlSubmitting(true);
    try {
      const { error } = await supabase.from("aml_checks" as any).insert({
        full_name: amlName,
        date_of_birth: amlDob,
        address: amlAddress,
        postcode: amlPostcode || null,
        document_type: amlDocType,
        status: "pending",
      });
      if (error) throw error;
      setAmlSubmitted(true);
    } catch (e: any) {
      toast({ title: "AML submission failed", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setAmlSubmitting(false);
    }
  };

  const reset = () => {
    setStep(1); setSubmitted(false); setAddress(""); setPostcode(""); setPropType("");
    setBedrooms(""); setBathrooms(""); setSqft(""); setName(""); setEmail(""); setPhone("");
    setPhotos([]); setDescription(""); setPhotoPackage("none"); setAiEnhancing(false); setAiEnhanced(false); setEnhanceProgress(0); setVirtualStaging(false); setAiPrice(null); setAiConfidence(null);
    setAskingPrice(""); setMktRightmove(true); setMktZoopla(true); setMktSocial(false);
    setMktVirtualTour(false); setAgreed(false);
    setAmlName(""); setAmlDob(""); setAmlAddress(""); setAmlPostcode(""); setAmlDocType(""); setAmlSubmitted(false);
    onClose();
  };

  if (!open) return null;

  const input = "w-full px-4 py-3 text-sm rounded-xl border border-border bg-background text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40";
  const label = "text-[11px] font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={reset} />
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl" style={{ scrollbarWidth: "thin" }}>

        {/* Header */}
        <div className="sticky top-0 z-10 px-6 pt-5 pb-4 border-b border-border bg-card/95 backdrop-blur-sm rounded-t-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary/10">
                <Home size={18} className="text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  {submitted ? "Listing Submitted" : "List Your Property"}
                </h2>
                {!submitted && <p className="text-[11px] text-muted-foreground">Step {step} of 5 — {stepLabels[step - 1]}</p>}
              </div>
            </div>
            <button onClick={reset} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Progress */}
          {!submitted && (
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className="flex-1 h-1 rounded-full transition-all duration-500" style={{ backgroundColor: s <= step ? "#00E5CC" : "hsl(var(--border))" }} />
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          {submitted ? (
            /* ── Success ── */
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,229,204,0.1)", boxShadow: "0 0 40px rgba(0,229,204,0.15)" }}>
                <CheckCircle size={40} className="text-primary" />
              </div>
              <h3 className="text-xl font-black mb-2 text-foreground">Your Property Is Being Prepared!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto mb-6">
                Our AI is optimising the details. We will send you the live{" "}
                <span className="text-primary font-semibold">Rightmove</span> &{" "}
                <span className="text-primary font-semibold">Zoopla</span> links as soon as it's live.
              </p>
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-xs text-muted-foreground mb-6 text-left space-y-2">
                <p className="font-semibold text-primary text-center">What happens next</p>
                <p>✓ AI optimises your listing description & images</p>
                {photoPackage !== "none" && <p>✓ Professional photographer booked — we'll be in touch to arrange</p>}
                <p>✓ Our team reviews within 24 hours</p>
                <p>✓ Published on Rightmove, Zoopla & selected portals</p>
                <p>✓ You receive live listing links via email</p>
              </div>
              <button onClick={reset} className="px-10 py-3.5 text-sm font-bold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                Done
              </button>
            </div>
          ) : step === 1 ? (
            /* ── Step 1: Property Details ── */
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Property Details</h3>
                <p className="text-xs text-muted-foreground mb-5">Tell us about the property you'd like to list.</p>
              </div>
              <AddressLookup
                value={address}
                onChange={setAddress}
                onPostcodeFound={setPostcode}
                label="Full Address"
                placeholder="e.g. 14 Oakwood Drive, Didsbury, Manchester or enter postcode"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <div><label className={label}>Postcode</label><input type="text" className={input} placeholder="Auto-filled or type manually" value={postcode} onChange={e => setPostcode(e.target.value)} /></div>
                <div><label className={label}>Property Type</label>
                  <select className={input} value={propType} onChange={e => setPropType(e.target.value)}>
                    <option value="">Select</option>
                    {propertyTypes.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className={label}>Bedrooms</label>
                  <select className={input} value={bedrooms} onChange={e => setBedrooms(e.target.value)}>
                    <option value="">—</option>{[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div><label className={label}>Bathrooms</label>
                  <select className={input} value={bathrooms} onChange={e => setBathrooms(e.target.value)}>
                    <option value="">—</option>{[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div><label className={label}>Size (sq ft)</label><input type="text" className={input} placeholder="e.g. 1200" value={sqft} onChange={e => setSqft(e.target.value)} /></div>
              </div>

              <div className="border-t border-border pt-4 mt-2">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Contact Details</p>
                <div className="grid grid-cols-1 gap-3">
                  <div><label className={label}>Full Name</label><input type="text" className={input} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={label}>Email</label><input type="email" className={input} placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
                    <div><label className={label}>Phone</label><input type="tel" className={input} placeholder="07xxx" value={phone} onChange={e => setPhone(e.target.value)} /></div>
                  </div>
                </div>
              </div>

              <a href="/ai-valuation" target="_blank" rel="noopener" className="flex items-center gap-2 text-xs text-primary font-semibold hover:underline mt-1">
                <Sparkles size={13} /> Already have an AI Valuation? Skip ahead →
              </a>

              <button onClick={() => setStep(2)} disabled={!address.trim() || !name.trim() || !email.trim()}
                className="w-full flex items-center justify-center gap-2 mt-2 py-3.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Continue <ArrowRight size={16} />
              </button>
            </div>
          ) : step === 2 ? (
            /* ── Step 2: Photos & Description ── */
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Upload Your Property Photos</h3>
                <p className="text-xs text-muted-foreground">Upload your own photos – our AI will automatically enhance them for maximum impact.</p>
              </div>

              {/* Drag & Drop Zone */}
              <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/heic,image/heif" onChange={e => { if (e.target.files) { addFiles(e.target.files); if (!aiEnhanced) startEnhancement(e.target.files.length); } }} className="hidden" />
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { handleDrop(e); if (!aiEnhanced) startEnhancement(e.dataTransfer.files.length); }}
                className={`relative w-full flex flex-col items-center gap-4 py-14 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${dragOver ? "border-primary bg-primary/10 scale-[1.02] shadow-[0_0_40px_rgba(0,229,204,0.15)]" : "border-primary/30 hover:border-primary/60 hover:bg-primary/5"}`}
              >
                <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ background: "radial-gradient(ellipse at 50% 80%, hsl(var(--primary) / 0.06) 0%, transparent 70%)" }} />
                <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/10">
                  <ImagePlus size={30} className="text-primary" />
                </div>
                <div className="text-center relative z-10">
                  <span className="text-sm font-bold text-foreground block">Drop your photos here or click to browse</span>
                  <span className="text-[11px] text-muted-foreground mt-1.5 block">JPG, PNG, HEIC — max 20 photos</span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-primary/70"><Sparkles size={10} />Auto-enhanced by AI</span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-primary/70"><Shield size={10} />Human reviewed</span>
                </div>
              </div>

              {/* Uploaded Photos Grid */}
              {photos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{photos.length} photo{photos.length !== 1 ? "s" : ""} uploaded</span>
                    {aiEnhanced && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary"><CheckCircle size={10} />AI Enhanced</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {photos.map((f, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden border border-border shadow-sm" style={{ boxShadow: aiEnhanced ? "0 0 12px hsl(var(--primary) / 0.12)" : undefined }}>
                        <img src={URL.createObjectURL(f)} alt="" className="w-20 h-20 object-cover" />
                        <button onClick={() => removePhoto(i)} className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={16} className="text-white" />
                        </button>
                        {aiEnhanced && <div className="absolute bottom-0 left-0 right-0 py-0.5 text-center text-[8px] font-bold text-primary-foreground bg-primary/90 backdrop-blur-sm">Enhanced</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Enhancement Progress with Stages */}
              {aiEnhancing && (
                <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <Loader2 size={18} className="text-primary animate-spin" />
                    <span className="text-sm font-bold text-foreground">AI Enhancing your photos…</span>
                    <span className="ml-auto text-xs font-bold text-primary tabular-nums">{enhanceProgress}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${enhanceProgress}%`, background: "linear-gradient(90deg, hsl(var(--primary)), hsl(168 100% 55%))" }} />
                  </div>
                  <div className="flex gap-2">
                    {enhanceStages.map((s, i) => (
                      <div key={i} className={`flex-1 rounded-lg p-2.5 text-center transition-all duration-300 border ${enhanceStage === i ? "border-primary/40 bg-primary/10 scale-[1.02]" : enhanceStage > i ? "border-primary/20 bg-primary/5" : "border-border bg-secondary/20 opacity-50"}`}>
                        <div className="w-7 h-7 mx-auto mb-1.5 rounded-lg flex items-center justify-center" style={{ backgroundColor: enhanceStage >= i ? "hsl(var(--primary) / 0.15)" : "hsl(var(--secondary))" }}>
                          {enhanceStage > i ? <CheckCircle size={13} className="text-primary" /> : i === 0 ? <Lightbulb size={13} className={enhanceStage === i ? "text-primary" : "text-muted-foreground"} /> : i === 1 ? <Wand2 size={13} className={enhanceStage === i ? "text-primary" : "text-muted-foreground"} /> : <Eye size={13} className={enhanceStage === i ? "text-primary" : "text-muted-foreground"} />}
                        </div>
                        <span className={`text-[9px] font-semibold leading-tight block ${enhanceStage >= i ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Enhanced Results */}
              {aiEnhanced && photos.length > 0 && (
                <div className="space-y-3">
                  {/* Before / After Comparisons */}
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle size={16} className="text-primary" />
                      <span className="text-sm font-bold text-foreground">AI Enhancement Complete</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-3">Before & after — see the difference our AI makes:</p>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label: "Better lighting", before: "Dark, underexposed", after: "Bright & balanced" },
                        { label: "Colour correction", before: "Dull, washed out", after: "Vibrant & true" },
                        { label: "Composition", before: "Cluttered angles", after: "Clean & inviting" }
                      ].map((item, i) => (
                        <div key={i} className="rounded-xl overflow-hidden border border-border">
                          <div className="h-16 flex items-center justify-center bg-secondary/40 text-center p-1.5">
                            <div>
                              <span className="text-[8px] font-bold text-destructive/70 uppercase block">Before</span>
                              <span className="text-[9px] text-muted-foreground leading-tight block">{item.before}</span>
                            </div>
                          </div>
                          <div className="h-16 flex items-center justify-center bg-primary/10 text-center p-1.5 border-t border-primary/20">
                            <div>
                              <span className="text-[8px] font-bold text-primary uppercase block">After</span>
                              <span className="text-[9px] text-foreground leading-tight font-medium block">{item.after}</span>
                            </div>
                          </div>
                          <div className="py-1.5 text-center bg-card border-t border-border">
                            <span className="text-[9px] font-semibold text-muted-foreground">{item.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Virtual Staging Toggle */}
                    <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${virtualStaging ? "border-primary/40 bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.1)]" : "border-border hover:border-primary/20"}`}>
                      <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${virtualStaging ? "bg-primary" : "bg-secondary"}`} onClick={e => { e.preventDefault(); setVirtualStaging(!virtualStaging); }}>
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-background shadow-lg transition-transform ${virtualStaging ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-foreground block">Apply AI Virtual Staging</span>
                        <span className="text-[10px] text-muted-foreground">Furnish empty rooms with stylish furniture</span>
                      </div>
                      <Sparkles size={14} className={`transition-colors ${virtualStaging ? "text-primary" : "text-muted-foreground"}`} />
                    </label>
                  </div>

                  {/* Human Review */}
                  <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-secondary/20 p-4 flex items-start gap-3">
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                      <Shield size={18} className="text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-foreground block mb-0.5">Professional Human Review in Progress</span>
                      <span className="text-[11px] text-muted-foreground leading-relaxed">Our expert team ensures every photo meets our high standards before listing on <span className="text-primary font-semibold">Rightmove</span> & <span className="text-primary font-semibold">Zoopla</span>.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quality Assurance */}
              <div className="rounded-2xl border border-primary/20 p-4 space-y-2" style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--primary) / 0.02))" }}>
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-primary" />
                  <span className="text-xs font-bold text-foreground">Only Excellent Photos Get Published</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  We reject or re-shoot anything that doesn't meet our quality bar. Properties with professionally enhanced photos sell up to <span className="text-foreground font-bold">20% faster</span> on <span className="text-primary font-semibold">Rightmove</span>, <span className="text-primary font-semibold">Zoopla</span> and other portals.
                </p>
              </div>

              {/* Pro Tip */}
              <div className="rounded-xl bg-secondary/30 border border-border p-3 flex items-start gap-2.5">
                <Lightbulb size={14} className="text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed"><span className="text-foreground font-semibold">Pro Tip:</span> Properties with high-quality photos attract more viewings and achieve better prices.</p>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={label}>Listing Description</label>
                  <button onClick={generateDescription} disabled={generating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50">
                    {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {generating ? "Generating…" : "Generate Professional Description with AI"}
                  </button>
                </div>
                <textarea className={`${input} min-h-[120px] resize-none`} placeholder="Write a description or let our AI generate one…" value={description} onChange={e => setDescription(e.target.value)} />
              </div>

              {/* Professional Photography */}
              <div className="border-t border-border pt-5 mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <Camera size={16} className="text-primary" />
                  <h4 className="text-sm font-bold text-foreground">Professional Photography Package</h4>
                </div>
                <p className="text-[11px] text-muted-foreground mb-4">High-resolution photos that make your property stand out and sell faster.</p>

                <div className="space-y-2.5">
                  <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${photoPackage === "standard" ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20"}`}>
                    <input type="radio" name="photoPackage" checked={photoPackage === "standard"} onChange={() => setPhotoPackage("standard")} className="mt-1 w-4 h-4 accent-primary" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground">Standard Package</span>
                        <span className="text-sm font-black text-primary tabular-nums">£149</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">20 high-quality edited photos + basic floor plan</p>
                    </div>
                  </label>

                  <label className={`relative flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${photoPackage === "premium" ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20"}`}>
                    <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-primary text-primary-foreground shadow-sm">Recommended</span>
                    <input type="radio" name="photoPackage" checked={photoPackage === "premium"} onChange={() => setPhotoPackage("premium")} className="mt-1 w-4 h-4 accent-primary" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground">Premium Package</span>
                        <span className="text-sm font-black text-primary tabular-nums">£249</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">30+ photos, twilight shots, drone photos (if suitable), virtual tour & professional floor plan</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${photoPackage === "none" ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20"}`}>
                    <input type="radio" name="photoPackage" checked={photoPackage === "none"} onChange={() => setPhotoPackage("none")} className="w-4 h-4 accent-primary" />
                    <span className="text-sm text-muted-foreground">No thanks, I'll use my own photos</span>
                  </label>
                </div>

                {photoPackagePrice > 0 && (
                  <div className="mt-3 flex items-center justify-between px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="text-xs font-semibold text-foreground">Photography add-on</span>
                    <span className="text-sm font-black text-primary tabular-nums">£{photoPackagePrice}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(1)} className="flex-1 py-3.5 text-sm font-semibold rounded-xl border border-border hover:bg-secondary transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={enterStep3} className="flex-[2] py-3.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : step === 3 ? (
            /* ── Step 3: Pricing & Marketing ── */
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Pricing & Marketing</h3>
                <p className="text-xs text-muted-foreground mb-5">Set your price and choose where to advertise.</p>
              </div>

              {/* AI Price suggestion */}
              {aiPrice && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-primary" />
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">AI Suggested Price</span>
                  </div>
                  <p className="text-3xl font-black text-foreground tabular-nums mb-1">£{aiPrice.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${aiConfidence}%` }} />
                    </div>
                    <span className="text-xs font-bold text-primary tabular-nums">{aiConfidence}% confidence</span>
                  </div>
                </div>
              )}

              <div>
                <label className={label}>Your Desired Asking Price</label>
                <input type="text" className={input} placeholder="e.g. £425,000" value={askingPrice} onChange={e => setAskingPrice(e.target.value)} />
              </div>

              <div>
                <label className={label}>Marketing Channels</label>
                <div className="space-y-2 mt-2">
                  {[
                    { label: "Rightmove", icon: Globe, state: mktRightmove, set: setMktRightmove, desc: "UK's #1 property portal" },
                    { label: "Zoopla", icon: Globe, state: mktZoopla, set: setMktZoopla, desc: "Major UK property portal" },
                    { label: "Social Media Ads", icon: Megaphone, state: mktSocial, set: setMktSocial, desc: "Targeted Facebook & Instagram" },
                    { label: "Virtual Tour", icon: Video, state: mktVirtualTour, set: setMktVirtualTour, desc: "360° interactive walkthrough" },
                  ].map(ch => (
                    <label key={ch.label} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${ch.state ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20"}`}>
                      <input type="checkbox" checked={ch.state} onChange={() => ch.set(!ch.state)} className="w-4 h-4 rounded accent-primary" />
                      <ch.icon size={16} className={ch.state ? "text-primary" : "text-muted-foreground"} />
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-foreground">{ch.label}</span>
                        <span className="text-[11px] text-muted-foreground ml-2">{ch.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(2)} className="flex-1 py-3.5 text-sm font-semibold rounded-xl border border-border hover:bg-secondary transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={() => setStep(4)} className="flex-[2] py-3.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : step === 4 ? (
            /* ── Step 4: AML Verification ── */
            <div className="space-y-5">
              <AMLStep
                amlName={amlName}
                setAmlName={setAmlName}
                amlDob={amlDob}
                setAmlDob={setAmlDob}
                amlAddress={amlAddress}
                setAmlAddress={setAmlAddress}
                amlPostcode={amlPostcode}
                setAmlPostcode={setAmlPostcode}
                amlDocType={amlDocType}
                setAmlDocType={setAmlDocType}
                amlSubmitted={amlSubmitted}
                amlSubmitting={amlSubmitting}
                onSubmitAml={handleAmlSubmit}
                inputClass={input}
                labelClass={label}
              />

              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(3)} className="flex-1 py-3.5 text-sm font-semibold rounded-xl border border-border hover:bg-secondary transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={() => setStep(5)} disabled={!amlSubmitted}
                  className="flex-[2] py-3.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            /* ── Step 5: Confirm ── */
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Confirm & Instruct</h3>
                <p className="text-xs text-muted-foreground mb-5">Review your details and launch your listing.</p>
              </div>

              <div className="rounded-xl bg-secondary/30 border border-border p-4 space-y-2.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span className="font-medium text-foreground text-right max-w-[60%] truncate">{address}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium text-foreground">{propType || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Beds / Baths</span><span className="font-medium text-foreground">{bedrooms || "—"} / {bathrooms || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Size</span><span className="font-medium text-foreground">{sqft ? `${sqft} sq ft` : "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Asking Price</span><span className="font-semibold text-primary">{askingPrice || `£${aiPrice?.toLocaleString() || "—"}`}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Photos</span><span className="font-medium text-primary">{photos.length} uploaded → <span className="font-semibold">AI Enhanced + Human Reviewed</span></span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Photography</span><span className={`font-medium ${photoPackage !== "none" ? "text-primary font-semibold" : "text-foreground"}`}>{photoPackage === "premium" ? "Premium (£249)" : photoPackage === "standard" ? "Standard (£149)" : "Own photos"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Portals</span><span className="font-medium text-foreground">{[mktRightmove && "Rightmove", mktZoopla && "Zoopla", mktSocial && "Social", mktVirtualTour && "Virtual Tour"].filter(Boolean).join(", ")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">AML Status</span><span className="font-medium text-amber-500">{amlSubmitted ? "Submitted — In Progress" : "Not Started"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Contact</span><span className="font-medium text-foreground">{name}</span></div>
              </div>

              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-xs text-muted-foreground leading-relaxed">
                Once you confirm, we will review and automatically list your property on{" "}
                <span className="text-primary font-semibold">Rightmove</span>,{" "}
                <span className="text-primary font-semibold">Zoopla</span> and other major portals within 24–48 hours.
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-border accent-primary" />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I instruct <span className="text-foreground font-semibold">Hummm</span> to act as my agent and list my property on the selected portals. I accept the{" "}
                  <span className="text-primary font-medium">terms of service</span>.
                </span>
              </label>

              <div className="flex gap-3">
                <button onClick={() => setStep(4)} className="flex-1 py-3.5 text-sm font-semibold rounded-xl border border-border hover:bg-secondary transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={handleSubmit} disabled={!agreed || submitting}
                  className="flex-[2] py-3.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ boxShadow: agreed ? "0 0 24px rgba(0,229,204,0.25)" : "none" }}
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {submitting ? "Submitting…" : "Confirm & Launch Listing"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingWizard;
