import { useRef, useEffect, useCallback } from "react";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export function ShinyText({
  text,
  disabled = false,
  speed = 3,
  className = "",
}: ShinyTextProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const animRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  const animate = useCallback(
    (timestamp: number) => {
      if (!spanRef.current || disabled) return;
      if (!startRef.current) startRef.current = timestamp;

      const elapsed = timestamp - startRef.current;
      const duration = speed * 1000;
      const progress = (elapsed % duration) / duration;

      // Overlay a white shine via mask
      const pos = progress * 300 - 100;
      spanRef.current.style.setProperty("--shine-pos", `${pos}%`);

      animRef.current = requestAnimationFrame(animate);
    },
    [speed, disabled]
  );

  useEffect(() => {
    if (!disabled) {
      animRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [animate, disabled]);

  return (
    <span className={`relative inline-block ${className}`}>
      {text}
      <span
        ref={spanRef}
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 45%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.5) 55%, transparent 100%)",
          backgroundSize: "200% 100%",
          backgroundPosition: "var(--shine-pos, -100%) center",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          mixBlendMode: "overlay",
        }}
      >
        {text}
      </span>
    </span>
  );
}