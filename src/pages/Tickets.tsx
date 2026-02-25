import { useState } from "react";
import { useTickets, TicketStatus } from "@/hooks/useTickets";
import { useEmailQueue } from "@/hooks/useEmailQueue";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TicketDetailPanel } from "@/components/tickets/TicketDetailPanel";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Flame,
  Search,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const statusTabs: { value: TicketStatus | "all"; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All", icon: null },
  { value: "open", label: "Open", icon: <AlertCircle className="h-3.5 w-3.5" /> },
  { value: "pending", label: "Pending", icon: <Clock className="h-3.5 w-3.5" /> },
  { value: "resolved", label: "Resolved", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  { value: "closed", label: "Closed", icon: <XCircle className="h-3.5 w-3.5" /> },
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
  const [activeTab, setActiveTab] = useState<TicketStatus | "all">("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const statusFilter = activeTab === "all" ? undefined : activeTab;
  const { data: tickets, isLoading } = useTickets(statusFilter);
  const { pendingCount } = useEmailQueue();

  const filtered = (tickets ?? []).filter(
    (t) =>
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                onClick={() => setActiveTab(tab.value as TicketStatus | "all")}
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
