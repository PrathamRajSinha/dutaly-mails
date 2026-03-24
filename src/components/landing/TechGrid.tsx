import { useRef, useEffect } from "react";

export function TechGrid() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const groups = svg.querySelectorAll<SVGGElement>("[data-parallax]");
          groups.forEach((g) => {
            const speed = parseFloat(g.dataset.parallax || "0");
            g.setAttribute("transform", `translate(0, ${scrollY * speed})`);
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Generate hexagon points
  const hex = (cx: number, cy: number, r: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return pts.join(" ");
  };

  // Create a grid of hexagons
  const hexSize = 60;
  const cols = 30;
  const rows = 80;
  const hexagons: { x: number; y: number; layer: number }[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * hexSize * 1.75 + (row % 2 ? hexSize * 0.875 : 0);
      const y = row * hexSize * 1.5;
      const layer = (col + row) % 3;
      hexagons.push({ x, y, layer });
    }
  }

  // Some connecting lines between nearby hexagons
  const lines: { x1: number; y1: number; x2: number; y2: number; layer: number }[] = [];
  for (let i = 0; i < hexagons.length; i++) {
    for (let j = i + 1; j < Math.min(i + 4, hexagons.length); j++) {
      const dx = hexagons[j].x - hexagons[i].x;
      const dy = hexagons[j].y - hexagons[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < hexSize * 2.2 && Math.random() > 0.7) {
        lines.push({
          x1: hexagons[i].x,
          y1: hexagons[i].y,
          x2: hexagons[j].x,
          y2: hexagons[j].y,
          layer: hexagons[i].layer,
        });
      }
    }
  }

  // Dots at intersections
  const dots = hexagons.filter(() => Math.random() > 0.85);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      preserveAspectRatio="none"
    >
      {/* Layer 0 - slowest parallax */}
      <g data-parallax="-0.02" opacity="0.03">
        {hexagons
          .filter((h) => h.layer === 0)
          .map((h, i) => (
            <polygon
              key={`h0-${i}`}
              points={hex(h.x, h.y, hexSize * 0.4)}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-zinc-400"
            />
          ))}
      </g>

      {/* Layer 1 - medium parallax */}
      <g data-parallax="-0.04" opacity="0.04">
        {hexagons
          .filter((h) => h.layer === 1)
          .map((h, i) => (
            <polygon
              key={`h1-${i}`}
              points={hex(h.x, h.y, hexSize * 0.35)}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-zinc-500"
            />
          ))}
        {lines
          .filter((l) => l.layer === 1)
          .map((l, i) => (
            <line
              key={`l1-${i}`}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke="currentColor"
              strokeWidth="0.3"
              className="text-zinc-300"
            />
          ))}
      </g>

      {/* Layer 2 - fastest parallax */}
      <g data-parallax="-0.06" opacity="0.05">
        {hexagons
          .filter((h) => h.layer === 2)
          .map((h, i) => (
            <polygon
              key={`h2-${i}`}
              points={hex(h.x, h.y, hexSize * 0.3)}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-zinc-400"
            />
          ))}
        {dots.map((d, i) => (
          <circle
            key={`d-${i}`}
            cx={d.x}
            cy={d.y}
            r="1.5"
            fill="currentColor"
            className="text-zinc-300"
          />
        ))}
      </g>
    </svg>
  );
}
