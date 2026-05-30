import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Search, Loader2, AlertCircle, CheckCircle, Edit3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PRICING, type CountryCode } from "@/lib/pricing";

function isPostcode(val: string): boolean {
  return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(val.trim());
}

function extractPostcode(val: string): string | null {
  const match = val.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i);
  return match ? match[0].trim().toUpperCase() : null;
}

interface AddressLookupProps {
  value: string;
  onChange: (address: string) => void;
  onPostcodeFound?: (postcode: string) => void;
  onAddressSelected?: (address: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  variant?: "default" | "dark";
  className?: string;
  /** Country context — drives lookup strategy. Defaults to "UK". */
  country?: CountryCode;
}

// Simple cooldown: minimum ms between API calls
const COOLDOWN_MS = 1500;
let lastLookupTime = 0;

const AddressLookup = ({
  value,
  onChange,
  onPostcodeFound,
  onAddressSelected,
  label = "Full address with postcode",
  placeholder = "Start typing address or postcode (e.g. WC2H 9HB)",
  required = false,
  variant = "default",
  className = "",
  country = "UK",
}: AddressLookupProps) => {
  const isUK = country === "UK";
  const countryMeta = PRICING[country];
  const effectivePlaceholder = isUK ? placeholder : countryMeta.addressHint;
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualFields, setManualFields] = useState(false);
  const [manualStreet, setManualStreet] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [manualPostcode, setManualPostcode] = useState("");
  // ── Quick premise prompt (used when postcode is valid but premise data unavailable) ──
  const [premisePrompt, setPremisePrompt] = useState<{ postcode: string; town: string } | null>(null);
  const [premiseInput, setPremiseInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastSearchedPc = useRef("");
  const placesDebounce = useRef<number | null>(null);
  const placesAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset state when country changes
  useEffect(() => {
    setSuggestions([]);
    setShowDropdown(false);
    setError(null);
    setSelected(false);
    setManualFields(false);
    setPremisePrompt(null);
  }, [country]);

  useEffect(() => {
    if (showDropdown && dropdownRef.current) {
      const timer = setTimeout(() => {
        dropdownRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [showDropdown, suggestions, searching]);

  const lookupAddresses = useCallback(async (postcode: string) => {
    // Rate-limit: prevent rapid-fire calls
    const now = Date.now();
    if (now - lastLookupTime < COOLDOWN_MS) {
      return;
    }
    lastLookupTime = now;
    lastSearchedPc.current = postcode;

    setSearching(true);
    setShowDropdown(true);
    setError(null);
    setManualMode(false);
    setSelected(false);
    setManualFields(false);
    setPremisePrompt(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("lookup-address", {
        body: { postcode: postcode.trim() },
      });

      if (fnError) throw fnError;

      // Success path: Ideal Postcodes returned full premises
      if (data?.addresses?.length > 0) {
        setSuggestions(data.addresses);
        return;
      }

      // Graceful fallback: postcode is valid but no premise data (quota or API issue)
      if (data?.needs_premise && data?.postcode) {
        setSuggestions([]);
        setPremisePrompt({ postcode: data.postcode, town: data.town || "" });
        setPremiseInput("");
        return;
      }

      if (data?.error) {
        setSuggestions([]);
        setError(data.error);
        setManualMode(true);
        console.warn(`[AddressLookup] API error for postcode "${postcode}":`, data.error);
        return;
      }

      // No results — offer manual entry (common for new builds or rural)
      setSuggestions([]);
      setError("No exact matches found. Please enter the full address manually.");
      setManualMode(true);

    } catch (err: any) {
      console.warn("[AddressLookup] Lookup failed for postcode:", postcode, err);

      // Robust fallback: still allow the user to continue with manual entry
      setSuggestions([]);
      setError("Address lookup is temporarily unavailable. You can enter the full address manually below.");
      setManualMode(true);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleFindAddress = () => {
    if (searching) return; // extra guard against double-clicks
    if (!isUK) {
      // For non-UK countries, trigger a Places autocomplete on demand
      placesSearch(value);
      return;
    }
    const val = value.trim();
    const pc = extractPostcode(val) || (isPostcode(val) ? val : null);
    if (!pc) {
      setError("Please enter a valid UK postcode (e.g. NW6 1PB).");
      return;
    }
    lookupAddresses(pc);
  };

  // Google Places autocomplete (non-UK regions)
  const placesSearch = useCallback(async (input: string) => {
    const q = input.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    placesAbort.current?.abort();
    const ctl = new AbortController();
    placesAbort.current = ctl;
    setSearching(true);
    setShowDropdown(true);
    setError(null);
    setManualMode(false);
    setSelected(false);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("google-places-autocomplete", {
        body: {
          input: q,
          regionCodes: countryMeta.regionCodes,
          languageCode: countryMeta.locale,
        },
      });
      if (ctl.signal.aborted) return;
      if (fnError) throw fnError;
      if (data?.error) {
        setSuggestions([]);
        setError(data.error);
        setManualMode(true);
        return;
      }
      const list = (data?.predictions || []).map((p: any) => p.description as string).filter(Boolean);
      if (list.length === 0) {
        setError("No matching addresses found.");
        setManualMode(true);
      }
      setSuggestions(list);
    } catch (err) {
      if ((err as any)?.name === "AbortError") return;
      console.warn("[AddressLookup] Places search failed:", err);
      setError("Address lookup unavailable right now.");
      setManualMode(true);
    } finally {
      if (!ctl.signal.aborted) setSearching(false);
    }
  }, [countryMeta.regionCodes, countryMeta.locale]);

  const handleSelect = (addr: string) => {
    onChange(addr);
    setShowDropdown(false);
    setSuggestions([]);
    setError(null);
    setSelected(true);
    setManualFields(false);
    const pc = extractPostcode(addr);
    if (pc && onPostcodeFound) onPostcodeFound(pc);
    if (onAddressSelected) onAddressSelected(addr);
  };

  const handleChange = (val: string) => {
    onChange(val);
    setSelected(false);
    setError(null);
    if (!isUK) {
      // Debounced autocomplete for non-UK
      if (placesDebounce.current) window.clearTimeout(placesDebounce.current);
      placesDebounce.current = window.setTimeout(() => placesSearch(val), 350);
    }
  };

  const openManualEntry = () => {
    setShowDropdown(false);
    setError(null);
    setManualFields(true);
    setManualStreet("");
    setManualCity("");
    setManualPostcode(lastSearchedPc.current || "");
  };

  const confirmPremise = () => {
    if (!premisePrompt) return;
    const house = premiseInput.trim();
    if (!house) return;
    const town = premisePrompt.town ? `, ${premisePrompt.town}` : "";
    const fullAddr = `${house}${town}, ${premisePrompt.postcode}`;
    onChange(fullAddr);
    setShowDropdown(false);
    setPremisePrompt(null);
    setSelected(true);
    if (onPostcodeFound) onPostcodeFound(premisePrompt.postcode);
    if (onAddressSelected) onAddressSelected(fullAddr);
  };

  const confirmManualEntry = () => {
    const parts = [manualStreet, manualCity, manualPostcode].filter(Boolean);
    const fullAddr = parts.join(", ");
    if (!fullAddr.trim()) return;
    onChange(fullAddr);
    setSelected(true);
    setManualFields(false);
    const pc = extractPostcode(fullAddr);
    if (pc && onPostcodeFound) onPostcodeFound(pc);
    if (onAddressSelected) onAddressSelected(fullAddr);
  };

  const isDark = variant === "dark";

  const inputClasses = `${isDark
    ? "w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-[#00E5CC]/50 focus:ring-1 focus:ring-[#00E5CC]/30 text-sm"
    : "w-full pl-10 pr-4 py-3.5 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-sm"
  } ${selected ? "address-success" : ""}`;

  const buttonClasses = `${isDark
    ? "flex items-center gap-2 px-4 sm:px-5 py-3 text-xs font-bold rounded-xl bg-[#00E5CC] text-[#0A1428] hover:bg-[#00E5CC]/90 transition-all whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
    : "flex items-center gap-2 px-4 sm:px-5 py-3.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
  } humm-pulse`;

  const dropdownClasses = isDark
    ? "absolute z-50 left-0 right-0 mt-2 bg-[#0F1D32] border border-white/10 rounded-2xl shadow-2xl max-h-[min(20rem,50vh)] overflow-y-auto overscroll-contain"
    : "absolute z-50 left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl max-h-[min(20rem,50vh)] overflow-y-auto overscroll-contain";

  const itemClasses = isDark
    ? "w-full text-left px-4 py-3.5 text-sm text-white/90 hover:bg-[#00E5CC]/10 hover:text-[#00E5CC] active:bg-[#00E5CC]/20 transition-colors flex items-start gap-3 border-b border-white/5 last:border-0"
    : "w-full text-left px-4 py-3.5 text-sm text-foreground hover:bg-primary/5 hover:text-primary active:bg-primary/10 transition-colors flex items-start gap-3 border-b border-border/50 last:border-0";

  const manualInputCls = isDark
    ? "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/25 focus:outline-none focus:border-[#00E5CC]/50 text-sm"
    : "w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-sm";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className={`block mb-1.5 ${isDark ? "text-white/50 uppercase tracking-wider text-xs font-semibold" : "text-sm font-medium text-muted-foreground"}`}>
          {label} {required && "*"}
        </label>
      )}

      {!manualFields ? (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <MapPin size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30" : "text-muted-foreground"}`} />
              <input
                type="text"
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                autoComplete="off"
                className={inputClasses}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleFindAddress(); } }}
              />
            </div>
            <button type="button" onClick={handleFindAddress} disabled={searching || !value.trim()} className={buttonClasses}>
              {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              <span className="hidden sm:inline">{searching ? "Searching..." : "Find Address"}</span>
              <span className="sm:hidden">{searching ? "..." : "Find"}</span>
            </button>
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div ref={dropdownRef} className={dropdownClasses}>
              {searching && (
                <div className="flex items-center gap-3 p-5">
                  <Loader2 size={18} className="animate-spin text-primary" />
                  <div>
                    <span className={`text-sm font-semibold block ${isDark ? "text-white/80" : "text-foreground"}`}>
                      Finding all addresses in this postcode…
                    </span>
                    <span className={`text-xs block mt-0.5 ${isDark ? "text-white/40" : "text-muted-foreground"}`}>
                      Searching for every house, flat, and building
                    </span>
                  </div>
                </div>
              )}

              {!searching && suggestions.length > 0 && (
                <>
                  <div className={`sticky top-0 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm ${isDark ? "text-[#00E5CC]/70 bg-[#0F1D32]/95" : "text-primary/70 bg-card/95"}`}>
                    {suggestions.length} addresses found — tap to select
                  </div>
                  {suggestions.map((addr, i) => (
                    <button key={i} type="button" onClick={() => handleSelect(addr)} className={itemClasses}>
                      <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
                      <span>{addr}</span>
                    </button>
                  ))}
                  {/* Manual entry link at bottom of results */}
                  <button
                    type="button"
                    onClick={openManualEntry}
                    className={`w-full text-left px-4 py-3 text-xs font-semibold flex items-center gap-2 ${isDark ? "text-[#00E5CC]/60 hover:text-[#00E5CC] hover:bg-[#00E5CC]/5" : "text-primary/60 hover:text-primary hover:bg-primary/5"} transition-colors`}
                  >
                    <Edit3 size={12} /> Can't find your address? Enter manually
                  </button>
                </>
              )}

              {!searching && error && (
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className={`text-sm ${isDark ? "text-white/60" : "text-muted-foreground"}`}>{error}</p>
                  </div>
                  <button
                    type="button"
                    onClick={openManualEntry}
                    className={`inline-flex items-center gap-2 text-sm font-semibold ${isDark ? "text-[#00E5CC]" : "text-primary"} hover:underline`}
                  >
                    <Edit3 size={13} /> Can't find your address? Enter manually
                  </button>
                </div>
              )}

              {!searching && premisePrompt && (
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className={`text-sm font-semibold ${isDark ? "text-white/90" : "text-foreground"}`}>
                        Postcode confirmed: {premisePrompt.postcode}{premisePrompt.town ? ` · ${premisePrompt.town}` : ""}
                      </p>
                      <p className={`text-xs mt-0.5 ${isDark ? "text-white/50" : "text-muted-foreground"}`}>
                        Just add your house number or name to complete.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={premiseInput}
                      onChange={(e) => setPremiseInput(e.target.value)}
                      placeholder="e.g. 14 Oakwood Drive · Flat 3, 22 King St"
                      autoFocus
                      className={manualInputCls + " flex-1"}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); confirmPremise(); } }}
                    />
                    <button
                      type="button"
                      onClick={confirmPremise}
                      disabled={!premiseInput.trim()}
                      className={buttonClasses}
                    >
                      <CheckCircle size={14} /> Confirm
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={openManualEntry}
                    className={`text-xs font-semibold ${isDark ? "text-white/40 hover:text-white/60" : "text-muted-foreground hover:text-foreground"} transition-colors`}
                  >
                    Need to edit town/postcode? Enter full address manually
                  </button>
                </div>
              )}
            </div>
          )}

          {selected && (
            <p className={`text-xs mt-1.5 flex items-center gap-1 ${isDark ? "text-[#00E5CC]/70" : "text-primary/70"}`}>
              <CheckCircle size={11} /> Address selected
            </p>
          )}
        </>
      ) : (
        /* ── Manual entry fields ── */
        <div className="space-y-3">
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDark ? "text-white/50" : "text-muted-foreground"}`}>Street address *</label>
            <input
              type="text"
              value={manualStreet}
              onChange={(e) => setManualStreet(e.target.value)}
              placeholder="e.g. 14 Oakwood Drive"
              className={manualInputCls}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? "text-white/50" : "text-muted-foreground"}`}>City / Town *</label>
              <input
                type="text"
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
                placeholder="e.g. Manchester"
                className={manualInputCls}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? "text-white/50" : "text-muted-foreground"}`}>Postcode *</label>
              <input
                type="text"
                value={manualPostcode}
                onChange={(e) => setManualPostcode(e.target.value)}
                placeholder="e.g. M20 2TG"
                className={manualInputCls}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={confirmManualEntry}
              disabled={!manualStreet.trim() || !manualCity.trim() || !manualPostcode.trim()}
              className={buttonClasses}
            >
              <CheckCircle size={14} /> Confirm Address
            </button>
            <button
              type="button"
              onClick={() => setManualFields(false)}
              className={`text-xs font-semibold ${isDark ? "text-white/40 hover:text-white/60" : "text-muted-foreground hover:text-foreground"} transition-colors`}
            >
              ← Back to search
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressLookup;
