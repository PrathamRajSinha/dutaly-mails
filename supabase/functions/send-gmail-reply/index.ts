import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

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
  thread_id?: string;
  message_id?: string;
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

function createEmailRaw(to: string, subject: string, body: string, fromEmail: string, threadId?: string): string {
  // Create RFC 2822 formatted email
  const emailLines = [
    `From: ${fromEmail}`,
    `To: ${to}`,
    `Subject: Re: ${subject.replace(/^Re:\s*/i, "")}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `MIME-Version: 1.0`,
    "",
    body,
  ];

  const rawEmail = emailLines.join("\r\n");
  
  // Base64url encode
  return btoa(rawEmail)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
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
    console.log("Sending reply to:", requestData.to_address, "Subject:", requestData.subject);

    // Get the email account
    const { data: account, error: accountError } = await supabase
      .from("email_accounts")
      .select("*")
      .eq("id", requestData.email_account_id)
      .eq("user_id", user.id)
      .single();

    if (accountError || !account) {
      console.error("Account not found:", accountError);
      return new Response(
        JSON.stringify({ error: "Email account not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let accessToken = account.access_token;

    // Check if token needs refresh
    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      console.log("Access token expired, refreshing...");
      accessToken = await refreshAccessToken(supabaseUrl, supabaseKey, account.id, account.refresh_token);
      if (!accessToken) {
        return new Response(
          JSON.stringify({ error: "Failed to refresh access token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Create the raw email message
    const rawMessage = createEmailRaw(
      requestData.to_address,
      requestData.subject,
      requestData.body,
      account.email_address,
      requestData.thread_id
    );

    // Send via Gmail API
    const sendUrl = requestData.thread_id
      ? `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`
      : `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`;

    const sendBody: { raw: string; threadId?: string } = { raw: rawMessage };
    if (requestData.thread_id) {
      sendBody.threadId = requestData.thread_id;
    }

    const sendResponse = await fetch(sendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendBody),
    });

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      console.error("Gmail send error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to send email via Gmail" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sendResult = await sendResponse.json();
    console.log("Email sent successfully, message ID:", sendResult.id);

    // If we have the original message ID, mark it as read
    if (requestData.message_id) {
      try {
        await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${requestData.message_id}/modify`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              removeLabelIds: ["UNREAD"],
            }),
          }
        );
        console.log("Original message marked as read");
      } catch (markError) {
        console.warn("Failed to mark original message as read:", markError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message_id: sendResult.id,
        thread_id: sendResult.threadId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error sending reply:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
