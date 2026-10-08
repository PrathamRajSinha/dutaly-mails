import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logoAsset from "@/assets/dutaly-mails-logo.png.asset.json";

const navLinks = [{ label: "Product", href: "#product" }, { label: "How it works", href: "#how-it-works" }, { label: "Use cases", href: "#use-cases" }, { label: "Pricing", href: "/pricing" }];
export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { pathname } = useLocation();
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 12); onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => { if (!mobileOpen) return; const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMobileOpen(false); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [mobileOpen]);
  const href = (value: string) => value.startsWith("#") && pathname !== "/mails" ? `/mails${value}` : value;
  return <header className={`landing-nav fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${scrolled || mobileOpen ? "border-landing-line bg-landing-background/95 backdrop-blur-md" : "border-transparent bg-transparent"}`}>
    <div className="landing-wrap flex h-20 items-center justify-between gap-6">
      <Link to="/mails" aria-label="Dutaly home"><img src={logoAsset.url} alt="Dutaly" width={180} height={44} className="h-11 w-[180px] object-contain object-left" /></Link>
      <nav aria-label="Main navigation" className="hidden items-center gap-8 lg:flex">{navLinks.map(link => <Link key={link.label} to={href(link.href)} className="text-sm text-landing-muted transition-colors hover:text-landing-foreground">{link.label}</Link>)}</nav>
      <div className="hidden items-center gap-6 lg:flex">{!user && <Link to="/login" className="text-sm text-landing-foreground">Log in</Link>}<Button asChild className="landing-primary !h-10"><Link to={user ? "/dashboard" : "/signup"}>{user ? "Open inbox" : "Start free"}<ArrowRight /></Link></Button></div>
      <Button variant="ghost" size="icon" className="landing-quiet lg:hidden" onClick={() => setMobileOpen(open => !open)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} aria-controls="landing-mobile-menu">{mobileOpen ? <X /> : <Menu />}</Button>
    </div>
    {mobileOpen && <nav id="landing-mobile-menu" aria-label="Mobile navigation" className="landing-wrap flex flex-col gap-5 border-t border-landing-line py-6 lg:hidden">{navLinks.map(link => <Link key={link.label} to={href(link.href)} onClick={() => setMobileOpen(false)} className="text-landing-foreground">{link.label}</Link>)}{!user && <Link to="/login" className="text-landing-muted">Log in</Link>}<Button asChild className="landing-primary"><Link to={user ? "/dashboard" : "/signup"}>{user ? "Open inbox" : "Start free"}<ArrowRight /></Link></Button></nav>}
  </header>;
}
