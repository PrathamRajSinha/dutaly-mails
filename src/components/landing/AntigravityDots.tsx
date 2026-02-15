import { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  alpha: number;
  vx: number;
  vy: number;
}

interface AntigravityDotsProps {
  count?: number;
  color?: string;
  magnetRadius?: number;
  particleSize?: number;
  className?: string;
}

export function AntigravityDots({
  count = 200,
  color = "255, 255, 255",
  magnetRadius = 120,
  particleSize = 2,
  className = "",
}: AntigravityDotsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);
  const dprRef = useRef(1);

  const initParticles = useCallback(
    (width: number, height: number) => {
      const particles: Particle[] = [];
      // Create a grid-like distribution with some randomness
      const cols = Math.ceil(Math.sqrt(count * (width / height)));
      const rows = Math.ceil(count / cols);
      const spacingX = width / cols;
      const spacingY = height / rows;

      for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * spacingX + spacingX / 2 + (Math.random() - 0.5) * spacingX * 0.6;
        const y = row * spacingY + spacingY / 2 + (Math.random() - 0.5) * spacingY * 0.6;

        particles.push({
          x,
          y,
          baseX: x,
          baseY: y,
          size: particleSize * (0.5 + Math.random() * 0.8),
          alpha: 0.15 + Math.random() * 0.35,
          vx: 0,
          vy: 0,
        });
      }
      particlesRef.current = particles;
    },
    [count, particleSize]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      initParticles(rect.width, rect.height);
    };

    resize();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const mouse = mouseRef.current;
      const particles = particlesRef.current;

      for (const p of particles) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < magnetRadius) {
          // Push particles away from mouse (antigravity)
          const force = (magnetRadius - dist) / magnetRadius;
          const angle = Math.atan2(dy, dx);
          p.vx -= Math.cos(angle) * force * 3;
          p.vy -= Math.sin(angle) * force * 3;
        }

        // Return to base position with spring
        p.vx += (p.baseX - p.x) * 0.03;
        p.vy += (p.baseY - p.y) * 0.03;

        // Damping
        p.vx *= 0.9;
        p.vy *= 0.9;

        p.x += p.vx;
        p.y += p.vy;

        // Glow when displaced
        const displacement = Math.sqrt(
          (p.x - p.baseX) ** 2 + (p.y - p.baseY) ** 2
        );
        const glowAlpha = Math.min(p.alpha + displacement * 0.01, 0.8);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${glowAlpha})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", resize);
    };
  }, [initParticles, magnetRadius, color]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: "auto" }}
    />
  );
}
