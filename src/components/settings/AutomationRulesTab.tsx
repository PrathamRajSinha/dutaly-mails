import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isPast } from "date-fns";
import { Forward, Trash2, Plus, Loader2, ListTodo, CalendarClock, Check, History } from "lucide-react";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const db = supabase as any;

interface Rule {
  id: string; name: string; label_match: string | null; sentiment_below: number | null;
  subject_contains: string | null; from_match: string | null; skip_auto_replied: boolean;
  forward_to: string; note: string | null; is_active: boolean;
}
interface Log { id: string; email_subject: string | null; email_from: string | null; forward_to: string; success: boolean; error: string | null; created_at: string }
interface Task { id: string; kind: string; title: string; details: string | null; due_at: string | null; status: string; created_at: string }

const empty = { name: "", label_match: "", use_sentiment: false, sentiment_below: 0.3, subject_contains: "", from_match: "", skip_auto_replied: true, forward_to: "", note: "" };

const schema = z.object({
  forward_to: z.string().trim().email("Enter a valid email to forward to").max(320),
  name: z.string().trim().max(120),
  label_match: z.string().trim().max(40),
  subject_contains: z.string().trim().max(120),
  from_match: z.string().trim().max(200),
  note: z.string().trim().max(1000),
});

export function AutomationRulesTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const rules = useQuery({ queryKey: ["fwd-rules", user?.id], enabled: !!user, queryFn: async () => {
    const { data, error } = await db.from("email_forwarding_rules").select("*").order("created_at", { ascending: false });
    if (error) throw error; return data as Rule[];
  }});
  const logs = useQuery({ queryKey: ["fwd-logs", user?.id], enabled: !!user, queryFn: async () => {
    const { data, error } = await db.from("email_forward_logs").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) throw error; return data as Log[];
  }});
  const tasks = useQuery({ queryKey: ["automation-tasks", user?.id], enabled: !!user, queryFn: async () => {
    const { data, error } = await db.from("automation_tasks").select("*").order("due_at", { ascending: true, nullsFirst: false });
    if (error) throw error; return data as Task[];
  }});

  const { data: labelRows } = useQuery({ queryKey: ["all-labels", user?.id], enabled: !!user, queryFn: async () => {
    const { data } = await supabase.from("email_queue").select("labels").limit(500);
    const set = new Set<string>(); for (const r of data ?? []) for (const l of (r as any).labels ?? []) set.add(l);
    return [...set].sort();
  }});

  const save = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const v = parsed.data;
      if (!v.label_match && !form.use_sentiment && !v.subject_contains && !v.from_match) throw new Error("Add at least one condition");
      const row = {
        user_id: user!.id, name: v.name || `Forward to ${v.forward_to}`, forward_to: v.forward_to,
        label_match: v.label_match || null, subject_contains: v.subject_contains || null, from_match: v.from_match || null,
        sentiment_below: form.use_sentiment ? form.sentiment_below : null, skip_auto_replied: form.skip_auto_replied, note: v.note || null,
      };
      const { error } = editingId
        ? await db.from("email_forwarding_rules").update(row).eq("id", editingId)
        : await db.from("email_forwarding_rules").insert(row);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fwd-rules"] }); setForm(empty); setEditingId(null); setShowForm(false); toast.success("Rule saved"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = async (r: Rule, v: boolean) => {
    const { error } = await db.from("email_forwarding_rules").update({ is_active: v }).eq("id", r.id);
    if (error) toast.error("Couldn't update the rule"); else qc.invalidateQueries({ queryKey: ["fwd-rules"] });
  };
  const remove = async (id: string) => {
    const { error } = await db.from("email_forwarding_rules").delete().eq("id", id);
    if (error) toast.error("Couldn't delete the rule"); else qc.invalidateQueries({ queryKey: ["fwd-rules"] });
  };
  const edit = (r: Rule) => {
    setForm({ name: r.name, label_match: r.label_match ?? "", use_sentiment: r.sentiment_below != null, sentiment_below: r.sentiment_below ?? 0.3,
      subject_contains: r.subject_contains ?? "", from_match: r.from_match ?? "", skip_auto_replied: r.skip_auto_replied, forward_to: r.forward_to, note: r.note ?? "" });
    setEditingId(r.id); setShowForm(true);
  };
  const setTask = async (t: Task, status: string) => {
    const { error } = await db.from("automation_tasks").update({ status }).eq("id", t.id);
    if (error) toast.error("Couldn't update"); else qc.invalidateQueries({ queryKey: ["automation-tasks"] });
  };
  const delTask = async (id: string) => {
    const { error } = await db.from("automation_tasks").delete().eq("id", id);
    if (error) toast.error("Couldn't delete"); else qc.invalidateQueries({ queryKey: ["automation-tasks"] });
  };

  const describe = (r: Rule) => [
    r.label_match && `label is "${r.label_match}"`,
    r.sentiment_below != null && `mood below ${Math.round(r.sentiment_below * 100)}%`,
    r.subject_contains && `subject contains "${r.subject_contains}"`,
    r.from_match && `from ${r.from_match}`,
  ].filter(Boolean).join(" and ");

  return (
    <Tabs defaultValue="rules" className="space-y-4">
      <TabsList className="bg-muted">
        <TabsTrigger value="rules" className="gap-2"><Forward className="h-4 w-4" />Forwarding rules</TabsTrigger>
        <TabsTrigger value="tasks" className="gap-2"><ListTodo className="h-4 w-4" />Tasks & reminders</TabsTrigger>
        <TabsTrigger value="log" className="gap-2"><History className="h-4 w-4" />Forwarding log</TabsTrigger>
      </TabsList>

      <TabsContent value="rules" className="space-y-4">
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Forwarding rules</CardTitle>
              <CardDescription>Automatically forward incoming emails that match your conditions. All conditions in a rule must match.</CardDescription>
            </div>
            {!showForm && <Button size="sm" onClick={() => { setForm(empty); setEditingId(null); setShowForm(true); }}><Plus className="mr-1.5 h-4 w-4" />Create forwarding rule</Button>}
          </CardHeader>
          {showForm && (
            <CardContent className="space-y-4 border-t border-border pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Rule name</Label><Input value={form.name} maxLength={120} placeholder="e.g. Billing to finance" onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Forward to</Label><Input type="email" value={form.forward_to} maxLength={320} placeholder="finance@company.com" onChange={(e) => setForm({ ...form, forward_to: e.target.value })} /></div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">When</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Label is</Label>
                  <Input list="fwd-labels" value={form.label_match} maxLength={40} placeholder="Any label" onChange={(e) => setForm({ ...form, label_match: e.target.value })} />
                  <datalist id="fwd-labels">{(labelRows ?? []).map((l) => <option key={l} value={l} />)}</datalist>
                </div>
                <div className="space-y-1.5"><Label>Subject contains</Label><Input value={form.subject_contains} maxLength={120} placeholder="e.g. invoice" onChange={(e) => setForm({ ...form, subject_contains: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>From sender or domain</Label><Input value={form.from_match} maxLength={200} placeholder="name@x.com or x.com" onChange={(e) => setForm({ ...form, from_match: e.target.value })} /></div>
              </div>
              <div className="space-y-2 rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2"><Switch checked={form.use_sentiment} onCheckedChange={(v) => setForm({ ...form, use_sentiment: v })} />Customer mood is below</Label>
                  <span className="text-sm font-medium text-primary">{Math.round(form.sentiment_below * 100)}%</span>
                </div>
                {form.use_sentiment && <Slider value={[form.sentiment_below]} min={0.05} max={0.9} step={0.05} onValueChange={([v]) => setForm({ ...form, sentiment_below: v })} />}
                <p className="text-xs text-muted-foreground">Lower means more upset. 30% catches clearly unhappy customers.</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox checked={form.skip_auto_replied} onCheckedChange={(v) => setForm({ ...form, skip_auto_replied: v === true })} />
                Don't forward emails the AI already auto-replied to
              </label>
              <div className="space-y-1.5">
                <Label>Note added above the forwarded email (optional)</Label>
                <Textarea value={form.note} maxLength={1000} placeholder="e.g. Please handle this billing question within 24h." onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}Save rule</Button>
                <Button variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
              </div>
            </CardContent>
          )}
          <CardContent className={showForm ? "border-t border-border pt-4" : ""}>
            {rules.isLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> :
              !rules.data?.length ? <p className="text-sm text-muted-foreground">No forwarding rules yet. You can also ask the Knowledge Base chat to set one up.</p> : (
              <div className="divide-y divide-border">
                {rules.data.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center gap-3 py-3">
                    <Switch checked={r.is_active} onCheckedChange={(v) => toggle(r, v)} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground">When {describe(r) || "—"} → {r.forward_to}{r.skip_auto_replied ? " · skips auto-replied" : ""}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => edit(r)}>Edit</Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(r.id)} aria-label="Delete rule"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tasks">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base">Tasks & reminders</CardTitle>
            <CardDescription>Created from the Knowledge Base chat when you approve them. Overdue items are highlighted here.</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.isLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> :
              !tasks.data?.length ? <p className="text-sm text-muted-foreground">Nothing yet. Try asking the chat: "Remind me Friday to follow up with John".</p> : (
              <div className="divide-y divide-border">
                {tasks.data.map((t) => {
                  const done = t.status === "done";
                  const overdue = !done && t.due_at && isPast(new Date(t.due_at));
                  return (
                    <div key={t.id} className="flex items-center gap-3 py-3">
                      <Checkbox checked={done} onCheckedChange={(v) => setTask(t, v === true ? "done" : "open")} />
                      {t.kind === "reminder" ? <CalendarClock className="h-4 w-4 text-muted-foreground" /> : <ListTodo className="h-4 w-4 text-muted-foreground" />}
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>{t.title}</p>
                        {t.details && <p className="text-xs text-muted-foreground">{t.details}</p>}
                      </div>
                      {t.due_at && <Badge variant={overdue ? "destructive" : "secondary"} className="text-[10px]">{overdue ? "Overdue · " : ""}{format(new Date(t.due_at), "MMM d, h:mm a")}</Badge>}
                      {done && <Check className="h-4 w-4 text-primary" />}
                      <Button size="icon" variant="ghost" onClick={() => delTask(t.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="log">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base">Forwarding log</CardTitle>
            <CardDescription>Every email that was forwarded by a rule.</CardDescription>
          </CardHeader>
          <CardContent>
            {logs.isLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> :
              !logs.data?.length ? <p className="text-sm text-muted-foreground">No emails have been forwarded yet.</p> : (
              <div className="divide-y divide-border">
                {logs.data.map((l) => (
                  <div key={l.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <Badge variant={l.success ? "secondary" : "destructive"} className="text-[10px]">{l.success ? "Forwarded" : "Failed"}</Badge>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-foreground">{l.email_subject || "(no subject)"}</p>
                      <p className="truncate text-xs text-muted-foreground">From {l.email_from} → {l.forward_to}{!l.success ? " · couldn't send" : ""}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{format(new Date(l.created_at), "MMM d, h:mm a")}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
