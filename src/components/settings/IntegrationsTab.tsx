import { useState } from "react";
import { MessageSquare, Zap, Trash2, Send, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIntegrations, Integration } from "@/hooks/useIntegrations";

const EVENTS = [
  { id: "ticket.created", label: "New ticket" },
  { id: "ticket.updated", label: "Ticket updated" },
  { id: "ticket.angry_detected", label: "Angry customer" },
  { id: "ticket.sla_breached", label: "SLA breached" },
];

const PROVIDERS = {
  slack: {
    name: "Slack",
    icon: MessageSquare,
    field: "webhook_url",
    placeholder: "https://hooks.slack.com/services/...",
    valid: (u: string) => u.startsWith("https://hooks.slack.com/"),
    help: "In Slack, create an app → Incoming Webhooks → Add New Webhook to Workspace, pick a channel, and paste the link here.",
  },
  zapier: {
    name: "Zapier",
    icon: Zap,
    field: "url",
    placeholder: "https://hooks.zapier.com/hooks/catch/...",
    valid: (u: string) => u.startsWith("https://hooks.zapier.com/"),
    help: "In Zapier, create a Zap with the trigger “Webhooks by Zapier → Catch Hook”, copy the webhook URL and paste it here.",
  },
} as const;

type ProviderKey = keyof typeof PROVIDERS;

function ProviderCard({ provider, existing }: { provider: ProviderKey; existing?: Integration }) {
  const p = PROVIDERS[provider];
  const { addIntegration, updateIntegration, deleteIntegration } = useIntegrations();
  const cfg = (existing?.config_json ?? {}) as Record<string, any>;
  const [url, setUrl] = useState<string>(cfg[p.field] ?? "");
  const [events, setEvents] = useState<string[]>(cfg.events ?? EVENTS.map((e) => e.id));
  const [testing, setTesting] = useState(false);
  const Icon = p.icon;

  const save = () => {
    const clean = url.trim();
    if (!p.valid(clean)) {
      toast.error(`That doesn't look like a ${p.name} webhook link. It should start with ${p.placeholder.replace("...", "")}`);
      return;
    }
    if (events.length === 0) return toast.error("Pick at least one event to send.");
    const config_json = { [p.field]: clean, events };
    if (existing) updateIntegration.mutate({ id: existing.id, config_json });
    else addIntegration.mutate({ provider, config_json });
  };

  const test = async () => {
    if (!existing) return;
    setTesting(true);
    const { data, error } = await supabase.functions.invoke("dispatch-integration-events", {
      body: { test_integration_id: existing.id },
    });
    setTesting(false);
    if (error || data?.error) {
      let msg = data?.error;
      try { msg = msg || JSON.parse(await (error as any).context.text()).error; } catch { /* ignore */ }
      toast.error(msg || `Couldn't send a test to ${p.name}.`);
    } else toast.success(`Test sent — check ${p.name}.`);
  };

  return (
    <Card className="border border-border">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary">
            <Icon className="h-5 w-5 text-foreground" />
          </span>
          <div>
            <CardTitle className="text-base">{p.name}</CardTitle>
            <CardDescription>Get ticket alerts in {p.name}.</CardDescription>
          </div>
        </div>
        {existing ? (
          <div className="flex items-center gap-2">
            <Badge variant={existing.is_active ? "default" : "secondary"}>{existing.is_active ? "On" : "Paused"}</Badge>
            <Switch
              checked={!!existing.is_active}
              onCheckedChange={(v) => updateIntegration.mutate({ id: existing.id, is_active: v })}
            />
          </div>
        ) : (
          <Badge variant="outline">Not connected</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{p.help}</p>
        <div className="space-y-2">
          <Label>Webhook link</Label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={p.placeholder} />
        </div>
        <div className="space-y-2">
          <Label>Send these events</Label>
          <div className="grid grid-cols-2 gap-2">
            {EVENTS.map((ev) => (
              <label key={ev.id} className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={events.includes(ev.id)}
                  onCheckedChange={(c) =>
                    setEvents((prev) => (c ? [...prev, ev.id] : prev.filter((x) => x !== ev.id)))
                  }
                />
                {ev.label}
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={save} disabled={addIntegration.isPending || updateIntegration.isPending}>
            {existing ? "Save changes" : `Connect ${p.name}`}
          </Button>
          {existing && (
            <>
              <Button variant="outline" onClick={test} disabled={testing}>
                {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send test
              </Button>
              <Button variant="ghost" onClick={() => deleteIntegration.mutate(existing.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Remove
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function IntegrationsTab() {
  const { data, isLoading } = useIntegrations();
  if (isLoading) return <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {(Object.keys(PROVIDERS) as ProviderKey[]).map((k) => {
        const existing = data?.find((i) => i.provider === k);
        return <ProviderCard key={(existing?.id ?? "new") + k} provider={k} existing={existing} />;
      })}
    </div>
  );
}
