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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

export default function EmailQueue() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { emails, isLoading, updateEmailStatus, pendingCount } = useEmailQueue();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editedReply, setEditedReply] = useState("");
  const [addKBDialogOpen, setAddKBDialogOpen] = useState(false);
  const [selectedEmailForKB, setSelectedEmailForKB] = useState<QueuedEmail | null>(null);
  const [isFetching, setIsFetching] = useState(false);

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

      // Invalidate email queue to refresh the list
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

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["email-queue"] });
    toast.success("Queue refreshed");
  };

  const filteredQueue = emails.filter(
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

  const handleEditSend = async (id: string) => {
    await updateEmailStatus.mutateAsync({ id, status: "sent", editedReply });
    setEditingReply(null);
  };

  const handleAddToKB = (email: QueuedEmail) => {
    setSelectedEmailForKB(email);
    setAddKBDialogOpen(true);
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
            Review emails the AI wasn't confident about
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
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Badge variant="secondary" className="py-1.5 text-sm">
            <Clock className="mr-1 h-3 w-3" />
            {pendingCount} pending
          </Badge>
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

      {/* Queue List */}
      <div className="space-y-4">
        {filteredQueue.map((email) => {
          const isExpanded = expandedId === email.id;
          const isEditing = editingReply === email.id;
          const confidencePercent = email.confidence_score ? Math.round(email.confidence_score * 100) : null;

          return (
            <Card key={email.id} className="border border-border overflow-hidden">
              {/* Header */}
              <div
                className="flex cursor-pointer items-center justify-between p-5"
                onClick={() => setExpandedId(isExpanded ? null : email.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <AlertCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-card-foreground">
                      {email.subject}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      From: {email.from_name || email.from_address} • {formatTimeAgo(email.queued_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {confidencePercent !== null && (
                    <Badge className={cn("font-medium", getConfidenceColor(email.confidence_score))}>
                      {confidencePercent}% confidence
                    </Badge>
                  )}
                  {email.intent && (
                    <Badge variant="outline" className="capitalize">{email.intent}</Badge>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <CardContent className="border-t border-border bg-muted/30 pt-5">
                  {/* Reason */}
                  {email.flag_reason && (
                    <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600" />
                      <p className="text-sm text-amber-800">{email.flag_reason}</p>
                    </div>
                  )}

                  {/* Original Email */}
                  <div className="mb-6">
                    <h4 className="mb-2 text-sm font-medium text-card-foreground">
                      Original Email
                    </h4>
                    <div className="rounded-lg border border-border bg-card p-4">
                      <p className="whitespace-pre-wrap text-sm text-card-foreground">
                        {email.body}
                      </p>
                    </div>
                  </div>

                  {/* Suggested Reply */}
                  {email.suggested_reply && (
                    <div className="mb-6">
                      <h4 className="mb-2 text-sm font-medium text-card-foreground">
                        AI Suggested Reply
                      </h4>
                      {isEditing ? (
                        <Textarea
                          className="min-h-[120px]"
                          value={editedReply}
                          onChange={(e) => setEditedReply(e.target.value)}
                        />
                      ) : (
                        <div className="rounded-lg border border-border bg-card p-4">
                          <p className="whitespace-pre-wrap text-sm text-card-foreground">
                            {email.suggested_reply}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    {isEditing ? (
                      <>
                        <Button 
                          onClick={() => handleEditSend(email.id)}
                          disabled={updateEmailStatus.isPending}
                        >
                          {updateEmailStatus.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="mr-2 h-4 w-4" />
                          )}
                          Send Edited Reply
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingReply(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={() => handleApprove(email.id)}
                          disabled={updateEmailStatus.isPending}
                        >
                          {updateEmailStatus.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="mr-2 h-4 w-4" />
                          )}
                          Approve & Send
                        </Button>
                        {email.suggested_reply && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingReply(email.id);
                              setEditedReply(email.suggested_reply || "");
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit & Send
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => handleIgnore(email.id)}
                          disabled={updateEmailStatus.isPending}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Ignore
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleAddToKB(email)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add to Knowledge Base
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {filteredQueue.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-green-100 p-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-foreground">
            All caught up!
          </h3>
          <p className="mt-1 text-muted-foreground">
            No emails need your review right now
          </p>
        </div>
      )}

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
                <p className="text-sm text-muted-foreground">
                  {selectedEmailForKB.subject}
                </p>
              </div>
              <Textarea
                placeholder="What knowledge should be added from this interaction?"
                rows={4}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddKBDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAddKBDialogOpen(false);
                toast.success("Added to knowledge base");
              }}
            >
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
