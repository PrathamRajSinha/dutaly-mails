import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface QueuedEmail {
  id: string;
  user_id: string;
  email_account_id: string | null;
  external_email_id: string | null;
  from_address: string;
  from_name: string | null;
  subject: string;
  body: string;
  suggested_reply: string | null;
  confidence_score: number | null;
  flag_reason: string | null;
  intent: "support" | "sales" | "personal" | "newsletter" | "spam" | "unknown" | null;
  status: "pending" | "approved" | "edited" | "ignored" | "sent" | "sending";
  thread_id: string | null;
  queued_at: string;
  reviewed_at: string | null;
  created_at: string;
}

export type QueueTab = "needs_review" | "drafted" | "sent" | "ignored";

export function useEmailQueue(statusFilter?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: allEmails = [], isLoading, error } = useQuery({
    queryKey: ["email-queue", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_queue")
        .select("*")
        .order("queued_at", { ascending: false });

      if (error) throw error;
      return data as QueuedEmail[];
    },
    enabled: !!user,
  });

  // Categorize emails
  const needsReview = allEmails.filter(
    e => e.status === "pending" && (!e.suggested_reply || (e.confidence_score !== null && e.confidence_score < 0.7))
  );
  const drafted = allEmails.filter(
    e => e.status === "pending" && e.suggested_reply && (e.confidence_score === null || e.confidence_score >= 0.7)
  );
  const sent = allEmails.filter(e => e.status === "sent" || e.status === "approved" || e.status === "edited" || e.status === "sending");
  const ignored = allEmails.filter(e => e.status === "ignored");

  const updateEmailStatus = useMutation({
    mutationFn: async ({ id, status, editedReply }: { id: string; status: QueuedEmail["status"]; editedReply?: string }) => {
      const updates: Partial<QueuedEmail> = {
        status,
        reviewed_at: new Date().toISOString(),
      };
      
      if (editedReply) {
        updates.suggested_reply = editedReply;
      }

      const { data, error } = await supabase
        .from("email_queue")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["email-queue"] });
      if (variables.status === "approved" || variables.status === "sent") {
        toast.success("Email sent successfully");
      } else if (variables.status === "ignored") {
        toast.info("Email ignored");
      }
    },
    onError: (error) => {
      toast.error("Failed to update: " + error.message);
    },
  });

  const deleteEmail = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("email_queue")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-queue"] });
    },
    onError: (error) => {
      toast.error("Failed to delete: " + error.message);
    },
  });

  return {
    emails: allEmails,
    needsReview,
    drafted,
    sent,
    ignored,
    isLoading,
    error,
    updateEmailStatus,
    deleteEmail,
    pendingCount: allEmails.filter(e => e.status === "pending").length,
  };
}