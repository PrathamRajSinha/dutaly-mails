import { Link } from "react-router-dom";
import logoDarkBg from "@/assets/logo-dark-bg.png";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Use cases", href: "#use-cases" },
];

const companyLinks = [
  { label: "About", to: "/about" },
  { label: "Pricing", to: "/pricing" },
  { label: "Sign in", to: "/login" },
];

const legalLinks = [
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  { label: "Refund", to: "/refund" },
];

const columnHeading = "font-display text-[11px] font-semibold uppercase tracking-[0.16em] mb-4";
const linkStyle = "text-[13.5px] transition-opacity hover:opacity-100";

export function FooterSection() {
  return (
    <footer className="py-16" style={{ background: "#0A0A0F", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <img src={logoDarkBg} alt="Dutaly — AI-powered email support" className="h-6 w-auto" />
            <p className="mt-5 max-w-[300px] text-[13.5px] leading-[1.75]" style={{ color: "rgba(255,255,255,0.35)" }}>
              Duta (दूत) means messenger or agent in Sanskrit. We build AI agents that handle your
              business communication — starting with email.
            </p>
          </div>

          <div>
            <p className={columnHeading} style={{ color: "rgba(255,255,255,0.5)" }}>Product</p>
            <ul className="space-y-3">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className={linkStyle} style={{ color: "rgba(255,255,255,0.42)" }}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className={columnHeading} style={{ color: "rgba(255,255,255,0.5)" }}>Company</p>
            <ul className="space-y-3">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className={linkStyle} style={{ color: "rgba(255,255,255,0.42)" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className={columnHeading} style={{ color: "rgba(255,255,255,0.5)" }}>Legal</p>
            <ul className="space-y-3">
              {legalLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className={linkStyle} style={{ color: "rgba(255,255,255,0.42)" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="mt-14 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <p className="text-[12.5px]" style={{ color: "rgba(255,255,255,0.28)" }}>
            © 2026 Dutaly. All rights reserved.
          </p>
          <p className="text-[12.5px]" style={{ color: "rgba(255,255,255,0.28)" }}>
            Built for support teams that care about answers.
          </p>
        </div>
      </div>
    </footer>
  );
}
