import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { format, formatDistanceToNow, startOfDay, endOfDay, subDays } from "date-fns";
import {
  Search,
  Check,
  X,
  Edit,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Send,
  Plus,
  Clock,
  Loader2,
  RefreshCw,
  FileEdit,
  XCircle,
  Eye,
  Play,
  Pause,
  FileText,
  Paperclip,
  Trash2,
  CalendarIcon,
  Inbox,
  Flame,
  Flag,
  CheckCircle2,
  Mail,
  Filter,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useEmailQueue, type QueuedEmail } from "@/hooks/useEmailQueue";
import { useTickets, type TicketStatus, type Ticket } from "@/hooks/useTickets";
import { useAutoSentAudit } from "@/hooks/useAutoSentAudit";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";
import { TemplatePickerDialog } from "@/components/email-templates/TemplatePickerDialog";
import { type EmailTemplate } from "@/hooks/useEmailTemplates";
import { replaceVariables, renderEmailHtml } from "@/lib/emailHtml";
import { TicketDetailPanel } from "@/components/tickets/TicketDetailPanel";
// ─── Helpers ────────────────────────────────────────────────
const getConfidenceColor = (confidence: number | null) => {
  if (!confidence) return "text-muted-foreground bg-muted";
  if (confidence >= 0.7) return "text-green-600 bg-green-500/10";
  if (confidence >= 0.5) return "text-amber-600 bg-amber-500/10";
  return "text-red-600 bg-red-500/10";
};

const formatTimeAgo = (date: string) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
};

const priorityStyles: Record<string, { bg: string; color: string }> = {
  low: { bg: '#F1EFE8', color: '#5F5E5A' },
  medium: { bg: '#E6F1FB', color: '#185FA5' },
  high: { bg: '#FAEEDA', color: '#854F0B' },
  urgent: { bg: '#FCEBEB', color: '#A32D2D' },
};


type ViewMode = "tickets" | "emails";
type TicketTabValue = TicketStatus | "all" | "auto_sent";
type EmailTabValue = "all_emails" | "needs_review" | "drafted" | "sent" | "ignored";

// ─── Main Component ─────────────────────────────────────────
export default function UnifiedInbox() {
  const [viewMode, setViewMode] = useState<ViewMode>("tickets");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoFetchEnabled, setAutoFetchEnabled] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const isFetchingRef = useRef(false);
  const { session } = useAuth();
  const { accounts } = useEmailAccounts();
  const queryClient = useQueryClient();

  const handleAutoFetch = useCallback(async () => {
    if (!session?.access_token || isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const hasGmail = accounts.some((a) => a.provider === "gmail" && a.is_active);
      const hasImap = accounts.some((a) => a.provider === "imap" && a.is_active);
      const fetches: Promise<{ data: any; error: any }>[] = [];
      if (hasGmail) fetches.push(supabase.functions.invoke("fetch-gmail-emails", { headers: { Authorization: `Bearer ${session.access_token}` } }));
      if (hasImap) fetches.push(supabase.functions.invoke("fetch-imap-emails", { headers: { Authorization: `Bearer ${session.access_token}` } }));
      if (fetches.length === 0) return;
      await Promise.allSettled(fetches);
      await queryClient.invalidateQueries({ queryKey: ["email-queue"] });
    } catch (error) {
      console.error("Auto-fetch error:", error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [session?.access_token, accounts, queryClient]);

  useEffect(() => {
    if (!autoFetchEnabled) return;
    const interval = setInterval(handleAutoFetch, 10000);
    return () => clearInterval(interval);
  }, [autoFetchEnabled, handleAutoFetch]);

  const handleFetchEmails = async () => {
    if (!session?.access_token) {
      toast.error("Please sign in to fetch emails");
      return;
    }
    setIsFetching(true);
    try {
      const hasGmail = accounts.some((a) => a.provider === "gmail" && a.is_active);
      const hasImap = accounts.some((a) => a.provider === "imap" && a.is_active);
      const fetches: Promise<{ data: any; error: any }>[] = [];
      if (hasGmail) fetches.push(supabase.functions.invoke("fetch-gmail-emails", { headers: { Authorization: `Bearer ${session.access_token}` } }));
      if (hasImap) fetches.push(supabase.functions.invoke("fetch-imap-emails", { headers: { Authorization: `Bearer ${session.access_token}` } }));
      if (fetches.length === 0) {
        toast.info("No active email accounts connected");
        setIsFetching(false);
        return;
      }
      const results = await Promise.allSettled(fetches);
      let totalProcessed = 0;
      let totalSkipped = 0;
      let totalTotal = 0;
      for (const result of results) {
        if (result.status === "fulfilled" && !result.value.error) {
          const data = result.value.data;
          totalProcessed += data.processed || 0;
          totalSkipped += data.skipped || 0;
          totalTotal += data.total || 0;
        }
      }
      await queryClient.invalidateQueries({ queryKey: ["email-queue"] });
      if (totalProcessed > 0) toast.success(`Fetched ${totalProcessed} new email(s)`);
      else if (totalTotal === 0) toast.info("No unread emails found");
      else toast.info(`No new emails (${totalSkipped} already processed)`);
    } catch (error) {
      console.error("Fetch emails error:", error);
      toast.error("Failed to fetch emails");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Unified Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-medium" style={{ color: '#1A1730' }}>Inbox</h1>
            <p className="text-[13px] mt-0.5" style={{ color: '#9490B8' }}>
              Manage tickets and email conversations
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Fetch controls */}
            <Button
              variant={autoFetchEnabled ? "destructive" : "secondary"}
              size="sm"
              onClick={() => setAutoFetchEnabled(!autoFetchEnabled)}
            >
              {autoFetchEnabled ? <><Pause className="mr-2 h-4 w-4" />Stop</> : <><Play className="mr-2 h-4 w-4" />Auto-Fetch</>}
            </Button>
            {autoFetchEnabled && (
              <span className="flex items-center gap-1.5 text-[11px]" style={{ color: '#9490B8' }}>
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Every 10s
              </span>
            )}
            <Button variant="secondary" size="sm" onClick={handleFetchEmails} disabled={isFetching}>
              {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Fetch Now
            </Button>

            {/* Segmented control */}
            <div className="flex items-center rounded-full p-1" style={{ backgroundColor: '#EBE9FF' }}>
              <button
                onClick={() => setViewMode("tickets")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all",
                  viewMode === "tickets"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-[#9490B8] hover:text-foreground"
                )}
              >
                <Inbox className="h-3.5 w-3.5" />
                Tickets
              </button>
              <button
                onClick={() => setViewMode("emails")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all",
                  viewMode === "emails"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-[#9490B8] hover:text-foreground"
                )}
              >
                <Mail className="h-3.5 w-3.5" />
                Emails
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "tickets" ? (
          <TicketsView searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        ) : (
          <EmailsView searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        )}
      </div>
    </div>
  );
}

// ─── Tickets View ───────────────────────────────────────────
function TicketsView({ searchQuery, onSearchChange }: { searchQuery: string; onSearchChange: (v: string) => void }) {
  const [activeTab, setActiveTab] = useState<TicketTabValue>("all");
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const statusFilter = activeTab === "all" || activeTab === "auto_sent" ? undefined : activeTab;
  const { data: tickets, isLoading } = useTickets(statusFilter);
  const { pendingCount } = useEmailQueue();
  const { data: autoSentLogs = [] } = useAutoSentAudit();
  const queryClient = useQueryClient();

  const ticketTabs: { value: TicketTabValue; label: string; icon: React.ReactNode; count?: number }[] = [
    { value: "all", label: "All", icon: <Eye className="h-4 w-4" />, count: tickets?.length },
    { value: "open", label: "Open", icon: <AlertCircle className="h-4 w-4" />, count: tickets?.filter(t => t.status === "open").length },
    { value: "pending", label: "Pending", icon: <Clock className="h-4 w-4" />, count: tickets?.filter(t => t.status === "pending").length },
    { value: "resolved", label: "Resolved", icon: <CheckCircle2 className="h-4 w-4" /> },
    { value: "closed", label: "Closed", icon: <XCircle className="h-4 w-4" /> },
    { value: "auto_sent", label: "Auto-Sent", icon: <Send className="h-4 w-4" /> },
  ];

  const handleFlagWrong = async (entry: { customer_email: string; ticket_id: string | null }) => {
    try {
      const { data: instructions } = await supabase
        .from("ai_instructions")
        .select("id, manual_only_senders")
        .single();
      if (instructions) {
        const current = (instructions.manual_only_senders as string[]) || [];
        if (!current.includes(entry.customer_email)) {
          await supabase
            .from("ai_instructions")
            .update({ manual_only_senders: [...current, entry.customer_email] })
            .eq("id", instructions.id);
        }
      }
      if (entry.ticket_id) {
        await supabase.from("tickets").update({ status: "open", priority: "high" }).eq("id", entry.ticket_id);
      }
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["auto-sent-audit"] });
      toast.success("Sender added to manual-only list.");
    } catch {
      toast.error("Failed to flag reply");
    }
  };

  const filtered = (tickets ?? []).filter(
    (t) =>
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const angryTickets = filtered.filter(
    (t) => t.escalation_flag && t.status !== "resolved" && t.status !== "closed"
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-[20px] font-medium" style={{ color: '#1A1730' }}>Tickets</h1>
            <p className="mt-0.5 text-[13px]" style={{ color: '#9490B8' }}>Review and manage support tickets</p>
          </div>
          {pendingCount > 0 && (
            <Badge className="bg-destructive/10 text-destructive text-xs h-6 px-2 shrink-0">
              {pendingCount} emails to review
            </Badge>
          )}
        </div>

        {/* Search */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tickets..." className="pl-10" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} />
          </div>
        </div>

        {/* Escalated Banner */}
        {angryTickets.length > 0 && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-4 w-4 text-destructive" />
              <span className="text-sm font-semibold text-destructive">Needs Immediate Attention ({angryTickets.length})</span>
            </div>
            <div className="space-y-2">
              {angryTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setExpandedTicketId(expandedTicketId === ticket.id ? null : ticket.id)}
                  className="w-full text-left flex items-center gap-2 rounded-md px-3 py-2 hover:bg-destructive/10 transition-colors"
                >
                  <Badge variant="destructive" className="text-[10px] h-4 px-1.5 shrink-0">Escalated</Badge>
                  <p className="text-sm font-medium text-foreground truncate flex-1">{ticket.subject}</p>
                  <span className="text-xs text-muted-foreground shrink-0">{ticket.customer_email}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TicketTabValue)}>
          <TabsList className="mb-6">
            {ticketTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                {tab.icon}
                {tab.label}
                {tab.count != null && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">{tab.count}</Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {activeTab === "auto_sent" ? (
            <TabsContent value="auto_sent">
              {autoSentLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Send className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No auto-sent replies yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {autoSentLogs.map((entry) => (
                    <AutoSentCard
                      key={entry.id}
                      entry={entry}
                      onFlagWrong={() => handleFlagWrong({ customer_email: entry.customer_email, ticket_id: entry.ticket_id })}
                      onViewTicket={() => {
                        if (entry.ticket_id) {
                          setActiveTab("all");
                          setExpandedTicketId(entry.ticket_id);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ) : (
            <>
              {ticketTabs.filter(t => t.value !== "auto_sent").map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="rounded-full bg-muted p-4">
                        <Inbox className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-foreground">No tickets found</h3>
                      <p className="mt-1 text-muted-foreground">No tickets in this category</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filtered.map((ticket) => (
                        <TicketCard
                          key={ticket.id}
                          ticket={ticket}
                          isExpanded={expandedTicketId === ticket.id}
                          onToggle={() => setExpandedTicketId(expandedTicketId === ticket.id ? null : ticket.id)}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </>
          )}
        </Tabs>
      </div>
    </ScrollArea>
  );
}

// ─── TicketCard ──────────────────────────────────────────────
function TicketCard({ ticket, isExpanded, onToggle }: { ticket: Ticket; isExpanded: boolean; onToggle: () => void }) {
  const statusIcon = () => {
    switch (ticket.status) {
      case "open": return <AlertCircle className="h-4 w-4 text-primary" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "resolved": return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "closed": return <XCircle className="h-4 w-4 text-muted-foreground" />;
      default: return <AlertCircle className="h-4 w-4 text-primary" />;
    }
  };

  const statusBgColor = () => {
    switch (ticket.status) {
      case "open": return "bg-primary/10";
      case "pending": return "bg-yellow-500/10";
      case "resolved": return "bg-green-500/10";
      case "closed": return "bg-muted";
      default: return "bg-primary/10";
    }
  };

  const statusBadge = () => {
    const colors: Record<string, string> = {
      open: "bg-primary/10 text-primary",
      pending: "bg-yellow-500/10 text-yellow-600",
      resolved: "bg-green-500/10 text-green-600",
      closed: "bg-muted text-muted-foreground",
    };
    return (
      <Badge className={cn("border-0 font-medium text-[10px] h-5", colors[ticket.status] || colors.open)}>
        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
      </Badge>
    );
  };

  const pStyle = priorityStyles[ticket.priority] || priorityStyles.low;
  const sentimentDot = () => {
    if (ticket.sentiment_score === null) return null;
    const pct = ticket.sentiment_score * 100;
    const dotColor = pct > 60 ? '#1D9E75' : pct > 30 ? '#BA7517' : '#DC2626';
    return <span className="inline-block h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} title={`Sentiment: ${Math.round(pct)}%`} />;
  };

  return (
    <Card className="border border-border overflow-hidden">
      <div
        className="flex cursor-pointer items-center gap-4 p-4 transition-colors"
        style={{ backgroundColor: 'transparent' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F4F3FF')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        onClick={onToggle}
      >
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-full shrink-0", statusBgColor())}>
          {statusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {ticket.escalation_flag && <Flame className="h-3.5 w-3.5 text-destructive shrink-0" />}
            <h3 className="text-[13px] font-medium truncate" style={{ color: '#1A1730' }}>{ticket.subject}</h3>
            {statusBadge()}
          </div>
          <p className="text-[11px] mt-0.5" style={{ color: '#9490B8' }}>
            {ticket.customer_email} · {formatTimeAgo(ticket.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium capitalize"
            style={{ backgroundColor: pStyle.bg, color: pStyle.color }}
          >
            {ticket.priority}
          </span>
          {ticket.category && (
            <Badge variant="outline" className="capitalize text-[10px] h-5">{ticket.category.replace("_", " ")}</Badge>
          )}
          {sentimentDot()}
          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {isExpanded && (
        <CardContent className="border-t border-border px-0 pb-0 pt-0" style={{ backgroundColor: '#F4F3FF' }}>
          <TicketDetailPanel ticketId={ticket.id} onBack={onToggle} />
        </CardContent>
      )}
    </Card>
  );
}

// ─── Emails View ────────────────────────────────────────────
function EmailsView({ searchQuery, onSearchChange }: { searchQuery: string; onSearchChange: (v: string) => void }) {
  const { emails: allEmails, needsReview, drafted, sent, ignored, isLoading, updateEmailStatus, pendingCount } = useEmailQueue();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addKBDialogOpen, setAddKBDialogOpen] = useState(false);
  const [selectedEmailForKB, setSelectedEmailForKB] = useState<QueuedEmail | null>(null);
  const [activeTab, setActiveTab] = useState<EmailTabValue>(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "needs_review" || tab === "drafted" || tab === "sent" || tab === "ignored") return tab;
    return "all_emails";
  });
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [datePreset, setDatePreset] = useState<string>("all");
  const applyDatePreset = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    switch (preset) {
      case "today": setDateFrom(startOfDay(now)); setDateTo(undefined); break;
      case "7d": setDateFrom(startOfDay(subDays(now, 7))); setDateTo(undefined); break;
      case "30d": setDateFrom(startOfDay(subDays(now, 30))); setDateTo(undefined); break;
      default: setDateFrom(undefined); setDateTo(undefined); break;
    }
  };

  const filterEmails = (emails: QueuedEmail[]) =>
    emails.filter((email) => {
      const matchesSearch =
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.from_address.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      const emailDate = new Date(email.queued_at);
      if (dateFrom && emailDate < startOfDay(dateFrom)) return false;
      if (dateTo && emailDate > endOfDay(dateTo)) return false;
      return true;
    });

  const handleApprove = async (id: string) => {
    await updateEmailStatus.mutateAsync({ id, status: "approved" });
  };
  const handleIgnore = async (id: string) => {
    await updateEmailStatus.mutateAsync({ id, status: "ignored" });
  };
  const handleEditSend = async (id: string, editedReply: string) => {
    await updateEmailStatus.mutateAsync({ id, status: "edited", editedReply });
  };
  const handleAddToKB = (email: QueuedEmail) => {
    setSelectedEmailForKB(email);
    setAddKBDialogOpen(true);
  };

  const handleReopen = async (id: string) => {
    await updateEmailStatus.mutateAsync({ id, status: "pending" });
    toast.success("Email reopened");
  };

  const renderEmailList = (emails: QueuedEmail[], readOnly = false) => {
    const filtered = filterEmails(emails);
    if (filtered.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4">
            <Check className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-foreground">Nothing here</h3>
          <p className="mt-1 text-muted-foreground">No emails in this category</p>
        </div>
      );
    }
    return (
      <div className="divide-y divide-border space-y-0 rounded-xl border border-border bg-card overflow-hidden">
        {filtered.map((email) => (
          <EmailCard
            key={email.id}
            email={email}
            isExpanded={expandedId === email.id}
            onToggle={() => setExpandedId(expandedId === email.id ? null : email.id)}
            onApprove={() => handleApprove(email.id)}
            onIgnore={() => handleIgnore(email.id)}
            onEditSend={(reply) => handleEditSend(email.id, reply)}
            onAddToKB={() => handleAddToKB(email)}
            onReopen={() => handleReopen(email.id)}
            isPending={updateEmailStatus.isPending}
            readOnly={readOnly}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[20px] font-medium" style={{ color: '#1A1730' }}>Email Queue</h1>
          <p className="mt-0.5 text-[13px]" style={{ color: '#9490B8' }}>Review and manage all processed emails</p>
        </div>

        {/* Search & Date Filter */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search emails..." className="pl-10" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} />
          </div>
          <div className="flex items-center gap-1">
            {[
              { label: "All", value: "all" },
              { label: "Today", value: "today" },
              { label: "7 days", value: "7d" },
              { label: "30 days", value: "30d" },
            ].map((p) => (
              <Button key={p.value} variant={datePreset === p.value ? "default" : "outline"} size="sm" className="h-8 text-xs" onClick={() => applyDatePreset(p.value)}>
                {p.label}
              </Button>
            ))}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                {dateFrom ? format(dateFrom, "MMM d") : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateFrom} onSelect={(d) => { setDateFrom(d); setDatePreset("custom"); }} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
          <span className="text-xs text-muted-foreground">–</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                {dateTo ? format(dateTo, "MMM d") : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateTo} onSelect={(d) => { setDateTo(d); setDatePreset("custom"); }} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
          {(dateFrom || dateTo) && datePreset === "custom" && (
            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={() => applyDatePreset("all")}>Clear</Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EmailTabValue)}>
          <TabsList className="mb-6">
            <TabsTrigger value="all_emails" className="gap-2">
              <Eye className="h-4 w-4" />All
              <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">{allEmails.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="needs_review" className="gap-2">
              <AlertCircle className="h-4 w-4" />Needs Review
              <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">{needsReview.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="drafted" className="gap-2">
              <FileEdit className="h-4 w-4" />Drafted
              <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">{drafted.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <Send className="h-4 w-4" />Sent
              <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">{sent.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ignored" className="gap-2">
              <XCircle className="h-4 w-4" />Ignored
              <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">{ignored.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all_emails">{renderEmailList(allEmails)}</TabsContent>
          <TabsContent value="needs_review">{renderEmailList(needsReview)}</TabsContent>
          <TabsContent value="drafted">{renderEmailList(drafted)}</TabsContent>
          <TabsContent value="sent">{renderEmailList(sent, true)}</TabsContent>
          <TabsContent value="ignored">{renderEmailList(ignored)}</TabsContent>
        </Tabs>

        {/* Add to KB Dialog */}
        <Dialog open={addKBDialogOpen} onOpenChange={setAddKBDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Knowledge Base</DialogTitle>
              <DialogDescription>Create a new knowledge entry based on this email interaction.</DialogDescription>
            </DialogHeader>
            {selectedEmailForKB && (
              <div className="space-y-4 py-4">
                <div>
                  <p className="text-sm font-medium">Email Subject</p>
                  <p className="text-sm text-muted-foreground">{selectedEmailForKB.subject}</p>
                </div>
                <Textarea placeholder="What knowledge should be added from this interaction?" rows={4} />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddKBDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => { setAddKBDialogOpen(false); toast.success("Added to knowledge base"); }}>Add Entry</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ScrollArea>
  );
}

// ─── EmailCard ──────────────────────────────────────────────
function EmailCard({
  email,
  isExpanded,
  onToggle,
  onApprove,
  onIgnore,
  onEditSend,
  onAddToKB,
  onReopen,
  isPending,
  readOnly = false,
}: {
  email: QueuedEmail;
  isExpanded: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onIgnore: () => void;
  onEditSend: (reply: string) => void;
  onAddToKB: () => void;
  onReopen: () => void;
  isPending: boolean;
  readOnly?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [editedReply, setEditedReply] = useState(email.suggested_reply || "");
  const [composedReply, setComposedReply] = useState("");
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<EmailTemplate | null>(null);
  const [attachments, setAttachments] = useState<{ name: string; url: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, session } = useAuth();

  const handleHelpMeWrite = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-reply", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: {
          subject: email.subject,
          body: email.body,
          from_name: email.from_name,
          from_address: email.from_address,
          intent: email.intent,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const reply = data?.reply || "";
      if (isEditing) setEditedReply(reply);
      else { setComposedReply(reply); setIsComposing(true); }
      toast.success("AI draft generated");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate reply");
    } finally {
      setIsGenerating(false);
    }
  };

  const confidencePercent = email.confidence_score ? Math.round(email.confidence_score * 100) : null;
  const hasReply = !!email.suggested_reply;

  const handleTemplateSelect = (template: EmailTemplate) => {
    const replaced = replaceVariables(template.body, {
      sender_name: email.from_name || email.from_address.split("@")[0],
      subject: email.subject,
    });
    if (isEditing) setEditedReply(replaced);
    else { setComposedReply(replaced); setIsComposing(true); }
    setActiveTemplate(template);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const filePath = `${user.id}/${crypto.randomUUID()}_${file.name}`;
        const { error } = await supabase.storage.from("email-attachments").upload(filePath, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("email-attachments").getPublicUrl(filePath);
        setAttachments((prev) => [...prev, { name: file.name, url: urlData.publicUrl }]);
      }
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (url: string) => {
    setAttachments((prev) => prev.filter((a) => a.url !== url));
  };

  const statusBadge = () => {
    switch (email.status) {
      case "sent": case "sending":
        return <Badge className="bg-green-500/10 text-green-600 border-0 font-medium text-[10px] h-5">Sent</Badge>;
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600 border-0 font-medium text-[10px] h-5">Approved</Badge>;
      case "ignored":
        return <Badge className="bg-muted text-muted-foreground border-0 font-medium text-[10px] h-5">Ignored</Badge>;
      case "edited":
        return <Badge className="bg-blue-500/10 text-blue-600 border-0 font-medium text-[10px] h-5">Edited</Badge>;
      default:
        return null;
    }
  };

  return (
    <div
      className="overflow-hidden transition-colors"
      style={{ backgroundColor: 'transparent' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F4F3FF')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <div className="flex cursor-pointer items-center gap-4 p-4" onClick={onToggle}>
        <div className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full shrink-0",
          email.status === "sent" || email.status === "approved" || email.status === "sending"
            ? "bg-green-500/10"
            : email.status === "ignored" ? "bg-muted"
            : email.suggested_reply ? "bg-primary/10" : "bg-amber-500/10"
        )}>
          {email.status === "sent" || email.status === "approved" || email.status === "sending" ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : email.status === "ignored" ? (
            <XCircle className="h-4 w-4 text-muted-foreground" />
          ) : email.suggested_reply ? (
            <FileEdit className="h-4 w-4 text-primary" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-card-foreground truncate">{email.subject}</h3>
            {statusBadge()}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {email.from_name || email.from_address} · {formatTimeAgo(email.queued_at)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {confidencePercent !== null && (
            <Badge className={cn("font-medium text-[10px] h-5 border-0", getConfidenceColor(email.confidence_score))}>
              {confidencePercent}%
            </Badge>
          )}
          {email.intent && (
            <Badge variant="outline" className="capitalize text-[10px] h-5">{email.intent}</Badge>
          )}
          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {isExpanded && (
        <CardContent className="border-t border-border px-4 pb-4 pt-4 space-y-4" style={{ backgroundColor: '#F4F3FF' }}>
          {email.flag_reason && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800">{email.flag_reason}</p>
            </div>
          )}

          <div>
            <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Original Email</h4>
            <div className="rounded-xl bg-white p-4" style={{ borderLeft: '3px solid rgba(124,111,224,0.3)' }}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{email.body}</p>
            </div>
          </div>

          {hasReply && (
            <div>
              <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {readOnly ? "Reply Sent" : "AI Suggested Reply"}
              </h4>
              {isEditing ? (
                <Textarea className="min-h-[120px]" value={editedReply} onChange={(e) => setEditedReply(e.target.value)} />
              ) : (
                <div className="rounded-xl p-4" style={{ backgroundColor: '#F4F3FF', borderLeft: '3px solid #7C6FE0' }}>
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">{email.suggested_reply}</p>
                </div>
              )}
            </div>
          )}

          {!hasReply && !readOnly && (
            <div>
              <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {isComposing ? "Compose Reply" : "No AI reply generated"}
              </h4>
              {isComposing ? (
                <div className="space-y-2">
                  <Textarea className="min-h-[120px]" placeholder="Write your reply here..." value={composedReply} onChange={(e) => setComposedReply(e.target.value)} />
                  <Button variant="outline" size="sm" onClick={handleHelpMeWrite} disabled={isGenerating} className="gap-1.5">
                    {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                    {isGenerating ? "Writing..." : "Help me write"}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No suggested reply. Compose one manually or ignore.</p>
              )}
            </div>
          )}

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((a) => (
                <Badge key={a.url} variant="secondary" className="gap-1 pr-1">
                  <Paperclip className="h-3 w-3" />{a.name}
                  <button onClick={() => removeAttachment(a.url)} className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"><Trash2 className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          )}

          {activeTemplate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Template: <span className="font-medium">{activeTemplate.name}</span>
              <button onClick={() => setActiveTemplate(null)} className="text-destructive hover:underline">Remove</button>
            </div>
          )}

          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />

          {!readOnly && (
            <div className="flex flex-wrap gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={() => { onEditSend(editedReply); setIsEditing(false); }} disabled={isPending}>
                    {isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
                    Send Edited
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setTemplatePickerOpen(true)}>
                    <FileText className="mr-1.5 h-3.5 w-3.5" />Template
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Paperclip className="mr-1.5 h-3.5 w-3.5" />}
                    Attach
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                </>
              ) : isComposing ? (
                <>
                  <Button size="sm" onClick={() => { onEditSend(composedReply); setIsComposing(false); }} disabled={isPending || !composedReply.trim()}>
                    {isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
                    Send
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setTemplatePickerOpen(true)}>
                    <FileText className="mr-1.5 h-3.5 w-3.5" />Template
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Paperclip className="mr-1.5 h-3.5 w-3.5" />}
                    Attach
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsComposing(false)}>Cancel</Button>
                </>
              ) : email.status === "ignored" ? (
                <>
                  <Button size="sm" onClick={onReopen} disabled={isPending}>
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />Reopen
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { handleHelpMeWrite(); }}>
                    {isGenerating ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Wand2 className="mr-1.5 h-3.5 w-3.5" />}
                    {isGenerating ? "Writing..." : "Help me write"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsComposing(true)}>
                    <Edit className="mr-1.5 h-3.5 w-3.5" />Reply Anyway
                  </Button>
                </>
              ) : (
                <>
                  {hasReply ? (
                    <Button size="sm" onClick={onApprove} disabled={isPending}>
                      {isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
                      Approve & Send
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => setIsComposing(true)}>
                      <Edit className="mr-1.5 h-3.5 w-3.5" />Compose
                    </Button>
                  )}
                  {hasReply && (
                    <Button variant="outline" size="sm" onClick={() => { setIsEditing(true); setEditedReply(email.suggested_reply || ""); }}>
                      <Edit className="mr-1.5 h-3.5 w-3.5" />Edit
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setTemplatePickerOpen(true)}>
                    <FileText className="mr-1.5 h-3.5 w-3.5" />Template
                  </Button>
                  <Button variant="outline" size="sm" onClick={onIgnore} disabled={isPending}>
                    <X className="mr-1.5 h-3.5 w-3.5" />Ignore
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onAddToKB}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />Add to KB
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      )}

      <TemplatePickerDialog open={templatePickerOpen} onOpenChange={setTemplatePickerOpen} onSelect={handleTemplateSelect} />
    </div>
  );
}

// ─── AutoSentCard ───────────────────────────────────────────
function AutoSentCard({
  entry,
  onFlagWrong,
  onViewTicket,
}: {
  entry: {
    id: string;
    customer_email: string;
    subject: string;
    sent_at: string;
    confidence_score: number | null;
    details: Record<string, unknown> | null;
    ticket_id: string | null;
  };
  onFlagWrong: () => void;
  onViewTicket: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border border-border">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{entry.subject}</p>
            <p className="text-xs text-muted-foreground">{entry.customer_email}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {entry.confidence_score !== null && (
              <Badge variant="secondary" className="text-xs">{Math.round(entry.confidence_score * 100)}%</Badge>
            )}
            <Badge variant="outline" className="text-xs">{format(new Date(entry.sent_at), "MMM d, h:mm a")}</Badge>
          </div>
        </div>

        {entry.details?.category && (
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-xs capitalize">{String(entry.details.category).replace("_", " ")}</Badge>
            {entry.details?.kb_entry_title && (
              <span className="text-xs text-muted-foreground">KB: {String(entry.details.kb_entry_title)}</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {entry.ticket_id && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onViewTicket}>View Ticket</Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onFlagWrong}
          >
            <Flag className="mr-1 h-3 w-3" />This was wrong
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs ml-auto" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Hide" : "Details"}
          </Button>
        </div>

        {expanded && entry.details && (
          <div className="rounded-md border border-border bg-muted/30 p-3 text-xs space-y-1">
            <p><strong>Intent:</strong> {String(entry.details.intent || "unknown")}</p>
            <p><strong>Category:</strong> {String(entry.details.category || "general")}</p>
            <p><strong>Sentiment:</strong> {entry.details.sentiment_score != null ? `${Math.round(Number(entry.details.sentiment_score) * 100)}%` : "N/A"}</p>
            <p><strong>Reason:</strong> {String(entry.details.reason || "N/A")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
