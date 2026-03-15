

# Fix Onboarding Loop & Auth Flow

## Problem 1: Onboarding loops after completion
**Root cause**: `handleFinish` in `Onboarding.tsx` updates the `profiles` table but never invalidates the React Query cache. When it navigates to `/dashboard`, `ProtectedRoute` reads the stale cached value (`onboarding_completed: false`) and redirects right back to `/onboarding`.

**Fix**: Import `useQueryClient` in `Onboarding.tsx` and call `queryClient.invalidateQueries({ queryKey: ["profile-onboarding"] })` after the profile update succeeds, before navigating.

Also: the Supabase calls don't check for errors (they return `{ error }` but never throw). Add proper error checking so failures are caught.

## Problem 2: "Get Started" skips sign-in for logged-in users
**Root cause**: User is already authenticated. `Auth.tsx` redirects logged-in users to `/dashboard`. This is correct behavior — not a bug. But we should make the landing page CTA smarter: if the user is logged in, "Get Started" should go to `/dashboard` instead of `/auth`.

**Fix**: In `HeroSection.tsx`, `CTASection.tsx`, and `LandingNavbar.tsx`, use the auth state to conditionally link to `/dashboard` if logged in, or `/auth` if not.

## Files Changed
- `src/pages/Onboarding.tsx` — invalidate query cache after profile update, add error checking on Supabase calls
- `src/components/landing/HeroSection.tsx` — smart CTA link
- `src/components/landing/CTASection.tsx` — smart CTA link  
- `src/components/landing/LandingNavbar.tsx` — smart CTA link

