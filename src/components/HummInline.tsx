import hummLogo from "@/assets/logo-hummm.png";

interface HummInlineProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  xs: "h-3.5",
  sm: "h-5",
  md: "h-6",
  lg: "h-8",
  xl: "h-10",
};

const HummInline = ({ className = "", size = "md" }: HummInlineProps) => (
  <img
    src={hummLogo}
    alt="Hummm"
    className={`inline-block ${sizeMap[size]} w-auto align-middle ${className}`}
  />
);

export default HummInline;
