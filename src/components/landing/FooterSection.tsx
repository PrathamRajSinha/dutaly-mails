import { Link } from "react-router-dom";

export function FooterSection() {
  return (
    <footer className="border-t border-zinc-200 py-10 bg-zinc-50/50">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-[15px] font-semibold text-zinc-900 tracking-tight">Dutaly</span>
        <div className="flex items-center gap-8 text-[13px] text-zinc-500">
          <a href="#features" className="hover:text-zinc-900 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-zinc-900 transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-zinc-900 transition-colors">Pricing</a>
          <Link to="/auth" className="hover:text-zinc-900 transition-colors">Sign in</Link>
        </div>
        <p className="text-[12px] text-zinc-400">© 2026 Dutaly. All rights reserved.</p>
      </div>
    </footer>
  );
}
