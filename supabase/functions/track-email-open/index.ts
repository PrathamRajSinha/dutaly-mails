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

Deno.serve(async (req) => {
  try {
    const tid = new URL(req.url).searchParams.get("tid") ?? "";
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tid)) {
      const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { error } = await supabase.rpc("record_email_open", { p_tracking_id: tid });
      if (error) console.error("record_email_open failed:", error.message);
    }
  } catch (e) {
    console.error("track-email-open error:", e);
  }
  return new Response(GIF, { status: 200, headers });
});
