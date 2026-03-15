import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, BookOpen } from "lucide-react";

export function ResolutionRateCard() {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["resolution-rate", user?.id],
    queryFn: async () => {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

      // This month: auto-resolved (auto_replied in activity_logs)
      const { count: autoResolvedCount } = await supabase
        .from("activity_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .in("action", ["auto_replied", "auto_sent"])
        .gte("created_at", thisMonthStart);

      // This month: escalated (drafted or queued)
      const { count: escalatedCount } = await supabase
        .from("activity_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .in("action", ["drafted", "queued"])
        .gte("created_at", thisMonthStart);

      // Last month for comparison
      const { count: lastAutoResolved } = await supabase
        .from("activity_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .in("action", ["auto_replied", "auto_sent"])
        .gte("created_at", lastMonthStart)
        .lte("created_at", lastMonthEnd);

      const { count: lastEscalated } = await supabase
        .from("activity_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .in("action", ["drafted", "queued"])
        .gte("created_at", lastMonthStart)
        .lte("created_at", lastMonthEnd);

      const resolved = autoResolvedCount ?? 0;
      const escalated = escalatedCount ?? 0;
      const total = resolved + escalated;
      const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

      const lastResolved = lastAutoResolved ?? 0;
      const lastEsc = lastEscalated ?? 0;
      const lastTotal = lastResolved + lastEsc;
      const lastRate = lastTotal > 0 ? Math.round((lastResolved / lastTotal) * 100) : 0;

      return {
        resolved,
        escalated,
        total,
        rate,
        lastRate,
        change: rate - lastRate,
      };
    },
    enabled: !!user,
  });

  if (!data || data.total === 0) return null;

  const { rate, resolved, escalated, change } = data;

  // SVG donut chart
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (rate / 100) * circumference;

  return (
    <Card className="border border-border bg-card col-span-full">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Donut Chart */}
          <div className="relative shrink-0">
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth={strokeWidth}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{rate}%</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Resolution Rate</h3>
              <p className="text-sm text-muted-foreground">
                Your AI agent fully handled {rate}% of customer emails this month without you.
              </p>
            </div>

            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Auto-resolved</span>
                <p className="text-lg font-semibold text-foreground">{resolved}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Escalated</span>
                <p className="text-lg font-semibold text-foreground">{escalated}</p>
              </div>
              <div className="flex items-center gap-1">
                {change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={change >= 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                  {change >= 0 ? "+" : ""}{change}% vs last month
                </span>
              </div>
            </div>

            {rate < 40 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
                <BookOpen className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-amber-900">
                    Your resolution rate is low. Adding more knowledge base entries usually fixes this.
                  </p>
                  <Link to="/knowledge-base">
                    <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">
                      Add KB Entry →
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
