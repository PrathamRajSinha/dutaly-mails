## Update favicon to new Dutaly logo

1. Copy `user-uploads://dutalybig.png` to `public/favicon.png` (overwrite existing).
2. Delete `public/favicon.ico` if present so browsers don't fall back to the old icon.
3. Update `index.html` `<link rel="icon">` to point at `/favicon.png?v=3` (bump cache-buster from `v=2` so existing visitors see the new icon).

No other files change. The OG/Twitter image tags stay as-is.