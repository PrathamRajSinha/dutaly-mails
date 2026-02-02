import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface AIInstructions {
  id: string;
  user_id: string;
  system_prompt: string;
  tone: "formal" | "professional" | "friendly" | "concise";
  reply_length: "short" | "medium" | "long";
  signature: string;
  auto_reply_enabled: boolean;
  escalate_unknown: boolean;
  ignore_spam: boolean;
  ignore_promotions: boolean;
  auto_reply_confidence_threshold: number;
  greeting_response_enabled: boolean;
  greeting_template: string;
  created_at: string;
  updated_at: string;
}

const defaultInstructions = `You are an AI email assistant. Follow these rules strictly:

1. REPLYING TO EMAILS
   - Only answer questions using information from the knowledge base
   - If you're unsure or the information isn't in the knowledge base, send the email to the review queue
   - Never make up information or guess answers
   - Keep replies concise (1-2 paragraphs maximum)

2. EMAILS TO IGNORE
   - Newsletters and promotional emails
   - Cold sales pitches
   - Spam or suspicious emails
   - Emails marked as spam

3. EMAILS TO ESCALATE
   - Urgent requests or complaints
   - Requests for meetings or calls
   - Partnership inquiries
   - Any email asking for something not covered in the knowledge base

4. TONE & STYLE
   - Be professional but friendly
   - Use the user's first name when available
   - End with a helpful closing`;

export function useAIInstructions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: instructions, isLoading, error } = useQuery({
    queryKey: ["ai-instructions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_instructions")
        .select("*")
        .single();

      if (error) {
        // If no record exists, return default values
        if (error.code === "PGRST116") {
          return {
            system_prompt: defaultInstructions,
            tone: "professional" as const,
            reply_length: "medium" as const,
            signature: "Best regards,\nThe Team",
            auto_reply_enabled: false,
            escalate_unknown: true,
            ignore_spam: true,
            ignore_promotions: true,
            auto_reply_confidence_threshold: 0.8,
            greeting_response_enabled: true,
            greeting_template: "Hello! Thank you for reaching out. How can I assist you today?",
          };
        }
        throw error;
      }
      return data as AIInstructions;
    },
    enabled: !!user,
  });

  const updateInstructions = useMutation({
    mutationFn: async (updates: Partial<AIInstructions>) => {
      // Use upsert to handle both insert and update in one operation
      // This is more reliable than checking existence first
      const { data, error } = await supabase
        .from("ai_instructions")
        .upsert({
          ...updates,
          user_id: user!.id,
          system_prompt: updates.system_prompt || defaultInstructions,
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-instructions"] });
      toast.success("Instructions saved");
    },
    onError: (error) => {
      toast.error("Failed to save: " + error.message);
    },
  });

  return {
    instructions,
    isLoading,
    error,
    updateInstructions,
    defaultInstructions,
  };
}
