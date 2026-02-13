import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface EmailSummary {
  from_name: string | null;
  from_address: string;
  subject: string;
  status: string;
  intent: string | null;
  queued_at: string;
  confidence_score: number | null;
  suggested_reply: string | null;
}

interface EmailDetailDialogProps {
  email: EmailSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-600 border-green-500/20",
  sent: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  ignored: "bg-muted text-muted-foreground border-border",
  flagged: "bg-red-500/10 text-red-600 border-red-500/20",
};

export function EmailDetailDialog({ email, open, onOpenChange }: EmailDetailDialogProps) {
  if (!email) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">{email.subject}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">From</p>
              <p className="font-medium text-foreground">
                {email.from_name || email.from_address}
              </p>
              {email.from_name && (
                <p className="text-xs text-muted-foreground">{email.from_address}</p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Received</p>
              <p className="font-medium text-foreground">
                {format(new Date(email.queued_at), "PPP p")}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className={statusColors[email.status] || ""}>
              {email.status}
            </Badge>
            {email.intent && (
              <Badge variant="secondary">{email.intent}</Badge>
            )}
            {email.confidence_score !== null && (
              <Badge variant="outline">
                Confidence: {Math.round(email.confidence_score * 100)}%
              </Badge>
            )}
          </div>

          {email.suggested_reply && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-2">AI Generated Reply</p>
                <div className="rounded-md bg-muted p-3 text-sm text-foreground whitespace-pre-wrap">
                  {email.suggested_reply}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
