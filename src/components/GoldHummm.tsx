import hummBird from "@/assets/humm-bird.png";

const MINT = "#72F1B8";
const MINT_DARK = "#2FD1B5";

interface GoldHummmProps {
  size?: number;
  className?: string;
  pulse?: boolean;
  showLabel?: boolean;
}

const GoldHummm = ({ size = 20, className = "", pulse = true, showLabel = false }: GoldHummmProps) => {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`relative inline-flex items-center justify-center ${pulse ? "volt-pulse" : ""}`}
        style={{ borderRadius: "9999px" }}
      >
        <img
          src={hummBird}
          alt="Hummm Bird"
          width={size}
          height={size}
          className="drop-shadow-sm object-contain humm-bird-flutter"
        />
      </span>
      {showLabel && (
        <span
          className="text-[10px] font-black uppercase tracking-wider bg-clip-text text-transparent"
          style={{ backgroundImage: `linear-gradient(to right, #ffffff, ${MINT})` }}
        >
          Hummm
        </span>
      )}
    </span>
  );
};

export default GoldHummm;
