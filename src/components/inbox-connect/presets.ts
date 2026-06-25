export const PROVIDER_PRESETS: Record<string, { imap_host: string; imap_port: number; smtp_host: string; smtp_port: number }> = {
  "gmail.com": { imap_host: "imap.gmail.com", imap_port: 993, smtp_host: "smtp.gmail.com", smtp_port: 465 },
  "googlemail.com": { imap_host: "imap.gmail.com", imap_port: 993, smtp_host: "smtp.gmail.com", smtp_port: 465 },
  "yahoo.com": { imap_host: "imap.mail.yahoo.com", imap_port: 993, smtp_host: "smtp.mail.yahoo.com", smtp_port: 587 },
  "yahoo.co.uk": { imap_host: "imap.mail.yahoo.com", imap_port: 993, smtp_host: "smtp.mail.yahoo.com", smtp_port: 587 },
  "aol.com": { imap_host: "imap.aol.com", imap_port: 993, smtp_host: "smtp.aol.com", smtp_port: 587 },
  "icloud.com": { imap_host: "imap.mail.me.com", imap_port: 993, smtp_host: "smtp.mail.me.com", smtp_port: 587 },
  "me.com": { imap_host: "imap.mail.me.com", imap_port: 993, smtp_host: "smtp.mail.me.com", smtp_port: 587 },
  "zoho.com": { imap_host: "imap.zoho.com", imap_port: 993, smtp_host: "smtp.zoho.com", smtp_port: 587 },
  "secureserver.net": { imap_host: "imap.secureserver.net", imap_port: 993, smtp_host: "smtpout.secureserver.net", smtp_port: 465 },
  "godaddy.com": { imap_host: "imap.secureserver.net", imap_port: 993, smtp_host: "smtpout.secureserver.net", smtp_port: 465 },
};

export const APP_PASSWORD_LINKS: Record<string, { label: string; url: string; note?: string }> = {
  "yahoo.com": { label: "Yahoo", url: "https://login.yahoo.com/account/security/app-passwords" },
  "yahoo.co.uk": { label: "Yahoo", url: "https://login.yahoo.com/account/security/app-passwords" },
  "aol.com": { label: "AOL", url: "https://login.aol.com/account/security/app-passwords" },
  "icloud.com": { label: "Apple", url: "https://appleid.apple.com/account/manage", note: "Security → App-Specific Passwords" },
  "me.com": { label: "Apple", url: "https://appleid.apple.com/account/manage", note: "Security → App-Specific Passwords" },
  "zoho.com": { label: "Zoho", url: "https://accounts.zoho.com/home#security/security_pwd" },
  "secureserver.net": { label: "GoDaddy", url: "https://www.godaddy.com/help/add-my-workspace-email-to-my-email-client-6932" },
  "godaddy.com": { label: "GoDaddy", url: "https://www.godaddy.com/help/add-my-workspace-email-to-my-email-client-6932" },
};

export const GMAIL_SCOPES = [
  {
    title: "Read your emails",
    scope: "gmail.readonly",
    description: "So Dutaly can classify and draft replies to incoming customer messages.",
  },
  {
    title: "Send replies on your behalf",
    scope: "gmail.send",
    description: "Only after you approve a draft, or via auto-reply rules you explicitly enable.",
  },
  {
    title: "Manage labels",
    scope: "gmail.labels",
    description: "To mark threads as handled and keep your inbox organized.",
  },
  {
    title: "Your email address",
    scope: "userinfo.email",
    description: "To identify which inbox is connected to Dutaly.",
  },
];
