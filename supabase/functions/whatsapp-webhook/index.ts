import { createClient } from "npm:@supabase/supabase-js@2";

const GRAPH = "https://graph.facebook.com/v21.0";

async function validSignature(secret: string, raw: string, header: string | null) {
  if (!header?.startsWith("sha256=")) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
  const hex = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex === header.slice(7);
}

Deno.serve(async (req) => {
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const url = new URL(req.url);

  if (req.method === "GET") {
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    if (url.searchParams.get("hub.mode") === "subscribe" && token && challenge) {
      const { data } = await admin.from("whatsapp_accounts").select("id").eq("verify_token", token).limit(1);
      if (data?.length) return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }
  if (req.method !== "POST") return new Response("ok");

  const raw = await req.text();
  let payload: any;
  try { payload = JSON.parse(raw); } catch { return new Response("bad", { status: 400 }); }

  const work: Promise<unknown>[] = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const v = change.value ?? {};
      const pnid = v.metadata?.phone_number_id;
      if (!pnid) continue;
      const { data: acc } = await admin.from("whatsapp_accounts").select("*").eq("phone_number_id", pnid).eq("is_active", true).maybeSingle();
      if (!acc) continue;
      if (acc.app_secret && !(await validSignature(acc.app_secret, raw, req.headers.get("x-hub-signature-256")))) {
        console.warn("bad signature for", pnid);
        continue;
      }
      for (const s of v.statuses ?? []) {
        await admin.from("whatsapp_messages").update({ status: s.status }).eq("wa_message_id", s.id);
      }
      const names: Record<string, string> = {};
      for (const c of v.contacts ?? []) names[c.wa_id] = c.profile?.name;
      for (const m of v.messages ?? []) {
        const body = m.type === "text" ? m.text?.body ?? "" : m.type === "button" ? m.button?.text ?? "" : m.type === "interactive" ? (m.interactive?.button_reply?.title ?? m.interactive?.list_reply?.title ?? "") : `[${m.type} message]`;
        const { error } = await admin.from("whatsapp_messages").insert({
          user_id: acc.user_id, whatsapp_account_id: acc.id, contact_wa_id: m.from, contact_name: names[m.from] ?? null,
          direction: "in", body, message_type: m.type, wa_message_id: m.id, status: "received",
        });
        if (error) continue; // duplicate delivery
        if (acc.auto_reply_enabled && m.type === "text" && body) work.push(autoReply(admin, acc, m.from, body));
      }
    }
  }
  // @ts-ignore EdgeRuntime exists in Supabase
  if (typeof EdgeRuntime !== "undefined") EdgeRuntime.waitUntil(Promise.allSettled(work)); else await Promise.allSettled(work);
  return new Response("ok");
});

async function autoReply(admin: any, acc: any, from: string, text: string) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return;
  const [{ data: kb }, { data: ins }, { data: history }] = await Promise.all([
    admin.from("knowledge_base_entries").select("title,content,extracted_text").eq("user_id", acc.user_id).limit(200),
    admin.from("ai_instructions").select("system_prompt,tone,auto_reply_enabled").eq("user_id", acc.user_id).maybeSingle(),
    admin.from("whatsapp_messages").select("direction,body").eq("user_id", acc.user_id).eq("contact_wa_id", from).order("created_at", { ascending: false }).limit(12),
  ]);
  if (ins && ins.auto_reply_enabled === false) return;
  const words = text.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const ranked = (kb ?? []).map((e: any) => {
    const hay = `${e.title} ${e.content} ${e.extracted_text ?? ""}`.toLowerCase();
    return { e, s: words.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0) };
  }).sort((a: any, b: any) => b.s - a.s).slice(0, 6).map(({ e }: any) => `## ${e.title}\n${(e.content || e.extracted_text || "").slice(0, 1500)}`).join("\n\n");

  const system = `You are the WhatsApp support assistant for ${acc.verified_name || "this business"}.
Tone: ${ins?.tone || "friendly"}. ${ins?.system_prompt || ""}
STRICT RULES: Answer ONLY from the knowledge base below. Simple greetings may be answered warmly. If the answer isn't in the knowledge base, say a team member will get back to them shortly — never guess.
Write for WhatsApp: short (under 80 words), plain text, no markdown headings, *single asterisks* for bold if needed.
Return JSON: {"reply": string, "sentiment": number 0-1, "escalate": boolean}.

KNOWLEDGE BASE:
${ranked || "(empty)"}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      reasoning_effort: "low",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        ...(history ?? []).reverse().map((h: any) => ({ role: h.direction === "in" ? "user" : "assistant", content: h.body })),
      ],
    }),
  });
  if (!res.ok) { console.error("AI", res.status, await res.text()); return; }
  let out: any;
  try { out = JSON.parse((await res.json()).choices[0].message.content); } catch { return; }
  if (!out?.reply || (typeof out.sentiment === "number" && out.sentiment < 0.3)) {
    await admin.from("activity_logs").insert({ user_id: acc.user_id, action: "whatsapp_escalated", email_from: from, email_subject: text.slice(0, 120), details: { reason: "angry_or_unanswered" } });
    return;
  }
  const r = await fetch(`${GRAPH}/${acc.phone_number_id}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${acc.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to: from, type: "text", text: { body: out.reply } }),
  });
  const t = await r.text();
  await admin.from("whatsapp_messages").insert({
    user_id: acc.user_id, whatsapp_account_id: acc.id, contact_wa_id: from, direction: "out", body: out.reply, is_ai: true,
    wa_message_id: r.ok ? JSON.parse(t)?.messages?.[0]?.id ?? null : null, status: r.ok ? "sent" : "failed", error: r.ok ? null : t.slice(0, 500),
  });
}
