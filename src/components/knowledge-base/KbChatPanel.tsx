import { useRef, useState, useEffect } from "react";
import { Loader2, Send, Check, RotateCcw, BookOpen } from "lucide-react";
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
  saved?: string[];
  failed?: string[];
}

const STORAGE_KEY = "dutaly:kb-chat";

const STARTER: ChatMessage = {
  role: "assistant",
  content:
    "Hi! Let's teach the AI about your business. Just talk naturally — I'll save the important facts into your knowledge base automatically as we go.\n\nTo start: what does your business do, and who are your customers?",
};

const QUICK_TOPICS = [
  "Shipping & delivery",
  "Refunds & returns",
  "Pricing & plans",
  "Business hours & contact",
  "Account & login help",
];

function loadHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [STARTER];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as ChatMessage[]) : null;
    return parsed && parsed.length ? parsed : [STARTER];
  } catch {
    return [STARTER];
  }
}

interface KbChatPanelProps {
  onSaveEntry: (entry: Suggestion) => Promise<void>;
}

export function KbChatPanel({ onSaveEntry }: KbChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-60)));
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isSending) inputRef.current?.focus();
  }, [isSending]);

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || isSending) return;

    const history = [...messages, { role: "user" as const, content: text }];
    setMessages(history);
    setInput("");
    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("kb-chat", {
        body: { messages: history.map((m) => ({ role: m.role, content: m.content })) },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const entries: Suggestion[] = Array.isArray(data?.kb_entries) ? data.kb_entries : [];
      const saved: string[] = [];
      const failed: string[] = [];
      for (const entry of entries) {
        try {
          await onSaveEntry(entry);
          saved.push(entry.title);
        } catch {
          failed.push(entry.title);
        }
      }
      if (saved.length) toast.success(`Saved ${saved.length} ${saved.length === 1 ? "entry" : "entries"} to your knowledge base`);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data?.reply ?? "Got it.", saved, failed },
      ]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reach the assistant. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
    } finally {
      setIsSending(false);
    }
  };

  const reset = () => {
    setMessages([STARTER]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const totalSaved = messages.reduce((n, m) => n + (m.saved?.length ?? 0), 0);

  return (
    <Card className="border-border">
      <CardContent className="flex h-[600px] flex-col p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">AI interview</p>
            <p className="text-xs text-muted-foreground">
              Facts you share are saved to your knowledge base automatically.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {totalSaved > 0 && (
              <Badge variant="secondary" className="gap-1">
                <BookOpen className="h-3 w-3" /> {totalSaved} saved
              </Badge>
            )}
            <Button size="sm" variant="ghost" onClick={reset} disabled={isSending}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Start over
            </Button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((m, idx) => (
            <div key={idx} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                  m.role === "user"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-muted text-foreground",
                )}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {!!m.saved?.length && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.saved.map((s) => (
                      <Badge key={s} variant="outline" className="gap-1 bg-background text-[11px]">
                        <Check className="h-3 w-3 text-primary" /> Saved · {s}
                      </Badge>
                    ))}
                  </div>
                )}
                {!!m.failed?.length && (
                  <p className="mt-2 text-xs text-destructive">
                    Couldn't save: {m.failed.join(", ")}. You may have hit your plan's entry limit.
                  </p>
                )}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
            </div>
          )}
        </div>

        {messages.length <= 2 && !isSending && (
          <div className="flex flex-wrap gap-2 px-5 pb-3">
            {QUICK_TOPICS.map((t) => (
              <Button key={t} size="sm" variant="outline" className="h-7 rounded-full text-xs"
                onClick={() => void send(`Let's cover ${t.toLowerCase()}.`)}>
                {t}
              </Button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 border-t border-border p-4">
          <Textarea
            ref={inputRef}
            rows={1}
            value={input}
            placeholder="e.g. We ship across India in 3–5 days, free above ₹999…"
            className="max-h-32 min-h-[44px] resize-none placeholder:text-muted-foreground/60"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <Button onClick={() => void send()} disabled={isSending || !input.trim()} size="icon" className="h-11 w-11">
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
