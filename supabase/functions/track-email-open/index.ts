import { createClient } from "npm:@supabase/supabase-js@2";

// 1x1 transparent GIF
const GIF = Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), (c) => c.charCodeAt(0));
const headers = {
  "Content-Type": "image/gif",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "Access-Control-Allow-Origin": "*",
};

// Infer the mail client from the user agent. Image proxies (Gmail, Apple MPP)
// fetch images automatically, so those opens are only "likely".
function inferClient(ua: string): { client: string; proxy: boolean } {
  const u = ua.toLowerCase();
  if (u.includes("googleimageproxy")) return { client: "Gmail", proxy: true };
  if (u.includes("yahoomailproxy")) return { client: "Yahoo Mail", proxy: true };
  if (u.includes("outlook") || u.includes("microsoft office")) return { client: "Outlook", proxy: false };
  if (u.includes("thunderbird")) return { client: "Thunderbird", proxy: false };
  if (u === "mozilla/5.0") return { client: "Apple Mail", proxy: true }; // Apple Mail Privacy Protection
  if (u.includes("iphone") || u.includes("ipad") || u.includes("macintosh")) return { client: "Apple Mail", proxy: false };
  if (u.includes("android")) return { client: "Android mail", proxy: false };
  if (u.includes("mozilla")) return { client: "Web browser", proxy: false };
  return { client: "Unknown", proxy: false };
}

Deno.serve(async (req) => {
  try {
    const tid = new URL(req.url).searchParams.get("tid") ?? "";
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tid)) {
      const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { client, proxy } = inferClient(req.headers.get("user-agent") ?? "");
      const country = req.headers.get("cf-ipcountry") || req.headers.get("x-country") || null;
      const { error } = await supabase.rpc("record_email_open_event", {
        p_tracking_id: tid,
        p_client: client,
        p_is_proxy: proxy,
        p_country: country,
      });
      if (error) console.error("record_email_open_event failed:", error.message);
    }
  } catch (e) {
    console.error("track-email-open error:", e);
  }
  return new Response(GIF, { status: 200, headers });
});
