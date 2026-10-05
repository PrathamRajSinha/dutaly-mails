import { useState } from "react";
import { format } from "date-fns";
import { CalendarClock, Check, Eye, Forward, ListTodo, Loader2, Mail, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";
import { toast } from "sonner";
import { renderEmailHtml, replaceVariables, type EmailTemplateStyle } from "@/lib/emailHtml";

type ActionTemplate = EmailTemplateStyle & { id: string; name: string };

export type AgentAction =
  | { type: "send_email"; to: string; subject: string; body: string; template?: ActionTemplate | null }
  | { type: "task" | "reminder"; title: string; details?: string | null; due_at?: string | null }
  | {
      type: "forward_rule"; title: string; forward_to: string; label_match?: string | null;
      subject_contains?: string | null; from_match?: string | null; sentiment_below?: number | null; note?: string | null;
    };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AgentActionCard({ action }: { action: AgentAction }) {
  const { user, session } = useAuth();
  const { accounts } = useEmailAccounts();
  const active = accounts.filter((a) => a.is_active);
  const [state, setState] = useState<"idle" | "saving" | "done" | "dismissed">("idle");

  // editable email fields
  const isEmail = action.type === "send_email";
  const [to, setTo] = useState(isEmail ? action.to : "");
  const [subject, setSubject] = useState(isEmail ? action.subject : "");
  const [body, setBody] = useState(isEmail ? action.body : "");
  const [fromId, setFromId] = useState<string>("");
  const accountId = fromId || active[0]?.id || "";
  const selectedAccount = active.find((a) => a.id === accountId);
  const recipientName = to.split("@")[0]?.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "there";
  const senderName = selectedAccount?.email_address.split("@")[0]?.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "The Team";
  const resolvedBody = replaceVariables(body, { sender_name: recipientName, subject, my_name: senderName });
  const template = isEmail ? action.template : null;
  const emailHtml = renderEmailHtml(resolvedBody, template || {
    font_family: "sans-serif", font_size: "medium", text_color: "#333333",
    accent_color: "#7C6FE0", footer_text: "", footer_logo_url: "",
  });

  const sendEmail = async () => {
    if (!session) return;
    if (!EMAIL_RE.test(to.trim())) return toast.error("Please enter a valid email address.");
    if (!body.trim()) return toast.error("The email is empty.");
    const account = active.find((a) => a.id === accountId);
    if (!account) return toast.error("Connect an email account in Settings first.");
    setState("saving");
    const { data, error } = await supabase.functions.invoke(account.provider === "gmail" ? "send-gmail-reply" : "send-imap-reply", {
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: { email_account_id: account.id, to_address: to.trim(), subject: subject.trim() || "(no subject)", body: resolvedBody.trim(), html_body: emailHtml, is_new: true },
    });
    if (error || data?.error) {
      setState("idle");
      return toast.error(data?.error || "We couldn't send this email. Please check the account in Settings and try again.");
    }
    setState("done");
    toast.success(`Email sent to ${to.trim()}`);
  };

  const saveOther = async () => {
    if (!user || action.type === "send_email") return;
    setState("saving");
    const db = supabase as any;
    const { error } = action.type === "forward_rule"
      ? await db.from("email_forwarding_rules").insert({
          user_id: user.id, name: action.title, forward_to: action.forward_to, label_match: action.label_match ?? null,
          subject_contains: action.subject_contains ?? null, from_match: action.from_match ?? null,
          sentiment_below: action.sentiment_below ?? null, note: action.note ?? null,
        })
      : await db.from("automation_tasks").insert({
          user_id: user.id, kind: action.type, title: action.title, details: action.details ?? null, due_at: action.due_at ?? null,
        });
    if (error) { setState("idle"); return toast.error("Couldn't save that. Please try again."); }
    setState("done");
    toast.success("Saved. You'll find it under Instructions → Automation.");
  };

  if (state === "dismissed") return <p className="text-xs text-muted-foreground">Dismissed</p>;

  if (action.type === "send_email") {
    return (
      <div className="w-full space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Mail className="h-3.5 w-3.5" /> Email ready to send
        </div>
        {template && (
          <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground">
            <Eye className="h-3.5 w-3.5 text-primary" />
            Using <span className="font-semibold">{template.name}</span> with its saved design
          </div>
        )}
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-xs text-muted-foreground">From</span>
            {active.length > 1 ? (
              <Select value={accountId} onValueChange={setFromId} disabled={state !== "idle"}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>{active.map((a) => <SelectItem key={a.id} value={a.id}>{a.email_address}</SelectItem>)}</SelectContent>
              </Select>
            ) : (
              <span className="text-foreground">{active[0]?.email_address ?? "No connected account"}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-xs text-muted-foreground">To</span>
            <Input className="h-8" value={to} onChange={(e) => setTo(e.target.value)} disabled={state !== "idle"} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-xs text-muted-foreground">Subject</span>
            <Input className="h-8" value={subject} onChange={(e) => setSubject(e.target.value)} disabled={state !== "idle"} />
          </div>
          <Textarea rows={Math.min(12, body.split("\n").length + 1)} value={body} onChange={(e) => setBody(e.target.value)} disabled={state !== "idle"} />
          <div className="overflow-hidden rounded-md border border-border bg-background">
            <div className="border-b border-border bg-muted/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recipient preview</div>
            <div className="max-h-72 overflow-y-auto bg-background p-5" dangerouslySetInnerHTML={{ __html: emailHtml }} />
          </div>
        </div>
        {state === "done" ? (
          <p className="flex items-center gap-1.5 text-xs font-medium text-primary"><Check className="h-3.5 w-3.5" />Sent</p>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" onClick={sendEmail} disabled={state === "saving" || !active.length}>
              {state === "saving" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}Send now
            </Button>
            <Button size="sm" variant="outline" disabled={state === "saving"} onClick={() => setState("dismissed")}>
              <X className="mr-1.5 h-3.5 w-3.5" />Discard
            </Button>
          </div>
        )}
      </div>
    );
  }

  const Icon = action.type === "forward_rule" ? Forward : action.type === "reminder" ? CalendarClock : ListTodo;
  const label = action.type === "forward_rule" ? "Forwarding rule" : action.type === "reminder" ? "Reminder" : "Task";
  const desc = action.type === "forward_rule"
    ? `When ${[
        action.label_match && `label is "${action.label_match}"`,
        action.subject_contains && `subject contains "${action.subject_contains}"`,
        action.from_match && `from ${action.from_match}`,
        action.sentiment_below != null && `mood below ${Math.round(action.sentiment_below * 100)}%`,
      ].filter(Boolean).join(" and ") || "(no condition)"} → forward to ${action.forward_to}`
    : action.due_at ? `Due ${format(new Date(action.due_at), "EEE, MMM d 'at' h:mm a")}` : "No due date";

  return (
    <div className="w-full space-y-2 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary"><Icon className="h-3.5 w-3.5" />{label}</div>
      <p className="text-sm font-semibold text-foreground">{action.title}</p>
      <p className="text-sm text-muted-foreground">{desc}</p>
      {action.type !== "forward_rule" && action.details && <p className="text-sm text-muted-foreground">{action.details}</p>}
      {action.type === "forward_rule" && action.note && <p className="text-xs text-muted-foreground">Note: {action.note}</p>}
      {state === "done" ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-primary"><Check className="h-3.5 w-3.5" />Saved</p>
      ) : (
        <div className="flex gap-2">
          <Button size="sm" onClick={saveOther} disabled={state === "saving"}>
            {state === "saving" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}Approve
          </Button>
          <Button size="sm" variant="outline" disabled={state === "saving"} onClick={() => setState("dismissed")}><X className="mr-1.5 h-3.5 w-3.5" />Dismiss</Button>
        </div>
      )}
    </div>
  );
}
