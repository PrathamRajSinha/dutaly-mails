// deno-lint-ignore-file no-explicit-any
export function normalizeLabels(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const r of raw) {
    if (typeof r !== "string") continue;
    const t = r.trim().replace(/\s+/g, " ").slice(0, 32);
    if (!t) continue;
    const titled = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    if (!out.some((o) => o.toLowerCase() === titled.toLowerCase())) out.push(titled);
    if (out.length >= 3) break;
  }
  return out;
}

export async function getExistingLabels(supabase: any, userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("email_queue")
    .select("labels")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(300);
  const counts = new Map<string, number>();
  for (const row of data || []) for (const l of row.labels || []) counts.set(l, (counts.get(l) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([l]) => l);
}

export function labelPromptSection(existing: string[]): string {
  return `TOPIC LABELS:
- Also return "labels": 1 to 3 short topic labels (1-3 words each, Sentence case) describing what the email is about, e.g. "Order status", "Shipping delay", "Password reset", "Pricing question", "Invoice request", "Bug report", "Partnership", "Cancellation", "Feedback", "Newsletter".
- Prefer reusing these existing labels when they fit: ${existing.length ? existing.join(", ") : "(none yet)"}.`;
}

export function mergeLabels(a: string[] = [], b: string[] = []): string[] {
  const out = [...a];
  for (const l of b) if (!out.some((o) => o.toLowerCase() === l.toLowerCase())) out.push(l);
  return out.slice(0, 6);
}
