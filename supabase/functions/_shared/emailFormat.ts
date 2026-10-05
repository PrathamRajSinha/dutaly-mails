// Keep in sync with src/lib/emailHtml.ts
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

export const fontSizes: Record<string, string> = {
  xsmall: "12px",
  small: "13px",
  medium: "15px",
  large: "17px",
  xlarge: "19px",
};

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
