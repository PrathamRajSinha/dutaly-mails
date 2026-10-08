import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
export function CTASection() {
  const { user } = useAuth();
  return <section className="landing-band bg-landing-surface"><div className="landing-wrap grid items-end gap-10 md:grid-cols-[1.5fr_1fr]"><div><p className="landing-label mb-8"><span>Your next chapter</span></p><h2 className="landing-title">A little less inbox.<br /><em>A little more possibility.</em></h2></div><div className="md:justify-self-end"><p className="mb-6 max-w-[340px] text-base leading-[1.8] text-landing-muted">Give your customer emails a thoughtful first response. Keep the final say.</p><div className="flex flex-wrap gap-3"><Button asChild className="landing-primary"><Link to={user ? "/dashboard" : "/signup"}>{user ? "Open your inbox" : "Start free"}<ArrowRight /></Link></Button><Button asChild variant="ghost" className="landing-secondary"><Link to="/pricing">See pricing</Link></Button></div></div></div></section>;
}
