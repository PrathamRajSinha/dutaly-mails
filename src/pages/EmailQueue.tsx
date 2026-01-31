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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface QueuedEmail {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  confidence: number;
  reason: string;
  suggestedReply: string;
  category: string;
}

const initialQueue: QueuedEmail[] = [
  {
    id: "1",
    from: "sarah@startup.io",
    subject: "Partnership opportunity discussion",
    body: "Hi there,\n\nI'm the BD lead at Startup.io and I've been following your company's growth. We're building a complementary product and I think there could be great synergy between our solutions.\n\nWould you be open to a quick call next week to explore potential partnership opportunities?\n\nBest,\nSarah",
    receivedAt: "32 min ago",
    confidence: 42,
    reason: "Partnership inquiries are outside knowledge base scope",
    suggestedReply: "Thank you for reaching out about a potential partnership. I'll forward this to our business development team who will be in touch with you shortly to schedule a call.",
    category: "Partnership",
  },
  {
    id: "2",
    from: "james@enterprise.com",
    subject: "Custom pricing request for 500+ users",
    body: "Hello,\n\nWe're evaluating your solution for our organization of 500+ employees. The pricing page shows up to 100 users - what are the options for enterprise deployment?\n\nAlso interested in:\n- SSO integration\n- Dedicated support\n- SLA guarantees\n\nPlease advise.\n\nJames Miller\nIT Director, Enterprise Corp",
    receivedAt: "1 hr ago",
    confidence: 35,
    reason: "Enterprise pricing not in knowledge base",
    suggestedReply: "Thank you for your interest in our enterprise solution. For organizations of 500+ users, we offer custom pricing with dedicated support, SSO integration, and SLA guarantees. I'll have our enterprise sales team reach out to you with a tailored proposal.",
    category: "Sales",
  },
  {
    id: "3",
    from: "angry.customer@email.com",
    subject: "URGENT: Service outage affecting our team",
    body: "This is unacceptable! Our team has been unable to access the platform for the past 2 hours. We have critical deadlines and this is severely impacting our work.\n\nWe need this resolved IMMEDIATELY or we'll be forced to look at alternatives.\n\nExpecting a response within the hour.",
    receivedAt: "45 min ago",
    confidence: 28,
    reason: "Urgent complaint requires human attention",
    suggestedReply: "I sincerely apologize for the service disruption you're experiencing. I understand how critical this is for your team. I'm escalating this to our technical team immediately and someone will reach out to you within the next 30 minutes with an update.",
    category: "Support",
  },
  {
    id: "4",
    from: "intern@company.org",
    subject: "Question about API rate limits",
    body: "Hi,\n\nI'm working on integrating your API and noticed we're hitting rate limits. The docs mention 1000 requests/minute but we're getting 429 errors at around 800.\n\nIs there something we're missing? Any way to increase the limit?\n\nThanks!",
    receivedAt: "2 hrs ago",
    confidence: 55,
    reason: "Technical details partially match knowledge base but need verification",
    suggestedReply: "Thank you for reaching out about the API rate limits. The standard limit is indeed 1000 requests per minute. The discrepancy you're seeing might be due to concurrent request handling. I'd recommend implementing exponential backoff. For higher limits, please contact our API team with your use case details.",
    category: "Technical",
  },
];

export default function EmailQueue() {
  const [queue, setQueue] = useState<QueuedEmail[]>(initialQueue);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editedReply, setEditedReply] = useState("");
  const [addKBDialogOpen, setAddKBDialogOpen] = useState(false);
  const [selectedEmailForKB, setSelectedEmailForKB] = useState<QueuedEmail | null>(null);

  const filteredQueue = queue.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = (id: string) => {
    setQueue(queue.filter((e) => e.id !== id));
    toast.success("Email reply sent successfully");
  };

  const handleIgnore = (id: string) => {
    setQueue(queue.filter((e) => e.id !== id));
    toast.info("Email ignored");
  };

  const handleEditSend = (id: string) => {
    setQueue(queue.filter((e) => e.id !== id));
    setEditingReply(null);
    toast.success("Edited reply sent successfully");
  };

  const handleAddToKB = (email: QueuedEmail) => {
    setSelectedEmailForKB(email);
    setAddKBDialogOpen(true);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return "text-green-600 bg-green-50";
    if (confidence >= 50) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

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
          <Badge variant="secondary" className="py-1.5 text-sm">
            <Clock className="mr-1 h-3 w-3" />
            {queue.length} pending
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
                      From: {email.from} • {email.receivedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={cn("font-medium", getConfidenceColor(email.confidence))}>
                    {email.confidence}% confidence
                  </Badge>
                  <Badge variant="outline">{email.category}</Badge>
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
                  <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600" />
                    <p className="text-sm text-amber-800">{email.reason}</p>
                  </div>

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
                          {email.suggestedReply}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    {isEditing ? (
                      <>
                        <Button onClick={() => handleEditSend(email.id)}>
                          <Send className="mr-2 h-4 w-4" />
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
                        <Button onClick={() => handleApprove(email.id)}>
                          <Check className="mr-2 h-4 w-4" />
                          Approve & Send
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingReply(email.id);
                            setEditedReply(email.suggestedReply);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit & Send
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleIgnore(email.id)}
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
