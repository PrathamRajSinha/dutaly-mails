import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "@/hooks/useSubscription";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function UsageCard() {
  const { currentPlan, usage, usagePercent } = useSubscription();

  if (!currentPlan) return null;

  const resPercent = usagePercent("resolutions");
  const resLimit = currentPlan.resolutions_limit ?? -1;
  const resUsed = usage.resolutions_used ?? 0;

  // Project remaining resolutions
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const projected = dayOfMonth > 0 ? Math.round((resUsed / dayOfMonth) * daysInMonth) : 0;

  const items = [
    {
      label: "Resolutions used",
      used: resUsed,
      limit: resLimit,
      percent: resPercent,
      projected,
      showProjected: resLimit !== -1,
    },
    {
      label: "Emails processed",
      used: usage.emails_processed,
      limit: currentPlan.emails_per_month,
      percent: usagePercent("emails"),
    },
    {
      label: "AI questions",
      used: usage.ai_questions_asked,
      limit: currentPlan.ai_questions_per_month,
      percent: usagePercent("ai_questions"),
    },
  ];

  return (
    <>
      {/* Upgrade banner at 95% */}
      {resLimit !== -1 && resPercent >= 95 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-destructive">
              You've used {resPercent}% of your resolution quota this month.
            </p>
            <p className="text-xs text-destructive/80 mt-1">
              Upgrade your plan to continue auto-resolving customer emails.
            </p>
            <Link to="/choose-plan">
              <Button size="sm" variant="destructive" className="mt-2">
                Upgrade Plan
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
            <BarChart3 className="h-5 w-5 text-primary" />
            Usage — {currentPlan.display_name} Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-card-foreground">
                  {item.limit === -1 ? `${item.used} / ∞` : `${item.used} / ${item.limit}`}
                </span>
              </div>
              <Progress
                value={item.limit === -1 ? 0 : item.percent}
                className={cn(
                  "h-2",
                  item.percent >= 95 && "bg-destructive/20 [&>div]:bg-destructive",
                  item.percent >= 80 && item.percent < 95 && "bg-orange-500/20 [&>div]:bg-orange-500"
                )}
              />
              {"showProjected" in item && item.showProjected && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Projected: ~{item.projected} by end of month
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
