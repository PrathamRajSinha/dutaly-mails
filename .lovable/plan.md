# Template picker in Inbox Intelligence

## What will change
- Typing `/template` in the Inbox Intelligence message box will open a searchable list of saved templates.
- Users can select a template with the mouse, arrow keys, Enter, or Tab.
- The selected template will be inserted clearly into the request and sent with its exact saved wording, formatting, colours, fonts, and footer.
- The existing `@` contact picker will continue to work alongside it.

## Technical details
- Load the signed-in user's saved template names and IDs on the Inbox Intelligence page.
- Add slash-command detection and an accessible autocomplete menu using the existing message input interaction pattern.
- Pass the selected template ID explicitly to the email assistant so similarly named templates cannot be confused.
- Keep the current server-side name matching as a fallback for natural-language requests.
- Verify the app builds cleanly and the picker works by keyboard and mouse.
