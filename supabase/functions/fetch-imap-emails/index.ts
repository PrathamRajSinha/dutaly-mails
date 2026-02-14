import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Minimal IMAP client using Deno.connectTls
async function imapConnect(host: string, port: number): Promise<Deno.TlsConn> {
  const conn = await Deno.connectTls({ hostname: host, port });
  // Read greeting
  await readLine(conn);
  return conn;
}

async function readLine(conn: Deno.TlsConn): Promise<string> {
  const buf = new Uint8Array(4096);
  let result = "";
  while (true) {
    const n = await conn.read(buf);
    if (n === null) break;
    result += new TextDecoder().decode(buf.subarray(0, n));
    if (result.includes("\r\n")) break;
  }
  return result.trim();
}

async function readMultiLine(conn: Deno.TlsConn, tag: string): Promise<string> {
  const buf = new Uint8Array(8192);
  let result = "";
  while (true) {
    const n = await conn.read(buf);
    if (n === null) break;
    result += new TextDecoder().decode(buf.subarray(0, n));
    // Check if we got the tagged response line
    if (result.includes(`${tag} OK`) || result.includes(`${tag} NO`) || result.includes(`${tag} BAD`)) break;
  }
  return result;
}

async function imapCommand(conn: Deno.TlsConn, tag: string, command: string): Promise<string> {
  const cmd = `${tag} ${command}\r\n`;
  await conn.write(new TextEncoder().encode(cmd));
  return await readMultiLine(conn, tag);
}

function decodeMimeEncodedWord(str: string): string {
  // Decode RFC 2047 encoded words: =?charset?encoding?encoded_text?=
  return str.replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g, (_match, _charset, encoding, text) => {
    if (encoding.toUpperCase() === "B") {
      // Base64
      try {
        const bytes = Uint8Array.from(atob(text), c => c.charCodeAt(0));
        return new TextDecoder("utf-8").decode(bytes);
      } catch { return text; }
    } else if (encoding.toUpperCase() === "Q") {
      // Quoted-printable
      const decoded = text
        .replace(/_/g, " ")
        .replace(/=([0-9A-Fa-f]{2})/g, (_: string, hex: string) => String.fromCharCode(parseInt(hex, 16)));
      try {
        const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0));
        return new TextDecoder("utf-8").decode(bytes);
      } catch { return decoded; }
    }
    return text;
  });
}

function parseEmailHeaders(raw: string): { from: string; fromName: string | null; subject: string; messageId: string; threadId: string | null } {
  const getHeader = (name: string): string => {
    // Handle multi-line folded headers
    const regex = new RegExp(`^${name}:\\s*((?:.*(?:\\r?\\n[ \\t]+.*)*)*)`, "mi");
    const match = raw.match(regex);
    if (!match) return "";
    return decodeMimeEncodedWord(match[1].replace(/\\r?\\n[ \\t]+/g, " ").trim());
  };

  const from = getHeader("From");
  const subject = getHeader("Subject");
  const messageId = getHeader("Message-ID") || getHeader("Message-Id");
  const inReplyTo = getHeader("In-Reply-To");
  const references = getHeader("References");

  // Derive thread ID from In-Reply-To or References, fallback to normalized subject
  let threadId: string | null = null;
  if (inReplyTo) {
    threadId = inReplyTo.replace(/[<>]/g, "");
  } else if (references) {
    threadId = references.split(/\s+/)[0].replace(/[<>]/g, "");
  } else {
    // Fallback: normalize subject by stripping Re:/Fwd: prefixes
    const normalized = subject.replace(/^(Re|Fwd|Fw):\s*/gi, "").trim();
    if (normalized) threadId = `subj:${normalized}`;
  }

  // Parse from
  const fromMatch = from.match(/^(?:"?([^"]*)"?\s)?<?([^>]+)>?$/);
  const fromAddress = fromMatch ? fromMatch[2].trim() : from.trim();
  const fromName = fromMatch ? (fromMatch[1]?.trim() || null) : null;

  return { from: fromAddress, fromName, subject, messageId, threadId };
}

function decodeQuotedPrintable(text: string): string {
  return text
    .replace(/=\r?\n/g, "") // soft line breaks
    .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function decodeBase64(text: string): string {
  try {
    const cleaned = text.replace(/\r?\n/g, "");
    const bytes = Uint8Array.from(atob(cleaned), c => c.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  } catch { return text; }
}

function extractPlainBody(raw: string): string {
  // Extract BODY[TEXT] content using the byte-count literal {N}
  const bodyTextMatch = raw.match(/BODY\[TEXT\]\s*\{(\d+)\}\r?\n/);
  let bodyContent: string;
  
  if (bodyTextMatch) {
    const byteCount = parseInt(bodyTextMatch[1], 10);
    const startIdx = raw.indexOf(bodyTextMatch[0]) + bodyTextMatch[0].length;
    // Use the byte count to extract exactly the right amount of content
    bodyContent = raw.substring(startIdx, startIdx + byteCount);
  } else {
    bodyContent = raw;
  }

  // Check if this is a MIME multipart message
  const boundaryMatch = bodyContent.match(/--([^\s\r\n]+)/);
  if (boundaryMatch) {
    const boundary = boundaryMatch[1].replace(/--$/, "");
    const escapedBoundary = boundary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = bodyContent.split(new RegExp(`--${escapedBoundary}`));
    
    // Find the text/plain part
    for (const part of parts) {
      if (part.match(/Content-Type:\s*text\/plain/i)) {
        const contentSections = part.split(/\r?\n\r?\n/);
        if (contentSections.length >= 2) {
          let content = contentSections.slice(1).join("\n\n").trim();
          
          if (part.match(/Content-Transfer-Encoding:\s*quoted-printable/i)) {
            content = decodeQuotedPrintable(content);
          } else if (part.match(/Content-Transfer-Encoding:\s*base64/i)) {
            content = decodeBase64(content);
          }
          
          try {
            const bytes = Uint8Array.from(content, c => c.charCodeAt(0));
            content = new TextDecoder("utf-8").decode(bytes);
          } catch { /* already decoded */ }
          
          return content.trim().substring(0, 5000);
        }
      }
    }
  }

  // Fallback: no MIME boundaries, treat as plain text
  const plainBody = bodyContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return plainBody.substring(0, 5000);
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

    console.log("Fetching IMAP emails for user:", user.id);

    // Get user's IMAP accounts
    const { data: accounts, error: accountsError } = await supabase
      .from("email_accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "imap")
      .eq("is_active", true);

    if (accountsError || !accounts || accounts.length === 0) {
      return new Response(
        JSON.stringify({ error: "No IMAP account connected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let totalProcessed = 0;
    let totalSkipped = 0;
    let totalMessages = 0;

    for (const account of accounts) {
      const { imap_host, imap_port, email_address, imap_password } = account;

      if (!imap_host || !imap_password) {
        console.error(`Account ${account.id} missing IMAP config`);
        continue;
      }

      let conn: Deno.TlsConn | null = null;
      try {
        conn = await imapConnect(imap_host, imap_port || 993);

        // Login
        const loginResp = await imapCommand(conn, "A1", `LOGIN "${email_address}" "${imap_password}"`);
        if (loginResp.includes("A1 NO") || loginResp.includes("A1 BAD")) {
          console.error("IMAP login failed for", email_address);
          continue;
        }

        // Select INBOX
        await imapCommand(conn, "A2", "SELECT INBOX");

        // Search for unseen messages
        const searchResp = await imapCommand(conn, "A3", "SEARCH UNSEEN");
        const searchLine = searchResp.split("\r\n").find(l => l.startsWith("* SEARCH"));
        const uids = searchLine ? searchLine.replace("* SEARCH", "").trim().split(/\s+/).filter(Boolean) : [];

        console.log(`Found ${uids.length} unseen messages for ${email_address}`);
        totalMessages += uids.length;

        // Get existing IDs to dedup
        const { data: existingEmails } = await supabase
          .from("email_queue")
          .select("external_email_id")
          .eq("user_id", user.id)
          .not("external_email_id", "is", null);

        const existingIds = new Set((existingEmails || []).map(e => e.external_email_id));

        // Fetch up to 10 recent messages
        const recentUids = uids.slice(-10);
        
        for (const uid of recentUids) {
          const imapUid = `imap-${account.id}-${uid}`;
          if (existingIds.has(imapUid)) {
            totalSkipped++;
            continue;
          }

          // Fetch message
          const fetchResp = await imapCommand(conn, `F${uid}`, `FETCH ${uid} (BODY[HEADER] BODY[TEXT])`);
          
          const { from, fromName, subject, messageId, threadId } = parseEmailHeaders(fetchResp);
          const body = extractPlainBody(fetchResp);

          if (!from || !subject) {
            console.warn(`Skipping message ${uid}: missing from or subject`);
            continue;
          }

          console.log(`Processing IMAP email: "${subject}" from ${from}`);

          // Call process-email
          const processResponse = await fetch(
            `${supabaseUrl}/functions/v1/process-email`,
            {
              method: "POST",
              headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email_id: imapUid,
                email_account_id: account.id,
                from_address: from,
                from_name: fromName,
                subject,
                body,
                thread_id: threadId,
              }),
            }
          );

          if (processResponse.ok) {
            totalProcessed++;
            const result = await processResponse.json();
            console.log(`Email processed: ${result.action}`);

            // Auto-send via SMTP if needed
            if (result.action === "reply" && result.auto_send && result.suggested_reply) {
              console.log(`Auto-sending IMAP reply to ${from}...`);
              try {
                const sendResponse = await fetch(
                  `${supabaseUrl}/functions/v1/send-imap-reply`,
                  {
                    method: "POST",
                    headers: {
                      Authorization: authHeader,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      email_account_id: account.id,
                      to_address: from,
                      subject,
                      body: result.suggested_reply,
                    }),
                  }
                );

                if (sendResponse.ok) {
                  console.log("Auto-reply sent via SMTP");
                  await supabase
                    .from("email_queue")
                    .update({ status: "sent", reviewed_at: new Date().toISOString() })
                    .eq("external_email_id", imapUid)
                    .eq("user_id", user.id);

                  await supabase.from("activity_logs").insert({
                    user_id: user.id,
                    email_account_id: account.id,
                    action: "auto_sent",
                    email_subject: subject,
                    email_from: from,
                    details: { intent: result.intent, confidence: result.confidence },
                  });
                } else {
                  console.error("Failed to auto-send IMAP reply:", await sendResponse.text());
                  await supabase
                    .from("email_queue")
                    .update({ status: "pending" })
                    .eq("external_email_id", imapUid)
                    .eq("user_id", user.id);
                }
              } catch (sendError) {
                console.error("Error during IMAP auto-send:", sendError);
              }
            }
          } else {
            console.error(`Failed to process email ${uid}:`, await processResponse.text());
          }
        }

        // Logout
        await imapCommand(conn, "A9", "LOGOUT");
      } catch (imapError) {
        console.error(`IMAP error for ${email_address}:`, imapError);
      } finally {
        try { conn?.close(); } catch { /* ignore */ }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: totalMessages,
        processed: totalProcessed,
        skipped: totalSkipped,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error fetching IMAP emails:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
