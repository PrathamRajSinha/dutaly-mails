import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { X, Eye } from "lucide-react";

interface PendingSend {
  id: string;
  from_name: string | null;
  from_address: string;
  subject: string;
  ticket_id: string | null;
  scheduled_at: number; // timestamp when it should send
  windowSeconds: number;
}

export function UnsendToastProvider() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingSends, setPendingSends] = useState<PendingSend[]>([]);

  // Poll for emails in "sending" status
  useEffect(() => {
    if (!user) return;

    const checkSending = async () => {
      const { data } = await supabase
        .from("email_queue")
        .select("id, from_name, from_address, subject, ticket_id, queued_at")
        .eq("user_id", user.id)
        .eq("status", "sending")
        .order("queued_at", { ascending: false })
        .limit(5);

      if (data && data.length > 0) {
        // Get unsend window from ai_instructions
        const { data: instructions } = await supabase
          .from("ai_instructions")
          .select("unsend_window_seconds")
          .eq("user_id", user.id)
          .single();

        const windowSeconds = instructions?.unsend_window_seconds ?? 60;

        if (windowSeconds === 0) {
          // Unsend window is off - don't show toasts
          return;
        }

        const newPending = data
          .filter((e) => !pendingSends.find((p) => p.id === e.id))
          .map((e) => ({
            id: e.id,
            from_name: e.from_name,
            from_address: e.from_address,
            subject: e.subject,
            ticket_id: e.ticket_id,
            scheduled_at: new Date(e.queued_at).getTime() + windowSeconds * 1000,
            windowSeconds,
          }));

        if (newPending.length > 0) {
          setPendingSends((prev) => [...prev, ...newPending]);
        }
      }
    };

    checkSending();
    const interval = setInterval(checkSending, 10000);
    return () => clearInterval(interval);
  }, [user, pendingSends]);

  const handleCancel = useCallback(async (id: string) => {
    try {
      await supabase
        .from("email_queue")
        .update({ status: "pending" })
        .eq("id", id);
      setPendingSends((prev) => prev.filter((p) => p.id !== id));
      toast.success("Auto-reply cancelled. Moved to review queue.");
    } catch {
      toast.error("Failed to cancel");
    }
  }, []);

  const handleView = useCallback(() => {
    navigate("/inbox");
  }, [navigate]);

  const handleDismiss = useCallback((id: string) => {
    setPendingSends((prev) => prev.filter((p) => p.id !== id));
    toast.dismiss(`unsend-${id}`);
  }, []);

  // Show toast for each pending send
  useEffect(() => {
    pendingSends.forEach((send) => {
      const remaining = Math.max(0, Math.ceil((send.scheduled_at - Date.now()) / 1000));
      if (remaining <= 0) {
        // Time's up - remove from list
        setPendingSends((prev) => prev.filter((p) => p.id !== send.id));
        return;
      }

      const customerName = send.from_name || send.from_address;
      toast(
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            AI is sending a reply to <strong>{customerName}</strong> in {remaining}s
          </p>
          <p className="text-xs text-muted-foreground truncate">{send.subject}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => handleView(send.ticket_id)}
            >
              <Eye className="mr-1 h-3 w-3" />
              View
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 text-xs"
              onClick={() => handleCancel(send.id)}
            >
              <X className="mr-1 h-3 w-3" />
              Cancel
            </Button>
          </div>
        </div>,
        {
          id: `unsend-${send.id}`,
          duration: remaining * 1000,
          dismissible: false,
        }
      );
    });
  }, [pendingSends, handleCancel, handleView]);

  return null;
}
