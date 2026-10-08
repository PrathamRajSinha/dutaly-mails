import { ArrowUpRight, Link2 } from "lucide-react";
import { Link } from "react-router-dom";
export function StatsSection() {
  return <section className="border-t border-landing-line py-12"><div className="landing-wrap grid items-center gap-8 lg:grid-cols-[1fr_auto]"><div><p className="flex items-center gap-2 text-sm text-landing-foreground"><Link2 className="h-4 w-4 text-landing-accent" /> Fits the way you already work.</p><p className="mt-3 text-sm leading-relaxed text-landing-muted">Connect your inbox. Send ticket alerts to Slack or your Zapier workflows.</p></div><div className="flex flex-wrap items-center gap-7 text-base text-landing-foreground"><span>Gmail</span><span>IMAP</span><span>Slack</span><span>Zapier</span><Link to="/pricing" aria-label="View plans and integrations" className="text-landing-accent"><ArrowUpRight className="h-5 w-5" /></Link></div></div></section>;
}
