import { useRef, useState, useEffect } from "react";
import { Loader2, Send, Sparkles, Plus, Check, X, CalendarClock, Forward, ListTodo } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
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

export interface ProposedAction {
  type: "task" | "reminder" | "forward_rule";
  title: string;
  details?: string | null;
  due_at?: string | null;
  forward_to?: string;
  label_match?: string | null;
  subject_contains?: string | null;
  from_match?: string | null;
  sentiment_below?: number | null;
  note?: string | null;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  suggestions?: Suggestion[];
  actions?: ProposedAction[];
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
  const { user } = useAuth();
  const [actionState, setActionState] = useState<Record<string, "approved" | "denied" | "saving">>({});

  const approveAction = async (a: ProposedAction, key: string) => {
    if (!user) return;
    setActionState((p) => ({ ...p, [key]: "saving" }));
    const db = supabase as any;
    const { error } = a.type === "forward_rule"
      ? await db.from("email_forwarding_rules").insert({
          user_id: user.id, name: a.title, forward_to: a.forward_to, label_match: a.label_match ?? null,
          subject_contains: a.subject_contains ?? null, from_match: a.from_match ?? null,
          sentiment_below: a.sentiment_below ?? null, note: a.note ?? null,
        })
      : await db.from("automation_tasks").insert({
          user_id: user.id, kind: a.type, title: a.title, details: a.details ?? null, due_at: a.due_at ?? null,
        });
    if (error) {
      toast.error("Couldn't save that. Please try again.");
      setActionState((p) => { const n = { ...p }; delete n[key]; return n; });
      return;
    }
    setActionState((p) => ({ ...p, [key]: "approved" }));
    toast.success(a.type === "forward_rule" ? "Forwarding rule created. See Settings → Automation." : "Saved. See Settings → Automation.");
  };

  const describe = (a: ProposedAction) => {
    if (a.type === "forward_rule") {
      const conds = [
        a.label_match && `label is "${a.label_match}"`,
        a.subject_contains && `subject contains "${a.subject_contains}"`,
        a.from_match && `from ${a.from_match}`,
        a.sentiment_below != null && `mood below ${Math.round(a.sentiment_below * 100)}%`,
      ].filter(Boolean).join(" and ");
      return `When ${conds || "(no condition)"} → forward to ${a.forward_to}`;
    }
    return a.due_at ? `Due ${format(new Date(a.due_at), "EEE, MMM d 'at' h:mm a")}` : "No due date";
  };

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
          actions: Array.isArray(data?.actions) ? data.actions : [],
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
    <Card className="border-border">
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

              {message.actions?.map((a, aIdx) => {
                const key = `a-${idx}-${aIdx}`;
                const st = actionState[key];
                const Icon = a.type === "forward_rule" ? Forward : a.type === "reminder" ? CalendarClock : ListTodo;
                const label = a.type === "forward_rule" ? "Create forwarding rule" : a.type === "reminder" ? "Set reminder" : "Create task";
                return (
                  <div key={key} className="max-w-[85%] space-y-2 rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />{label}
                    </div>
                    <p className="text-sm font-semibold text-foreground">{a.title}</p>
                    <p className="text-sm text-muted-foreground">{describe(a)}</p>
                    {a.details && <p className="text-sm text-muted-foreground">{a.details}</p>}
                    {a.note && <p className="text-xs text-muted-foreground">Note: {a.note}</p>}
                    {st === "approved" ? (
                      <p className="flex items-center gap-1.5 text-xs font-medium text-primary"><Check className="h-3.5 w-3.5" />Approved</p>
                    ) : st === "denied" ? (
                      <p className="text-xs text-muted-foreground">Dismissed</p>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" disabled={st === "saving"} onClick={() => approveAction(a, key)}>
                          {st === "saving" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}Approve
                        </Button>
                        <Button size="sm" variant="outline" disabled={st === "saving"} onClick={() => setActionState((p) => ({ ...p, [key]: "denied" }))}>
                          <X className="mr-1.5 h-3.5 w-3.5" />Deny
                        </Button>
                        <Button size="sm" variant="ghost" disabled={st === "saving"} onClick={() => setInput(`Change the ${label.toLowerCase()} "${a.title}": `)}>
                          Edit
                        </Button>
                      </div>
                    )}
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

        <div className="flex items-end gap-2 border-t border-border p-4">
          <Textarea
            rows={1}
            value={input}
            placeholder="Answer, or ask e.g. “Remind me Friday to follow up with John”"
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
