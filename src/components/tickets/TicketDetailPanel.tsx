import { useState } from "react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Flame,
  Send,
  StickyNote,
  ChevronRight,
  Loader2,
  Trash2,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTicketDetail } from "@/hooks/useTicketDetail";
import { useTicketMutations } from "@/hooks/useTicketMutations";
import { useTicketNotes } from "@/hooks/useTicketNotes";
import type { TicketStatus, TicketPriority } from "@/hooks/useTickets";

const statusOptions: { value: TicketStatus; label: string; icon: React.ReactNode }[] = [
  { value: "open", label: "Open", icon: <AlertCircle className="h-3.5 w-3.5" /> },
  { value: "pending", label: "Pending", icon: <Clock className="h-3.5 w-3.5" /> },
  { value: "resolved", label: "Resolved", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  { value: "closed", label: "Closed", icon: <XCircle className="h-3.5 w-3.5" /> },
];

const priorityOptions: { value: TicketPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
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

function SlaCountdown({ slaDueAt }: { slaDueAt: string | null }) {
  if (!slaDueAt) return null;
  const due = new Date(slaDueAt);
  const overdue = isPast(due);

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
        overdue ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      {overdue ? (
        <span>Overdue by {formatDistanceToNow(due)}</span>
      ) : (
        <span>{formatDistanceToNow(due, { addSuffix: false })} left</span>
      )}
    </div>
  );
}

export function TicketDetailPanel({
  ticketId,
  onBack,
}: {
  ticketId: string;
  onBack: () => void;
}) {
  const { ticket, emails, notes, isLoading } = useTicketDetail(ticketId);
  const { updateStatus, updatePriority } = useTicketMutations(ticketId);
  const { addNote, deleteNote } = useTicketNotes(ticketId);
  const [newNote, setNewNote] = useState("");
  const [activeSection, setActiveSection] = useState<"conversation" | "notes">("conversation");

  if (isLoading || !ticket) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNote.mutate(newNote, { onSuccess: () => setNewNote("") });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 space-y-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="lg:hidden -ml-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {ticket.escalation_flag && <Flame className="h-4 w-4 text-destructive shrink-0" />}
              <h2 className="text-lg font-semibold text-foreground truncate">{ticket.subject}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{ticket.customer_email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={ticket.status}
            onValueChange={(v) => updateStatus.mutate(v as TicketStatus)}
          >
            <SelectTrigger className={cn("w-[130px] h-8 text-xs", statusColors[ticket.status])}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  <span className="flex items-center gap-1.5">{o.icon} {o.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={ticket.priority}
            onValueChange={(v) => updatePriority.mutate(v as TicketPriority)}
          >
            <SelectTrigger className={cn("w-[110px] h-8 text-xs", priorityColors[ticket.priority])}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <SlaCountdown slaDueAt={ticket.sla_due_at} />

          {ticket.category && (
            <Badge variant="outline" className="text-xs capitalize">
              {ticket.category.replace("_", " ")}
            </Badge>
          )}

          {ticket.sentiment_score !== null && (
            <Badge variant="outline" className="text-xs">
              Sentiment: {Math.round(ticket.sentiment_score * 100)}%
            </Badge>
          )}
        </div>
      </div>

      {/* Section toggle */}
      <div className="flex border-b border-border">
        <button
          className={cn(
            "flex-1 px-4 py-2.5 text-sm font-medium transition-colors",
            activeSection === "conversation"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveSection("conversation")}
        >
          <Mail className="inline h-4 w-4 mr-1.5" />
          Conversation ({emails.length})
        </button>
        <button
          className={cn(
            "flex-1 px-4 py-2.5 text-sm font-medium transition-colors",
            activeSection === "notes"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveSection("notes")}
        >
          <StickyNote className="inline h-4 w-4 mr-1.5" />
          Notes ({notes.length})
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {activeSection === "conversation" ? (
          <div className="p-4 space-y-4">
            {emails.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No emails linked to this ticket yet.
              </p>
            ) : (
              emails.map((email) => (
                <Card key={email.id} className="border-border">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {email.from_name || email.from_address}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(email.queued_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        {email.intent && (
                          <Badge variant="outline" className="text-xs capitalize">{email.intent}</Badge>
                        )}
                        {email.status !== "pending" && (
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              (email.status === "sent" || email.status === "approved") && "bg-green-500/10 text-green-600"
                            )}
                          >
                            {email.status}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="rounded-md border border-border bg-muted/30 p-3">
                      <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                        {email.body}
                      </p>
                    </div>

                    {email.suggested_reply && (
                      <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                          <Send className="h-3 w-3" /> AI Reply
                        </p>
                        <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                          {email.suggested_reply}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {notes.map((note) => (
              <Card key={note.id} className="border-border">
                <CardContent className="p-3 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{note.note_text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNote.mutate(note.id)}
                    className="shrink-0 h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}

            <div className="space-y-2">
              <Textarea
                placeholder="Add an internal note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[80px]"
              />
              <Button
                size="sm"
                onClick={handleAddNote}
                disabled={!newNote.trim() || addNote.isPending}
              >
                {addNote.isPending ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <StickyNote className="mr-2 h-3.5 w-3.5" />
                )}
                Add Note
              </Button>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
