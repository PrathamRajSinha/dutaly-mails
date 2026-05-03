## Fix: Coupon applies ₹100 instead of 100%

**Root cause:** DB stores `discount_type = "percent"` but `OnboardingPayment.tsx` checks for `"percentage"`, falling through to the flat-amount branch.

**Change:** In `src/pages/OnboardingPayment.tsx`, replace both `"percentage"` string comparisons with `"percent"` (lines 50 and 313).

After the fix, `FREETEST` (100% off) will compute `finalPrice = 0` and trigger the existing free-activation flow.