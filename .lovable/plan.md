

## Forgot Password / Reset Password Flow

### What we'll build

1. **"Forgot password?" link** on the Auth sign-in form that reveals an inline email input to request a reset link
2. **`/reset-password` page** where users land after clicking the email link, allowing them to set a new password
3. A new route in `App.tsx` for `/reset-password`

### Technical approach

**Auth page (`src/pages/Auth.tsx`)**
- Add a "Forgot password?" button below the sign-in form
- When clicked, show a simple form with email input and a "Send Reset Link" button
- Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`
- Back button to return to sign-in

**New page (`src/pages/ResetPassword.tsx`)**
- On mount, listen for `onAuthStateChange` event with `PASSWORD_RECOVERY` type
- Show a form with new password + confirm password fields
- Calls `supabase.auth.updateUser({ password })` to set the new password
- On success, redirect to `/dashboard`
- Validates passwords match and meet minimum length

**Routing (`src/App.tsx`)**
- Add `<Route path="/reset-password" element={<ResetPassword />} />` as a public route

### Files changed
- `src/pages/Auth.tsx` — add forgot password link and inline reset request form
- `src/pages/ResetPassword.tsx` — new page for setting new password
- `src/App.tsx` — add `/reset-password` route

