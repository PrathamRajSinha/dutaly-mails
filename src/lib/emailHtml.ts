export interface EmailTemplateStyle {
  font_family?: string;
  font_size?: string;
  text_color?: string;
  accent_color: string;
  footer_text: string;
  footer_logo_url: string;
}

// Keep in sync with supabase/functions/_shared/emailFormat.ts
export const fontStacks: Record<string, string> = {
  "sans-serif": "Arial, Helvetica, sans-serif",
  helvetica: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  verdana: "Verdana, Geneva, sans-serif",
  tahoma: "Tahoma, Verdana, sans-serif",
  trebuchet: "'Trebuchet MS', Helvetica, sans-serif",
  serif: "Georgia, 'Times New Roman', Times, serif",
  times: "'Times New Roman', Times, serif",
  garamond: "Garamond, Baskerville, Georgia, serif",
  monospace: "'Courier New', Courier, monospace",
};

export const fontLabels: Record<string, string> = {
  "sans-serif": "Arial",
  helvetica: "Helvetica",
  verdana: "Verdana",
  tahoma: "Tahoma",
  trebuchet: "Trebuchet",
  serif: "Georgia",
  times: "Times New Roman",
  garamond: "Garamond",
  monospace: "Courier",
};

export const fontSizes: Record<string, string> = {
  xsmall: "12px",
  small: "13px",
  medium: "15px",
  large: "17px",
  xlarge: "19px",
};

/** Escape text, then re-allow a small safe set of formatting tags. */
export function formatBody(body: string): string {
  let h = body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  h = h.replace(/&lt;(\/?)(b|strong|i|em|u|s|ul|ol|li|h2|h3|blockquote)&gt;/gi, "<$1$2>");
  h = h.replace(/&lt;a href=&quot;(https?:\/\/[^&\s]+|mailto:[^&\s]+)&quot;&gt;/gi, '<a href="$1" style="color:inherit;text-decoration:underline;">');
  h = h.replace(/&lt;\/a&gt;/gi, "</a>");
  h = h.replace(/&lt;span style=&quot;color:\s?(#[0-9a-f]{3,6})&quot;&gt;/gi, '<span style="color:$1">');
  h = h.replace(/&lt;mark&gt;/gi, '<span style="background:#fff3a3">').replace(/&lt;\/mark&gt;/gi, "</span>");
  h = h.replace(/&lt;\/span&gt;/gi, "</span>");
  h = h.replace(/\n*(<\/?(ul|ol|li|h2|h3|blockquote)>)\n*/gi, "$1");
  h = h.replace(/<blockquote>/gi, '<blockquote style="margin:12px 0;padding-left:12px;border-left:3px solid #ddd;color:#666;">');
  return h.replace(/\n/g, "<br />");
}

export function replaceVariables(
  body: string,
  vars: { sender_name?: string; subject?: string; my_name?: string }
): string {
  let result = body;
  if (vars.sender_name) result = result.replace(/\{\{sender_name\}\}/g, vars.sender_name);
  if (vars.subject) result = result.replace(/\{\{subject\}\}/g, vars.subject);
  if (vars.my_name) result = result.replace(/\{\{my_name\}\}/g, vars.my_name);
  result = result.replace(/\{\{date\}\}/g, new Date().toLocaleDateString());
  return result;
}

export function renderEmailHtml(body: string, style: EmailTemplateStyle): string {
  const fontStack = fontStacks[style.font_family ?? ""] || fontStacks["sans-serif"];
  const fontSize = fontSizes[style.font_size ?? ""] || fontSizes["medium"];

  const footerHtml =
    style.footer_text || style.footer_logo_url
      ? `<hr style="border: none; border-top: 1px solid ${style.accent_color}; margin: 24px 0;" />
         <div style="font-size: 12px; color: #999999;">
           ${style.footer_logo_url ? `<img src="${style.footer_logo_url}" alt="Logo" style="max-height: 40px; margin-bottom: 8px; display: block;" />` : ""}
           ${style.footer_text ? `<p style="margin: 0;">${formatBody(style.footer_text)}</p>` : ""}
         </div>`
      : "";

  return `<div style="font-family: ${fontStack}; font-size: ${fontSize}; color: ${style.text_color}; max-width: 600px; line-height: 1.6;">
  <div>${formatBody(body)}</div>
  ${footerHtml}
</div>`;
}
