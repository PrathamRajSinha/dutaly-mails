import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MICROSOFT_CLIENT_ID = Deno.env.get("MICROSOFT_CLIENT_ID")!;
const MICROSOFT_CLIENT_SECRET = Deno.env.get("MICROSOFT_CLIENT_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Frontend URL for redirects
const FRONTEND_URL = "https://id-preview--a10d7822-747b-4c2a-a9e5-fad4762101ef.lovable.app";

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    console.log("Outlook callback received:", { 
      hasCode: !!code, 
      hasState: !!state, 
      error,
      errorDescription 
    });

    // Handle OAuth errors
    if (error) {
      console.error("Microsoft OAuth error:", error, errorDescription);
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
    let stateData: { userId: string; timestamp: number; nonce: string };
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      console.error("Invalid state parameter");
      return Response.redirect(
        `${FRONTEND_URL}/settings?error=invalid_state`,
        302
      );
    }

    const { userId } = stateData;
    console.log(`Processing Outlook callback for user: ${userId}`);

    // Exchange code for tokens
    const redirectUri = `${SUPABASE_URL}/functions/v1/outlook-auth-callback`;
    const tokenResponse = await fetch(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: MICROSOFT_CLIENT_ID,
          client_secret: MICROSOFT_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          scope: "offline_access User.Read Mail.Read Mail.Send",
        }),
      }
    );

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

    // Get user email from Microsoft Graph
    const userInfoResponse = await fetch(
      "https://graph.microsoft.com/v1.0/me",
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
    const emailAddress = userInfo.mail || userInfo.userPrincipalName;
    console.log(`Got Outlook user email: ${emailAddress}`);

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
      console.log("Updated existing Outlook account");
    } else {
      // Insert new account
      const { error: insertError } = await supabase
        .from("email_accounts")
        .insert({
          user_id: userId,
          email_address: emailAddress,
          provider: "outlook",
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
      console.log("Inserted new Outlook account");
    }

    // Redirect to settings with success
    return Response.redirect(
      `${FRONTEND_URL}/settings?success=outlook_connected`,
      302
    );
  } catch (error) {
    console.error("Outlook callback error:", error);
    return Response.redirect(
      `${FRONTEND_URL}/settings?error=internal_error`,
      302
    );
  }
});
