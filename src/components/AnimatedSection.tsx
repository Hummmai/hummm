import { useInView } from "@/hooks/use-in-view";
import { ReactNode, useEffect, useState, useRef } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Pixels of parallax lift as element scrolls into view (0 = disabled) */
  parallax?: number;
}

const AnimatedSection = ({ children, className = "", delay = 0, parallax = 12 }: AnimatedSectionProps) => {
  const { ref, isInView } = useInView(0.05);
  const elRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);

  // Merge refs
  const setRefs = (node: HTMLDivElement | null) => {
    elRef.current = node;
    (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  useEffect(() => {
    if (!parallax || !isInView || !elRef.current) return;
    let raf: number;
    const onScroll = () => {
      raf = requestAnimationFrame(() => {
        if (!elRef.current) return;
        const rect = elRef.current.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 when element enters bottom, 1 when it reaches top
        const progress = Math.min(Math.max((vh - rect.top) / (vh + rect.height), 0), 1);
        setOffset((1 - progress) * parallax);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [parallax, isInView]);

  return (
    <div
      ref={setRefs}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? `translateY(${offset}px)` : "translateY(28px)",
        transition: `opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
