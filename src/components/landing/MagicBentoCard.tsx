import { useRef, useState, useCallback, type ReactNode, type MouseEvent } from "react";

interface RippleState {
  x: number;
  y: number;
  id: number;
}

interface MagicBentoCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  spotlightRadius?: number;
}

export function MagicBentoCard({
  children,
  className = "",
  glowColor = "124, 111, 224",
  spotlightRadius = 350,
}: MagicBentoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<RippleState[]>([]);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });

      // Tilt: max ±6deg
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = ((y - centerY) / centerY) * -6;
      const tiltY = ((x - centerX) / centerX) * 6;
      setTilt({ x: tiltX, y: tiltY });
    },
    []
  );

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  const handleClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const id = Date.now();
    setRipples((prev) => [
      ...prev,
      { x: e.clientX - rect.left, y: e.clientY - rect.top, id },
    ]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        transform: isHovered
          ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.015)`
          : "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)",
        transition: "transform 0.25s ease-out",
        willChange: "transform",
      }}
    >
      {/* Border glow layer */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          padding: "1px",
          background: isHovered
            ? `radial-gradient(${spotlightRadius * 0.6}px circle at ${mousePos.x}px ${mousePos.y}px, rgba(${glowColor}, 0.4), transparent 70%)`
            : "none",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          transition: "opacity 0.3s ease",
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Card background */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      />

      {/* Spotlight overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: isHovered
            ? `radial-gradient(${spotlightRadius}px circle at ${mousePos.x}px ${mousePos.y}px, rgba(${glowColor}, 0.08), transparent 70%)`
            : "none",
          transition: "opacity 0.3s ease",
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Click ripples */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            transform: "translate(-50%, -50%)",
            background: `rgba(${glowColor}, 0.15)`,
            animation: "magic-ripple 0.6s ease-out forwards",
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
