import { useState } from "react";
import { useTickets, TicketStatus } from "@/hooks/useTickets";
import { useEmailQueue } from "@/hooks/useEmailQueue";
import { useAutoSentAudit } from "@/hooks/useAutoSentAudit";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { TicketDetailPanel } from "@/components/tickets/TicketDetailPanel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Flame,
  Search,
  Inbox,
  Send,
  Flag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

type TabValue = TicketStatus | "all" | "auto_sent";
const statusTabs: { value: TabValue; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All", icon: null },
  { value: "open", label: "Open", icon: <AlertCircle className="h-3.5 w-3.5" /> },
  { value: "pending", label: "Pending", icon: <Clock className="h-3.5 w-3.5" /> },
  { value: "resolved", label: "Resolved", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  { value: "closed", label: "Closed", icon: <XCircle className="h-3.5 w-3.5" /> },
  { value: "auto_sent", label: "Auto-Sent", icon: <Send className="h-3.5 w-3.5" /> },
];

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-orange-500/10 text-orange-600",
  urgent: "bg-destructive/10 text-destructive",
};

const statusDot: Record<string, string> = {
  open: "bg-primary",
  pending: "bg-yellow-500",
  resolved: "bg-green-500",
  closed: "bg-muted-foreground",
};

export default function Tickets() {
  const [activeTab, setActiveTab] = useState<TicketStatus | "all" | "auto_sent">("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [angryExpanded, setAngryExpanded] = useState(true);
  const statusFilter = activeTab === "all" || activeTab === "auto_sent" ? undefined : activeTab;
  const { data: tickets, isLoading } = useTickets(statusFilter);
  const { pendingCount } = useEmailQueue();
  const { data: autoSentLogs = [] } = useAutoSentAudit();
  const queryClient = useQueryClient();

  // Separate angry/escalated tickets
  const angryTickets = (tickets ?? []).filter(
    (t) => t.escalation_flag && t.status !== "resolved" && t.status !== "closed"
  );

  const filtered = (tickets ?? []).filter(
    (t) =>
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFlagWrong = async (entry: { customer_email: string; ticket_id: string | null }) => {
    try {
      // Add sender to manual_only_senders
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

      // Move ticket to pending/open if exists
      if (entry.ticket_id) {
        await supabase
          .from("tickets")
          .update({ status: "open", priority: "high" })
          .eq("id", entry.ticket_id);
      }

      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["auto-sent-audit"] });
      toast.success("Sender added to manual-only list. Future emails will require review.");
    } catch {
      toast.error("Failed to flag reply");
    }
  };

  // Auto-Sent audit view
  if (activeTab === "auto_sent") {
    return (
      <div className="flex h-[calc(100vh-2rem)] overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex flex-col w-full">
          {/* Header */}
          <div className="border-b border-border px-4 py-3 space-y-3">
            <h1 className="text-lg font-semibold text-foreground">Auto-Reply Audit Log</h1>
            <div className="flex gap-1 overflow-x-auto">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value as any)}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors",
                    activeTab === tab.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {autoSentLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Send className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No auto-sent replies yet</p>
                </div>
              ) : (
                autoSentLogs.map((entry) => (
                  <AutoSentCard
                    key={entry.id}
                    entry={entry}
                    onFlagWrong={() => handleFlagWrong({
                      customer_email: entry.customer_email,
                      ticket_id: entry.ticket_id,
                    })}
                    onViewTicket={() => {
                      if (entry.ticket_id) {
                        setActiveTab("all");
                        setSelectedTicketId(entry.ticket_id);
                      }
                    }}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] overflow-hidden rounded-lg border border-border bg-card">
      {/* Left: Ticket List */}
      <div
        className={cn(
          "flex flex-col border-r border-border w-full lg:w-[380px] lg:min-w-[380px] shrink-0",
          selectedTicketId && "hidden lg:flex"
        )}
      >
        {/* List header */}
        <div className="border-b border-border px-4 py-3 space-y-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground">Customer Inbox</h1>
            {pendingCount > 0 && (
              <Badge className="bg-destructive/10 text-destructive text-xs h-5 px-1.5">
                {pendingCount} to review
              </Badge>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              className="pl-8 h-8 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as any)}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Angry Customer Pinned Section */}
        {angryTickets.length > 0 && activeTab !== "auto_sent" && (
          <div className="border-b border-destructive/20 bg-destructive/5">
            <button
              className="flex w-full items-center justify-between px-4 py-2 text-xs font-medium text-destructive"
              onClick={() => setAngryExpanded(!angryExpanded)}
            >
              <span className="flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5" />
                Needs Immediate Attention ({angryTickets.length})
              </span>
              {angryExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {angryExpanded && (
              <div className="divide-y divide-destructive/10">
                {angryTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 transition-colors hover:bg-destructive/10",
                      selectedTicketId === ticket.id && "bg-destructive/10"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Flame className="h-3.5 w-3.5 text-destructive shrink-0" />
                      <Badge variant="destructive" className="text-[10px] h-4 px-1.5 shrink-0">
                        Angry Customer
                      </Badge>
                      <p className="text-sm font-medium text-foreground truncate flex-1">{ticket.subject}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 pl-5">{ticket.customer_email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* List body */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <Inbox className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No tickets found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 transition-colors hover:bg-accent/50",
                    selectedTicketId === ticket.id && "bg-accent"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-1.5 h-2 w-2 rounded-full shrink-0",
                        statusDot[ticket.status]
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {ticket.escalation_flag && (
                          <Flame className="h-3.5 w-3.5 text-destructive shrink-0" />
                        )}
                        <p className="text-sm font-medium text-foreground truncate">
                          {ticket.subject}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {ticket.customer_email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={cn("text-[10px] h-4 px-1.5", priorityColors[ticket.priority])}
                        >
                          {ticket.priority}
                        </Badge>
                        {ticket.escalation_flag && (
                          <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                            Angry Customer
                          </Badge>
                        )}
                        {ticket.category && (
                          <span className="text-[10px] text-muted-foreground capitalize">
                            {ticket.category.replace("_", " ")}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right: Detail Panel */}
      <div
        className={cn(
          "flex-1 min-w-0",
          !selectedTicketId && "hidden lg:flex"
        )}
      >
        {selectedTicketId ? (
          <TicketDetailPanel
            ticketId={selectedTicketId}
            onBack={() => setSelectedTicketId(null)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Inbox className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select a ticket to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
              <Badge variant="secondary" className="text-xs">
                {Math.round(entry.confidence_score * 100)}% confidence
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {format(new Date(entry.sent_at), "MMM d, h:mm a")}
            </Badge>
          </div>
        </div>

        {entry.details?.category && (
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-xs capitalize">
              {String(entry.details.category).replace("_", " ")}
            </Badge>
            {entry.details?.kb_entry_title && (
              <span className="text-xs text-muted-foreground">
                KB: {String(entry.details.kb_entry_title)}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {entry.ticket_id && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onViewTicket}>
              View Ticket
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onFlagWrong}
          >
            <Flag className="mr-1 h-3 w-3" />
            This was wrong
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs ml-auto"
            onClick={() => setExpanded(!expanded)}
          >
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
