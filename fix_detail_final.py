import re
with open('src/components/tickets/TicketDetailPanel.tsx', 'r') as f:
    content = f.read()

# Fix SlaCountdown component - remove the bad line I injected
content = re.sub(r'const isBreached = ticket\?.sla_due_at.*?;', '', content)

# Fix other places where I injected it incorrectly
content = content.replace("const isBreached = ticket?.sla_due_at ? isPast(new Date(ticket.sla_due_at)) : false;", "")

# Ensure imports are correct
if 'Plus' not in content:
    content = content.replace('X, Edit,', 'X, Edit, Plus,')

with open('src/components/tickets/TicketDetailPanel.tsx', 'w') as f:
    f.write(content)
