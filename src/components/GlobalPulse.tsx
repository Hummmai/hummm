import { useEffect, useRef } from "react";

const GlobalPulse = ({ active = false }: { active?: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 200;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let frame = 0;
    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const r = 60;

      // Globe outline
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = active ? "rgba(45,212,191,0.4)" : "rgba(45,212,191,0.15)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Latitude lines
      for (let i = -2; i <= 2; i++) {
        const y = cy + i * 18;
        const rx = Math.sqrt(Math.max(0, r * r - (i * 18) ** 2));
        ctx.beginPath();
        ctx.ellipse(cx, y, rx, 4, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(45,212,191,0.1)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Longitude lines (rotating)
      for (let i = 0; i < 3; i++) {
        const angle = (frame / 100 + i * (Math.PI / 3));
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.abs(Math.cos(angle)) * r, r, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(45,212,191,0.12)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Connection nodes
      const nodes = [
        { a: 0.3, b: 0.8 }, { a: 1.2, b: -0.4 }, { a: 2.1, b: 0.2 },
        { a: 3.5, b: -0.6 }, { a: 4.2, b: 0.5 }, { a: 5.1, b: -0.3 },
        { a: 5.8, b: 0.7 }, { a: 0.8, b: -0.7 },
      ];

      const pts = nodes.map((n) => {
        const lon = n.a + frame / 200;
        const lat = n.b;
        const x = cx + r * Math.cos(lat) * Math.sin(lon);
        const y = cy + r * Math.sin(lat);
        return { x, y, visible: Math.cos(lon) > -0.1 };
      });

      // Draw connection lines
      if (active) {
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            if (!pts[i].visible || !pts[j].visible) continue;
            const dist = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
            if (dist < 80) {
              ctx.beginPath();
              ctx.moveTo(pts[i].x, pts[i].y);
              ctx.lineTo(pts[j].x, pts[j].y);
              const alpha = Math.max(0, 0.3 - dist / 300);
              ctx.strokeStyle = `rgba(45,212,191,${alpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
      }

      // Draw nodes
      pts.forEach((p) => {
        if (!p.visible) return;
        ctx.beginPath();
        ctx.arc(p.x, p.y, active ? 3 : 2, 0, Math.PI * 2);
        ctx.fillStyle = active ? "rgba(45,212,191,0.8)" : "rgba(45,212,191,0.3)";
        ctx.fill();

        if (active) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6 + Math.sin(frame / 20) * 2, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(45,212,191,0.15)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // Pulse rings when active
      if (active) {
        const pulseR = (frame % 80) / 80 * 30 + r;
        const pulseAlpha = 1 - (frame % 80) / 80;
        ctx.beginPath();
        ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(45,212,191,${pulseAlpha * 0.2})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      frame++;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="w-[200px] h-[200px]"
      style={{ imageRendering: "auto" }}
    />
  );
};

export default GlobalPulse;
