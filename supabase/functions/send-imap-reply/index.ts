import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendReplyRequest {
  email_account_id: string;
  to_address: string;
  subject: string;
  body: string;
  html_body?: string;
  attachments?: string[]; // URLs to download
}

// ===== IMAP APPEND helper to save sent message to Sent folder =====
async function imapReadUntil(conn: Deno.TlsConn, marker: string, timeoutMs = 10000): Promise<string> {
  const buf = new Uint8Array(8192);
  let result = "";
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const n = await conn.read(buf);
    if (n === null) break;
    result += new TextDecoder().decode(buf.subarray(0, n));
    if (result.includes(marker)) return result;
  }
  return result;
}

async function imapSend(conn: Deno.TlsConn, data: string): Promise<void> {
  await conn.write(new TextEncoder().encode(data));
}

function buildRfc822(opts: {
  from: string; to: string; subject: string; html?: string; text?: string;
}): string {
  const date = new Date().toUTCString();
  const messageId = `<${crypto.randomUUID()}@${opts.from.split("@")[1] || "localhost"}>`;
  const subjectEnc = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(opts.subject)))}?=`;
  const headers = [
    `From: ${opts.from}`,
    `To: ${opts.to}`,
    `Subject: ${subjectEnc}`,
    `Date: ${date}`,
    `Message-ID: ${messageId}`,
    `MIME-Version: 1.0`,
  ];
  let body: string;
  if (opts.html) {
    headers.push(`Content-Type: text/html; charset=UTF-8`);
    headers.push(`Content-Transfer-Encoding: base64`);
    body = btoa(unescape(encodeURIComponent(opts.html))).replace(/(.{76})/g, "$1\r\n");
  } else {
    headers.push(`Content-Type: text/plain; charset=UTF-8`);
    headers.push(`Content-Transfer-Encoding: base64`);
    body = btoa(unescape(encodeURIComponent(opts.text || ""))).replace(/(.{76})/g, "$1\r\n");
  }
  return headers.join("\r\n") + "\r\n\r\n" + body + "\r\n";
}

async function appendToSentFolder(opts: {
  host: string; port: number; username: string; password: string;
  from: string; to: string; subject: string; html?: string; text?: string;
}): Promise<void> {
  const conn = await Deno.connectTls({ hostname: opts.host, port: opts.port });
  try {
    await imapReadUntil(conn, "\r\n"); // greeting
    // login
    await imapSend(conn, `a1 LOGIN "${opts.username}" "${opts.password.replace(/"/g, '\\"')}"\r\n`);
    const loginResp = await imapReadUntil(conn, "a1 ");
    if (!/a1 OK/i.test(loginResp)) throw new Error("IMAP login failed: " + loginResp.slice(0, 200));

    // discover Sent folder via LIST (look for \Sent special-use, fallback to common names)
    await imapSend(conn, `a2 LIST "" "*"\r\n`);
    const listResp = await imapReadUntil(conn, "a2 ");
    const candidates = ["Sent", "Sent Mail", "Sent Messages", "INBOX.Sent", "[Gmail]/Sent Mail"];
    let sentFolder: string | null = null;
    // Prefer \Sent special-use
    const sentMatch = listResp.match(/\(\\?[^)]*\\Sent[^)]*\)[^"]*"[^"]*"\s+"([^"]+)"/i);
    if (sentMatch) sentFolder = sentMatch[1];
    if (!sentFolder) {
      for (const name of candidates) {
        const re = new RegExp(`"\\s+"${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "i");
        if (re.test(listResp)) { sentFolder = name; break; }
      }
    }
    if (!sentFolder) sentFolder = "Sent";

    const message = buildRfc822(opts);
    const bytes = new TextEncoder().encode(message);
    await imapSend(conn, `a3 APPEND "${sentFolder}" (\\Seen) {${bytes.length}}\r\n`);
    // wait for continuation "+"
    const cont = await imapReadUntil(conn, "+");
    if (!cont.includes("+")) throw new Error("APPEND not accepted: " + cont.slice(0, 200));
    await conn.write(bytes);
    await imapSend(conn, `\r\n`);
    const appendResp = await imapReadUntil(conn, "a3 ");
    if (!/a3 OK/i.test(appendResp)) throw new Error("APPEND failed: " + appendResp.slice(0, 200));

    await imapSend(conn, `a4 LOGOUT\r\n`);
    await imapReadUntil(conn, "a4 ", 3000);
  } finally {
    try { conn.close(); } catch { /* ignore */ }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestData: SendReplyRequest = await req.json();
    console.log("Sending SMTP reply to:", requestData.to_address, "Subject:", requestData.subject);

    // Get the email account
    const { data: account, error: accountError } = await supabase
      .from("email_accounts")
      .select("*")
      .eq("id", requestData.email_account_id)
      .eq("user_id", user.id)
      .single();

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ error: "Email account not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!account.smtp_host || !account.imap_password) {
      return new Response(
        JSON.stringify({ error: "SMTP not configured for this account" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const smtpPort = account.smtp_port || 587;
    const useStartTls = smtpPort === 587;

    const client = new SMTPClient({
      connection: {
        hostname: account.smtp_host,
        port: smtpPort,
        tls: !useStartTls,
        auth: {
          username: account.email_address,
          password: account.imap_password,
        },
      },
    });

    const subject = requestData.subject.startsWith("Re:")
      ? requestData.subject
      : `Re: ${requestData.subject}`;

    // Normalize line endings to CRLF to comply with RFC 5322 (avoids "bare LF" SMTP 552 errors)
    const toCrlf = (s: string) => s.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n/g, "\r\n");
    const textBody = requestData.body ? toCrlf(requestData.body) : (requestData.html_body ? "See HTML version" : "");
    const htmlBody = requestData.html_body ? toCrlf(requestData.html_body) : undefined;

    const sendOptions: Record<string, unknown> = {
      from: account.email_address,
      to: requestData.to_address,
      subject,
      content: textBody,
    };

    if (htmlBody) {
      sendOptions.html = htmlBody;
    }

    // Download and attach files if any
    if (requestData.attachments && requestData.attachments.length > 0) {
      console.log(`Processing ${requestData.attachments.length} attachments...`);
      const attachmentList = [];
      for (const url of requestData.attachments) {
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`Failed to download attachment: ${url}`);
          continue;
        }
        const buffer = await response.arrayBuffer();
        const filename = url.split("/").pop()?.split("?")[0] || "attachment";
        const cleanName = filename.includes("_") ? filename.substring(filename.indexOf("_") + 1) : filename;
        const contentType = response.headers.get("content-type") || "application/octet-stream";
        
        attachmentList.push({
          filename: cleanName,
          content: new Uint8Array(buffer),
          contentType,
        });
      }
      if (attachmentList.length > 0) {
        sendOptions.attachments = attachmentList;
      }
    }

    await client.send(sendOptions as any);
    await client.close();

    console.log("SMTP email sent successfully");

    // Append a copy to the IMAP Sent folder so it shows up in the user's mail client
    if (account.imap_host && account.imap_password) {
      try {
        await appendToSentFolder({
          host: account.imap_host,
          port: account.imap_port || 993,
          username: account.email_address,
          password: account.imap_password,
          from: account.email_address,
          to: requestData.to_address,
          subject,
          html: requestData.html_body,
          text: requestData.body,
        });
        console.log("Saved copy to Sent folder");
      } catch (e) {
        console.warn("Failed to append to Sent folder:", e instanceof Error ? e.message : e);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error sending SMTP reply:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
