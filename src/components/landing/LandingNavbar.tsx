import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logoDarkBg from "@/assets/logo-dark-bg.png";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { label: "features", href: "#features" },
  { label: "how it works", href: "#how-it-works" },
  { label: "use cases", href: "#use-cases" },
  { label: "pricing", href: "/pricing" },
];

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const ctaLink = user ? "/dashboard" : "/signup";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: "#0A0A0F", borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/mails">
          <img src={logoDarkBg} alt="Dutaly" className="h-6 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.label}
                to={link.href}
                className="text-[13px] font-medium transition-colors duration-200 hover:opacity-80"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-[13px] font-medium transition-colors duration-200 hover:opacity-80"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link to="/dashboard">
              <Button className="text-[13px] font-medium h-9 px-5 text-white border-0" style={{ background: "#7C6FE0", borderRadius: "6px" }}>
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-[13px] font-medium transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>
                Log in
              </Link>
              <Link to="/signup">
                <Button className="text-[13px] font-medium h-9 px-5 text-white border-0" style={{ background: "#7C6FE0", borderRadius: "6px" }}>
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" style={{ color: "rgba(255,255,255,0.5)" }} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-6 py-5 space-y-3 border-t" style={{ background: "#0A0A0F", borderColor: "rgba(255,255,255,0.08)" }}>
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.label}
                to={link.href}
                className="block text-[15px] font-medium"
                style={{ color: "rgba(255,255,255,0.5)" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="block text-[15px] font-medium"
                style={{ color: "rgba(255,255,255,0.5)" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            )
          )}
          <Link to={ctaLink} className="block pt-2">
            <Button className="w-full text-white font-medium" style={{ background: "#7C6FE0", borderRadius: "6px" }}>
              {user ? "Dashboard" : "Sign up"}
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
