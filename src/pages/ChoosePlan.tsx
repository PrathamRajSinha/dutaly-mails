import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function ChoosePlan() {
  const { plans, isLoading } = useSubscription();
  const { signOut } = useAuth();

  const planFeatures: Record<string, string[]> = {
    starter: ["100 emails/month", "20 AI questions/month", "10 KB entries", "2 email accounts", "Email templates"],
    pro: ["500 emails/month", "100 AI questions/month", "50 KB entries", "5 email accounts", "Email templates", "Priority support"],
    enterprise: ["Unlimited emails", "Unlimited AI questions", "Unlimited KB entries", "Unlimited accounts", "Custom integrations", "SLA guarantee"],
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-foreground">Choose Your Plan</h1>
        <p className="mt-2 text-muted-foreground">Select a plan to get started with MailReplai</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 max-w-5xl w-full">
        {plans.map((plan) => {
          const isPro = plan.name === "pro";
          const features = planFeatures[plan.name] || [];

          return (
            <Card
              key={plan.id}
              className={`relative border ${isPro ? "border-primary shadow-lg" : "border-border"}`}
            >
              {isPro && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.display_name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {plan.name === "enterprise" ? "For large organizations" : plan.name === "pro" ? "For growing teams" : "For individuals getting started"}
                </p>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-foreground">
                    {plan.name === "enterprise" ? "Custom" : "TBD"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={isPro ? "default" : "outline"}
                  onClick={() => toast.info("Payment integration coming soon. Contact us to get started.")}
                >
                  {plan.name === "enterprise" ? "Contact Us" : "Subscribe"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button variant="ghost" className="mt-8 text-muted-foreground" onClick={signOut}>
        Sign out
      </Button>
    </div>
  );
}
