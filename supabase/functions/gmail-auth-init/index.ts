import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      SUPABASE_URL,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    console.log(`Generating Gmail OAuth URL for user: ${userId}`);

    // Create state parameter with user ID (simple base64 encoding for now)
    // Capture the caller's origin so the callback can redirect back to the same domain
    let origin: string | null = null;
    try {
      const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
      origin = body?.origin || req.headers.get("origin") || req.headers.get("referer") || null;
      if (origin) {
        const u = new URL(origin);
        origin = `${u.protocol}//${u.host}`;
      }
    } catch {
      origin = req.headers.get("origin");
    }

    const stateData = {
      userId,
      timestamp: Date.now(),
      nonce: crypto.randomUUID(),
      origin,
    };
    const state = btoa(JSON.stringify(stateData));

    // Build Google OAuth URL
    const redirectUri = `${SUPABASE_URL}/functions/v1/gmail-auth-callback`;
    const scopes = [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.labels",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" ");

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scopes);
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");
    authUrl.searchParams.set("state", state);

    console.log(`Generated Gmail OAuth URL with redirect: ${redirectUri}`);

    return new Response(
      JSON.stringify({ url: authUrl.toString() }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating Gmail auth URL:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
