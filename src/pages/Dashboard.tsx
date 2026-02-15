import { Mail, Send, Clock, Zap, TrendingUp, AlertCircle, Loader2, RefreshCw, FileEdit } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { useEmailQueue } from "@/hooks/useEmailQueue";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { UsageCard } from "@/components/dashboard/UsageCard";

export default function Dashboard() {
  const { logs, isLoading: logsLoading } = useActivityLogs(10);
  const { pendingCount, needsReview, drafted, isLoading: queueLoading } = useEmailQueue();

  const { accounts } = useEmailAccounts();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [isFetching, setIsFetching] = useState(false);

  const isLoading = logsLoading || queueLoading;

  const handleFetchEmails = async () => {
    if (!session?.access_token) {
      toast.error("Please sign in to fetch emails");
      return;
    }
    setIsFetching(true);
    try {
      const hasGmail = accounts.some(a => a.provider === "gmail" && a.is_active);
      const hasImap = accounts.some(a => a.provider === "imap" && a.is_active);

      const fetches: Promise<{ data: any; error: any }>[] = [];
      if (hasGmail) {
        fetches.push(supabase.functions.invoke("fetch-gmail-emails", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }));
      }
      if (hasImap) {
        fetches.push(supabase.functions.invoke("fetch-imap-emails", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }));
      }

      if (fetches.length === 0) {
        toast.info("No active email accounts found");
        setIsFetching(false);
        return;
      }

      const results = await Promise.all(fetches);
      let totalProcessed = 0;
      let totalSkipped = 0;
      for (const { data, error } of results) {
        if (error) throw error;
        if (data?.error) { toast.error(data.error); continue; }
        totalProcessed += data?.processed || 0;
        totalSkipped += data?.skipped || 0;
      }
      toast.success(`Fetched emails: ${totalProcessed} new, ${totalSkipped} skipped`);
      queryClient.invalidateQueries({ queryKey: ["email-queue"] });
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
    } catch (error) {
      console.error("Fetch emails error:", error);
      toast.error("Failed to fetch emails");
    } finally {
      setIsFetching(false);
    }
  };
  // Calculate stats from logs
  const repliedCount = logs.filter(l => l.action === "replied" || l.action === "auto_replied" || l.action === "auto_sent").length;
  const ignoredCount = logs.filter(l => l.action === "ignored").length;
  const totalActions = logs.length;

  const stats = [
    {
      title: "Total Actions",
      value: totalActions,
      subtitle: "Recent activity",
      icon: Mail,
      variant: "primary" as const,
    },
    {
      title: "Auto-Replied",
      value: repliedCount,
      subtitle: totalActions > 0 ? `${Math.round((repliedCount / totalActions) * 100)}% of total` : "0%",
      icon: Send,
      variant: "success" as const,
    },
    {
      title: "In Review Queue",
      value: pendingCount,
      subtitle: "Needs your attention",
      icon: Clock,
      variant: "warning" as const,
    },
    {
      title: "Time Saved",
      value: `${Math.round(repliedCount * 3)} min`,
      subtitle: "Estimated",
      icon: Zap,
      variant: "default" as const,
    },
  ];

  // Transform activity logs for display with real confidence from details
  const recentActivity = logs.map(log => {
    const details = log.details as Record<string, unknown> | null;
    const confidence = details?.confidence 
      ? Math.round(Number(details.confidence) * 100) 
      : undefined;

    return {
      from: log.email_from || "Unknown",
      subject: log.email_subject || "No subject",
      action: log.action,
      time: formatTimeAgo(log.created_at),
      confidence,
    };
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Monitor your AI email agent's performance and activity
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleFetchEmails}
          disabled={isFetching}
        >
          {isFetching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Fetch Emails
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-card-foreground">
                Recent Activity
              </CardTitle>
              <Link to="/queue">
                <Button variant="ghost" size="sm" className="text-primary">
                  View all
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No activity yet. Connect your email to get started.
                </p>
              ) : (
                recentActivity.map((email, index) => (
                  <ActivityItem key={index} email={email} />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Status */}
        <div className="space-y-6">
          <UsageCard />
          {/* Queue Alert - Drafted */}
          {drafted.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="rounded-full bg-amber-100 p-2">
                  <FileEdit className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-amber-900">
                    {drafted.length} drafted repl{drafted.length !== 1 ? "ies" : "y"} ready
                  </h3>
                  <p className="mt-1 text-sm text-amber-700">
                    AI has drafted replies for your review.
                  </p>
                  <Link to="/queue?tab=drafted">
                    <Button size="sm" className="mt-3" variant="outline">
                      Review Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Queue Alert - Needs Review */}
          {needsReview.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="rounded-full bg-red-100 p-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-red-900">
                    {needsReview.length} email{needsReview.length !== 1 ? "s" : ""} need attention
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    The AI wasn't confident about these emails.
                  </p>
                  <Link to="/queue?tab=needs_review">
                    <Button size="sm" className="mt-3" variant="outline">
                      Review Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Getting Started */}
          {totalActions === 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-5">
                <h3 className="font-medium text-card-foreground">Getting Started</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  1. Connect your email in Settings<br />
                  2. Add knowledge to the Knowledge Base<br />
                  3. Configure AI instructions<br />
                  4. Enable automation
                </p>
                <Link to="/settings">
                  <Button size="sm" className="mt-4">
                    Go to Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Performance */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">Auto-reply rate</span>
                  <span className="font-medium text-card-foreground">
                    {totalActions > 0 ? Math.round((repliedCount / totalActions) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div 
                    className="h-full rounded-full bg-primary" 
                    style={{ width: `${totalActions > 0 ? (repliedCount / totalActions) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">Ignored rate</span>
                  <span className="font-medium text-card-foreground">
                    {totalActions > 0 ? Math.round((ignoredCount / totalActions) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div 
                    className="h-full rounded-full bg-amber-500" 
                    style={{ width: `${totalActions > 0 ? (ignoredCount / totalActions) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(date: string) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hr ago`;
  return `${Math.floor(diffMins / 1440)} days ago`;
}