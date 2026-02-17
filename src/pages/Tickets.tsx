import { useState } from "react";
import { useTickets, TicketStatus } from "@/hooks/useTickets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Clock, CheckCircle2, XCircle, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const statusTabs: { value: TicketStatus | "all"; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All", icon: null },
  { value: "open", label: "Open", icon: <AlertCircle className="h-4 w-4" /> },
  { value: "pending", label: "Pending", icon: <Clock className="h-4 w-4" /> },
  { value: "resolved", label: "Resolved", icon: <CheckCircle2 className="h-4 w-4" /> },
  { value: "closed", label: "Closed", icon: <XCircle className="h-4 w-4" /> },
];

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-orange-500/10 text-orange-600",
  urgent: "bg-destructive/10 text-destructive",
};

const statusColors: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  pending: "bg-yellow-500/10 text-yellow-600",
  resolved: "bg-green-500/10 text-green-600",
  closed: "bg-muted text-muted-foreground",
};

export default function Tickets() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const statusFilter = activeTab === "all" ? undefined : (activeTab as TicketStatus);
  const { data: tickets, isLoading } = useTickets(statusFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tickets</h1>
        <p className="text-muted-foreground">Manage customer support tickets created from incoming emails.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))
          ) : !tickets?.length ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                No tickets found.
              </CardContent>
            </Card>
          ) : (
            tickets.map((ticket) => (
              <Card key={ticket.id} className="transition-colors hover:border-primary/30">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-medium truncate flex items-center gap-2">
                        {ticket.escalation_flag && <Flame className="h-4 w-4 text-destructive shrink-0" />}
                        {ticket.subject}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">{ticket.customer_email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className={cn("text-xs", statusColors[ticket.status])}>
                        {ticket.status}
                      </Badge>
                      <Badge variant="secondary" className={cn("text-xs", priorityColors[ticket.priority])}>
                        {ticket.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {ticket.category && <span className="capitalize">{ticket.category.replace("_", " ")}</span>}
                    <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                    {ticket.last_customer_reply_at && (
                      <span>Last reply {new Date(ticket.last_customer_reply_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
