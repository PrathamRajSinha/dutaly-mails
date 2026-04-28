import { useRef, useState, useCallback, useEffect, type ReactNode, type CSSProperties } from "react";

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
  const [localPos, setLocalPos] = useState({ x: 0, y: 0 });
  const [intensity, setIntensity] = useState(0);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleGlobalMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setLocalPos({ x, y });

      // Calculate distance from card edges (not center)
      const distX = Math.max(0, Math.max(rect.left - e.clientX, e.clientX - rect.right));
      const distY = Math.max(0, Math.max(rect.top - e.clientY, e.clientY - rect.bottom));
      const dist = Math.sqrt(distX * distX + distY * distY);

      const maxDist = 200;
      const newIntensity = dist <= 0 ? 1 : Math.max(0, 1 - dist / maxDist);
      setIntensity(newIntensity);
    };

    window.addEventListener("mousemove", handleGlobalMove);
    return () => window.removeEventListener("mousemove", handleGlobalMove);
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{ willChange: "auto" }}
    >
      {/* Border glow layer - proximity based */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          padding: "1px",
          background:
            intensity > 0
              ? `radial-gradient(${spotlightRadius * 0.6}px circle at ${localPos.x}px ${localPos.y}px, rgba(${glowColor}, ${0.85 * intensity}), transparent 70%)`
              : "none",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          transition: "opacity 0.3s ease",
          opacity: intensity > 0 ? 1 : 0,
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

      {/* Spotlight overlay - only when directly hovering */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background:
            intensity >= 1
              ? `radial-gradient(${spotlightRadius}px circle at ${localPos.x}px ${localPos.y}px, rgba(${glowColor}, 0.06), transparent 70%)`
              : "none",
          transition: "opacity 0.3s ease",
          opacity: intensity >= 1 ? 1 : 0,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
