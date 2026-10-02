# Fix app-wide dark mode

## Scope
- Make every authenticated app screen use the dark theme consistently, including page backgrounds, cards, filters, tabs, forms, dialogs, badges, and empty states.
- Replace the most visible light-only styling in the shared shell with semantic theme colors.
- Preserve the landing page’s intentional dark presentation and all existing functionality.

## Implementation
- Expand the shared dark-theme tokens and compatibility rules so legacy light-only colors map to accessible dark surfaces and text.
- Update shared account tabs and sidebar controls to use semantic theme classes instead of fixed light colors.
- Correct common hover, border, muted text, input, and card states that currently flash or remain light in dark mode.
- Respect the saved theme choice across reloads.

## Verification
- Check the app at desktop size in both light and dark mode.
- Confirm the theme toggle persists after navigation/reload.
- Verify the preview builds without errors.
