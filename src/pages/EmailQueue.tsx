import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useEmailQueue, type QueuedEmail } from "@/hooks/useEmailQueue";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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
}: {
  email: QueuedEmail;
  isExpanded: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onIgnore: () => void;
  onEditSend: (reply: string) => void;
  onAddToKB: () => void;
  isPending: boolean;
  readOnly?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [editedReply, setEditedReply] = useState(email.suggested_reply || "");
  const [composedReply, setComposedReply] = useState("");
  const confidencePercent = email.confidence_score ? Math.round(email.confidence_score * 100) : null;
  const hasReply = !!email.suggested_reply;

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

          {!readOnly && (
            <div className="flex flex-wrap gap-3">
              {isEditing ? (
                <>
                  <Button onClick={() => { onEditSend(editedReply); setIsEditing(false); }} disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Send Edited Reply
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </>
              ) : isComposing ? (
                <>
                  <Button onClick={() => { onEditSend(composedReply); setIsComposing(false); }} disabled={isPending || !composedReply.trim()}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Send Reply
                  </Button>
                  <Button variant="outline" onClick={() => setIsComposing(false)}>Cancel</Button>
                </>
              ) : (
                <>
                  {hasReply ? (
                    <Button onClick={onApprove} disabled={isPending}>
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
    </Card>
  );
}

export default function EmailQueue() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { needsReview, drafted, sent, ignored, isLoading, updateEmailStatus, pendingCount } = useEmailQueue();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addKBDialogOpen, setAddKBDialogOpen] = useState(false);
  const [selectedEmailForKB, setSelectedEmailForKB] = useState<QueuedEmail | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [activeTab, setActiveTab] = useState("needs_review");

  const handleFetchEmails = async () => {
    if (!session?.access_token) {
      toast.error("Please sign in to fetch emails");
      return;
    }
    setIsFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-gmail-emails", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["email-queue"] });
      if (data.processed > 0) {
        toast.success(`Fetched ${data.processed} new email(s)`);
      } else if (data.total === 0) {
        toast.info("No unread emails found");
      } else {
        toast.info(`No new emails (${data.skipped} already processed)`);
      }
    } catch (error) {
      console.error("Fetch emails error:", error);
      toast.error("Failed to fetch emails");
    } finally {
      setIsFetching(false);
    }
  };

  const filterEmails = (emails: QueuedEmail[]) =>
    emails.filter(
      (email) =>
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.from_address.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            onApprove={() => handleApprove(email.id)}
            onIgnore={() => handleIgnore(email.id)}
            onEditSend={(reply) => handleEditSend(email.id, reply)}
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
            Fetch New Emails
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["email-queue"] });
              toast.success("Queue refreshed");
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
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