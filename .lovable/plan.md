# Export Technical Documentation as PDF

Generate a polished PDF of the Dutaly technical documentation (from the previous response) and save it to `/mnt/documents/` so the user can download it.

## Approach

- Use Python `reportlab` with Platypus flowables for clean typography, headings, code blocks, and page breaks.
- Single script run via `code--exec`, no project code changes.
- Output: `/mnt/documents/dutaly-technical-documentation.pdf`.

## Contents (sections)

1. Overview & Product Summary
2. Architecture (with ASCII diagram rendered in monospace)
3. Key Technologies (table)
4. Frontend Areas
5. Database Schema & RLS Model
6. Edge Functions
7. Email Connection Flow (5-step wizard)
8. AI Pipeline & Decision Tree
9. Deployment & Configuration
10. Security Posture (RLS, JWT, secrets handling — no sensitive details)

## Style

- Inter-like sans (Helvetica fallback), navy headings (#0A0A0F), purple accent (#7C6FE0) matching Dutaly brand.
- Cover page with title, subtitle, date.
- Page numbers in footer.

## QA

- Render PDF to JPEG pages with `pdftoppm` and visually inspect every page for clipping, overflow, broken layout before delivering.
- Iterate until clean.

## Deliverable

`<presentation-artifact path="dutaly-technical-documentation.pdf" mime_type="application/pdf"></presentation-artifact>`
