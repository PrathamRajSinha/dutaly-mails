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
  return (
    <div className="relative min-h-screen bg-white text-zinc-900 overflow-x-hidden">
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
  );
}
