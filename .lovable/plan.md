
# Gmail and Outlook OAuth Integration Plan

This plan implements secure OAuth2 authentication for Gmail and Microsoft Outlook, allowing users to connect their email accounts without sharing passwords.

---

## Overview

The integration will create:
1. **Two edge functions** - One for Gmail OAuth flow, one for Outlook OAuth flow
2. **OAuth callback handling** - Frontend pages to handle the redirect after user authorizes
3. **Token storage** - Secure storage of access/refresh tokens in the existing `email_accounts` table
4. **UI updates** - Connect buttons that initiate the OAuth flows

---

## Architecture

```text
+----------------+       +------------------+       +----------------+
|    Settings    |  -->  |  Edge Function   |  -->  |  Google/MS     |
|    Page        |       |  (Init OAuth)    |       |  OAuth Server  |
+----------------+       +------------------+       +----------------+
                                                          |
                                                          v
+----------------+       +------------------+       +----------------+
|  email_accounts|  <--  |  Edge Function   |  <--  |  Callback URL  |
|    table       |       |  (Handle Token)  |       |  (/oauth/...)  |
+----------------+       +------------------+       +----------------+
```

---

## Step 1: Add Required Secrets

You will need to configure the following secrets in your Supabase project:

**For Gmail:**
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console

**For Outlook:**
- `MICROSOFT_CLIENT_ID` - From Azure Portal
- `MICROSOFT_CLIENT_SECRET` - From Azure Portal

---

## Step 2: Create Gmail OAuth Edge Functions

### 2a. `gmail-auth-init` Edge Function

Generates the Google OAuth2 authorization URL with required scopes:
- `https://www.googleapis.com/auth/gmail.readonly` (read emails)
- `https://www.googleapis.com/auth/gmail.send` (send replies)
- `https://www.googleapis.com/auth/gmail.labels` (apply labels)

The function will:
- Create a state token (JWT with user ID) for security
- Build the Google OAuth URL with PKCE code verifier
- Return the URL for the frontend to redirect

### 2b. `gmail-auth-callback` Edge Function

Handles the callback from Google:
- Receives authorization code from Google
- Exchanges code for access/refresh tokens
- Fetches user's email address from Google
- Stores tokens securely in `email_accounts` table
- Returns success/failure status

---

## Step 3: Create Outlook OAuth Edge Functions

### 3a. `outlook-auth-init` Edge Function

Generates the Microsoft OAuth2 authorization URL with scopes:
- `https://graph.microsoft.com/Mail.Read`
- `https://graph.microsoft.com/Mail.Send`
- `offline_access` (for refresh token)

### 3b. `outlook-auth-callback` Edge Function

Handles the callback from Microsoft:
- Receives authorization code
- Exchanges for tokens via Microsoft token endpoint
- Fetches user profile from Graph API
- Stores in `email_accounts` table

---

## Step 4: Create OAuth Callback Pages

### 4a. `/oauth/gmail/callback` Page

A simple React page that:
- Reads the `code` and `state` query parameters
- Calls the `gmail-auth-callback` edge function
- Shows loading spinner during processing
- Redirects to Settings page on success with toast notification
- Shows error message if connection fails

### 4b. `/oauth/outlook/callback` Page

Same pattern as Gmail callback for Microsoft OAuth.

---

## Step 5: Update Settings Page

Modify the "Connect Gmail" and "Connect Outlook" buttons to:
- Call the respective `*-auth-init` edge function
- Redirect user to the returned OAuth URL
- Handle loading states during the process

---

## Step 6: Update config.toml

Add the new edge functions to the Supabase configuration:

```toml
project_id = "wywlevstbiivkmcmmmei"

[functions.process-email]
verify_jwt = false

[functions.gmail-auth-init]
verify_jwt = false

[functions.gmail-auth-callback]
verify_jwt = false

[functions.outlook-auth-init]
verify_jwt = false

[functions.outlook-auth-callback]
verify_jwt = false
```

---

## File Changes Summary

| File | Action |
|------|--------|
| `supabase/functions/gmail-auth-init/index.ts` | Create |
| `supabase/functions/gmail-auth-callback/index.ts` | Create |
| `supabase/functions/outlook-auth-init/index.ts` | Create |
| `supabase/functions/outlook-auth-callback/index.ts` | Create |
| `src/pages/OAuthGmailCallback.tsx` | Create |
| `src/pages/OAuthOutlookCallback.tsx` | Create |
| `src/pages/Settings.tsx` | Modify |
| `src/App.tsx` | Modify (add routes) |
| `supabase/config.toml` | Modify |

---

## Technical Details

### OAuth2 PKCE Flow (Gmail)

```text
1. User clicks "Connect Gmail"
2. Frontend calls gmail-auth-init edge function
3. Edge function generates:
   - code_verifier (random 43-128 char string)
   - code_challenge (SHA256 hash of verifier, base64url encoded)
   - state (JWT containing user_id + nonce)
4. Stores code_verifier in temporary table or JWT
5. Returns Google auth URL with code_challenge
6. User authorizes app in Google
7. Google redirects to /oauth/gmail/callback?code=XXX&state=YYY
8. Frontend calls gmail-auth-callback with code + state
9. Edge function:
   - Validates state JWT
   - Exchanges code + code_verifier for tokens
   - Saves tokens to email_accounts
10. User redirected to Settings with success message
```

### Token Storage

Tokens will be stored in the existing `email_accounts` table:
- `access_token` - Short-lived token for API calls
- `refresh_token` - Long-lived token to get new access tokens
- `token_expires_at` - When access token expires

### Security Considerations

- State parameter prevents CSRF attacks
- PKCE flow prevents authorization code interception
- Tokens are stored server-side, never exposed to frontend
- Refresh tokens allow maintaining connection without re-auth

---

## User Setup Instructions

After implementation, you will need to:

1. **Create a Google Cloud Project:**
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add redirect URI: `https://wywlevstbiivkmcmmmei.supabase.co/functions/v1/gmail-auth-callback`
   - Enable Gmail API

2. **Create an Azure App Registration:**
   - Go to Azure Portal > App Registrations
   - Create new registration
   - Add redirect URI: `https://wywlevstbiivkmcmmmei.supabase.co/functions/v1/outlook-auth-callback`
   - Add Mail.Read, Mail.Send permissions

3. **Add secrets to Supabase:**
   - Go to Supabase Dashboard > Edge Functions > Secrets
   - Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
   - Add MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET
