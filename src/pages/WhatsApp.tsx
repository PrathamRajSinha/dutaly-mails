import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Copy, Loader2, MessageCircle, Plus, Send, Sparkles, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type WaAccount = {
  id: string; phone_number_id: string; waba_id: string; display_phone_number: string | null;
  verified_name: string | null; verify_token: string; auto_reply_enabled: boolean; is_active: boolean; last_status: string | null;
};
type WaMessage = {
  id: string; whatsapp_account_id: string; contact_wa_id: string; contact_name: string | null; direction: string;
  body: string; status: string | null; is_ai: boolean; error: string | null; created_at: string;
};

const WEBHOOK_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/whatsapp-webhook`;

async function invokeErr(error: unknown) {
  if (error instanceof FunctionsHttpError) {
    try { return (await error.context.json()).error as string; } catch { /* ignore */ }
  }
  return "Something went wrong. Please try again.";
}

function copy(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copied");
}

function ConnectDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (v: boolean) => void; onDone: (a: WaAccount) => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ phone_number_id: "", waba_id: "", access_token: "", app_secret: "" });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ verify_token: string; display_phone_number: string | null; verified_name: string | null } | null>(null);

  useEffect(() => { if (!open) { setStep(1); setResult(null); setForm({ phone_number_id: "", waba_id: "", access_token: "", app_secret: "" }); } }, [open]);

  const connect = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("whatsapp-connect", {
      body: { action: "connect", ...form, phone_number_id: form.phone_number_id.trim(), waba_id: form.waba_id.trim(), access_token: form.access_token.trim(), app_secret: form.app_secret.trim() || null },
    });
    setBusy(false);
    if (error) return toast.error(await invokeErr(error));
    setResult(data.account);
    setStep(3);
    onDone(data.account);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Connect your WhatsApp Business number</DialogTitle>
          <DialogDescription>Step {step} of 3 · Messages go out from your own number and name.</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 text-[13px] text-muted-foreground">
            <ol className="list-decimal space-y-2 pl-5">
              <li>Open <a className="text-primary underline" href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer">Meta for Developers</a> and create a <b className="text-foreground">Business</b> app, then add the <b className="text-foreground">WhatsApp</b> product.</li>
              <li>In <b className="text-foreground">WhatsApp → API Setup</b>, copy the <b className="text-foreground">Phone number ID</b> and <b className="text-foreground">WhatsApp Business Account ID</b>.</li>
              <li>In <a className="text-primary underline" href="https://business.facebook.com/settings/system-users" target="_blank" rel="noreferrer">Business Settings → System users</a>, create a user, give it your app and WhatsApp account, and generate a <b className="text-foreground">permanent token</b> with <code>whatsapp_business_messaging</code> and <code>whatsapp_business_management</code>.</li>
              <li>Optional but safer: copy your <b className="text-foreground">App secret</b> from App settings → Basic.</li>
            </ol>
            <div className="flex justify-end"><Button onClick={() => setStep(2)}>I have these</Button></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            {([
              ["phone_number_id", "Phone number ID", "e.g. 106540352242922"],
              ["waba_id", "WhatsApp Business Account ID", "e.g. 102290129340398"],
              ["access_token", "Permanent access token", "EAAG…"],
              ["app_secret", "App secret (optional)", "Used to confirm messages really come from Meta"],
            ] as const).map(([k, label, ph]) => (
              <div key={k} className="space-y-1.5">
                <Label>{label}</Label>
                <Input type={k === "access_token" || k === "app_secret" ? "password" : "text"} placeholder={ph}
                  value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={connect} disabled={busy || !form.phone_number_id || !form.waba_id || !form.access_token}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Verify & connect
              </Button>
            </div>
          </div>
        )}

        {step === 3 && result && (
          <div className="space-y-4 text-[13px]">
            <p className="text-foreground">Connected <b>{result.verified_name}</b> ({result.display_phone_number}). Last step — tell Meta where to send incoming messages:</p>
            <p className="text-muted-foreground">In your Meta app open <b className="text-foreground">WhatsApp → Configuration → Webhook → Edit</b>, paste these, then subscribe to the <b className="text-foreground">messages</b> field.</p>
            <CopyRow label="Callback URL" value={WEBHOOK_URL} />
            <CopyRow label="Verify token" value={result.verify_token} />
            <div className="flex justify-end"><Button onClick={() => onOpenChange(false)}>Done</Button></div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-[12px] text-muted-foreground">{label}</Label>
      <div className="flex gap-2">
        <Input readOnly value={value} className="font-mono text-[12px]" />
        <Button variant="outline" size="icon" onClick={() => copy(value)} aria-label={`Copy ${label}`}><Copy className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

export default function WhatsApp() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [connectOpen, setConnectOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [newTo, setNewTo] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["wa-accounts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("whatsapp_accounts" as never)
        .select("id,phone_number_id,waba_id,display_phone_number,verified_name,verify_token,auto_reply_enabled,is_active,last_status")
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as unknown as WaAccount[];
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["wa-messages", user?.id],
    enabled: !!user && accounts.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("whatsapp_messages" as never).select("*").order("created_at", { ascending: true }).limit(1000);
      if (error) throw error;
      return (data ?? []) as unknown as WaMessage[];
    },
  });

  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel(`wa-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "whatsapp_messages" }, () => qc.invalidateQueries({ queryKey: ["wa-messages"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, qc]);

  const threads = useMemo(() => {
    const map = new Map<string, { id: string; name: string | null; last: WaMessage; lastIn: string | null }>();
    for (const m of messages) {
      const t = map.get(m.contact_wa_id) ?? { id: m.contact_wa_id, name: null, last: m, lastIn: null };
      if (m.contact_name) t.name = m.contact_name;
      if (m.direction === "in") t.lastIn = m.created_at;
      t.last = m;
      map.set(m.contact_wa_id, t);
    }
    return [...map.values()].sort((a, b) => b.last.created_at.localeCompare(a.last.created_at));
  }, [messages]);

  const thread = messages.filter((m) => m.contact_wa_id === active);
  const activeThread = threads.find((t) => t.id === active);
  const windowOpen = !!activeThread?.lastIn && Date.now() - new Date(activeThread.lastIn).getTime() < 24 * 3600 * 1000;

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [thread.length, active]);

  const send = async (to: string, body: string) => {
    const account = accounts.find((a) => a.id === (thread[0]?.whatsapp_account_id)) ?? accounts[0];
    if (!account) return;
    setSending(true);
    const { error } = await supabase.functions.invoke("whatsapp-connect", { body: { action: "send", account_id: account.id, to, body } });
    setSending(false);
    qc.invalidateQueries({ queryKey: ["wa-messages"] });
    if (error) return toast.error(await invokeErr(error));
    setDraft("");
  };

  const toggleAuto = async (a: WaAccount, v: boolean) => {
    const { error } = await supabase.from("whatsapp_accounts" as never).update({ auto_reply_enabled: v } as never).eq("id", a.id);
    if (error) return toast.error("Couldn't save that change.");
    qc.invalidateQueries({ queryKey: ["wa-accounts"] });
  };
  const remove = async (a: WaAccount) => {
    if (!confirm(`Disconnect ${a.display_phone_number}? Its chats will be removed from Dutaly.`)) return;
    await supabase.from("whatsapp_accounts" as never).delete().eq("id", a.id);
    qc.invalidateQueries({ queryKey: ["wa-accounts"] });
    qc.invalidateQueries({ queryKey: ["wa-messages"] });
  };

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-medium text-foreground">WhatsApp</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Reply to customers on your own WhatsApp Business number, with AI answers from your knowledge base.</p>
        </div>
        <Button onClick={() => setConnectOpen(true)}><Plus className="mr-2 h-4 w-4" />Connect number</Button>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <MessageCircle className="h-8 w-8 text-primary" />
            <p className="text-[15px] font-medium text-foreground">Connect your WhatsApp Business number</p>
            <p className="max-w-md text-[13px] text-muted-foreground">Takes about 5 minutes. You'll need a Meta Business account — we'll show you exactly what to copy.</p>
            <Button onClick={() => setConnectOpen(true)}>Start setup</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {accounts.map((a) => (
              <Card key={a.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-[15px]">{a.verified_name || "WhatsApp number"}</CardTitle>
                      <CardDescription>{a.display_phone_number}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => remove(a)} aria-label="Disconnect"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-foreground">AI auto-replies</span>
                    <Switch checked={a.auto_reply_enabled} onCheckedChange={(v) => toggleAuto(a, v)} />
                  </div>
                  <details className="text-[12px] text-muted-foreground">
                    <summary className="cursor-pointer">Webhook details</summary>
                    <div className="mt-2 space-y-2">
                      <CopyRow label="Callback URL" value={WEBHOOK_URL} />
                      <CopyRow label="Verify token" value={a.verify_token} />
                    </div>
                  </details>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="overflow-hidden">
            <div className="grid h-[600px] md:grid-cols-[280px_1fr]">
              <div className="flex flex-col border-r border-border">
                <div className="flex gap-2 border-b border-border p-3">
                  <Input placeholder="New chat: +91…" value={newTo} onChange={(e) => setNewTo(e.target.value)} className="h-8 text-[13px]" />
                  <Button size="sm" variant="outline" disabled={!/^\+?\d{6,20}$/.test(newTo.replace(/\s/g, ""))}
                    onClick={() => { setActive(newTo.replace(/\D/g, "")); setNewTo(""); }}>Open</Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {threads.length === 0 && <p className="p-4 text-[13px] text-muted-foreground">No chats yet. When customers message your number, they'll appear here.</p>}
                  {threads.map((t) => (
                    <button key={t.id} onClick={() => setActive(t.id)}
                      className={cn("w-full border-b border-border px-4 py-3 text-left hover:bg-muted", active === t.id && "bg-muted")}>
                      <div className="truncate text-[13px] font-medium text-foreground">{t.name || `+${t.id}`}</div>
                      <div className="truncate text-[12px] text-muted-foreground">{t.last.direction === "out" ? "You: " : ""}{t.last.body}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex min-h-0 flex-col">
                {!active ? (
                  <div className="flex flex-1 items-center justify-center text-[13px] text-muted-foreground">Pick a chat to read and reply</div>
                ) : (
                  <>
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                      <div className="text-[14px] font-medium text-foreground">{activeThread?.name || `+${active}`}</div>
                      <Badge variant={windowOpen ? "secondary" : "outline"}>{windowOpen ? "Reply window open" : "Reply window closed"}</Badge>
                    </div>
                    <div className="flex-1 space-y-2 overflow-y-auto p-4">
                      {thread.map((m) => (
                        <div key={m.id} className={cn("flex", m.direction === "out" ? "justify-end" : "justify-start")}>
                          <div className={cn("max-w-[75%] rounded-lg px-3 py-2 text-[13px]",
                            m.direction === "out" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                            <div className="whitespace-pre-wrap">{m.body}</div>
                            <div className="mt-1 flex items-center gap-1 text-[10px] opacity-70">
                              {m.is_ai && <><Sparkles className="h-3 w-3" />AI ·</>}
                              {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              {m.direction === "out" && m.status && ` · ${m.status === "failed" ? "not sent" : m.status}`}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={endRef} />
                    </div>
                    <div className="border-t border-border p-3">
                      {!windowOpen && (
                        <p className="mb-2 text-[12px] text-muted-foreground">
                          WhatsApp only allows free replies within 24 hours of the customer's last message. Outside that, an approved template is needed.{" "}
                          <a className="inline-flex items-center gap-0.5 underline" href="https://business.facebook.com/latest/whatsapp_manager/message_templates" target="_blank" rel="noreferrer">Manage templates <ExternalLink className="h-3 w-3" /></a>
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Textarea rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a reply…"
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && draft.trim()) { e.preventDefault(); send(active, draft.trim()); } }} />
                        <Button onClick={() => send(active, draft.trim())} disabled={sending || !draft.trim()} aria-label="Send">
                          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </>
      )}

      <ConnectDialog open={connectOpen} onOpenChange={setConnectOpen} onDone={() => qc.invalidateQueries({ queryKey: ["wa-accounts"] })} />
    </div>
  );
}
