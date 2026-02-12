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

    await client.send({
      from: account.email_address,
      to: requestData.to_address,
      subject,
      content: requestData.body,
    });

    await client.close();

    console.log("SMTP email sent successfully");

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
