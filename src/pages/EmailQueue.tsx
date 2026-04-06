import { useState, useEffect, useRef, useCallback } from "react";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";
import { TemplatePickerDialog } from "@/components/email-templates/TemplatePickerDialog";
import { type EmailTemplate } from "@/hooks/useEmailTemplates";
import { replaceVariables, renderEmailHtml } from "@/lib/emailHtml";

const getConfidenceColor = (confidence: number | null) => {
  if (!confidence) return "text-muted-foreground bg-muted";
  if (confidence >= 0.7) return "text-green-600 bg-green-50";
  if (confidence >= 0.5) return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
};

const formatTimeAgo = (date: string) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hr ago`;
  return `${Math.floor(diffMins / 1440)} days ago`;
};

function EmailCard({ 
  email, 
  isExpanded, 
  onToggle, 
  onApprove, 
  onIgnore, 
  onEditSend,
  onAddToKB,
  isPending,
  readOnly = false,
  userName,
}: {
  email: QueuedEmail;
  isExpanded: boolean;
  onToggle: () => void;
  onApprove: (htmlBody?: string, attachmentUrls?: string[]) => void;
  onIgnore: () => void;
  onEditSend: (reply: string, htmlBody?: string, attachmentUrls?: string[]) => void;
  onAddToKB: () => void;
  isPending: boolean;
  readOnly?: boolean;
  userName?: string;
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

  const confidencePercent = email.confidence_score ? Math.round(email.confidence_score * 100) : null;
  const hasReply = !!email.suggested_reply;

  const handleTemplateSelect = (template: EmailTemplate) => {
    const replaced = replaceVariables(template.body, {
      sender_name: email.from_name || email.from_address.split("@")[0],
      subject: email.subject,
      my_name: userName,
    });
    if (isEditing) {
      setEditedReply(replaced);
    } else {
      setComposedReply(replaced);
      setIsComposing(true);
    }
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

  const getHtmlBody = (textBody: string) => {
    if (!activeTemplate) return undefined;
    return renderEmailHtml(textBody, activeTemplate);
  };

  const attachmentUrls = attachments.length > 0 ? attachments.map((a) => a.url) : undefined;

  const statusBadge = () => {
    switch (email.status) {
      case "sent":
      case "sending":
        return <Badge className="bg-green-50 text-green-600 font-medium">Sent</Badge>;
      case "approved":
        return <Badge className="bg-green-50 text-green-600 font-medium">Approved</Badge>;
      case "ignored":
        return <Badge className="bg-muted text-muted-foreground font-medium">Ignored</Badge>;
      case "edited":
        return <Badge className="bg-blue-50 text-blue-600 font-medium">Edited & Sent</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="border border-border overflow-hidden">
      <div
        className="flex cursor-pointer items-center justify-between p-5"
        onClick={onToggle}
      >
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            email.status === "sent" || email.status === "approved" || email.status === "sending"
              ? "bg-green-100"
              : email.status === "ignored"
              ? "bg-muted"
              : "bg-primary/10"
          )}>
            {email.status === "sent" || email.status === "approved" || email.status === "sending" ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : email.status === "ignored" ? (
              <XCircle className="h-5 w-5 text-muted-foreground" />
            ) : email.suggested_reply ? (
              <FileEdit className="h-5 w-5 text-primary" />
            ) : (
              <AlertCircle className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-card-foreground">{email.subject}</h3>
            <p className="text-sm text-muted-foreground">
              From: {email.from_name || email.from_address} • {formatTimeAgo(email.queued_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {statusBadge()}
          {confidencePercent !== null && (
            <Badge className={cn("font-medium", getConfidenceColor(email.confidence_score))}>
              {confidencePercent}%
            </Badge>
          )}
          {email.intent && (
            <Badge variant="outline" className="capitalize">{email.intent}</Badge>
          )}
          {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </div>
      </div>

      {isExpanded && (
        <CardContent className="border-t border-border bg-card px-5 pb-5 pt-5 space-y-4">
          {email.flag_reason && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800">{email.flag_reason}</p>
            </div>
          )}

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Original Email</h4>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{email.body}</p>
            </div>
          </div>

          {/* Suggested Reply Section */}
          {hasReply && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {readOnly ? "Reply Sent" : "AI Suggested Reply"}
              </h4>
              {isEditing ? (
                <Textarea
                  className="min-h-[120px]"
                  value={editedReply}
                  onChange={(e) => setEditedReply(e.target.value)}
                />
              ) : (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{email.suggested_reply}</p>
                </div>
              )}
            </div>
          )}

          {/* Compose area for emails without a suggestion */}
          {!hasReply && !readOnly && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {isComposing ? "Compose Reply" : "No AI reply generated"}
              </h4>
              {isComposing ? (
                <Textarea
                  className="min-h-[120px]"
                  placeholder="Write your reply here..."
                  value={composedReply}
                  onChange={(e) => setComposedReply(e.target.value)}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  This email doesn't have a suggested reply. Compose one manually or ignore it.
                </p>
              )}
            </div>
          )}

          {/* Attachments display */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((a) => (
                <Badge key={a.url} variant="secondary" className="gap-1 pr-1">
                  <Paperclip className="h-3 w-3" />
                  {a.name}
                  <button
                    onClick={() => removeAttachment(a.url)}
                    className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Active template indicator */}
          {activeTemplate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Using template: <span className="font-medium">{activeTemplate.name}</span>
              <button onClick={() => setActiveTemplate(null)} className="text-destructive hover:underline">
                Remove
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />

          {!readOnly && (
            <div className="flex flex-wrap gap-3">
              {isEditing ? (
                <>
                  <Button onClick={() => { onEditSend(editedReply, getHtmlBody(editedReply), attachmentUrls); setIsEditing(false); }} disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Send Edited Reply
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setTemplatePickerOpen(true)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Use Template
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Paperclip className="mr-2 h-4 w-4" />}
                    Attach File
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </>
              ) : isComposing ? (
                <>
                  <Button onClick={() => { onEditSend(composedReply, getHtmlBody(composedReply), attachmentUrls); setIsComposing(false); }} disabled={isPending || !composedReply.trim()}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Send Reply
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setTemplatePickerOpen(true)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Use Template
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Paperclip className="mr-2 h-4 w-4" />}
                    Attach File
                  </Button>
                  <Button variant="outline" onClick={() => setIsComposing(false)}>Cancel</Button>
                </>
              ) : (
                <>
                  {hasReply ? (
                    <Button onClick={() => onApprove(undefined, attachmentUrls)} disabled={isPending}>
                      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                      Approve & Send
                    </Button>
                  ) : (
                    <Button onClick={() => setIsComposing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Compose Reply
                    </Button>
                  )}
                  {hasReply && (
                    <Button variant="outline" onClick={() => { setIsEditing(true); setEditedReply(email.suggested_reply || ""); }}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit & Send
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setTemplatePickerOpen(true)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Use Template
                  </Button>
                  <Button variant="outline" onClick={onIgnore} disabled={isPending}>
                    <X className="mr-2 h-4 w-4" />
                    Ignore
                  </Button>
                  <Button variant="ghost" onClick={onAddToKB}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Knowledge Base
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      )}

      <TemplatePickerDialog
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
        onSelect={handleTemplateSelect}
      />
    </Card>
  );
}

export default function EmailQueue() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { accounts } = useEmailAccounts();
  const { emails: allEmails, needsReview, drafted, sent, ignored, isLoading, updateEmailStatus, pendingCount } = useEmailQueue();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addKBDialogOpen, setAddKBDialogOpen] = useState(false);
  const [selectedEmailForKB, setSelectedEmailForKB] = useState<QueuedEmail | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") || "needs_review";
  });
  const [autoFetchEnabled, setAutoFetchEnabled] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [datePreset, setDatePreset] = useState<string>("all");
  const isFetchingRef = useRef(false);

  const handleAutoFetch = useCallback(async () => {
    if (!session?.access_token || isFetchingRef.current) return;
    isFetchingRef.current = true;
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
      if (totalProcessed > 0) {
        toast.success(`Fetched ${totalProcessed} new email(s)`);
      } else if (totalTotal === 0) {
        toast.info("No unread emails found");
      } else {
        toast.info(`No new emails (${totalSkipped} already processed)`);
      }
    } catch (error) {
      console.error("Fetch emails error:", error);
      toast.error("Failed to fetch emails");
    } finally {
      setIsFetching(false);
    }
  };

  const applyDatePreset = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    switch (preset) {
      case "today":
        setDateFrom(startOfDay(now));
        setDateTo(undefined);
        break;
      case "7d":
        setDateFrom(startOfDay(subDays(now, 7)));
        setDateTo(undefined);
        break;
      case "30d":
        setDateFrom(startOfDay(subDays(now, 30)));
        setDateTo(undefined);
        break;
      case "all":
      default:
        setDateFrom(undefined);
        setDateTo(undefined);
        break;
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

  const handleApprove = async (id: string, _htmlBody?: string, _attachmentUrls?: string[]) => {
    await updateEmailStatus.mutateAsync({ id, status: "approved" });
  };

  const handleIgnore = async (id: string) => {
    await updateEmailStatus.mutateAsync({ id, status: "ignored" });
  };

  const handleEditSend = async (id: string, editedReply: string, _htmlBody?: string, _attachmentUrls?: string[]) => {
    await updateEmailStatus.mutateAsync({ id, status: "edited", editedReply });
  };

  const handleAddToKB = (email: QueuedEmail) => {
    setSelectedEmailForKB(email);
    setAddKBDialogOpen(true);
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
      <div className="space-y-4">
        {filtered.map((email) => (
          <EmailCard
            key={email.id}
            email={email}
            isExpanded={expandedId === email.id}
            onToggle={() => setExpandedId(expandedId === email.id ? null : email.id)}
            onApprove={(htmlBody, attachmentUrls) => handleApprove(email.id, htmlBody, attachmentUrls)}
            onIgnore={() => handleIgnore(email.id)}
            onEditSend={(reply, htmlBody, attachmentUrls) => handleEditSend(email.id, reply, htmlBody, attachmentUrls)}
            onAddToKB={() => handleAddToKB(email)}
            isPending={updateEmailStatus.isPending}
            readOnly={readOnly}
          />
        ))}
      </div>
    );
  };

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
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Email Queue</h1>
          <p className="mt-1 text-muted-foreground">
            Review and manage all processed emails
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={autoFetchEnabled ? "destructive" : "outline"}
            size="sm"
            onClick={() => setAutoFetchEnabled(!autoFetchEnabled)}
          >
            {autoFetchEnabled ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Stop Auto-Fetch
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Auto-Fetch
              </>
            )}
          </Button>
          {autoFetchEnabled && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Every 10s
            </span>
          )}
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
            Fetch Now
          </Button>
        </div>
      </div>

      {/* Search & Date Filter */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Date presets */}
        <div className="flex items-center gap-1">
          {[
            { label: "All", value: "all" },
            { label: "Today", value: "today" },
            { label: "7 days", value: "7d" },
            { label: "30 days", value: "30d" },
          ].map((p) => (
            <Button
              key={p.value}
              variant={datePreset === p.value ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => applyDatePreset(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>

        {/* Custom date range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" />
              {dateFrom ? format(dateFrom, "MMM d") : "From"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={(d) => { setDateFrom(d); setDatePreset("custom"); }}
              initialFocus
              className="p-3 pointer-events-auto"
            />
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
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={(d) => { setDateTo(d); setDatePreset("custom"); }}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {(dateFrom || dateTo) && datePreset === "custom" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={() => applyDatePreset("all")}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all_emails" className="gap-2">
            <Eye className="h-4 w-4" />
            All
            {allEmails.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{allEmails.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="needs_review" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Needs Review
            {needsReview.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{needsReview.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="drafted" className="gap-2">
            <FileEdit className="h-4 w-4" />
            Drafted
            {drafted.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{drafted.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <Send className="h-4 w-4" />
            Sent
            {sent.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{sent.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ignored" className="gap-2">
            <XCircle className="h-4 w-4" />
            Ignored
            {ignored.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{ignored.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all_emails">{renderEmailList(allEmails)}</TabsContent>
        <TabsContent value="needs_review">{renderEmailList(needsReview)}</TabsContent>
        <TabsContent value="drafted">{renderEmailList(drafted)}</TabsContent>
        <TabsContent value="sent">{renderEmailList(sent, true)}</TabsContent>
        <TabsContent value="ignored">{renderEmailList(ignored, true)}</TabsContent>
      </Tabs>

      {/* Add to KB Dialog */}
      <Dialog open={addKBDialogOpen} onOpenChange={setAddKBDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Knowledge Base</DialogTitle>
            <DialogDescription>
              Create a new knowledge entry based on this email interaction.
            </DialogDescription>
          </DialogHeader>
          {selectedEmailForKB && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium">Email Subject</p>
                <p className="text-sm text-muted-foreground">{selectedEmailForKB.subject}</p>
              </div>
              <Textarea
                placeholder="What knowledge should be added from this interaction?"
                rows={4}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddKBDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => { setAddKBDialogOpen(false); toast.success("Added to knowledge base"); }}>
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}