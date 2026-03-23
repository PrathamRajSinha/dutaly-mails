import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function CTASection() {
  const { user } = useAuth();
  const ctaLink = user ? "/dashboard" : "/auth";

  return (
    <section className="py-32 sm:py-40 border-t border-zinc-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold tracking-[-0.03em] text-zinc-900 leading-[1.1] max-w-[600px]">
          Never miss a customer email again.
        </h2>
        <p className="mt-5 text-[16px] text-zinc-500 max-w-[440px]">
          Turn messy inboxes into structured support. Start in minutes.
        </p>
        <div className="mt-8">
          <Link to={ctaLink}>
            <Button className="h-10 px-5 text-[13px] bg-zinc-900 text-white hover:bg-zinc-800 rounded-md font-medium">
              Start free trial
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
