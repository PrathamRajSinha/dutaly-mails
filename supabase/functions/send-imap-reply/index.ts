import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";
import { SmtpClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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

    const client = new SmtpClient();

    const smtpPort = account.smtp_port || 587;
    const useStartTls = smtpPort === 587;

    if (useStartTls) {
      await client.connect({
        hostname: account.smtp_host,
        port: smtpPort,
      });
      await client.starttls();
    } else {
      await client.connectTLS({
        hostname: account.smtp_host,
        port: smtpPort,
      });
    }

    await client.login({
      username: account.email_address,
      password: account.imap_password,
    });

    const subject = requestData.subject.startsWith("Re:") 
      ? requestData.subject 
      : `Re: ${requestData.subject}`;

    // Build send options with html support
    const sendOptions: Record<string, unknown> = {
      from: account.email_address,
      to: requestData.to_address,
      subject,
    };

    if (requestData.html_body) {
      sendOptions.content = "auto";
      sendOptions.html = requestData.html_body;
    } else {
      sendOptions.content = requestData.body;
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
