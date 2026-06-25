import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GmailMessage {
  id: string;
  threadId: string;
}

interface GmailMessageDetail {
  id: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{
      mimeType: string;
      body?: { data?: string };
      parts?: Array<{
        mimeType: string;
        body?: { data?: string };
      }>;
    }>;
  };
  snippet: string;
}

function base64UrlDecode(data: string): string {
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return atob(base64);
  }
}

function extractEmailBody(payload: GmailMessageDetail["payload"]): string {
  if (payload.body?.data) {
    return base64UrlDecode(payload.body.data);
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return base64UrlDecode(part.body.data);
      }
      if (part.parts) {
        for (const nestedPart of part.parts) {
          if (nestedPart.mimeType === "text/plain" && nestedPart.body?.data) {
            return base64UrlDecode(nestedPart.body.data);
          }
        }
      }
    }
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        const html = base64UrlDecode(part.body.data);
        return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      }
    }
  }
  return "";
}

function getHeader(headers: Array<{ name: string; value: string }>, name: string): string {
  const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return header?.value || "";
}

function parseFromHeader(from: string): { address: string; name: string | null } {
  const match = from.match(/^(?:"?([^"]*)"?\s)?<?([^>]+)>?$/);
  if (match) {
    return { name: match[1]?.trim() || null, address: match[2].trim() };
  }
  return { name: null, address: from.trim() };
}

async function refreshAccessToken(
  supabaseUrl: string,
  supabaseKey: string,
  accountId: string,
  refreshToken: string
): Promise<string | null> {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    console.error("Failed to refresh token:", await response.text());
    return null;
  }

  const tokens = await response.json();
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  const supabase = createClient(supabaseUrl, supabaseKey);
  await supabase
    .from("email_accounts")
    .update({
      access_token: tokens.access_token,
      token_expires_at: expiresAt,
    })
    .eq("id", accountId);

  return tokens.access_token;
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

    console.log("Fetching Gmail emails for user:", user.id);

    // Get user's Gmail account
    const { data: accounts, error: accountsError } = await supabase
      .from("email_accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "gmail")
      .eq("is_active", true);

    if (accountsError || !accounts || accounts.length === 0) {
      return new Response(
        JSON.stringify({ error: "No Gmail account connected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get existing external_email_ids to avoid duplicates (across all accounts)
    const { data: existingEmails } = await supabase
      .from("email_queue")
      .select("external_email_id")
      .eq("user_id", user.id)
      .not("external_email_id", "is", null);

    const existingIds = new Set((existingEmails || []).map((e) => e.external_email_id));

    let processed = 0;
    let skipped = 0;
    let totalMessages = 0;

    // Loop through ALL connected Gmail accounts
    for (const account of accounts) {
      console.log(`Processing Gmail account: ${account.email_address} (${account.id})`);
      let accessToken = account.access_token;

      // Check if token needs refresh
      if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
        console.log(`Access token expired for ${account.email_address}, refreshing...`);
        const refreshed = await refreshAccessToken(supabaseUrl, supabaseKey, account.id, account.refresh_token);
        if (!refreshed) {
          console.error(`Failed to refresh access token for ${account.email_address}, skipping`);
          continue;
        }
        accessToken = refreshed;
      }

      // Fetch recent unread emails from Gmail
      const listResponse = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=is:unread",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!listResponse.ok) {
        const errorText = await listResponse.text();
        console.error(`Gmail API error for ${account.email_address}:`, errorText);
        continue;
      }

      const listData = await listResponse.json();
      const messages: GmailMessage[] = listData.messages || [];
      totalMessages += messages.length;

      console.log(`Found ${messages.length} unread messages for ${account.email_address}`);

      for (const msg of messages) {
        if (existingIds.has(msg.id)) {
          skipped++;
          continue;
        }

        // Fetch full message details
        const detailResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!detailResponse.ok) {
          console.error(`Failed to fetch message ${msg.id}`);
          continue;
        }

        const detail: GmailMessageDetail = await detailResponse.json();
        const headers = detail.payload.headers;

        const from = getHeader(headers, "From");
        const subject = getHeader(headers, "Subject");
        const body = extractEmailBody(detail.payload) || detail.snippet;

        const { address: fromAddress, name: fromName } = parseFromHeader(from);

        console.log(`Processing email: "${subject}" from ${fromAddress}`);

        // Call process-email function to classify and queue
        const processResponse = await fetch(
          `${supabaseUrl}/functions/v1/process-email`,
          {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email_id: msg.id,
              email_account_id: account.id,
              from_address: fromAddress,
              from_name: fromName,
              subject: subject,
              body: body,
              thread_id: msg.threadId || null,
            }),
          }
        );

        if (processResponse.ok) {
          processed++;
          existingIds.add(msg.id);
          const result = await processResponse.json();
          console.log(`Email processed: ${result.action}, auto_send: ${result.auto_send}`);

          // If auto_send is true, actually send the reply via Gmail
          if (result.action === "reply" && result.auto_send && result.suggested_reply) {
            console.log(`Auto-sending reply to ${fromAddress}...`);

            try {
              const sendResponse = await fetch(
                `${supabaseUrl}/functions/v1/send-gmail-reply`,
                {
                  method: "POST",
                  headers: {
                    Authorization: authHeader,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    email_account_id: account.id,
                    to_address: fromAddress,
                    subject: subject,
                    body: result.suggested_reply,
                    message_id: msg.id,
                    thread_id: msg.threadId,
                  }),
                }
              );

              if (sendResponse.ok) {
                const sendResult = await sendResponse.json();
                console.log(`Auto-reply sent successfully, message ID: ${sendResult.message_id}`);

                await supabase
                  .from("email_queue")
                  .update({
                    status: "sent",
                    reviewed_at: new Date().toISOString(),
                    email_account_id: account.id,
                  })
                  .eq("external_email_id", msg.id)
                  .eq("user_id", user.id);

                await supabase.from("activity_logs").insert({
                  user_id: user.id,
                  email_account_id: account.id,
                  action: "auto_sent",
                  email_subject: subject,
                  email_from: fromAddress,
                  details: {
                    intent: result.intent,
                    confidence: result.confidence,
                    sent_message_id: sendResult.message_id,
                  },
                });
              } else {
                const errorText = await sendResponse.text();
                console.error("Failed to auto-send reply:", errorText);

                await supabase
                  .from("email_queue")
                  .update({ status: "pending" })
                  .eq("external_email_id", msg.id)
                  .eq("user_id", user.id);
              }
            } catch (sendError) {
              console.error("Error during auto-send:", sendError);
              await supabase
                .from("email_queue")
                .update({ status: "pending" })
                .eq("external_email_id", msg.id)
                .eq("user_id", user.id);
            }
          }
        } else {
          console.error(`Failed to process email ${msg.id}:`, await processResponse.text());
        }
      }
    }

    console.log(`Completed: ${processed} processed, ${skipped} skipped (already in queue)`);

    return new Response(
      JSON.stringify({
        success: true,
        total: messages.length,
        processed,
        skipped,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error fetching Gmail emails:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
