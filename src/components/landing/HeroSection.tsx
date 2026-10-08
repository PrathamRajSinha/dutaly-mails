import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/landing-correspondence.jpg";
import { LandingInboxPreview } from "./LandingInboxPreview";

export function HeroSection() {
  const { user } = useAuth();
  const [typed, setTyped] = useState("");
  const [cursor, setCursor] = useState(true);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setTyped("Handled."); setCursor(false); return; }
    let index = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => { index += 1; setTyped("Handled.".slice(0, index)); if (index >= 8) { clearInterval(interval); timeout = setTimeout(() => setCursor(false), 600); } }, 150);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);
  return <>
    <section className="landing-hero">
      <img className="landing-hero-photo" src={heroImage} alt="A sculptural stack of paper envelopes" width={1536} height={1024} fetchPriority="high" />
      <div className="landing-wrap landing-hero-content">
        <p className="landing-label mb-7"><span>Meet your email agent</span></p>
        <h1>Dutaly<span className="text-landing-accent">.</span></h1>
        <p className="landing-hero-deck mt-5 font-display">Customer email. <span className="relative inline-block min-w-[155px] text-landing-accent" aria-label="Handled."><span aria-hidden="true">{typed}{cursor && <span className="animate-pulse">|</span>}</span></span></p>
        <p className="mt-6 max-w-[450px] text-base leading-[1.8] text-landing-foreground/75">An AI inbox that knows your business, answers the everyday questions, and brings you the ones that need a human.</p>
        <div className="mt-8 flex flex-wrap items-center gap-3"><Button asChild className="landing-primary"><Link to={user ? "/dashboard" : "/signup"}>{user ? "Open your inbox" : "Start free"}<ArrowRight /></Link></Button><Button asChild variant="ghost" className="landing-secondary"><a href="#product">Explore Dutaly<ArrowDown /></a></Button></div>
        <p className="mt-5 text-xs text-landing-muted">Gmail & IMAP · Your knowledge. Your rules.</p>
      </div>
    </section>
    <section id="product" className="scroll-mt-24 border-t border-landing-line py-12 sm:py-16">
      <div className="landing-wrap">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><p className="landing-label"><span>01</span> One inbox. A little more intelligence.</p><a href="#how-it-works" className="flex items-center gap-2 text-sm text-landing-muted hover:text-landing-foreground">From email to answer<ArrowRight className="h-4 w-4" /></a></div>
        <LandingInboxPreview />
      </div>
    </section>
  </>;
}
