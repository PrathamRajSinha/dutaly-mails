import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Mail,
  Shield,
  Bell,
  Check,
  ExternalLink,
  AlertTriangle,
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Session } from "@supabase/supabase-js";

interface EmailAccount {
  id: string;
  email_address: string;
  provider: string;
  is_active: boolean | null;
}

const PROVIDER_PRESETS: Record<string, { imap_host: string; imap_port: number; smtp_host: string; smtp_port: number }> = {
  "yahoo.com": { imap_host: "imap.mail.yahoo.com", imap_port: 993, smtp_host: "smtp.mail.yahoo.com", smtp_port: 587 },
  "yahoo.co.uk": { imap_host: "imap.mail.yahoo.com", imap_port: 993, smtp_host: "smtp.mail.yahoo.com", smtp_port: 587 },
  "aol.com": { imap_host: "imap.aol.com", imap_port: 993, smtp_host: "smtp.aol.com", smtp_port: 587 },
  "icloud.com": { imap_host: "imap.mail.me.com", imap_port: 993, smtp_host: "smtp.mail.me.com", smtp_port: 587 },
  "me.com": { imap_host: "imap.mail.me.com", imap_port: 993, smtp_host: "smtp.mail.me.com", smtp_port: 587 },
  "zoho.com": { imap_host: "imap.zoho.com", imap_port: 993, smtp_host: "smtp.zoho.com", smtp_port: 587 },
  "protonmail.com": { imap_host: "127.0.0.1", imap_port: 1143, smtp_host: "127.0.0.1", smtp_port: 1025 },
  "secureserver.net": { imap_host: "imap.secureserver.net", imap_port: 993, smtp_host: "smtpout.secureserver.net", smtp_port: 465 },
  "godaddy.com": { imap_host: "imap.secureserver.net", imap_port: 993, smtp_host: "smtpout.secureserver.net", smtp_port: 465 },
};

const APP_PASSWORD_LINKS: Record<string, { label: string; url: string; note?: string }> = {
  "yahoo.com": { label: "Yahoo App Password", url: "https://login.yahoo.com/account/security/app-passwords" },
  "yahoo.co.uk": { label: "Yahoo App Password", url: "https://login.yahoo.com/account/security/app-passwords" },
  "aol.com": { label: "AOL App Password", url: "https://login.aol.com/account/security/app-passwords" },
  "icloud.com": { label: "Apple App-Specific Password", url: "https://appleid.apple.com/account/manage", note: "Go to Security → App-Specific Passwords" },
  "me.com": { label: "Apple App-Specific Password", url: "https://appleid.apple.com/account/manage", note: "Go to Security → App-Specific Passwords" },
  "zoho.com": { label: "Zoho App Password", url: "https://accounts.zoho.com/home#security/security_pwd" },
  "protonmail.com": { label: "ProtonMail Bridge", url: "https://proton.me/mail/bridge", note: "ProtonMail requires Bridge to use IMAP" },
  "secureserver.net": { label: "GoDaddy Email Setup", url: "https://www.godaddy.com/help/add-my-workspace-email-to-my-email-client-6932", note: "Use your regular GoDaddy email password" },
  "godaddy.com": { label: "GoDaddy Email Setup", url: "https://www.godaddy.com/help/add-my-workspace-email-to-my-email-client-6932", note: "Use your regular GoDaddy email password" },
};

function getAppPasswordHelp(email: string) {
  if (!email.includes("@")) {
    return { type: "generic" as const, message: "Use an app-specific password for better security" };
  }
  const domain = email.split("@")[1]?.toLowerCase();
  if (domain && APP_PASSWORD_LINKS[domain]) {
    const info = APP_PASSWORD_LINKS[domain];
    return { type: "known" as const, ...info };
  }
  return { type: "unknown" as const, message: "Check your email provider's settings for an app-specific password option" };
}

function ConnectedAccountCard({
  account,
  onDisconnect,
  isDisconnecting,
  session,
}: {
  account: EmailAccount;
  onDisconnect: () => void;
  isDisconnecting: boolean;
  session: Session | null;
}) {
  const [isFetching, setIsFetching] = useState(false);

  const handleFetchEmails = async () => {
    if (!session?.access_token) {
      toast.error("Please sign in to fetch emails");
      return;
    }

    setIsFetching(true);
    try {
      const functionName = account.provider === "imap" ? "fetch-imap-emails" : "fetch-gmail-emails";
      const { data, error } = await supabase.functions.invoke(functionName, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      if (data.processed > 0) {
        toast.success(`Fetched ${data.processed} new email(s)`);
      } else if (data.total === 0) {
        toast.info("No unread emails found");
      } else {
        toast.info(`No new emails (${data.skipped} already processed)`);
      }
    } catch (error) {
      console.error("Fetch emails error:", error);
      toast.error("Failed to fetch emails");
    } finally {
      setIsFetching(false);
    }
  };

  const providerColor = account.provider === "gmail" ? "bg-red-100" : account.provider === "outlook" ? "bg-blue-100" : "bg-purple-100";

  return (
    <Card className="border border-border">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${providerColor}`}>
            {account.provider === "imap" ? <Server className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
          </div>
          <div>
            <p className="font-medium text-card-foreground">{account.email_address}</p>
            <p className="text-sm text-muted-foreground capitalize">{account.provider === "imap" ? "IMAP/SMTP" : account.provider}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={account.is_active ? "default" : "secondary"}>
            {account.is_active ? "Active" : "Paused"}
          </Badge>
          {(account.provider === "gmail" || account.provider === "imap") && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleFetchEmails}
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Fetch Emails
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onDisconnect}
            disabled={isDisconnecting}
          >
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ImapConnectionForm({ session }: { session: Session | null }) {
  const [email, setEmail] = useState("");
  const [imapHost, setImapHost] = useState("");
  const [imapPort, setImapPort] = useState("993");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [password, setPassword] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  // Auto-detect preset
  useEffect(() => {
    if (!email.includes("@")) return;
    const domain = email.split("@")[1]?.toLowerCase();
    if (domain && PROVIDER_PRESETS[domain]) {
      const preset = PROVIDER_PRESETS[domain];
      setImapHost(preset.imap_host);
      setImapPort(String(preset.imap_port));
      setSmtpHost(preset.smtp_host);
      setSmtpPort(String(preset.smtp_port));
    }
  }, [email]);

  const handleConnect = async () => {
    if (!session?.access_token) {
      toast.error("Please sign in first");
      return;
    }
    if (!email || !imapHost || !smtpHost || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsConnecting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("email_accounts").insert({
        user_id: user.id,
        email_address: email,
        provider: "imap",
        is_active: true,
        imap_host: imapHost,
        imap_port: parseInt(imapPort),
        smtp_host: smtpHost,
        smtp_port: parseInt(smtpPort),
        imap_password: password,
      });

      if (error) throw error;

      toast.success("Email account connected!");
      setEmail("");
      setPassword("");
      setImapHost("");
      setSmtpHost("");
    } catch (error: unknown) {
      console.error("IMAP connection error:", error);
      toast.error("Failed to connect account");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
            <Server className="h-5 w-5" />
          </div>
          Other Email (IMAP/SMTP)
        </CardTitle>
        <CardDescription>
          Connect Yahoo, iCloud, Zoho, ProtonMail, or any IMAP-compatible provider
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>IMAP Host</Label>
            <Input
              placeholder="imap.example.com"
              value={imapHost}
              onChange={(e) => setImapHost(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>IMAP Port</Label>
            <Input
              type="number"
              value={imapPort}
              onChange={(e) => setImapPort(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>SMTP Host</Label>
            <Input
              placeholder="smtp.example.com"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>SMTP Port</Label>
            <Input
              type="number"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>App Password</Label>
          <Input
            type="password"
            placeholder="Your app password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {(() => {
            const help = getAppPasswordHelp(email);
            if (help.type === "known") {
              return (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    {help.label} required.{" "}
                    <a
                      href={help.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                    >
                      Generate one here
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                  {help.note && <p className="text-muted-foreground/70">{help.note}</p>}
                </div>
              );
            }
            return (
              <p className="text-xs text-muted-foreground">
                {help.message}
              </p>
            );
          })()}
        </div>
        <Button onClick={handleConnect} className="w-full" disabled={isConnecting}>
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              Connect Account
              <Plus className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  const { session } = useAuth();
  const { accounts, isLoading, disconnectAccount } = useEmailAccounts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [newWhitelistEmail, setNewWhitelistEmail] = useState("");
  const [newBlacklistEmail, setNewBlacklistEmail] = useState("");
  const [whitelistEmails, setWhitelistEmails] = useState<string[]>([]);
  const [blacklistEmails, setBlacklistEmails] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [queueAlerts, setQueueAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);

  // Handle OAuth callback messages
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success) {
      if (success === "gmail_connected") {
        toast.success("Gmail account connected successfully!");
      } else if (success === "outlook_connected") {
        toast.success("Outlook account connected successfully!");
      }
      setSearchParams({});
    }

    if (error) {
      const errorMessages: Record<string, string> = {
        missing_params: "OAuth callback missing parameters",
        invalid_state: "Invalid OAuth state - please try again",
        token_exchange_failed: "Failed to exchange OAuth code for tokens",
        user_info_failed: "Failed to get email information",
        db_error: "Failed to save email account",
        internal_error: "An unexpected error occurred",
        access_denied: "Access was denied",
      };
      toast.error(errorMessages[error] || `OAuth error: ${error}`);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleConnectGmail = async () => {
    if (!session?.access_token) {
      toast.error("Please sign in to connect your Gmail account");
      return;
    }

    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("gmail-auth-init", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Gmail connection error:", error);
      toast.error("Failed to start Gmail connection");
      setIsConnecting(false);
    }
  };

  const handleConnectOutlook = async () => {
    if (!session?.access_token) {
      toast.error("Please sign in to connect your Outlook account");
      return;
    }

    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("outlook-auth-init", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Outlook connection error:", error);
      toast.error("Failed to start Outlook connection");
      setIsConnecting(false);
    }
  };

  const handleAddToWhitelist = () => {
    if (newWhitelistEmail && !whitelistEmails.includes(newWhitelistEmail)) {
      setWhitelistEmails([...whitelistEmails, newWhitelistEmail]);
      setNewWhitelistEmail("");
      toast.success("Added to whitelist");
    }
  };

  const handleAddToBlacklist = () => {
    if (newBlacklistEmail && !blacklistEmails.includes(newBlacklistEmail)) {
      setBlacklistEmails([...blacklistEmails, newBlacklistEmail]);
      setNewBlacklistEmail("");
      toast.success("Added to blacklist");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Connect your inbox and configure automation settings
        </p>
      </div>

      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="connections" className="gap-2">
            <Mail className="h-4 w-4" />
            Email Connections
          </TabsTrigger>
          <TabsTrigger value="safety" className="gap-2">
            <Shield className="h-4 w-4" />
            Safety & Filters
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Email Connections Tab */}
        <TabsContent value="connections">
          {/* Connected Accounts */}
          {accounts.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-4 text-lg font-medium text-foreground">Connected Accounts</h3>
              <div className="space-y-3">
                {accounts.map((account) => (
                  <ConnectedAccountCard
                    key={account.id}
                    account={account}
                    onDisconnect={() => disconnectAccount.mutate(account.id)}
                    isDisconnecting={disconnectAccount.isPending}
                    session={session}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Gmail */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2l.01 12c0 1.1.89 2 1.99 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"
                      />
                    </svg>
                  </div>
                  Gmail
                </CardTitle>
                <CardDescription>
                  Connect your Gmail account to read and send emails
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleConnectGmail} className="w-full" disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Connect Gmail
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Outlook */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#0078D4"
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                      />
                    </svg>
                  </div>
                  Outlook
                </CardTitle>
                <CardDescription>
                  Connect your Outlook or Microsoft 365 account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleConnectOutlook} className="w-full" variant="outline" disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Connect Outlook
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* IMAP/SMTP */}
            <ImapConnectionForm session={session} />
          </div>

          {/* Permissions Info */}
          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardContent className="flex items-start gap-4 pt-6">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-medium text-card-foreground">
                  Your data is secure
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  We only request minimal permissions: read emails, send replies, and apply labels. 
                  IMAP/SMTP passwords are stored encrypted. You can disconnect at any time.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Safety & Filters Tab */}
        <TabsContent value="safety">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Whitelist */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  Whitelist
                </CardTitle>
                <CardDescription>
                  Always auto-reply to emails from these senders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="email@example.com"
                    value={newWhitelistEmail}
                    onChange={(e) => setNewWhitelistEmail(e.target.value)}
                  />
                  <Button onClick={handleAddToWhitelist} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {whitelistEmails.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No emails in whitelist</p>
                  ) : (
                    whitelistEmails.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2"
                      >
                        <span className="text-sm text-green-800">{email}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            setWhitelistEmails(whitelistEmails.filter((e) => e !== email))
                          }
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Blacklist */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Blacklist
                </CardTitle>
                <CardDescription>
                  Always ignore emails from these senders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="spam@example.com"
                    value={newBlacklistEmail}
                    onChange={(e) => setNewBlacklistEmail(e.target.value)}
                  />
                  <Button onClick={handleAddToBlacklist} size="icon" variant="destructive">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {blacklistEmails.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No emails in blacklist</p>
                  ) : (
                    blacklistEmails.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2"
                      >
                        <span className="text-sm text-red-800">{email}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            setBlacklistEmails(blacklistEmails.filter((e) => e !== email))
                          }
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about email activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-card-foreground">Email notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about important actions
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-card-foreground">Queue alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when emails need your review
                  </p>
                </div>
                <Switch checked={queueAlerts} onCheckedChange={setQueueAlerts} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-card-foreground">Daily digest</p>
                  <p className="text-sm text-muted-foreground">
                    Receive a daily summary of email activity
                  </p>
                </div>
                <Switch checked={dailyDigest} onCheckedChange={setDailyDigest} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
