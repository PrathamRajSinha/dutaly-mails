import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const GRAPH = "https://graph.facebook.com/v21.0";
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Connect = z.object({
  action: z.literal("connect"),
  phone_number_id: z.string().regex(/^\d{5,25}$/),
  waba_id: z.string().regex(/^\d{5,25}$/),
  access_token: z.string().min(20).max(1000),
  app_secret: z.string().max(200).optional().nullable(),
});
const Send = z.object({
  action: z.literal("send"),
  account_id: z.string().uuid(),
  to: z.string().regex(/^\+?\d{6,20}$/),
  body: z.string().min(1).max(4096),
});
const Body = z.discriminatedUnion("action", [Connect, Send]);

function friendly(detail: string) {
  if (/OAuthException|access token|190/i.test(detail)) return "The access token was rejected by Meta. Generate a new permanent token and try again.";
  if (/does not exist|100/i.test(detail)) return "Meta couldn't find that Phone Number ID or Business Account ID. Double-check both numbers.";
  if (/24 hour|131047|re-engagement/i.test(detail)) return "This customer hasn't messaged you in the last 24 hours, so WhatsApp only allows an approved template message.";
  return "WhatsApp didn't accept the request. Please check your details and try again.";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const auth = req.headers.get("Authorization") || "";
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Please sign in again." }, 401);
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Some details look wrong. Check the numbers and token.", fields: parsed.error.flatten().fieldErrors }, 400);
    const input = parsed.data;

    if (input.action === "connect") {
      const r = await fetch(`${GRAPH}/${input.phone_number_id}?fields=display_phone_number,verified_name`, {
        headers: { Authorization: `Bearer ${input.access_token}` },
      });
      const t = await r.text();
      if (!r.ok) { console.error("verify", r.status, t); return json({ error: friendly(t) }, 400); }
      const info = JSON.parse(t);

      const { data: existing } = await admin.from("whatsapp_accounts").select("user_id").eq("phone_number_id", input.phone_number_id).maybeSingle();
      if (existing && existing.user_id !== user.id) return json({ error: "This WhatsApp number is already connected to another Dutaly account." }, 409);

      // Subscribe app to the WABA so messages reach the webhook
      const sub = await fetch(`${GRAPH}/${input.waba_id}/subscribed_apps`, { method: "POST", headers: { Authorization: `Bearer ${input.access_token}` } });
      const subText = await sub.text();
      if (!sub.ok) console.warn("subscribe failed", sub.status, subText);

      const { data, error } = await admin.from("whatsapp_accounts").upsert({
        user_id: user.id,
        phone_number_id: input.phone_number_id,
        waba_id: input.waba_id,
        access_token: input.access_token,
        app_secret: input.app_secret || null,
        display_phone_number: info.display_phone_number ?? null,
        verified_name: info.verified_name ?? null,
        is_active: true,
        last_status: sub.ok ? "connected" : "connected_no_webhook",
      }, { onConflict: "phone_number_id" }).select("id,display_phone_number,verified_name,verify_token").single();
      if (error) throw error;
      return json({ ok: true, account: data, webhook_subscribed: sub.ok });
    }

    // send
    const { data: acc } = await admin.from("whatsapp_accounts").select("*").eq("id", input.account_id).eq("user_id", user.id).maybeSingle();
    if (!acc) return json({ error: "That WhatsApp number isn't connected." }, 404);
    const to = input.to.replace(/\D/g, "");
    const r = await fetch(`${GRAPH}/${acc.phone_number_id}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${acc.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: input.body } }),
    });
    const t = await r.text();
    if (!r.ok) {
      console.error("send", r.status, t);
      await admin.from("whatsapp_messages").insert({ user_id: user.id, whatsapp_account_id: acc.id, contact_wa_id: to, direction: "out", body: input.body, status: "failed", error: t.slice(0, 500) });
      return json({ error: friendly(t) }, 400);
    }
    const id = JSON.parse(t)?.messages?.[0]?.id ?? null;
    await admin.from("whatsapp_messages").insert({ user_id: user.id, whatsapp_account_id: acc.id, contact_wa_id: to, direction: "out", body: input.body, wa_message_id: id, status: "sent" });
    return json({ ok: true, id });
  } catch (e) {
    console.error(e);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
