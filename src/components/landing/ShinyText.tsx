import { useRef, useEffect, useCallback } from "react";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  color?: string;
  shineColor?: string;
  spread?: number;
}

export function ShinyText({
  text,
  disabled = false,
  speed = 2,
  className = "",
  color = "transparent",
  shineColor = "rgba(255, 255, 255, 0.6)",
  spread = 120,
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
      const position = progress * 200;

      spanRef.current.style.backgroundPosition = `${position}% center`;
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
    <span
      ref={spanRef}
      className={className}
      style={{
        backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        display: "inline-block",
      }}
    >
      {text}
    </span>
  );
}
