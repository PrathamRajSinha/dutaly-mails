import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Allowed frontend origins (callback only redirects back to these)
const ALLOWED_ORIGINS = [
  "https://mails.dutaly.com",
  "https://dutaly.com",
  "https://www.dutaly.com",
  "https://mail-replai.lovable.app",
  "https://id-preview--a10d7822-747b-4c2a-a9e5-fad4762101ef.lovable.app",
];
const DEFAULT_FRONTEND_URL = "https://mails.dutaly.com";

function resolveFrontendUrl(origin: string | null | undefined): string {
  if (!origin) return DEFAULT_FRONTEND_URL;
  try {
    const u = new URL(origin);
    const normalized = `${u.protocol}//${u.host}`;
    if (ALLOWED_ORIGINS.includes(normalized)) return normalized;
    // Allow any lovableproject.com / lovable.app preview sandbox
    if (u.host.endsWith(".lovableproject.com") || u.host.endsWith(".lovable.app")) {
      return normalized;
    }
  } catch {
    // fall through
  }
  return DEFAULT_FRONTEND_URL;
}

Deno.serve(async (req) => {
  let FRONTEND_URL = DEFAULT_FRONTEND_URL;
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Try to extract origin from state early so error redirects land on the right domain
    if (state) {
      try {
        const preview = JSON.parse(atob(state));
        FRONTEND_URL = resolveFrontendUrl(preview?.origin);
      } catch {
        // ignore, use default
      }
    }

    console.log("Gmail callback received:", {
      hasCode: !!code,
      hasState: !!state,
      error,
      frontend: FRONTEND_URL,
    });

    // Handle OAuth errors
    if (error) {
      console.error("Google OAuth error:", error);
      return Response.redirect(
        `${FRONTEND_URL}/settings?error=${encodeURIComponent(error)}`,
        302
      );
    }

    if (!code || !state) {
      console.error("Missing code or state");
      return Response.redirect(
        `${FRONTEND_URL}/settings?error=missing_params`,
        302
      );
    }

    // Decode state to get user ID
    let stateData: { userId: string; timestamp: number; nonce: string; origin?: string };
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      console.error("Invalid state parameter");
      return Response.redirect(
        `${FRONTEND_URL}/settings?error=invalid_state`,
        302
      );
    }

    FRONTEND_URL = resolveFrontendUrl(stateData.origin);
    const { userId } = stateData;
    console.log(`Processing Gmail callback for user: ${userId} -> ${FRONTEND_URL}`);

    // Exchange code for tokens
    const redirectUri = `${SUPABASE_URL}/functions/v1/gmail-auth-callback`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return Response.redirect(
        `${FRONTEND_URL}/settings?error=token_exchange_failed`,
        302
      );
    }

    const tokens = await tokenResponse.json();
    console.log("Token exchange successful");

    // Get user email from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );

    if (!userInfoResponse.ok) {
      console.error("Failed to get user info");
      return Response.redirect(
        `${FRONTEND_URL}/settings?error=user_info_failed`,
        302
      );
    }

    const userInfo = await userInfoResponse.json();
    const emailAddress = userInfo.email;
    console.log(`Got Gmail user email: ${emailAddress}`);

    // Calculate token expiration
    const expiresAt = new Date(
      Date.now() + tokens.expires_in * 1000
    ).toISOString();

    // Use service role to insert/update email account
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from("email_accounts")
      .select("id")
      .eq("user_id", userId)
      .eq("email_address", emailAddress)
      .single();

    if (existingAccount) {
      // Update existing account
      const { error: updateError } = await supabase
        .from("email_accounts")
        .update({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: expiresAt,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingAccount.id);

      if (updateError) {
        console.error("Failed to update email account:", updateError);
        return Response.redirect(
          `${FRONTEND_URL}/settings?error=db_error`,
          302
        );
      }
      console.log("Updated existing Gmail account");
    } else {
      // Insert new account
      const { error: insertError } = await supabase
        .from("email_accounts")
        .insert({
          user_id: userId,
          email_address: emailAddress,
          provider: "gmail",
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: expiresAt,
          is_active: true,
        });

      if (insertError) {
        console.error("Failed to insert email account:", insertError);
        return Response.redirect(
          `${FRONTEND_URL}/settings?error=db_error`,
          302
        );
      }
      console.log("Inserted new Gmail account");
    }

    // Redirect to settings with success
    return Response.redirect(
      `${FRONTEND_URL}/settings?success=gmail_connected`,
      302
    );
  } catch (error) {
    console.error("Gmail callback error:", error);
    return Response.redirect(
      `${FRONTEND_URL}/settings?error=internal_error`,
      302
    );
  }
});
