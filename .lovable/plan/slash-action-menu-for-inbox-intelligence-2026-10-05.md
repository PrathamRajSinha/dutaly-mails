# Slash action menu for Inbox Intelligence

## What will change
- Typing `/` will immediately open a searchable action menu above the message box.
- The first available action will be **Use template**; selecting it opens the existing saved-template picker.
- The menu will support mouse selection and Arrow Up, Arrow Down, Enter, Tab, and Escape.
- The action list will be defined in one place so future actions can be added without rebuilding the menu.
- Update the message-box hint to advertise `/` for actions while keeping `@` for contacts.

## Technical details
- Replace the template-only slash detection with a two-stage command state: action selection, then template selection.
- Preserve the selected template ID in the assistant request so the exact saved design is used.
- Use the existing semantic colors and controls, then verify keyboard behavior and the visible menu in Inbox Intelligence.
