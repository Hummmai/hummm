import { useState } from "react";
import AddressLookup from "@/components/AddressLookup";
import { PRICING, type CountryCode } from "@/lib/pricing";

interface AddressLookupWrapperProps {
  value: string;
  onChange: (address: string) => void;
  onAddressSelected?: (address: string) => void;
  country?: CountryCode;
  label?: string;
  placeholder?: string;
  className?: string;
}

/**
 * AddressLookupWrapper (Phase 2 refactor)
 * 
 * Thin wrapper that provides better UX around the core AddressLookup:
 * - Clear "Use manual address" fallback button
 * - Consistent styling for audit flows
 * - Country-aware behavior
 */
export default function AddressLookupWrapper({
  value,
  onChange,
  onAddressSelected,
  country = "UK",
  label = "Property address or postcode",
  placeholder,
  className = "",
}: AddressLookupWrapperProps) {
  const [showManual, setShowManual] = useState(false);

  const effectivePlaceholder = placeholder || 
    (country === "UK" 
      ? "e.g. 42 Acacia Avenue, London SW1A 1AA or W1A 1AA" 
      : "Enter full address");

  return (
    <div className={className}>
      <AddressLookup
        value={value}
        onChange={onChange}
        onAddressSelected={onAddressSelected}
        label={label}
        placeholder={effectivePlaceholder}
        country={country}
        variant="default"
      />

      {/* Manual entry fallback - always available for robustness */}
      {!showManual && (
        <button
          type="button"
          onClick={() => setShowManual(true)}
          className="mt-2 text-[11px] text-primary/80 hover:text-primary underline underline-offset-2"
        >
          Prefer to type the full address manually?
        </button>
      )}

      {showManual && (
        <div className="mt-3">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Full address, e.g. 15 Willow Road, Bristol BS1 4EX"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <p className="mt-1 text-[10px] text-muted-foreground">
            We’ll still look up local data using the postcode if we can find one.
          </p>
        </div>
      )}
    </div>
  );
}
