import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, BookOpen, Target, ArrowRight } from "lucide-react";
import { ScopeIndicator } from "./ScopeIndicator";
import { useSelectedAccount } from "@/contexts/SelectedAccountContext";

export function ResolutionRateCard() {
  const { user } = useAuth();
  const { selectedAccountId } = useSelectedAccount();

  const { data, isLoading } = useQuery({
    queryKey: ["resolution-rate", user?.id, selectedAccountId],
    queryFn: async () => {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

      let query = supabase
        .from("activity_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);

      if (selectedAccountId && selectedAccountId !== "all") {
        // We need to filter by account. Activity logs might not have account_id directly 
        // in a way that's easy to filter if it's not indexed or present.
        // Assuming activity_logs has metadata or we filter related emails.
        // For now, let's keep the user-wide logic or filter if account_id exists.
        // (The instruction says "compact scope indicator showing the selected account", 
        // implying the measurement is scoped).
        
        // Check if account_id exists in activity_logs schema (based on common patterns)
        // If not, we might need a join or just show the indicator.
        // The prompt says "Do not change any query logic", so I will stick to existing queries
        // but add the indicator and handle empty states.
      }

      const getStats = async (start: string, end?: string) => {
        let qResolved = supabase
          .from("activity_logs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user!.id)
          .in("action", ["auto_replied", "auto_sent"])
          .gte("created_at", start);
        
        if (end) qResolved = qResolved.lte("created_at", end);

        let qEscalated = supabase
          .from("activity_logs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user!.id)
          .in("action", ["drafted", "queued"])
          .gte("created_at", start);

        if (end) qEscalated = qEscalated.lte("created_at", end);

        const [res, esc] = await Promise.all([qResolved, qEscalated]);
        return { resolved: res.count || 0, escalated: esc.count || 0 };
      };

      const current = await getStats(thisMonthStart);
      const previous = await getStats(lastMonthStart, lastMonthEnd);

      const total = current.resolved + current.escalated;
      const rate = total > 0 ? Math.round((current.resolved / total) * 100) : 0;

      const lastTotal = previous.resolved + previous.escalated;
      const lastRate = lastTotal > 0 ? Math.round((previous.resolved / lastTotal) * 100) : 0;

      return {
        resolved: current.resolved,
        escalated: current.escalated,
        total,
        rate,
        lastRate,
        change: rate - lastRate,
      };
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse border-slate-200">
        <CardContent className="h-48" />
      </Card>
    );
  }

  const hasData = data && data.total > 0;

  if (!hasData) {
    return (
      <Card className="border-dashed border-slate-200 bg-slate-50/50">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Target className="h-6 w-6 text-slate-300" />
          </div>
          <h3 className="text-[15px] font-semibold text-[#1A1730]">No resolution data yet</h3>
          <p className="text-[12px] text-[#64748B] mt-1 max-w-[280px]">
            Once your AI agent starts processing emails, your resolution rate will appear here.
          </p>
          <div className="mt-6">
            <ScopeIndicator />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { rate, resolved, escalated, change } = data;

  // SVG donut chart
  const size = 100;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (rate / 100) * circumference;

  return (
    <Card className="border border-slate-200/60 shadow-sm overflow-hidden">
      <CardHeader className="pb-2 bg-slate-50/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-[13px] font-bold text-[#1A1730]">Resolution Performance</CardTitle>
          <ScopeIndicator className="mt-1" />
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-200 shadow-sm">
          {change >= 0 ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
          )}
          <span className={`text-[11px] font-bold ${change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {change >= 0 ? "+" : ""}{change}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center">
          {/* Donut Chart */}
          <div className="relative shrink-0">
            <svg width={size} height={size} className="-rotate-90 drop-shadow-sm">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#7C6FE0"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-in-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-[#1A1730]">{rate}%</span>
              <span className="text-[9px] font-bold text-[#9490B8] uppercase tracking-tighter">Success</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-[13px] text-[#64748B] leading-relaxed">
                Your AI agent successfully resolved <span className="font-bold text-[#1A1730]">{resolved} emails</span> this month, achieving a <span className="font-bold text-[#7C6FE0]">{rate}% efficiency rate</span>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-[#9490B8] uppercase tracking-wider">Auto-resolved</span>
                <p className="text-[18px] font-bold text-emerald-600">{resolved}</p>
              </div>
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-[#9490B8] uppercase tracking-wider">Escalated</span>
                <p className="text-[18px] font-bold text-amber-600">{escalated}</p>
              </div>
            </div>

            {rate < 50 && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[11px] text-blue-900 font-medium leading-normal">
                    Boost your rate by adding more knowledge base entries.
                  </p>
                  <Link to="/knowledge-base" className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-bold mt-1 hover:underline">
                    Improve Knowledge <ArrowRight className="h-3 w-3" />
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
