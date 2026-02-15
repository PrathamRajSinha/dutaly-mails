import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "@/hooks/useSubscription";
import { BarChart3 } from "lucide-react";

export function UsageCard() {
  const { currentPlan, usage, usagePercent } = useSubscription();

  if (!currentPlan) return null;

  const items = [
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
              className="h-2"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
