import { Link } from "react-router-dom";

export function FooterSection() {
  return (
    <footer className="border-t border-white/[0.06] py-8">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-[14px] font-medium text-white">Dutaly</span>
        <div className="flex items-center gap-6 text-[13px] text-zinc-600">
          <a href="#features" className="hover:text-zinc-300 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-zinc-300 transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-zinc-300 transition-colors">Pricing</a>
          <Link to="/auth" className="hover:text-zinc-300 transition-colors">Sign in</Link>
        </div>
        <p className="text-[11px] text-zinc-700">© 2026 Dutaly. All rights reserved.</p>
      </div>
    </footer>
  );
}
