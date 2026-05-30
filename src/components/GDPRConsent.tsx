import { Link } from "react-router-dom";

interface GDPRConsentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Use "dark" for dark-background sections like the waitlist */
  variant?: "light" | "dark";
}

const GDPRConsent = ({ checked, onChange, variant = "light" }: GDPRConsentProps) => {
  const isDark = variant === "dark";

  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`mt-0.5 w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center transition-colors ${
          checked
            ? "border-primary bg-primary"
            : isDark
              ? "border-white/30 bg-transparent"
              : "border-border bg-background"
        }`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke={isDark ? "#0A1428" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span
        className={`text-[11px] leading-relaxed ${
          isDark ? "text-white/50" : "text-muted-foreground"
        }`}
      >
        I consent to Hummm processing my data as described in the{" "}
        <Link
          to="/privacy-policy"
          target="_blank"
          className="text-primary hover:underline font-medium"
        >
          Privacy Policy
        </Link>
        .
      </span>
    </label>
  );
};

export default GDPRConsent;
