// deno-lint-ignore-file no-explicit-any
const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />");

/**
 * Looks up the tracking id for a queue row owned by userId and returns html with an open-tracking pixel.
 * If no html is given, wraps the plain text body. Returns the original html when tracking isn't possible.
 */
export async function withTrackingPixel(
  supabase: any,
  supabaseUrl: string,
  userId: string,
  queueEmailId: string | undefined,
  html: string | undefined,
  textBody: string,
): Promise<string | undefined> {
  if (!queueEmailId || !/^[0-9a-f-]{36}$/i.test(queueEmailId)) return html;
  const { data } = await supabase
    .from("email_queue")
    .select("tracking_id")
    .eq("id", queueEmailId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!data?.tracking_id) return html;
  const base = html ?? `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${escapeHtml(textBody || "")}</div>`;
  const pixel = `<img src="${supabaseUrl}/functions/v1/track-email-open?tid=${data.tracking_id}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;opacity:0;" />`;
  return base.includes("</body>") ? base.replace("</body>", `${pixel}</body>`) : base + pixel;
}
