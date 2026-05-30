import { useEffect, useRef } from "react";

interface Props {
  mouseX?: number;
  mouseY?: number;
}

const TealParticles = ({ mouseX = 0.5, mouseY = 0.5 }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });

  mouse.current.x = mouseX;
  mouse.current.y = mouseY;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; life: number; maxLife: number; glow: boolean };
    let particles: P[] = [];
    const isMobile = window.innerWidth < 768;
    const MAX_PARTICLES = isMobile ? 35 : 90;
    const SPAWN_RATE = isMobile ? 0.2 : 0.35;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    const spawn = () => {
      if (particles.length >= MAX_PARTICLES) return;
      const mx = mouse.current.x * W();
      const my = mouse.current.y * H();
      const nearMouse = Math.random() < 0.35;
      const x = nearMouse ? mx + (Math.random() - 0.5) * 250 : Math.random() * W();
      const y = nearMouse ? my + (Math.random() - 0.5) * 250 : Math.random() * H();
      const maxLife = 200 + Math.random() * 400;
      const isGlow = Math.random() < 0.12; // 12% chance of a larger glowing particle
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.35 - 0.12,
        r: isGlow ? Math.random() * 4 + 2 : Math.random() * 2.5 + 0.5,
        a: 0,
        life: 0,
        maxLife,
        glow: isGlow,
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, W(), H());

      // Subtle mouse attraction
      const mx = mouse.current.x * W();
      const my = mouse.current.y * H();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        // Gentle mouse attraction
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 300 && dist > 10) {
          p.vx += (dx / dist) * 0.008;
          p.vy += (dy / dist) * 0.008;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Damping
        p.vx *= 0.998;
        p.vy *= 0.998;

        const ratio = p.life / p.maxLife;
        p.a = ratio < 0.15 ? ratio / 0.15 : ratio > 0.7 ? (1 - ratio) / 0.3 : 1;
        p.a *= p.glow ? 0.6 : 0.45;

        if (p.life >= p.maxLife) { particles.splice(i, 1); continue; }

        // Outer glow
        const glowR = p.glow ? p.r * 4 : p.r * 2.5;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
        grad.addColorStop(0, `hsla(168, 100%, 60%, ${p.a})`);
        grad.addColorStop(0.5, `hsla(168, 100%, 50%, ${p.a * 0.3})`);
        grad.addColorStop(1, `hsla(168, 100%, 50%, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(168, 100%, 75%, ${p.a * 0.9})`;
        ctx.fill();
      }

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const ddx = particles[i].x - particles[j].x;
          const ddy = particles[i].y - particles[j].y;
          const d = ddx * ddx + ddy * ddy;
          if (d < 15000) {
            const alpha = (1 - d / 15000) * 0.1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(168, 100%, 55%, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      if (Math.random() < SPAWN_RATE) spawn();
      animId = requestAnimationFrame(draw);
    };

    const initialCount = isMobile ? 20 : 45;
    for (let i = 0; i < initialCount; i++) spawn();
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

export default TealParticles;
