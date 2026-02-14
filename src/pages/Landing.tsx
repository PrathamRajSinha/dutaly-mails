import { useCallback, useState } from "react";
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY + window.scrollY });
  }, []);

  return (
    <>
      <style>{`
        @keyframes blob-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -20px) scale(1.05); }
          50% { transform: translate(-20px, 30px) scale(0.95); }
          75% { transform: translate(20px, 20px) scale(1.02); }
        }
      `}</style>
      <div
        className="dark min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30 overflow-x-hidden relative"
        onMouseMove={handleMouseMove}
      >
      {/* Mouse-tracking grid glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99,102,241,0.06), transparent 40%)`,
        }}
      />

      {/* Animated grid overlay */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"
          style={{
            maskImage: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 70%)`,
            WebkitMaskImage: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 70%)`,
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
