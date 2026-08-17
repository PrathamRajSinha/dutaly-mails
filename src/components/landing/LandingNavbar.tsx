import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logoDarkBg from "@/assets/logo-dark-bg.png";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Use cases", href: "#use-cases" },
  { label: "Pricing", href: "/pricing" },
];

const linkClass =
  "font-display text-[13px] font-medium transition-colors duration-200 hover:text-white";

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const ctaLink = user ? "/dashboard" : "/signup";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 transition-colors duration-300"
      style={{
        background: scrolled ? "rgba(10,10,15,0.82)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.08)" : "transparent"}`,
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Link to="/mails" aria-label="Dutaly home">
          <img src={logoDarkBg} alt="Dutaly — AI-powered email support" className="h-6 w-auto" />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <Link key={link.label} to={link.href} className={linkClass} style={{ color: "rgba(255,255,255,0.6)" }}>
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} className={linkClass} style={{ color: "rgba(255,255,255,0.6)" }}>
                {link.label}
              </a>
            )
          )}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          {user ? (
            <Link to="/dashboard">
              <Button
                className="font-display h-9 border-0 px-5 text-[13px] font-semibold text-white"
                style={{ background: "#7C6FE0", borderRadius: "8px", boxShadow: "0 8px 22px -10px rgba(124,111,224,0.8)" }}
              >
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className={linkClass} style={{ color: "rgba(255,255,255,0.6)" }}>
                Log in
              </Link>
              <Link to="/signup">
                <Button
                  className="font-display h-9 border-0 px-5 text-[13px] font-semibold text-white"
                  style={{ background: "#7C6FE0", borderRadius: "8px", boxShadow: "0 8px 22px -10px rgba(124,111,224,0.8)" }}
                >
                  Start free
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          style={{ color: "rgba(255,255,255,0.6)" }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="space-y-3 border-t px-6 py-5 md:hidden"
          style={{ background: "#0A0A0F", borderColor: "rgba(255,255,255,0.08)" }}
        >
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.label}
                to={link.href}
                className="font-display block text-[15px] font-medium"
                style={{ color: "rgba(255,255,255,0.62)" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="font-display block text-[15px] font-medium"
                style={{ color: "rgba(255,255,255,0.62)" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            )
          )}
          <Link to={ctaLink} className="block pt-2">
            <Button className="font-display w-full font-semibold text-white" style={{ background: "#7C6FE0", borderRadius: "8px" }}>
              {user ? "Dashboard" : "Start free"}
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
