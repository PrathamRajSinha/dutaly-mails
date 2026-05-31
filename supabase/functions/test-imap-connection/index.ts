import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function readUntil(conn: Deno.TlsConn, terminator: (s: string) => boolean, timeoutMs = 8000): Promise<string> {
  const buf = new Uint8Array(8192);
  let result = "";
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const n = await Promise.race([
      conn.read(buf),
      new Promise<null>((r) => setTimeout(() => r(null), timeoutMs)),
    ]);
    if (n === null || n === 0) break;
    result += new TextDecoder().decode(buf.subarray(0, n as number));
    if (terminator(result)) break;
  }
  return result;
}

async function testImap(host: string, port: number, email: string, password: string): Promise<string> {
  let conn: Deno.TlsConn | null = null;
  try {
    conn = await Deno.connectTls({ hostname: host, port });
    await readUntil(conn, (s) => s.includes("\r\n"));
    const cmd = `a1 LOGIN "${email.replace(/"/g, '\\"')}" "${password.replace(/"/g, '\\"')}"\r\n`;
    await conn.write(new TextEncoder().encode(cmd));
    const resp = await readUntil(conn, (s) => /a1 (OK|NO|BAD)/i.test(s));
    if (/a1 OK/i.test(resp)) return "ok";
    if (/a1 (NO|BAD)/i.test(resp)) return "auth_failed";
    return "unknown_error";
  } catch (e) {
    const msg = String((e as Error).message || e);
    if (/dns|getaddrinfo|nodename/i.test(msg)) return "host_unreachable";
    if (/refused|timed out|reset/i.test(msg)) return "host_unreachable";
    return "tls_error";
  } finally {
    try { conn?.close(); } catch { /* noop */ }
  }
}

async function testSmtp(host: string, port: number, email: string, password: string): Promise<string> {
  try {
    if (port === 465) {
      const conn = await Deno.connectTls({ hostname: host, port });
      await readUntil(conn, (s) => s.includes("\r\n"));
      conn.close();
    } else {
      const conn = await Deno.connect({ hostname: host, port });
      await readUntil(conn as unknown as Deno.TlsConn, (s) => s.includes("\r\n"));
      conn.close();
    }
    return "ok";
  } catch (e) {
    const msg = String((e as Error).message || e);
    if (/dns|getaddrinfo|nodename/i.test(msg)) return "host_unreachable";
    return "unreachable";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { email, password, imap_host, imap_port, smtp_host, smtp_port } = body || {};
    if (!email || !password || !imap_host || !imap_port || !smtp_host || !smtp_port) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imap = await testImap(String(imap_host), Number(imap_port), String(email), String(password));
    const smtp = imap === "ok"
      ? await testSmtp(String(smtp_host), Number(smtp_port), String(email), String(password))
      : "skipped";

    return new Response(JSON.stringify({ imap, smtp, ok: imap === "ok" && smtp === "ok" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("test-imap-connection error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
