import { Mail, Send, Clock, Zap, AlertCircle, Loader2, RefreshCw, FileEdit, Filter, Info, ChevronRight } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityItem, actionConfig } from "@/components/dashboard/ActivityItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { useEmailQueue } from "@/hooks/useEmailQueue";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { UsageCard } from "@/components/dashboard/UsageCard";
import { ResolutionRateCard } from "@/components/dashboard/ResolutionRateCard";
import { OnboardingBanner } from "@/components/dashboard/OnboardingBanner";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import { useSelectedAccount } from "@/contexts/SelectedAccountContext";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { logs, isLoading: logsLoading } = useActivityLogs(50);
  const { emails, pendingCount, needsReview, drafted, isLoading: queueLoading } = useEmailQueue();
  const { accounts } = useEmailAccounts();
  const { session } = useAuth();
  const { selectedAccountId } = useSelectedAccount();
  const queryClient = useQueryClient();
  const [isFetching, setIsFetching] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(
    () => localStorage.getItem("onboarding-banner-dismissed") === "true"
  );
  const { entries: kbEntries } = useKnowledgeBase();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const isLoading = logsLoading || queueLoading;

  const handleFetchEmails = async () => {
    if (!session?.access_token) {
      toast.error("Please sign in to fetch emails");
      return;
    }
    setIsFetching(true);
    try {
      const authHeaders = { Authorization: `Bearer ${session.access_token}` };
      const fetches: Promise<{ data: any; error: any }>[] = [];

      if (selectedAccountId && selectedAccountId !== "all") {
        const acc = accounts.find((a) => a.id === selectedAccountId && a.is_active);
        if (acc) {
          const fn = acc.provider === "imap" ? "fetch-imap-emails" : "fetch-gmail-emails";
          fetches.push(supabase.functions.invoke(fn, { headers: authHeaders, body: { account_id: acc.id } }));
        }
      } else {
        const hasGmail = accounts.some(a => a.provider === "gmail" && a.is_active);
        const hasImap = accounts.some(a => a.provider === "imap" && a.is_active);
        if (hasGmail) fetches.push(supabase.functions.invoke("fetch-gmail-emails", { headers: authHeaders }));
        if (hasImap) fetches.push(supabase.functions.invoke("fetch-imap-emails", { headers: authHeaders }));
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
      subtitle: "Lifetime activity",
      icon: Mail,
      variant: "primary" as const,
      hasData: totalActions > 0
    },
    {
      title: "Auto-Resolved",
      value: repliedCount,
      subtitle: totalActions > 0 ? `${Math.round((repliedCount / totalActions) * 100)}% resolution rate` : "0%",
      icon: Send,
      variant: "success" as const,
      hasData: totalActions > 0
    },
    {
      title: "Needs Review",
      value: pendingCount,
      subtitle: `${pendingCount} items in queue`,
      icon: Clock,
      variant: "warning" as const,
      hasData: true
    },
    {
      title: "Time Saved",
      value: `${Math.round(repliedCount * 4)}m`,
      subtitle: "AI productivity",
      icon: Zap,
      variant: "default" as const,
      hasData: repliedCount > 0
    },
  ];

  const processedActivity = useMemo(() => {
    return emails
      .filter(email => {
        if (selectedAccountId !== "all" && email.email_account_id !== selectedAccountId) return false;
        
        const status = email.status === "ignored"
          ? "ignored"
          : email.status === "sent" || email.status === "approved" || email.status === "edited" || email.status === "sending"
            ? "auto_sent"
            : email.suggested_reply
              ? "drafted"
              : "queued";
        
        if (activeFilter !== "all" && status !== activeFilter) return false;
        
        return true;
      })
      .slice(0, 10)
      .map((email) => {
        const account = accounts.find(a => a.id === email.email_account_id);
        return {
          from: email.from_name || email.from_address || "Unknown",
          subject: email.subject || "No subject",
          action: email.status === "ignored"
            ? "ignored"
            : email.status === "sent" || email.status === "approved" || email.status === "edited" || email.status === "sending"
              ? "auto_sent"
              : email.suggested_reply
                ? "drafted"
                : "queued",
          time: formatTimeAgo(email.queued_at),
          fullTime: new Date(email.queued_at).toLocaleString(),
          confidence: email.confidence_score !== null
            ? Math.round(Number(email.confidence_score) * 100)
            : undefined,
          accountEmail: account?.email_address
        };
      });
  }, [emails, selectedAccountId, activeFilter, accounts]);

  if (isLoading && emails.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#7C6FE0]" />
          <p className="text-[14px] font-medium text-[#64748B]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const filterOptions = [
    { label: "All Activity", value: "all" },
    { label: "Sent", value: "auto_sent" },
    { label: "Drafted", value: "drafted" },
    { label: "Needs Review", value: "queued" },
    { label: "Ignored", value: "ignored" },
  ];

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen bg-[#FDFDFF]">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1A1730]">Dashboard</h1>
          <p className="mt-1 text-[14px] text-[#64748B]">
            Real-time overview of your AI email operations and agent performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFetchEmails}
            disabled={isFetching}
            className="bg-white shadow-sm border-slate-200 hover:bg-slate-50 transition-all h-10 px-4"
          >
            {isFetching ? (
              <Loader2 className="mr-2.5 h-4 w-4 animate-spin text-[#7C6FE0]" />
            ) : (
              <RefreshCw className="mr-2.5 h-4 w-4 text-[#7C6FE0]" />
            )}
            <span className="font-semibold text-[#1A1730]">Fetch Emails</span>
          </Button>
        </div>
      </div>

      {/* Onboarding Banner */}
      {showOnboarding && (
        <div className="mb-10">
          <OnboardingBanner
            hasEmailAccount={hasEmailAccount}
            hasKbEntry={hasKbEntry}
            hasProcessedEmails={totalActions > 0}
            onFetchEmails={handleFetchEmails}
            isFetching={isFetching}
            onDismiss={handleDismissOnboarding}
          />
        </div>
      )}

      <div className="space-y-10">
        {/* Main Stats and Chart */}
        <div className="grid gap-6">
          {!showOnboarding && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <StatCard key={stat.title} {...stat} isLoading={isLoading} />
              ))}
            </div>
          )}
          
          {!showOnboarding && (
            <ResolutionRateCard />
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3 items-start">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <h2 className="text-[17px] font-bold text-[#1A1730]">Recent Activity</h2>
                <div className="flex items-center gap-1 text-[11px] font-medium text-[#9490B8] bg-slate-100 px-2 py-0.5 rounded-full">
                  {processedActivity.length} Recent
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setActiveFilter(opt.value)}
                      className={cn(
                        "px-3 py-1 text-[11px] font-bold rounded-md transition-all",
                        activeFilter === opt.value 
                          ? "bg-white text-[#7C6FE0] shadow-sm" 
                          : "text-[#64748B] hover:text-[#1A1730]"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <Link to="/inbox">
                  <Button variant="ghost" size="sm" className="text-[#7C6FE0] font-bold text-[12px] h-8 hover:bg-[#EBE9FF]/50">
                    View Queue <ChevronRight className="h-4 w-4 ml-0.5" />
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="border-slate-200/60 shadow-sm">
              <CardContent className="p-4 space-y-3">
                {isLoading ? (
                  <div className="space-y-4 py-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-4 p-4 animate-pulse">
                        <div className="h-10 w-10 bg-slate-100 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-1/3 bg-slate-100 rounded" />
                          <div className="h-3 w-1/2 bg-slate-50 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : processedActivity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Mail className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-[14px] font-semibold text-[#1A1730]">
                      No activity found
                    </p>
                    <p className="text-[12px] text-[#64748B] mt-1 max-w-[240px]">
                      {activeFilter === 'all' 
                        ? "Emails you fetch will appear here once they're processed by the AI."
                        : `No emails match the "${filterOptions.find(o => o.value === activeFilter)?.label}" filter.`}
                    </p>
                    {activeFilter !== 'all' && (
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="mt-2 text-[#7C6FE0]"
                        onClick={() => setActiveFilter('all')}
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {processedActivity.map((email, index) => (
                      <ActivityItem key={index} email={email} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Legend */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-2 py-4 border-t border-slate-100 mt-2">
              <span className="text-[11px] font-bold text-[#9490B8] uppercase tracking-wider flex items-center gap-1.5">
                <Info className="h-3 w-3" />
                Status Legend
              </span>
              {Object.entries(actionConfig).slice(0, 5).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: config.iconColor }} />
                  <span className="text-[11px] font-medium text-[#64748B]">{config.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <UsageCard />

            {(drafted.length > 0 || needsReview.length > 0) && (
              <div className="space-y-3">
                <h3 className="text-[13px] font-bold text-[#1A1730] px-1">Attention Required</h3>
                
                {drafted.length > 0 && (
                  <Card className="border-indigo-100 bg-indigo-50/20 hover:bg-indigo-50/40 transition-colors group overflow-hidden relative shadow-sm">
                    <div className="absolute top-0 right-0 p-1">
                      <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                    </div>
                    <CardContent className="flex items-start gap-3 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm shrink-0">
                        <FileEdit className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-[14px] font-bold text-[#1A1730]">
                          {drafted.length} Draft{drafted.length !== 1 ? "s" : ""} Ready
                        </h2>
                        <p className="mt-0.5 text-[11px] text-[#64748B] leading-normal">
                          AI has prepared replies for your approval.
                        </p>
                        <Link to="/inbox?tab=drafted">
                          <Button size="sm" className="mt-3 h-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold text-[11px]">
                            Review Drafts
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {needsReview.length > 0 && (
                  <Card className="border-amber-100 bg-amber-50/20 hover:bg-amber-50/40 transition-colors group overflow-hidden relative shadow-sm">
                    <CardContent className="flex items-start gap-3 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm shrink-0">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-[14px] font-bold text-[#1A1730]">
                          {needsReview.length} Need Review
                        </h2>
                        <p className="mt-0.5 text-[11px] text-[#64748B] leading-normal">
                          Emails that the AI wasn't fully confident about.
                        </p>
                        <Link to="/inbox?tab=needs_review">
                          <Button size="sm" className="mt-3 h-8 w-full bg-amber-600 hover:bg-amber-700 text-white shadow-sm font-semibold text-[11px]">
                            Review Now
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Performance Mini Summary */}
            <Card className="border-slate-200/60 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 bg-slate-50/50">
                <CardTitle className="text-[13px] font-bold text-[#1A1730]">
                  Efficiency Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div>
                  <div className="mb-2 flex justify-between items-end">
                    <span className="text-[11px] font-medium text-[#64748B]">Auto-reply success</span>
                    <span className="text-[11px] font-bold text-[#1A1730]">
                      {totalActions > 0 ? Math.round((repliedCount / totalActions) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${totalActions > 0 ? (repliedCount / totalActions) * 100 : 0}%`,
                        backgroundColor: '#10B981',
                      }}
                    />
                  </div>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#7C6FE0]" />
                    <span className="text-[11px] font-bold text-[#1A1730]">AI Availability</span>
                  </div>
                  <p className="text-[10px] text-[#64748B] leading-normal">
                    Your agent is actively monitoring {accounts.filter(a => a.is_active).length} connected account(s).
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
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

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
}
