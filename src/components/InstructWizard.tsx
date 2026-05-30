import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import HummLogo from "./HummLogo";
import ExecutionGateModal from "./ExecutionGateModal";
import {
  MapPin, Home, PoundSterling, Target, Heart, ArrowRight, ArrowLeft,
  Radar, Shield, Mail, CheckCircle, Loader2, Users, Send, FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const STEPS = [
  { num: 1, label: "Property Intel", icon: Home },
  { num: 2, label: "Agent Scout", icon: Radar },
  { num: 3, label: "Authorization", icon: Shield },
  { num: 4, label: "AI Outbox", icon: Mail },
];

const GOALS = [
  { id: "quick_sale", label: "Quick Sale", icon: "⚡", desc: "Speed is the priority" },
  { id: "highest_price", label: "Highest Price", icon: "💎", desc: "Maximum value extraction" },
  { id: "tenant_find", label: "Tenant Find", icon: "🔍", desc: "Find the right tenant fast" },
  { id: "full_management", label: "Full Management", icon: "🏗️", desc: "End-to-end property management" },
];

const PROPERTY_TYPES = ["Detached", "Semi-Detached", "Terraced", "Flat", "Bungalow", "Maisonette"];

interface AgentResult {
  id: string;
  name: string;
  properties_sold: number;
  price_achieved: string;
  avg_days: number;
  rating: number;
  postcode: string;
  distance_miles?: number;
}

const InstructWizard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);

  // Step 1 state
  const [address, setAddress] = useState(searchParams.get("address") || "");
  const [postcode, setPostcode] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [goal, setGoal] = useState("");
  const [movingReason, setMovingReason] = useState("");

  // Step 2 state
  const [agents, setAgents] = useState<AgentResult[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [scoutPhase, setScoutPhase] = useState<"scanning" | "done">("scanning");

  // Step 3 state
  const [authorized, setAuthorized] = useState(false);
  const [feeTarget, setFeeTarget] = useState("1.0");

  // Step 4 state
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showExecutionGate, setShowExecutionGate] = useState(false);

  const canAdvanceStep1 = address.trim() && postcode.trim() && propertyType && goal;

  // Agent scout on step 2 entry
  useEffect(() => {
    if (step === 2 && agents.length === 0) {
      fetchAgents();
    }
  }, [step]);

  const fetchAgents = async () => {
    setLoadingAgents(true);
    setScoutPhase("scanning");

    try {
      // Geocode the postcode first
      const { data: geoData } = await supabase.functions.invoke("geocode-postcode", {
        body: { postcode: postcode.trim() },
      });

      if (geoData?.lat && geoData?.lng) {
        const { data, error } = await supabase.rpc("get_agents_by_radius", {
          p_lat: geoData.lat,
          p_lng: geoData.lng,
          p_radius_miles: 15,
          p_listing_type: goal === "tenant_find" || goal === "full_management" ? "lettings" : "sale",
        });

        if (!error && data) {
          setAgents((data as AgentResult[]).slice(0, 6));
        }
      }
    } catch {
      // Fallback: empty list
    }

    // Simulate scanning effect
    setTimeout(() => {
      setScoutPhase("done");
      setLoadingAgents(false);
    }, 2500);
  };

  const toggleAgent = (id: string) => {
    setSelectedAgents((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to instruct Hummm");
        navigate("/auth?redirect=/instruct");
        return;
      }

      // Create a negotiate_request as the instruction record
      const { error } = await supabase.from("negotiate_requests").insert({
        user_id: user.id,
        property_link: address,
        property_address: address,
        postcode: postcode,
        goal: goal,
        package: "instruct",
        notes: JSON.stringify({
          property_type: propertyType,
          estimated_value: estimatedValue,
          moving_reason: movingReason,
          fee_target: feeTarget,
          selected_agents: selectedAgents,
          authorized: true,
        }),
        status: "instructed",
      });

      if (error) throw error;

      // Send notification email
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          template: "notify-sell",
          to: "hello@hummm.pro",
          data: {
            address,
            postcode,
            goal,
            propertyType,
            estimatedValue,
            agentCount: selectedAgents.length,
          },
        },
      });

      setSent(true);
      toast.success("Instruction submitted! Hummm is now active.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const goNext = () => setStep((s) => Math.min(s + 1, 4));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const selectedAgentObjects = agents.filter((a) => selectedAgents.includes(a.id));

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <HummLogo logoHeight="h-8" />
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-muted-foreground">
            Instruct
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Authorize Hummm
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Let our AI represent you. We find elite agents, negotiate fees, and manage every communication.
        </p>
      </div>

      {/* Step Progress */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-10">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <div key={s.num} className="flex items-center">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[hsl(var(--humm-teal))] to-[hsl(var(--humm-teal-deep))] text-background"
                    : isDone
                    ? "bg-[hsl(var(--humm-teal))/0.2] text-[hsl(var(--humm-teal))]"
                    : "bg-muted/30 text-muted-foreground"
                }`}
              >
                {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-6 sm:w-10 h-px mx-1 ${step > s.num ? "bg-[hsl(var(--humm-teal))]" : "bg-muted/30"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Hummm Watermark */}
      <div className="relative">
        <div className="absolute -top-4 right-0 opacity-[0.04] pointer-events-none">
          <HummLogo logoHeight="h-32" />
        </div>

        {/* Step 1: Property Intel */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Home className="w-5 h-5 text-[hsl(var(--humm-teal))]" />
                Property Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Property Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--humm-teal))]" />
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 42 Rivington Street, London"
                      className="pl-10 bg-background/50 border-border/50 focus:border-[hsl(var(--humm-teal))] focus:ring-[hsl(var(--humm-teal))/0.2]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Postcode *</label>
                    <Input
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                      placeholder="e.g. EC2A 3AY"
                      className="bg-background/50 border-border/50 focus:border-[hsl(var(--humm-teal))]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Estimated Value</label>
                    <div className="relative">
                      <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={estimatedValue}
                        onChange={(e) => setEstimatedValue(e.target.value)}
                        placeholder="450,000"
                        className="pl-10 bg-background/50 border-border/50 focus:border-[hsl(var(--humm-teal))]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Property Type *</label>
                  <div className="flex flex-wrap gap-2">
                    {PROPERTY_TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setPropertyType(t)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          propertyType === t
                            ? "bg-gradient-to-r from-[hsl(var(--humm-teal))] to-[hsl(var(--humm-teal-deep))] text-background"
                            : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-[hsl(var(--humm-teal))]" />
                Your Goal *
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      goal === g.id
                        ? "border-[hsl(var(--humm-teal))] bg-[hsl(var(--humm-teal))/0.08] shadow-[0_0_20px_hsl(var(--humm-teal)/0.15)]"
                        : "border-border/50 bg-background/30 hover:border-muted-foreground/30"
                    }`}
                  >
                    <span className="text-xl mb-1 block">{g.icon}</span>
                    <span className="text-sm font-semibold text-white">{g.label}</span>
                    <span className="text-xs text-muted-foreground block mt-0.5">{g.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-3">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-[hsl(var(--humm-teal))]" />
                Why are you moving?
              </h2>
              <p className="text-xs text-muted-foreground">
                This helps our AI craft the strongest negotiation strategy. Optional but powerful.
              </p>
              <Textarea
                value={movingReason}
                onChange={(e) => setMovingReason(e.target.value)}
                placeholder="e.g. Relocating for work, downsizing, need more space for family..."
                rows={3}
                className="bg-background/50 border-border/50 focus:border-[hsl(var(--humm-teal))] resize-none"
              />
            </div>

            <Button
              onClick={goNext}
              disabled={!canAdvanceStep1}
              className="w-full h-12 bg-gradient-to-r from-[hsl(var(--humm-teal))] to-[hsl(var(--humm-teal-deep))] text-background font-bold text-sm tracking-wider hover:shadow-[0_0_30px_hsl(var(--humm-teal)/0.3)] transition-all disabled:opacity-40"
            >
              SCOUT ELITE AGENTS
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Agent Scout */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {scoutPhase === "scanning" ? (
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-12 flex flex-col items-center">
                {/* Radar Pulse */}
                <div className="relative w-32 h-32 mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-[hsl(var(--humm-teal))/0.3] animate-ping" />
                  <div className="absolute inset-4 rounded-full border-2 border-[hsl(var(--humm-teal))/0.5] animate-ping [animation-delay:0.3s]" />
                  <div className="absolute inset-8 rounded-full border-2 border-[hsl(var(--humm-teal))/0.7] animate-ping [animation-delay:0.6s]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Radar className="w-10 h-10 text-[hsl(var(--humm-teal))] animate-spin [animation-duration:3s]" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Searching for Elite Agents...</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  Analyzing sold prices, market velocity, and fee structures within 15 miles of {postcode}
                </p>
              </div>
            ) : (
              <>
                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
                    <Users className="w-5 h-5 text-[hsl(var(--humm-teal))]" />
                    Top Agents Near {postcode}
                  </h2>
                  <p className="text-xs text-muted-foreground mb-4">
                    Select the agents you want Hummm to contact on your behalf.
                  </p>

                  {agents.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground mb-2">No agents found in your area yet.</p>
                      <p className="text-xs text-muted-foreground">Hummm will assign a partner agent from our network.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {agents.map((agent) => {
                        const isSelected = selectedAgents.includes(agent.id);
                        return (
                          <button
                            key={agent.id}
                            onClick={() => toggleAgent(agent.id)}
                            className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-4 ${
                              isSelected
                                ? "border-[hsl(var(--humm-teal))] bg-[hsl(var(--humm-teal))/0.06] shadow-[0_0_15px_hsl(var(--humm-teal)/0.1)]"
                                : "border-border/50 bg-background/30 hover:border-muted-foreground/30"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isSelected ? "border-[hsl(var(--humm-teal))] bg-[hsl(var(--humm-teal))]" : "border-muted-foreground/40"
                            }`}>
                              {isSelected && <CheckCircle className="w-3 h-3 text-background" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-white text-sm">{agent.name}</span>
                                {agent.distance_miles && (
                                  <span className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded-full">
                                    {agent.distance_miles.toFixed(1)} mi
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                <span>{agent.properties_sold} sold</span>
                                <span>{agent.price_achieved} achieved</span>
                                <span>{agent.avg_days} avg days</span>
                                {agent.rating > 0 && <span>★ {agent.rating}</span>}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button onClick={goBack} variant="outline" className="flex-1 h-12 border-border/50">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button
                    onClick={goNext}
                    className="flex-[2] h-12 bg-gradient-to-r from-[hsl(var(--humm-teal))] to-[hsl(var(--humm-teal-deep))] text-background font-bold text-sm tracking-wider hover:shadow-[0_0_30px_hsl(var(--humm-teal)/0.3)]"
                  >
                    AUTHORIZE HUMM
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Digital Authorization */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--humm-teal))] to-[hsl(var(--humm-teal-deep))] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-background" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Letter of Authority</h2>
                  <p className="text-xs text-muted-foreground">Digital authorization for Hummm to act on your behalf</p>
                </div>
              </div>

              <div className="bg-background/50 rounded-xl p-5 border border-border/30 space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>I, the property owner/authorized person for:</p>
                <p className="text-white font-semibold text-base">{address}, {postcode}</p>
                <p>
                  hereby authorize <span className="text-[hsl(var(--humm-teal))] font-semibold">Hummm</span> to
                  act as my designated representative in all communications with estate agents regarding the 
                  {goal === "tenant_find" || goal === "full_management" ? " letting" : " sale"} of the above property.
                </p>
                <p>This includes but is not limited to:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Requesting marketing proposals and fee structures</li>
                  <li>Negotiating commission rates on my behalf</li>
                  <li>Managing initial agent communications</li>
                  <li>Sharing property details necessary for accurate appraisals</li>
                </ul>
                <p className="text-xs italic">
                  This authority does not extend to signing contracts or making binding financial commitments.
                  All final decisions remain with the property owner.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Target Fee Rate</label>
                <div className="flex items-center gap-3">
                  <Input
                    value={feeTarget}
                    onChange={(e) => setFeeTarget(e.target.value)}
                    placeholder="1.0"
                    className="w-24 bg-background/50 border-border/50 focus:border-[hsl(var(--humm-teal))] text-center"
                  />
                  <span className="text-sm text-muted-foreground">% + VAT</span>
                  <span className="text-xs text-muted-foreground ml-auto">UK avg: 1.2–1.8%</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-[hsl(var(--humm-teal))/0.05] border border-[hsl(var(--humm-teal))/0.15]">
                <Checkbox
                  id="authorize"
                  checked={authorized}
                  onCheckedChange={(c) => setAuthorized(c === true)}
                  className="mt-0.5 data-[state=checked]:bg-[hsl(var(--humm-teal))] data-[state=checked]:border-[hsl(var(--humm-teal))]"
                />
                <label htmlFor="authorize" className="text-sm text-white leading-relaxed cursor-pointer">
                  I authorize Hummm to act as my designated representative in all communications 
                  with estate agents for this property.
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={goBack} variant="outline" className="flex-1 h-12 border-border/50">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={goNext}
                disabled={!authorized}
                className="flex-[2] h-12 bg-gradient-to-r from-[hsl(var(--humm-teal))] to-[hsl(var(--humm-teal-deep))] text-background font-bold text-sm tracking-wider hover:shadow-[0_0_30px_hsl(var(--humm-teal)/0.3)] disabled:opacity-40"
              >
                PREVIEW AI OUTBOX
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: AI Outbox */}
        {step === 4 && !sent && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-[hsl(var(--humm-teal))]" />
                AI Outbox Preview
              </h2>
              <p className="text-xs text-muted-foreground">
                The Tactical Negotiator will send the following to {selectedAgentObjects.length || "your matched"} agent{selectedAgentObjects.length !== 1 ? "s" : ""}:
              </p>

              <div className="bg-background/70 rounded-xl border border-border/30 overflow-hidden">
                <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-[hsl(var(--humm-teal))]" />
                  <span className="text-xs text-muted-foreground">From:</span>
                  <span className="text-xs text-white font-medium">Hummm — Property Representation</span>
                </div>
                <div className="px-5 py-3 border-b border-border/30">
                  <span className="text-xs text-muted-foreground">Subject: </span>
                  <span className="text-xs text-white font-medium">
                    Market Appraisal Request — {address}
                  </span>
                </div>
                <div className="px-5 py-5 text-sm text-muted-foreground leading-relaxed space-y-3">
                  <p>Dear [Agent Name],</p>
                  <p>
                    I am representing the owner of <span className="text-white font-medium">{address}, {postcode}</span>.
                    We are preparing to bring this {propertyType?.toLowerCase() || "property"} to market
                    {goal === "quick_sale" ? " with an emphasis on speed of sale" : 
                     goal === "highest_price" ? " with the objective of achieving the highest possible price" :
                     goal === "tenant_find" ? " to find a quality tenant" :
                     " for full management services"}.
                  </p>
                  <p>
                    We are seeking a competitive instruction at <span className="text-[hsl(var(--humm-teal))] font-semibold">{feeTarget}% + VAT</span>.
                    Please provide your marketing strategy, comparable evidence, and pricing recommendation for Hummm's review.
                  </p>
                  {estimatedValue && (
                    <p>
                      The owner's current valuation expectation is in the region of £{estimatedValue}.
                    </p>
                  )}
                  <p>
                    We look forward to reviewing your proposal.
                  </p>
                  <p className="pt-2">
                    Kind regards,<br />
                    <span className="text-[hsl(var(--humm-teal))] font-semibold">Hummm — Tactical Negotiator</span><br />
                    <span className="text-xs">AI-Powered Property Representation | hummm.pro</span>
                  </p>
                </div>
              </div>

              {selectedAgentObjects.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Sending to:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgentObjects.map((a) => (
                      <span key={a.id} className="px-3 py-1 rounded-full text-xs font-medium bg-[hsl(var(--humm-teal))/0.1] text-[hsl(var(--humm-teal))] border border-[hsl(var(--humm-teal))/0.2]">
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={goBack} variant="outline" className="flex-1 h-12 border-border/50">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={() => setShowExecutionGate(true)}
                disabled={sending}
                className="flex-[2] h-12 bg-gradient-to-r from-[hsl(var(--humm-teal))] to-[hsl(var(--humm-teal-deep))] text-background font-bold text-sm tracking-wider hover:shadow-[0_0_30px_hsl(var(--humm-teal)/0.3)]"
              >
                {sending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> DISPATCHING...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> DISPATCH ECHO</>
                )}
              </Button>
            </div>

            <ExecutionGateModal
              open={showExecutionGate}
              onClose={() => setShowExecutionGate(false)}
              gateType="execution_credit"
            />
          </div>
        )}

        {/* Step 4: Sent confirmation */}
        {step === 4 && sent && (
          <div className="animate-in fade-in duration-500 text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(var(--humm-teal))] to-[hsl(var(--humm-teal-deep))] flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_hsl(var(--humm-teal)/0.3)]">
              <CheckCircle className="w-10 h-10 text-background" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Hummm Dispatched</h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">
              Hummm's Tactical Negotiator is now contacting agents on your behalf.
              You'll receive updates in your Hummm Command Center.
            </p>
            <Button
              onClick={() => navigate("/dashboard")}
              className="h-12 px-8 bg-gradient-to-r from-[hsl(var(--humm-teal))] to-[hsl(var(--humm-teal-deep))] text-background font-bold tracking-wider"
            >
              <FileCheck className="w-4 h-4 mr-2" />
              ENTER COMMAND CENTER
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructWizard;
