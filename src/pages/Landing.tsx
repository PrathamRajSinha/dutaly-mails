import { useCallback, useRef } from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustedBySection } from "@/components/landing/TrustedBySection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { InteractiveDemoSection } from "@/components/landing/InteractiveDemoSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CTASection } from "@/components/landing/CTASection";
import { FooterSection } from "@/components/landing/FooterSection";

export default function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty("--mouse-x", `${e.clientX}px`);
    el.style.setProperty("--mouse-y", `${e.clientY}px`);
  }, []);

  return (
    <>
      <style>{`
        @keyframes blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          20% { transform: translate(80px, -60px) scale(1.1); }
          40% { transform: translate(-40px, 80px) scale(0.9); }
          60% { transform: translate(60px, 40px) scale(1.05); }
          80% { transform: translate(-70px, -30px) scale(0.95); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          15% { transform: translate(-90px, 50px) scale(1.08); }
          35% { transform: translate(70px, -70px) scale(0.92); }
          55% { transform: translate(-50px, -60px) scale(1.06); }
          75% { transform: translate(80px, 40px) scale(0.96); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate(-50%, 0) scale(1); }
          25% { transform: translate(calc(-50% + 60px), -50px) scale(1.12); }
          50% { transform: translate(calc(-50% - 80px), 60px) scale(0.88); }
          75% { transform: translate(calc(-50% + 40px), 30px) scale(1.04); }
        }
      `}</style>
      <div
        ref={containerRef}
        className="dark min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30 overflow-x-hidden relative"
        onMouseMove={handleMouseMove}
        style={{ "--mouse-x": "50vw", "--mouse-y": "50vh" } as React.CSSProperties}
      >
        {/* Mouse-tracking grid glow — uses CSS vars, no re-renders */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background: "radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(99,102,241,0.06), transparent 40%)",
          }}
        />

        {/* Animated grid overlay */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div
            className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"
            style={{
              maskImage: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), black 0%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), black 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10">
          <LandingNavbar />
          <HeroSection />
          <TrustedBySection />
          <FeaturesSection />
          <InteractiveDemoSection />
          <StatsSection />
          <TestimonialsSection />
          <PricingSection />
          <CTASection />
          <FooterSection />
        </div>
      </div>
    </>
  );
}
