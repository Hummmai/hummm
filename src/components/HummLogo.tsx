import { Link } from "react-router-dom";
import hummLogo from "@/assets/logo-hummm.png";

interface HummLogoProps {
  className?: string;
  logoHeight?: string;
  linkHome?: boolean;
  animate?: boolean;
}

const HummLogo = ({ className = "", logoHeight = "h-10 sm:h-12", linkHome = true, animate = false }: HummLogoProps) => {
  const img = (
    <span className={`relative inline-flex items-center ${linkHome ? "cursor-pointer" : ""} ${className}`}>
      <img
        src={hummLogo}
        alt="Hummm"
        className={`${logoHeight} w-auto ${animate ? "humm-logo-float" : ""}`}
      />
    </span>
  );

  if (linkHome) {
    return <Link to="/" aria-label="Go to homepage">{img}</Link>;
  }

  return img;
};

export default HummLogo;