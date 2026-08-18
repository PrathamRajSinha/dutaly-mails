import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { BarChart3, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScopeIndicator } from "./ScopeIndicator";

export function UsageCard() {
  const { currentPlan, usage, usagePercent, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-3">
          <div className="h-4 w-32 bg-slate-100 rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-full bg-slate-50 rounded" />
              <div className="h-2 w-full bg-slate-100 rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!currentPlan) {
    return (
      <Card>
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center mb-3">
            <Info className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-[13px] font-medium text-[#1A1730]">No active plan</p>
          <p className="text-[11px] text-[#64748B] mt-1">Choose a plan to see usage stats.</p>
          <Link to="/choose-plan" className="mt-4">
            <Button size="sm" variant="outline">Choose Plan</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const resPercent = usagePercent("resolutions");
  const resLimit = currentPlan.resolutions_limit ?? -1;
  const resUsed = usage.resolutions_used ?? 0;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const projected = dayOfMonth > 0 ? Math.round((resUsed / dayOfMonth) * daysInMonth) : 0;

  const items = [
    {
      label: "Resolutions",
      used: resUsed,
      limit: resLimit,
      percent: resPercent,
      projected,
      showProjected: resLimit !== -1,
    },
    {
      label: "Emails Processed",
      used: usage.emails_processed,
      limit: currentPlan.emails_per_month,
      percent: usagePercent("emails"),
    },
    {
      label: "AI Support Actions",
      used: usage.ai_questions_asked,
      limit: currentPlan.ai_questions_per_month,
      percent: usagePercent("ai_questions"),
    },
  ];

  return (
    <div className="space-y-4">
      {resLimit !== -1 && resPercent >= 90 && (
        <Card className="border-red-100 bg-red-50/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <BarChart3 className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-red-700">
                  Quota Alert
                </p>
                <p className="text-[11px] mt-0.5 text-red-600/80 leading-normal">
                  You've used {resPercent}% of your {currentPlan.display_name} resolution quota.
                </p>
                <Link to="/choose-plan">
                  <Button size="sm" variant="destructive" className="mt-3 h-7 text-[11px] px-3 shadow-sm">
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-slate-200/60 overflow-hidden">
        <CardHeader className="pb-3 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[13px] font-bold text-[#1A1730]">
              <BarChart3 className="h-4 w-4 text-[#7C6FE0]" />
              Usage Summary
            </CardTitle>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EBE9FF] text-[#7C6FE0]">
              {currentPlan.display_name}
            </span>
          </div>
          <ScopeIndicator className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {items.map((item) => (
            <div key={item.label} className="group">
              <div className="mb-1.5 flex justify-between items-end">
                <span className="text-[11px] font-medium text-[#64748B] group-hover:text-[#1A1730] transition-colors">
                  {item.label}
                </span>
                <span className="text-[11px] font-bold text-[#1A1730]">
                  {item.limit === -1 ? item.used : `${item.used} / ${item.limit}`}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${item.limit === -1 ? 0 : Math.min(item.percent, 100)}%`,
                    backgroundColor: item.percent >= 95 ? '#EF4444' : item.percent >= 80 ? '#F59E0B' : '#7C6FE0',
                  }}
                />
              </div>
              {"showProjected" in item && item.showProjected && item.used > 0 && (
                <p className="text-[10px] mt-1.5 text-[#9490B8] flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Projected: <span className="font-semibold text-[#64748B]">~${item.projected}</span> by month end
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
