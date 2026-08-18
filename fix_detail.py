import re
with open('src/components/tickets/TicketDetailPanel.tsx', 'r') as f:
    content = f.read()

# Fix "Cannot find name 'overdue'" by defining it correctly or removing incorrect injections
# The error appeared at lines 148, 269, 324.
content = content.replace("const isBreached = overdue;", "const isBreached = ticket?.sla_due_at ? isPast(new Date(ticket.sla_due_at)) : false;")
# Also check for 'overdue' in conversation cards
content = re.sub(r'const isBreached = overdue;', 'const isBreached = ticket?.sla_due_at ? isPast(new Date(ticket.sla_due_at)) : false;', content)

with open('src/components/tickets/TicketDetailPanel.tsx', 'w') as f:
    f.write(content)
