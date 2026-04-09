import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Send, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmailDetailDialog, type EmailSummary } from "@/components/ask-emails/EmailDetailDialog";
import { EmailReferenceList } from "@/components/ask-emails/EmailReferenceList";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  emailCount?: number;
  emails?: EmailSummary[];
}

const SUGGESTIONS = [
  "Summarize all support emails",
  "What unresolved questions do I have?",
  "Which emails had low confidence scores?",
  "List all senders and their topics",
];

export default function AskEmails() {
  const { session } = useAuth();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailSummary | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSend = async (question?: string) => {
    const q = question || input.trim();
    if (!q || !session?.access_token) return;

    const userMsg: ChatMessage = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ask-about-emails", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          question: q,
          start_date: startDate ? startDate.toISOString() : undefined,
          end_date: endDate ? endDate.toISOString() : undefined,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.answer,
            emailCount: data.email_count,
            emails: data.emails || [],
          },
        ]);
      }
    } catch (err) {
      console.error("Ask error:", err);
      toast.error("Failed to get answer");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-medium text-[#1A1730]">Inbox Intelligence</h1>
          <p className="mt-0.5 text-[13px] text-[#9490B8]">
            Ask the AI questions about your emails within a date range
          </p>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border border-[rgba(124,111,224,0.2)] bg-white px-3.5 py-2 text-[13px] font-normal transition-colors hover:bg-[#F4F3FF]",
                  startDate ? "text-[#1A1730] border-[#7C6FE0] bg-[#EBE9FF]" : "text-[#9490B8]"
                )}
              >
                <CalendarIcon className="h-4 w-4 text-[#7C6FE0]" />
                {startDate ? format(startDate, "PPP") : "Start date"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <span className="text-[13px] text-[#9490B8]">to</span>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border border-[rgba(124,111,224,0.2)] bg-white px-3.5 py-2 text-[13px] font-normal transition-colors hover:bg-[#F4F3FF]",
                  endDate ? "text-[#1A1730] border-[#7C6FE0] bg-[#EBE9FF]" : "text-[#9490B8]"
                )}
              >
                <CalendarIcon className="h-4 w-4 text-[#7C6FE0]" />
                {endDate ? format(endDate, "PPP") : "End date"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(undefined); setEndDate(undefined); }}
              className="text-xs text-[#9490B8] hover:text-[#7C6FE0] transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-2xl bg-[#EBE9FF] p-4 mb-5">
              <Sparkles className="h-8 w-8 text-[#7C6FE0]" />
            </div>
            <h3 className="text-base font-medium text-[#1A1730] mb-2">
              Ask anything about your emails
            </h3>
            <p className="text-[13px] text-[#9490B8] mb-6 max-w-md">
              Select a date range and ask questions. The AI will analyze your emails and provide answers.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  disabled={isLoading}
                  className="rounded-full border border-[rgba(124,111,224,0.2)] bg-white px-3.5 py-1.5 text-xs text-[#3D3A5C] transition-colors hover:bg-[#F4F3FF] hover:border-[rgba(124,111,224,0.4)] disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <Card
              className={cn(
                "max-w-[80%]",
                msg.role === "user"
                  ? "bg-[#7C6FE0] text-white border-none"
                  : "bg-white border border-[rgba(124,111,224,0.1)]"
              )}
            >
              <CardContent className="p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                </p>
                {msg.role === "assistant" && msg.emailCount !== undefined && (
                  <p className="mt-2 text-xs text-[#9490B8]">
                    Based on {msg.emailCount} email{msg.emailCount !== 1 ? "s" : ""}
                  </p>
                )}
                {msg.role === "assistant" && msg.emails && msg.emails.length > 0 && (
                  <EmailReferenceList
                    emails={msg.emails}
                    onEmailClick={(email) => {
                      setSelectedEmail(email);
                      setDialogOpen(true);
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="bg-white border border-[rgba(124,111,224,0.1)]">
              <CardContent className="flex items-center gap-2 p-4">
                <Loader2 className="h-4 w-4 animate-spin text-[#7C6FE0]" />
                <span className="text-sm text-[#9490B8]">Analyzing emails...</span>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 rounded-xl border border-[rgba(124,111,224,0.2)] bg-white px-4 py-3">
        <input
          className="flex-1 bg-transparent text-sm text-[#1A1730] placeholder:text-[#C4BEFF] outline-none"
          placeholder="Ask a question about your emails..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={isLoading}
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C6FE0] text-white transition-colors hover:bg-[#6B5ED0] disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>

      <EmailDetailDialog
        email={selectedEmail}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
