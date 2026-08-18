import { useState, useEffect } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { 
  CalendarIcon, 
  Send, 
  Loader2, 
  Sparkles, 
  Copy, 
  Download, 
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Inbox
} from "lucide-react";
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
import { RecentQuestions } from "@/components/ask-emails/RecentQuestions";

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

const PRESETS = [
  { label: "Today", getValue: () => ({ start: startOfDay(new Date()), end: endOfDay(new Date()) }) },
  { label: "7d", getValue: () => ({ start: startOfDay(subDays(new Date(), 7)), end: endOfDay(new Date()) }) },
  { label: "30d", getValue: () => ({ start: startOfDay(subDays(new Date(), 30)), end: endOfDay(new Date()) }) },
  { label: "All", getValue: () => ({ start: undefined, end: undefined }) },
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
  
  // Persistence
  const [recentQuestions, setRecentQuestions] = useState<string[]>([]);
  const [savedQuestions, setSavedQuestions] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("ask-emails-saved");
    const recent = localStorage.getItem("ask-emails-recent");
    if (saved) setSavedQuestions(JSON.parse(saved));
    if (recent) setRecentQuestions(JSON.parse(recent));
  }, []);

  const handleSend = async (question?: string) => {
    const q = question || input.trim();
    if (!q || !session?.access_token) return;

    // Add to recent
    const updatedRecent = [q, ...recentQuestions.filter(rq => rq !== q)].slice(0, 10);
    setRecentQuestions(updatedRecent);
    localStorage.setItem("ask-emails-recent", JSON.stringify(updatedRecent));

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const downloadAsMd = (msg: ChatMessage) => {
    const citations = msg.emails?.map(e => `- ${e.from_name || e.from_address}: ${e.subject} (${format(new Date(e.queued_at), "PPP")})`).join("\n") || "";
    const content = `# Inbox Intelligence Answer\n\n${msg.content}\n\n${msg.emailCount ? `*Based on ${msg.emailCount} emails*` : ""}\n\n## Citations\n\n${citations}`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `answer-${format(new Date(), "yyyy-MM-dd")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded as .md");
  };

  const toggleSaveQuestion = (q: string) => {
    let updated;
    if (savedQuestions.includes(q)) {
      updated = savedQuestions.filter(sq => sq !== q);
      toast.info("Removed from saved questions");
    } else {
      updated = [q, ...savedQuestions];
      toast.success("Saved question");
    }
    setSavedQuestions(updated);
    localStorage.setItem("ask-emails-saved", JSON.stringify(updated));
  };

  const clearRecent = () => {
    setRecentQuestions([]);
    localStorage.removeItem("ask-emails-recent");
    toast.info("Recent questions cleared");
  };

  return (
    <div className="flex h-full flex-col p-4 md:p-8 overflow-hidden bg-[#FAFAFF]">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-semibold text-[#1A1730]">Inbox Intelligence</h1>
            <Badge variant="secondary" className="bg-[#EBE9FF] text-[#7C6FE0] border-none text-[10px] font-bold uppercase tracking-wider">AI Powered</Badge>
          </div>
          <p className="mt-0.5 text-[13px] text-[#9490B8]">
            Analyze and query your inbox data with natural language
          </p>
        </div>

        {/* Date Range & Presets */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-xl border border-[rgba(124,111,224,0.1)] shadow-sm">
          <div className="flex items-center gap-1 border-r border-[rgba(124,111,224,0.1)] pr-2 mr-1">
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 text-xs font-medium rounded-lg transition-all",
                  "hover:bg-[#F4F3FF] hover:text-[#7C6FE0]"
                )}
                onClick={() => {
                  const { start, end } = p.getValue();
                  setStartDate(start);
                  setEndDate(end);
                }}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                    startDate ? "text-[#7C6FE0] border-[#7C6FE0] bg-[#F4F3FF]" : "text-[#9490B8] border-[rgba(124,111,224,0.2)] bg-white hover:bg-[#F4F3FF]"
                  )}
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {startDate ? format(startDate, "MMM d") : "Start"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="p-3"
                />
              </PopoverContent>
            </Popover>
            <ChevronRight className="h-3 w-3 text-[#C4BEFF]" />
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                    endDate ? "text-[#7C6FE0] border-[#7C6FE0] bg-[#F4F3FF]" : "text-[#9490B8] border-[rgba(124,111,224,0.2)] bg-white hover:bg-[#F4F3FF]"
                  )}
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {endDate ? format(endDate, "MMM d") : "End"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className="p-3"
                />
              </PopoverContent>
            </Popover>
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStartDate(undefined); setEndDate(undefined); }}
                className="h-8 px-2 text-[10px] text-[#9490B8] hover:text-red-500"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto space-y-6 mb-4 pr-2 custom-scrollbar">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="rounded-2xl bg-[#EBE9FF] p-5 mb-6 shadow-sm border border-[rgba(124,111,224,0.1)]">
                  <Sparkles className="h-10 w-10 text-[#7C6FE0]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1A1730] mb-2">
                  What can I help you find today?
                </h3>
                <p className="text-[14px] text-[#9490B8] mb-8 max-w-md mx-auto">
                  Analyze trends, find specific details, or summarize your communication history across any timeframe.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      disabled={isLoading}
                      className="rounded-xl border border-[rgba(124,111,224,0.15)] bg-white px-5 py-2.5 text-[13px] font-medium text-[#3D3A5C] shadow-sm transition-all hover:bg-[#F4F3FF] hover:border-[#7C6FE0] hover:text-[#7C6FE0] disabled:opacity-50"
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
                  "flex group animate-in fade-in slide-in-from-bottom-2 duration-300",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "flex flex-col gap-2 max-w-[85%]",
                  msg.role === "user" ? "items-end" : "items-start"
                )}>
                  <Card
                    className={cn(
                      "shadow-sm",
                      msg.role === "user"
                        ? "bg-[#7C6FE0] text-white border-none rounded-2xl rounded-tr-none"
                        : "bg-white border-[rgba(124,111,224,0.1)] rounded-2xl rounded-tl-none"
                    )}
                  >
                    <CardContent className="p-4 md:p-5">
                      <p className={cn(
                        "whitespace-pre-wrap text-sm leading-relaxed",
                        msg.role === "user" ? "text-white" : "text-[#3D3A5C]"
                      )}>
                        {msg.content}
                      </p>
                      
                      {msg.role === "assistant" && msg.emailCount !== undefined && msg.emailCount > 0 && (
                        <div className="mt-4 pt-4 border-t border-[rgba(124,111,224,0.05)]">
                          <div className="flex items-center gap-2 mb-3">
                            <Inbox className="h-3.5 w-3.5 text-[#7C6FE0]" />
                            <span className="text-[11px] font-bold text-[#7C6FE0] uppercase tracking-wider">
                              Sources ({msg.emailCount})
                            </span>
                          </div>
                          {msg.emails && (
                            <EmailReferenceList
                              emails={msg.emails}
                              onEmailClick={(email) => {
                                setSelectedEmail(email);
                                setDialogOpen(true);
                              }}
                            />
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Message Actions */}
                  <div className={cn(
                    "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}>
                    {msg.role === "assistant" ? (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-[#9490B8] hover:text-[#7C6FE0] hover:bg-white"
                          onClick={() => copyToClipboard(msg.content)}
                          title="Copy answer"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-[#9490B8] hover:text-[#7C6FE0] hover:bg-white"
                          onClick={() => downloadAsMd(msg)}
                          title="Download .md"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "h-8 w-8 hover:bg-white",
                          savedQuestions.includes(msg.content) ? "text-[#7C6FE0]" : "text-[#9490B8]"
                        )}
                        onClick={() => toggleSaveQuestion(msg.content)}
                        title="Save question"
                      >
                        {savedQuestions.includes(msg.content) ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <Card className="bg-white border border-[rgba(124,111,224,0.1)] rounded-2xl rounded-tl-none">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F3FF]">
                      <Loader2 className="h-4 w-4 animate-spin text-[#7C6FE0]" />
                    </div>
                    <span className="text-sm font-medium text-[#9490B8]">Intelligence at work...</span>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="relative mt-auto">
            <div className="flex items-center gap-3 rounded-2xl border border-[rgba(124,111,224,0.2)] bg-white p-2 pl-5 shadow-sm focus-within:border-[#7C6FE0] transition-all">
              <input
                className="flex-1 bg-transparent py-2.5 text-sm text-[#1A1730] placeholder:text-[#C4BEFF] outline-none min-h-[44px]"
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
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7C6FE0] text-white transition-all hover:bg-[#6B5ED0] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <RecentQuestions 
            recent={recentQuestions}
            saved={savedQuestions}
            onSelect={(q) => handleSend(q)}
            onSave={toggleSaveQuestion}
            onClearRecent={clearRecent}
            onRemoveSaved={toggleSaveQuestion}
          />
        </div>
      </div>

      <EmailDetailDialog
        email={selectedEmail}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

function Badge({ children, variant = "default", className }: { children: React.ReactNode, variant?: "default" | "secondary" | "outline", className?: string }) {
  const variants = {
    default: "bg-[#7C6FE0] text-white",
    secondary: "bg-[#F4F3FF] text-[#7C6FE0]",
    outline: "border border-[rgba(124,111,224,0.2)] text-[#3D3A5C]"
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}
