

# Gmail and Outlook OAuth Implementation

This plan implements secure OAuth2 authentication for Gmail and Microsoft Outlook, allowing users to connect their email accounts.

---

## Step 1: Add Required Secrets

Before I can write the code, you need to add these OAuth credentials to Supabase:

| Secret Name | Description |
|-------------|-------------|
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `MICROSOFT_CLIENT_ID` | From Azure Portal |
| `MICROSOFT_CLIENT_SECRET` | From Azure Portal |

---

## Step 2: Create Edge Functions

### gmail-auth-init
- Generates Google OAuth2 authorization URL
- Creates secure state token with user ID
- Returns URL for frontend redirect

### gmail-auth-callback  
- Receives authorization code from Google
- Exchanges code for access/refresh tokens
- Fetches user's email from Google API
- Stores tokens in `email_accounts` table
- Redirects to Settings page

### outlook-auth-init
- Generates Microsoft OAuth2 authorization URL
- Creates secure state token with user ID
- Returns URL for frontend redirect

### outlook-auth-callback
- Receives authorization code from Microsoft
- Exchanges code for tokens via Microsoft endpoint
- Fetches user profile from Graph API
- Stores tokens in `email_accounts` table
- Redirects to Settings page

---

## Step 3: Create Callback Pages

### OAuthGmailCallback.tsx
- Reads `code` and `state` from URL
- Calls `gmail-auth-callback` edge function
- Shows loading spinner during processing
- Redirects to Settings on success

### OAuthOutlookCallback.tsx
- Same pattern for Microsoft OAuth

---

## Step 4: Update Settings Page

Modify connection handlers to:
- Call the `*-auth-init` edge function
- Get the OAuth URL from response
- Redirect user to Google/Microsoft authorization

---

## Step 5: Update App Routes

Add routes in `App.tsx`:
- `/oauth/gmail/callback`
- `/oauth/outlook/callback`

---

## Step 6: Update config.toml

Register the new edge functions with `verify_jwt = false` (authentication handled in code).

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
| `src/App.tsx` | Modify |
| `supabase/config.toml` | Modify |

---

## Technical Details

### Security Implementation

- **State parameter**: JWT containing user ID to prevent CSRF attacks
- **Server-side token storage**: Access/refresh tokens stored in database, never exposed to frontend
- **Service role**: Callback functions use service role to insert tokens for the authenticated user

### OAuth Flow

```text
1. User clicks "Connect Gmail/Outlook"
2. Frontend calls *-auth-init edge function
3. Edge function returns OAuth URL with state token
4. User authorizes app in Google/Microsoft
5. Provider redirects to callback edge function
6. Edge function exchanges code for tokens
7. Tokens saved to email_accounts table
8. User redirected to Settings with success message
```

### Token Storage Schema

Uses existing `email_accounts` table columns:
- `access_token` - Short-lived API token
- `refresh_token` - Long-lived refresh token  
- `token_expires_at` - Expiration timestamp

