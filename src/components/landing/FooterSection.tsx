import { Link } from "react-router-dom";

export function FooterSection() {
  return (
    <footer className="py-10" style={{ background: "#0A0A0F", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <span className="text-[15px] font-semibold tracking-tight" style={{ color: "#E8E4FF" }}>dutaly</span>
          <div className="flex items-center gap-8 text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            <a href="#features" className="hover:opacity-80 transition-opacity">features</a>
            <a href="#how-it-works" className="hover:opacity-80 transition-opacity">how it works</a>
            <Link to="/pricing" className="hover:opacity-80 transition-opacity">pricing</Link>
            <Link to="/auth" className="hover:opacity-80 transition-opacity">sign in</Link>
          </div>
          <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>© 2026 Dutaly. All rights reserved.</p>
        </div>
        <div className="border-t pt-6 text-center" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-[12px] max-w-[520px] mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.2)" }}>
            Duta (दूत) means messenger or agent in Sanskrit. We build AI agents that handle your business communication — starting with email.
          </p>
        </div>
      </div>
    </footer>
  );
}
