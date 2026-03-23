import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function FooterSection() {
  return (
    <footer className="border-t border-white/[0.04] py-10">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center">
              <Mail className="h-3.5 w-3.5 text-zinc-900" />
            </div>
            <span className="text-[15px] font-bold text-white tracking-tight">dyuticAI</span>
          </div>
          <div className="flex items-center gap-8 text-[13px] text-zinc-600">
            <a href="#features" className="hover:text-zinc-300 transition-colors duration-200">Features</a>
            <a href="#how-it-works" className="hover:text-zinc-300 transition-colors duration-200">How It Works</a>
            <a href="#pricing" className="hover:text-zinc-300 transition-colors duration-200">Pricing</a>
            <a href="#use-cases" className="hover:text-zinc-300 transition-colors duration-200">Use Cases</a>
            <Link to="/auth" className="hover:text-zinc-300 transition-colors duration-200">Sign in</Link>
          </div>
          <p className="text-[11px] text-zinc-700">© 2026 dyuticAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
