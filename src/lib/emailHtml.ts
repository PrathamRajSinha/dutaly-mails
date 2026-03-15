export interface EmailTemplateStyle {
  font_family?: string;
  font_size?: string;
  text_color?: string;
  accent_color: string;
  footer_text: string;
  footer_logo_url: string;
}

const fontStacks: Record<string, string> = {
  "sans-serif": "Arial, Helvetica, sans-serif",
  "serif": "Georgia, 'Times New Roman', Times, serif",
  "monospace": "'Courier New', Courier, monospace",
};

const fontSizes: Record<string, string> = {
  small: "13px",
  medium: "15px",
  large: "17px",
};

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
  const fontStack = fontStacks[style.font_family] || fontStacks["sans-serif"];
  const fontSize = fontSizes[style.font_size] || fontSizes["medium"];

  const escapedBody = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");

  const footerHtml =
    style.footer_text || style.footer_logo_url
      ? `<hr style="border: none; border-top: 1px solid ${style.accent_color}; margin: 24px 0;" />
         <div style="font-size: 12px; color: #999999;">
           ${style.footer_logo_url ? `<img src="${style.footer_logo_url}" alt="Logo" style="max-height: 40px; margin-bottom: 8px; display: block;" />` : ""}
           ${style.footer_text ? `<p style="margin: 0;">${style.footer_text.replace(/\n/g, "<br />")}</p>` : ""}
         </div>`
      : "";

  return `<div style="font-family: ${fontStack}; font-size: ${fontSize}; color: ${style.text_color}; max-width: 600px; line-height: 1.6;">
  <div>${escapedBody}</div>
  ${footerHtml}
</div>`;
}
