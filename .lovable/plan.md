Replace the site favicon with the uploaded `d:m` logo.

Steps:
1. Copy `user-uploads://dm.png` to `public/favicon.png`.
2. Delete the existing `public/favicon.ico` so browsers don't fall back to it.
3. Update `<link rel="icon">` in `index.html` to point to `/favicon.png` (type `image/png`).

Note: The image has a lot of whitespace around the `d:m` mark, which will make the favicon look tiny in the browser tab. If you want, I can crop/tighten it before setting it — otherwise I'll use it as-is.