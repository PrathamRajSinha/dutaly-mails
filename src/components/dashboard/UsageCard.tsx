import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function UsageCard() {
  const { currentPlan, usage, usagePercent } = useSubscription();

  if (!currentPlan) return null;

  const resPercent = usagePercent("resolutions");
  const resLimit = currentPlan.resolutions_limit ?? -1;
  const resUsed = usage.resolutions_used ?? 0;

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
      {resLimit !== -1 && resPercent >= 95 && (
        <Card className="border-[#DC2626]/20">
          <CardContent className="p-4">
            <p className="text-[13px] font-medium" style={{ color: '#DC2626' }}>
              You've used {resPercent}% of your resolution quota this month.
            </p>
            <p className="text-[11px] mt-1" style={{ color: '#9490B8' }}>
              Upgrade your plan to continue auto-resolving customer emails.
            </p>
            <Link to="/choose-plan">
              <Button size="sm" variant="destructive" className="mt-2 h-7 text-[11px]">
                Upgrade Plan
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-[13px] font-medium" style={{ color: '#1A1730' }}>
            <BarChart3 className="h-4 w-4" style={{ color: '#7C6FE0' }} />
            Usage - {currentPlan.display_name} Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.label}>
              <div className="mb-1.5 flex justify-between">
                <span className="text-[11px]" style={{ color: '#9490B8' }}>{item.label}</span>
                <span className="text-[11px] font-medium" style={{ color: '#1A1730' }}>
                  {item.limit === -1 ? `${item.used} / ∞` : `${item.used} / ${item.limit}`}
                </span>
              </div>
              <div className="h-1 rounded-full" style={{ backgroundColor: '#EBE9FF' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.limit === -1 ? 0 : Math.min(item.percent, 100)}%`,
                    backgroundColor: item.percent >= 95 ? '#DC2626' : item.percent >= 80 ? '#BA7517' : '#7C6FE0',
                  }}
                />
              </div>
              {"showProjected" in item && item.showProjected && (
                <p className="text-[11px] mt-0.5" style={{ color: '#9490B8' }}>
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
