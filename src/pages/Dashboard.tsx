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
import { ResolutionRateCard } from "@/components/dashboard/ResolutionRateCard";
import { OnboardingBanner } from "@/components/dashboard/OnboardingBanner";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";

export default function Dashboard() {
  const { logs, isLoading: logsLoading } = useActivityLogs(10);
  const { pendingCount, needsReview, drafted, isLoading: queueLoading } = useEmailQueue();

  const { accounts } = useEmailAccounts();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [isFetching, setIsFetching] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(
    () => localStorage.getItem("onboarding-banner-dismissed") === "true"
  );
  const { entries: kbEntries } = useKnowledgeBase();

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

  const repliedCount = logs.filter(l => l.action === "replied" || l.action === "auto_replied" || l.action === "auto_sent").length;
  const ignoredCount = logs.filter(l => l.action === "ignored").length;
  const totalActions = logs.length;
  const hasEmailAccount = accounts.some((a) => a.is_active);
  const hasKbEntry = kbEntries.length > 0;
  const showOnboarding = totalActions === 0 && !onboardingDismissed;

  const handleDismissOnboarding = () => {
    setOnboardingDismissed(true);
    localStorage.setItem("onboarding-banner-dismissed", "true");
  };

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
          <h1 className="text-[20px] font-medium" style={{ color: '#1A1730' }}>Dashboard</h1>
          <p className="mt-0.5 text-[13px]" style={{ color: '#9490B8' }}>
            Monitor your AI email agent's performance and activity
          </p>
        </div>
        <Button
          variant="secondary"
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

      {/* Resolution Rate Hero */}
      <div className="mb-6">
        <ResolutionRateCard />
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-[13px] font-medium" style={{ color: '#1A1730' }}>
                Recent Activity
              </CardTitle>
              <Link to="/inbox">
                <Button variant="ghost" size="sm" className="text-primary text-[12px] h-7">
                  View all
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentActivity.length === 0 ? (
                <p className="text-center py-8 text-[13px]" style={{ color: '#9490B8' }}>
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

        {/* Right sidebar */}
        <div className="space-y-4">
          <UsageCard />

          {drafted.length > 0 && (
            <Card className="border-[#BA7517]/20">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full shrink-0" style={{ backgroundColor: '#FAEEDA' }}>
                  <FileEdit className="h-4 w-4" style={{ color: '#BA7517' }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[13px] font-medium" style={{ color: '#1A1730' }}>
                    {drafted.length} drafted repl{drafted.length !== 1 ? "ies" : "y"} ready
                  </h3>
                  <p className="mt-0.5 text-[11px]" style={{ color: '#9490B8' }}>
                    AI has drafted replies for your review.
                  </p>
                  <Link to="/inbox?tab=drafted">
                    <Button size="sm" className="mt-2 h-7 text-[11px]" variant="secondary">
                      Review Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {needsReview.length > 0 && (
            <Card className="border-[#DC2626]/20">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full shrink-0" style={{ backgroundColor: '#FEF2F2' }}>
                  <AlertCircle className="h-4 w-4" style={{ color: '#DC2626' }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[13px] font-medium" style={{ color: '#1A1730' }}>
                    {needsReview.length} email{needsReview.length !== 1 ? "s" : ""} need attention
                  </h3>
                  <p className="mt-0.5 text-[11px]" style={{ color: '#9490B8' }}>
                    The AI wasn't confident about these emails.
                  </p>
                  <Link to="/inbox?tab=needs_review">
                    <Button size="sm" className="mt-2 h-7 text-[11px]" variant="secondary">
                      Review Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {totalActions === 0 && (
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <h3 className="text-[13px] font-medium" style={{ color: '#1A1730' }}>Getting Started</h3>
                <p className="mt-1 text-[11px] leading-relaxed" style={{ color: '#9490B8' }}>
                  1. Connect your email in Settings<br />
                  2. Add knowledge to the Knowledge Base<br />
                  3. Configure AI instructions<br />
                  4. Enable automation
                </p>
                <Link to="/settings">
                  <Button size="sm" className="mt-3 h-7 text-[11px]">
                    Go to Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Performance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[13px] font-medium" style={{ color: '#1A1730' }}>
                <TrendingUp className="h-4 w-4" style={{ color: '#7C6FE0' }} />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1.5 flex justify-between">
                  <span className="text-[11px]" style={{ color: '#9490B8' }}>Auto-reply rate</span>
                  <span className="text-[11px] font-medium" style={{ color: '#1A1730' }}>
                    {totalActions > 0 ? Math.round((repliedCount / totalActions) * 100) : 0}%
                  </span>
                </div>
                <div className="h-1 rounded-full" style={{ backgroundColor: '#EBE9FF' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${totalActions > 0 ? (repliedCount / totalActions) * 100 : 0}%`,
                      backgroundColor: '#1D9E75',
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex justify-between">
                  <span className="text-[11px]" style={{ color: '#9490B8' }}>Ignored rate</span>
                  <span className="text-[11px] font-medium" style={{ color: '#1A1730' }}>
                    {totalActions > 0 ? Math.round((ignoredCount / totalActions) * 100) : 0}%
                  </span>
                </div>
                <div className="h-1 rounded-full" style={{ backgroundColor: '#EBE9FF' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${totalActions > 0 ? (ignoredCount / totalActions) * 100 : 0}%`,
                      backgroundColor: '#BA7517',
                    }}
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
