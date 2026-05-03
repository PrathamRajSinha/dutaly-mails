import { useState, useRef, useCallback, useEffect } from "react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Flame,
  Send,
  StickyNote,
  Loader2,
  Trash2,
  Mail,
  ArrowLeft,
  Check,
  X,
  Edit,
  FileText,
  Paperclip,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useEmailQueue, type QueuedEmail } from "@/hooks/useEmailQueue";
import { useAuth } from "@/hooks/useAuth";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";
import { TemplatePickerDialog } from "@/components/email-templates/TemplatePickerDialog";
import { type EmailTemplate } from "@/hooks/useEmailTemplates";
import { replaceVariables, renderEmailHtml } from "@/lib/emailHtml";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TicketStatus, TicketPriority } from "@/hooks/useTickets";
import { QuickReplyChips } from "@/components/inbox/QuickReplyChips";
import { SnoozeMenu } from "@/components/inbox/SnoozeMenu";
import { SendLaterMenu } from "@/components/inbox/SendLaterMenu";

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
    <div className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium", overdue ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>
      <Clock className="h-3.5 w-3.5" />
      {overdue ? <span>Overdue by {formatDistanceToNow(due)}</span> : <span>{formatDistanceToNow(due, { addSuffix: false })} left</span>}
    </div>
  );
}

function EmailActions({ email, onApprove, onIgnore, onEditSend, onSnooze, onSchedule, isPending }: {
  email: QueuedEmail;
  onApprove: (htmlBody?: string, attachmentUrls?: string[]) => void;
  onIgnore: () => void;
  onEditSend: (reply: string, htmlBody?: string, attachmentUrls?: string[]) => void;
  onSnooze: (until: Date) => void;
  onSchedule: (sendAt: Date, reply?: string) => void;
  isPending: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [editedReply, setEditedReply] = useState(email.suggested_reply || "");
  const [composedReply, setComposedReply] = useState("");
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<EmailTemplate | null>(null);
  const [attachments, setAttachments] = useState<{ name: string; url: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const hasReply = !!email.suggested_reply;

  const handleTemplateSelect = (template: EmailTemplate) => {
    const replaced = replaceVariables(template.body, { sender_name: email.from_name || email.from_address.split("@")[0], subject: email.subject });
    if (isEditing) setEditedReply(replaced); else { setComposedReply(replaced); setIsComposing(true); }
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

  const removeAttachment = (url: string) => setAttachments((prev) => prev.filter((a) => a.url !== url));
  const getHtmlBody = (textBody: string) => activeTemplate ? renderEmailHtml(textBody, activeTemplate) : undefined;
  const attachmentUrls = attachments.length > 0 ? attachments.map((a) => a.url) : undefined;

  const handleQuickReply = (text: string) => {
    setComposedReply(text);
    setIsComposing(true);
  };

  return (
    <div className="space-y-3 pt-2">
      {/* Quick Reply Chips */}
      {!isEditing && !isComposing && (
        <QuickReplyChips onSelect={handleQuickReply} />
      )}
      {isEditing && <Textarea className="min-h-[100px]" value={editedReply} onChange={(e) => setEditedReply(e.target.value)} />}
      {!hasReply && isComposing && <Textarea className="min-h-[100px]" placeholder="Write your reply here..." value={composedReply} onChange={(e) => setComposedReply(e.target.value)} />}
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
          <FileText className="h-3.5 w-3.5" />Template: <span className="font-medium">{activeTemplate.name}</span>
          <button onClick={() => setActiveTemplate(null)} className="text-destructive hover:underline">Remove</button>
        </div>
      )}
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
      <div className="flex flex-wrap gap-2">
        {isEditing ? (
          <>
            <Button size="sm" onClick={() => { onEditSend(editedReply, getHtmlBody(editedReply), attachmentUrls); setIsEditing(false); }} disabled={isPending}>
              {isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}Send Edited
            </Button>
            <SendLaterMenu onSchedule={(sendAt) => onSchedule(sendAt, editedReply)} disabled={isPending} />
            <Button variant="outline" size="sm" onClick={() => setTemplatePickerOpen(true)}><FileText className="mr-1.5 h-3.5 w-3.5" /> Template</Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>{isUploading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Paperclip className="mr-1.5 h-3.5 w-3.5" />}Attach</Button>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
          </>
        ) : isComposing ? (
          <>
            <Button size="sm" onClick={() => { onEditSend(composedReply, getHtmlBody(composedReply), attachmentUrls); setIsComposing(false); }} disabled={isPending || !composedReply.trim()}>
              {isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}Send
            </Button>
            <SendLaterMenu onSchedule={(sendAt) => onSchedule(sendAt, composedReply)} disabled={isPending || !composedReply.trim()} />
            <Button variant="outline" size="sm" onClick={() => setTemplatePickerOpen(true)}><FileText className="mr-1.5 h-3.5 w-3.5" /> Template</Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>{isUploading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Paperclip className="mr-1.5 h-3.5 w-3.5" />}Attach</Button>
            <Button variant="ghost" size="sm" onClick={() => setIsComposing(false)}>Cancel</Button>
          </>
        ) : (
          <>
            {hasReply ? (
              <Button size="sm" onClick={() => onApprove(undefined, attachmentUrls)} disabled={isPending}>
                {isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}Approve & Send
              </Button>
            ) : (
              <Button size="sm" onClick={() => setIsComposing(true)}><Edit className="mr-1.5 h-3.5 w-3.5" /> Compose Reply</Button>
            )}
            {hasReply && (
              <Button variant="outline" size="sm" onClick={() => { setIsEditing(true); setEditedReply(email.suggested_reply || ""); }}>
                <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
              </Button>
            )}
            {hasReply && <SendLaterMenu onSchedule={(sendAt) => onSchedule(sendAt)} disabled={isPending} />}
            <SnoozeMenu onSnooze={onSnooze} disabled={isPending} />
            <Button variant="outline" size="sm" onClick={() => setTemplatePickerOpen(true)}><FileText className="mr-1.5 h-3.5 w-3.5" /> Template</Button>
            <Button variant="ghost" size="sm" onClick={onIgnore} disabled={isPending}><X className="mr-1.5 h-3.5 w-3.5" /> Ignore</Button>
          </>
        )}
      </div>
      <TemplatePickerDialog open={templatePickerOpen} onOpenChange={setTemplatePickerOpen} onSelect={handleTemplateSelect} />
    </div>
  );
}

export function TicketDetailPanel({ ticketId, onBack }: { ticketId: string; onBack: () => void }) {
  const { ticket, emails, notes, isLoading } = useTicketDetail(ticketId);
  const { updateStatus, updatePriority } = useTicketMutations(ticketId);
  const { addNote, deleteNote } = useTicketNotes(ticketId);
  const { updateEmailStatus, sendEmail, snoozeEmail, scheduleEmail } = useEmailQueue();
  const { session } = useAuth();
  const { accounts } = useEmailAccounts();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");
  const [activeSection, setActiveSection] = useState<"conversation" | "notes">("conversation");

  const pendingCount = emails.filter((e) => e.status === "pending").length;

  const handleApprove = async (email: QueuedEmail, htmlBody?: string, attachmentUrls?: string[]) => {
    await sendEmail.mutateAsync({ email, htmlBody, attachmentUrls });
    queryClient.invalidateQueries({ queryKey: ["ticket-emails"] });
  };
  const handleIgnore = async (emailId: string) => {
    await updateEmailStatus.mutateAsync({ id: emailId, status: "ignored" });
    queryClient.invalidateQueries({ queryKey: ["ticket-emails"] });
  };
  const handleEditSend = async (email: QueuedEmail, reply: string, htmlBody?: string, attachmentUrls?: string[]) => {
    await sendEmail.mutateAsync({ email, reply, htmlBody, attachmentUrls });
    queryClient.invalidateQueries({ queryKey: ["ticket-emails"] });
  };
  const handleSnooze = async (emailId: string, until: Date) => {
    await snoozeEmail.mutateAsync({ id: emailId, until });
    queryClient.invalidateQueries({ queryKey: ["ticket-emails"] });
  };
  const handleSchedule = async (emailId: string, sendAt: Date, reply?: string) => {
    await scheduleEmail.mutateAsync({ id: emailId, sendAt, reply });
    queryClient.invalidateQueries({ queryKey: ["ticket-emails"] });
  };

  if (isLoading || !ticket) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const handleAddNote = () => { if (!newNote.trim()) return; addNote.mutate(newNote, { onSuccess: () => setNewNote("") }); };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 space-y-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="lg:hidden -ml-2"><ArrowLeft className="h-4 w-4" /></Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {ticket.escalation_flag && <Flame className="h-4 w-4 text-destructive shrink-0" />}
              <h2 className="text-lg font-semibold text-foreground truncate">{ticket.subject}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{ticket.customer_email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={ticket.status} onValueChange={(v) => updateStatus.mutate(v as TicketStatus)}>
            <SelectTrigger className={cn("w-[130px] h-8 text-xs", statusColors[ticket.status])}><SelectValue /></SelectTrigger>
            <SelectContent>{statusOptions.map((o) => (<SelectItem key={o.value} value={o.value}><span className="flex items-center gap-1.5">{o.icon} {o.label}</span></SelectItem>))}</SelectContent>
          </Select>
          <Select value={ticket.priority} onValueChange={(v) => updatePriority.mutate(v as TicketPriority)}>
            <SelectTrigger className={cn("w-[110px] h-8 text-xs", priorityColors[ticket.priority])}><SelectValue /></SelectTrigger>
            <SelectContent>{priorityOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent>
          </Select>
          <SlaCountdown slaDueAt={ticket.sla_due_at} />
          {ticket.category && <Badge variant="outline" className="text-xs capitalize">{ticket.category.replace("_", " ")}</Badge>}
          {ticket.sentiment_score !== null && <Badge variant="outline" className="text-xs">Sentiment: {Math.round(ticket.sentiment_score * 100)}%</Badge>}
          {ticket.escalation_flag && <Badge variant="destructive" className="text-xs">Angry Customer</Badge>}
        </div>
      </div>

      {/* Section toggle */}
      <div className="flex border-b border-border">
        <button className={cn("flex-1 px-4 py-2.5 text-sm font-medium transition-colors", activeSection === "conversation" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground")} onClick={() => setActiveSection("conversation")}>
          <Mail className="inline h-4 w-4 mr-1.5" />Conversation ({emails.length})
          {pendingCount > 0 && <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px] bg-destructive/10 text-destructive">{pendingCount} pending</Badge>}
        </button>
        <button className={cn("flex-1 px-4 py-2.5 text-sm font-medium transition-colors", activeSection === "notes" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground")} onClick={() => setActiveSection("notes")}>
          <StickyNote className="inline h-4 w-4 mr-1.5" />Notes ({notes.length})
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {activeSection === "conversation" ? (
          <div className="p-4 space-y-4">
            {emails.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No emails linked to this ticket yet.</p>
            ) : (
              emails.map((email) => {
                const isPendingEmail = email.status === "pending";
                const isSent = email.status === "sent" || email.status === "approved" || email.status === "edited" || email.status === "sending";
                const isIgnored = email.status === "ignored";

                return (
                  <Card key={email.id} className="border-border">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{email.from_name || email.from_address}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(email.queued_at), "MMM d, yyyy 'at' h:mm a")}</p>
                        </div>
                        <div className="flex gap-1.5">
                          {email.intent && <Badge variant="outline" className="text-xs capitalize">{email.intent}</Badge>}
                          {email.confidence_score !== null && <Badge variant="secondary" className="text-xs">{Math.round(email.confidence_score * 100)}%</Badge>}
                          {isSent && <Badge className="bg-green-500/10 text-green-600 text-xs">Sent</Badge>}
                          {isIgnored && <Badge variant="secondary" className="text-xs">Ignored</Badge>}
                          {isPendingEmail && <Badge className="bg-yellow-500/10 text-yellow-600 text-xs">Needs Review</Badge>}
                        </div>
                      </div>
                      <div className="rounded-md border border-border bg-muted/30 p-3">
                        <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{email.body}</p>
                      </div>
                      {email.suggested_reply && !isPendingEmail && (
                        <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Send className="h-3 w-3" /> {isSent ? "Reply Sent" : "AI Reply"}</p>
                          <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{email.suggested_reply}</p>
                        </div>
                      )}
                      {isPendingEmail && (
                        <>
                          {email.suggested_reply && (
                            <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><Send className="h-3 w-3" /> AI Suggested Reply</p>
                              <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{email.suggested_reply}</p>
                            </div>
                          )}
                          {email.flag_reason && (
                            <div className="flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-2.5">
                              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-600" />
                              <p className="text-xs text-yellow-700">{email.flag_reason}</p>
                            </div>
                          )}
                          <EmailActions
                            email={email}
                            onApprove={(htmlBody, attachmentUrls) => handleApprove(email, htmlBody, attachmentUrls)}
                            onIgnore={() => handleIgnore(email.id)}
                            onEditSend={(reply, htmlBody, attachmentUrls) => handleEditSend(email, reply, htmlBody, attachmentUrls)}
                            onSnooze={(until) => handleSnooze(email.id, until)}
                            onSchedule={(sendAt, reply) => handleSchedule(email.id, sendAt, reply)}
                            isPending={updateEmailStatus.isPending || sendEmail.isPending}
                          />
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {notes.map((note) => (
              <Card key={note.id} className="border-border">
                <CardContent className="p-3 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{note.note_text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteNote.mutate(note.id)} className="shrink-0 h-7 w-7 p-0 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </CardContent>
              </Card>
            ))}
            <div className="space-y-2">
              <Textarea placeholder="Add an internal note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} className="min-h-[80px]" />
              <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim() || addNote.isPending}>
                {addNote.isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <StickyNote className="mr-2 h-3.5 w-3.5" />}Add Note
              </Button>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
