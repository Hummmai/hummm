import hummBird from "@/assets/humm-bird.png";

interface HummPulseLoaderProps {
  size?: number;
  label?: string;
  className?: string;
}

const HummPulseLoader = ({ size = 40, label = "Loading…", className = "" }: HummPulseLoaderProps) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            background: "radial-gradient(circle, rgba(114,241,184,0.25) 0%, transparent 70%)",
            transform: "scale(1.6)",
          }}
        />
        {/* Bird icon */}
        <img
          src={hummBird}
          alt=""
          width={size}
          height={size}
          className="relative z-10 object-contain animate-pulse drop-shadow-[0_0_12px_rgba(114,241,184,0.4)]"
        />
      </div>
      {label && (
        <p className="text-xs font-medium tracking-wide text-muted-foreground animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
};

export default HummPulseLoader;
