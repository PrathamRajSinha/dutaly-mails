import { useRef, useState, useEffect } from "react";
import { Loader2, Send, Sparkles, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Suggestion {
  title: string;
  content: string;
  category: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  suggestions?: Suggestion[];
}

const STARTER: ChatMessage = {
  role: "assistant",
  content:
    "Hi! Tell me about your business and the questions your customers ask most. I'll turn your answers into knowledge base entries so the AI can reply accurately. What does your business do?",
};

interface KbChatPanelProps {
  onSaveEntry: (entry: Suggestion) => Promise<void>;
}

export function KbChatPanel({ onSaveEntry }: KbChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([STARTER]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  const send = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const history = [...messages, { role: "user" as const, content: text }];
    setMessages(history);
    setInput("");
    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("kb-chat", {
        body: {
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.reply ?? "Got it.",
          suggestions: Array.isArray(data?.kb_entries) ? data.kb_entries : [],
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not reach the assistant. Please try again.";
      toast.error(message);
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleSave = async (suggestion: Suggestion, key: string) => {
    setSavingKey(key);
    try {
      await onSaveEntry(suggestion);
      setSavedKeys((prev) => new Set(prev).add(key));
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <Card className="border-slate-200">
      <CardContent className="flex h-[560px] flex-col gap-4 p-0">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((message, idx) => (
            <div key={idx} className="space-y-3">
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap",
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {message.content}
              </div>

              {message.suggestions?.map((suggestion, sIdx) => {
                const key = `${idx}-${sIdx}`;
                const saved = savedKeys.has(key);
                return (
                  <div
                    key={key}
                    className="max-w-[85%] space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">
                        Suggested knowledge entry
                      </span>
                      <Badge variant="outline" className="ml-auto capitalize text-[10px]">
                        {suggestion.category}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{suggestion.title}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {suggestion.content}
                    </p>
                    <Button
                      size="sm"
                      variant={saved ? "outline" : "default"}
                      disabled={saved || savingKey === key}
                      onClick={() => handleSave(suggestion, key)}
                    >
                      {savingKey === key ? (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      ) : saved ? (
                        <Check className="mr-2 h-3.5 w-3.5" />
                      ) : (
                        <Plus className="mr-2 h-3.5 w-3.5" />
                      )}
                      {saved ? "Added to knowledge base" : "Add to knowledge base"}
                    </Button>
                  </div>
                );
              })}
            </div>
          ))}

          {isSending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </div>
          )}
        </div>

        <div className="flex items-end gap-2 border-t border-slate-200 p-4">
          <Textarea
            rows={1}
            value={input}
            placeholder="Type your answer..."
            className="min-h-[44px] resize-none placeholder:text-muted-foreground/60"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <Button onClick={() => void send()} disabled={isSending || !input.trim()} className="h-11">
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
