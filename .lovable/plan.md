1. Clean up `.env` file by removing duplicate key entries (VITE_SUPABASE_PUBLISHABLE_KEY and VITE_SUPABASE_URL both appear twice).

2. Add `.env` to `.gitignore` to prevent accidental commits of local environment files and signal to judges that secrets are properly managed.

3. Replace the generic Lovable README with a hackathon-ready README for Dutaly that includes:
   - Project description and problem statement
   - Key features and AI capabilities
   - Tech stack (React, Vite, Tailwind, Supabase, Razorpay, Gemini)
   - Architecture overview
   - Setup instructions
   - Team/demo info placeholders
   - Screenshots section
   - Note that publishable keys in the repo are intentionally public-facing