import { Link } from "react-router-dom";
import logoDarkBg from "@/assets/logo-dark-bg.png";

export function FooterSection() {
  return (
    <footer className="py-10" style={{ background: "#0A0A0F", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <img src={logoDarkBg} alt="Dutaly" className="h-6 w-auto" />
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            <a href="#features" className="hover:opacity-80 transition-opacity">features</a>
            <Link to="/pricing" className="hover:opacity-80 transition-opacity">pricing</Link>
            <Link to="/login" className="hover:opacity-80 transition-opacity">sign in</Link>
            <Link to="/privacy" className="hover:opacity-80 transition-opacity">privacy</Link>
            <Link to="/terms" className="hover:opacity-80 transition-opacity">terms</Link>
            <Link to="/refund" className="hover:opacity-80 transition-opacity">refund</Link>
          </div>
          <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>© 2026 Dutaly. All rights reserved.</p>
        </div>
        <div className="border-t pt-6 text-center" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-[12px] max-w-[520px] mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.2)" }}>
            Duta (दूत) means messenger or agent in Sanskrit. We build AI agents that handle your business communication - starting with email.
          </p>
        </div>
      </div>
    </footer>
  );
}
