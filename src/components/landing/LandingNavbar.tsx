import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Pricing", href: "#pricing" },
];

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const ctaLink = user ? "/dashboard" : "/auth";
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ["rgba(9,9,11,0)", "rgba(9,9,11,0.9)"]);
  const blur = useTransform(scrollY, [0, 80], ["blur(0px)", "blur(20px)"]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04]"
      style={{ backgroundColor: bg, backdropFilter: blur }}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
            <Mail className="h-4 w-4 text-zinc-900" />
          </div>
          <span className="text-[17px] font-bold text-white tracking-tight">dyuticAI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[13px] font-medium text-zinc-500 hover:text-zinc-200 transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link to="/dashboard">
              <Button className="bg-white text-zinc-900 hover:bg-zinc-200 rounded-full text-[13px] font-semibold h-9 px-5">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-full text-[13px] h-9 px-4">
                  Log in
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-white text-zinc-900 hover:bg-zinc-200 rounded-full text-[13px] font-semibold h-9 px-5">
                  Start free trial
                </Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-zinc-950/98 backdrop-blur-2xl border-t border-white/5 p-6 space-y-4"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-zinc-400 hover:text-white transition-colors text-[15px]"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link to={ctaLink} className="block pt-2">
            <Button className="w-full bg-white text-zinc-900 hover:bg-zinc-200 rounded-full font-semibold">
              {user ? "Dashboard" : "Start free trial"}
            </Button>
          </Link>
        </motion.div>
      )}
    </motion.header>
  );
}
