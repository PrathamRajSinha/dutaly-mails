import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function FooterSection() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Mail className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-white">MailReplAI</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <a href="#features" className="hover:text-zinc-300 transition-colors">Features</a>
            <a href="#demo" className="hover:text-zinc-300 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-zinc-300 transition-colors">Pricing</a>
            <a href="#use-cases" className="hover:text-zinc-300 transition-colors">Use Cases</a>
            <Link to="/auth" className="hover:text-zinc-300 transition-colors">Sign in</Link>
          </div>
          <p className="text-xs text-zinc-600">© 2026 MailReplAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
