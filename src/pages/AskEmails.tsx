import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Send, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Ask Me Anything</h1>
        <p className="mt-1 text-muted-foreground">
          Ask the AI questions about your emails within a date range
        </p>
      </div>

      {/* Date Range */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : "Start date"}
            </Button>
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
        <span className="text-muted-foreground">to</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : "End date"}
            </Button>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStartDate(undefined);
              setEndDate(undefined);
            }}
          >
            Clear dates
          </Button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Ask anything about your emails
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Select a date range and ask questions. The AI will analyze your emails and provide answers.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <Button
                  key={s}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend(s)}
                  disabled={isLoading}
                >
                  {s}
                </Button>
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
                  ? "bg-primary text-primary-foreground"
                  : "bg-card"
              )}
            >
              <CardContent className="p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                </p>
                {msg.role === "assistant" && msg.emails && msg.emails.length > 0 && (
                  <EmailReferenceList
                    emails={msg.emails}
                    onEmailClick={(email) => {
                      setSelectedEmail(email);
                      setDialogOpen(true);
                    }}
                  />
                )}
                {msg.emailCount !== undefined && (
                  <p
                    className={cn(
                      "mt-2 text-xs",
                      msg.role === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    Based on {msg.emailCount} email{msg.emailCount !== 1 ? "s" : ""}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="bg-card">
              <CardContent className="flex items-center gap-2 p-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Analyzing emails...</span>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
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
        <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <EmailDetailDialog
        email={selectedEmail}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
