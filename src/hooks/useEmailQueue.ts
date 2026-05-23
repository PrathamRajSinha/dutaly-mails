import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSelectedAccount } from "@/contexts/SelectedAccountContext";
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
  status: "pending" | "approved" | "edited" | "ignored" | "sent" | "sending" | "scheduled" | "snoozed";
  thread_id: string | null;
  queued_at: string;
  reviewed_at: string | null;
  created_at: string;
  scheduled_send_at: string | null;
  snoozed_until: string | null;
}

export type QueueTab = "needs_review" | "drafted" | "sent" | "ignored";

export function useEmailQueue(statusFilter?: string) {
  const { user, session } = useAuth();
  const { selectedAccountId, connectedAccountIds, accountsLoading } = useSelectedAccount();
  const queryClient = useQueryClient();

  const scopeIds =
    selectedAccountId === "all" ? connectedAccountIds : [selectedAccountId];

  const { data: allEmails = [], isLoading, error } = useQuery({
    queryKey: ["email-queue", user?.id, selectedAccountId, scopeIds.join(",")],
    queryFn: async () => {
      if (scopeIds.length === 0) return [] as QueuedEmail[];
      const { data, error } = await supabase
        .from("email_queue")
        .select("*")
        .in("email_account_id", scopeIds)
        .order("queued_at", { ascending: false });

      if (error) throw error;
      return data as QueuedEmail[];
    },
    enabled: !!user && !accountsLoading,
  });

  // Realtime: refresh when new emails arrive or status changes for this user
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`email-queue-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "email_queue",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["email-queue"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

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

  const sendEmail = useMutation({
    mutationFn: async ({
      email,
      reply,
      htmlBody,
      attachmentUrls,
    }: {
      email: QueuedEmail;
      reply?: string;
      htmlBody?: string;
      attachmentUrls?: string[];
    }) => {
      if (!session?.access_token) {
        throw new Error("Please sign in to send emails");
      }

      if (!email.email_account_id) {
        throw new Error("No email account is connected to this conversation");
      }

      const replyBody = reply?.trim() || email.suggested_reply?.trim();
      if (!replyBody) {
        throw new Error("Reply content is empty");
      }

      const { data: account, error: accountError } = await supabase
        .from("email_accounts")
        .select("provider, is_active")
        .eq("id", email.email_account_id)
        .single();

      if (accountError || !account) {
        throw accountError ?? new Error("Email account not found");
      }

      if (!account.is_active) {
        throw new Error("This email account is paused");
      }

      const functionName = account.provider === "gmail"
        ? "send-gmail-reply"
        : "send-imap-reply";

      const payload: Record<string, unknown> = {
        email_account_id: email.email_account_id,
        to_address: email.from_address,
        subject: email.subject,
        body: replyBody,
      };

      if (htmlBody) {
        payload.html_body = htmlBody;
      }

      if (attachmentUrls?.length) {
        payload.attachments = attachmentUrls;
      }

      if (email.thread_id) {
        payload.thread_id = email.thread_id;
      }

      if (account.provider === "gmail" && email.external_email_id) {
        payload.message_id = email.external_email_id;
      }

      const { data: sendData, error: sendError } = await supabase.functions.invoke(functionName, {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: payload,
      });

      if (sendError) {
        // Try to extract a user-friendly error from the function's response body
        let friendly: string | null = null;
        try {
          const ctx = (sendError as { context?: Response }).context;
          if (ctx && typeof ctx.json === "function") {
            const parsed = await ctx.json();
            if (parsed && typeof parsed.error === "string") friendly = parsed.error;
          }
        } catch { /* ignore */ }
        throw new Error(friendly || "We couldn't send your email. Please try again.");
      }

      if (
        sendData &&
        typeof sendData === "object" &&
        "error" in sendData &&
        typeof sendData.error === "string"
      ) {
        throw new Error(sendData.error);
      }

      const updates: Partial<QueuedEmail> = {
        status: "sent",
        reviewed_at: new Date().toISOString(),
      };

      if (reply) {
        updates.suggested_reply = replyBody;
      }

      const { error: queueError } = await supabase
        .from("email_queue")
        .update(updates)
        .eq("id", email.id);

      if (queueError) {
        throw queueError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-queue"] });
      queryClient.invalidateQueries({ queryKey: ["ticket-emails"] });
      toast.success("Email sent successfully");
    },
    onError: (error) => {
      toast.error("Failed to send email: " + error.message);
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

  const snoozeEmail = useMutation({
    mutationFn: async ({ id, until }: { id: string; until: Date }) => {
      const { error } = await supabase
        .from("email_queue")
        .update({ status: "snoozed" as any, snoozed_until: until.toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-queue"] });
      toast.success("Email snoozed");
    },
    onError: (error) => {
      toast.error("Failed to snooze: " + error.message);
    },
  });

  const scheduleEmail = useMutation({
    mutationFn: async ({ id, sendAt, reply }: { id: string; sendAt: Date; reply?: string }) => {
      const updates: any = {
        status: "scheduled" as any,
        scheduled_send_at: sendAt.toISOString(),
      };
      if (reply) updates.suggested_reply = reply;
      const { error } = await supabase
        .from("email_queue")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-queue"] });
      toast.success("Email scheduled");
    },
    onError: (error) => {
      toast.error("Failed to schedule: " + error.message);
    },
  });

  const snoozed = allEmails.filter(e => e.status === "snoozed" as any);
  const scheduled = allEmails.filter(e => e.status === "scheduled" as any);

  return {
    emails: allEmails,
    needsReview,
    drafted,
    sent,
    ignored,
    snoozed,
    scheduled,
    isLoading,
    error,
    updateEmailStatus,
    sendEmail,
    deleteEmail,
    snoozeEmail,
    scheduleEmail,
    pendingCount: allEmails.filter(e => e.status === "pending").length,
  };
}