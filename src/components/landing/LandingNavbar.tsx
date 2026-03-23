import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const ctaLink = user ? "/dashboard" : "/auth";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="text-[15px] font-semibold text-white tracking-tight">
          Dutaly
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[13px] text-zinc-500 hover:text-white transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link to="/dashboard">
              <Button className="bg-white text-black hover:bg-zinc-200 text-[13px] font-medium h-8 px-4 rounded-md">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/auth" className="text-[13px] text-zinc-500 hover:text-white transition-colors">
                Log in
              </Link>
              <Link to="/auth">
                <Button className="bg-white text-black hover:bg-zinc-200 text-[13px] font-medium h-8 px-4 rounded-md">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-zinc-400" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#0A0A0B] border-t border-white/[0.06] px-6 py-5 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-[15px] text-zinc-400 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link to={ctaLink} className="block pt-2">
            <Button className="w-full bg-white text-black hover:bg-zinc-200 rounded-md font-medium">
              {user ? "Dashboard" : "Sign up"}
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
