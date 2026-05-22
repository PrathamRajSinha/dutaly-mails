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
  Clock,
  Webhook,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSlaSettings } from "@/hooks/useSlaSettings";
import { useIntegrations } from "@/hooks/useIntegrations";
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

  const providerColor = account.provider === "gmail" ? "bg-red-100" : "bg-purple-100";

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
  const [step, setStep] = useState<"email" | "details">("email");
  const [detectedPreset, setDetectedPreset] = useState<string | null>(null);
  const [showManualFields, setShowManualFields] = useState(false);

  const handleEmailConfirm = () => {
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    const domain = email.split("@")[1]?.toLowerCase();
    if (domain && PROVIDER_PRESETS[domain]) {
      const preset = PROVIDER_PRESETS[domain];
      setImapHost(preset.imap_host);
      setImapPort(String(preset.imap_port));
      setSmtpHost(preset.smtp_host);
      setSmtpPort(String(preset.smtp_port));
      setDetectedPreset(domain);
    } else {
      setDetectedPreset(null);
    }
    setStep("details");
  };

  const handleBack = () => {
    setStep("email");
  };

  const handleConnect = async () => {
    if (!session?.access_token) {
      toast.error("Please sign in first");
      return;
    }
    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!detectedPreset && (!imapHost || !smtpHost)) {
      toast.error("Please fill in server host fields or select a provider");
      return;
    }
    // If preset detected but hosts not manually set, ensure they're filled from preset
    const finalImapHost = imapHost || (detectedPreset ? PROVIDER_PRESETS[detectedPreset]?.imap_host : "");
    const finalSmtpHost = smtpHost || (detectedPreset ? PROVIDER_PRESETS[detectedPreset]?.smtp_host : "");

    setIsConnecting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Prevent duplicate connection for the same email address (case-insensitive)
      const { data: existing } = await supabase
        .from("email_accounts")
        .select("id")
        .eq("user_id", user.id)
        .ilike("email_address", email)
        .maybeSingle();

      if (existing) {
        toast.error("This email is already connected");
        setIsConnecting(false);
        return;
      }

      const { error } = await supabase.from("email_accounts").insert({
        user_id: user.id,
        email_address: email,
        provider: "imap",
        is_active: true,
        imap_host: finalImapHost,
        imap_port: parseInt(imapPort),
        smtp_host: finalSmtpHost,
        smtp_port: parseInt(smtpPort),
        imap_password: password,
      });

      if (error) throw error;

      toast.success("Email account connected!");
      setEmail("");
      setPassword("");
      setImapHost("");
      setSmtpHost("");
      setStep("email");
      setDetectedPreset(null);
      setShowManualFields(false);
    } catch (error: unknown) {
      console.error("IMAP connection error:", error);
      toast.error("Failed to connect account");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleApplyPreset = (presetKey: string) => {
    const preset = PROVIDER_PRESETS[presetKey];
    if (preset) {
      setImapHost(preset.imap_host);
      setImapPort(String(preset.imap_port));
      setSmtpHost(preset.smtp_host);
      setSmtpPort(String(preset.smtp_port));
      setDetectedPreset(presetKey);
    }
  };

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <Server className="h-5 w-5" />
          </div>
          Other Email (IMAP/SMTP)
        </CardTitle>
        <CardDescription>
          Connect Yahoo, iCloud, Zoho, GoDaddy, ProtonMail, or any IMAP-compatible provider
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "email" ? (
          <>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailConfirm()}
                  className="flex-1"
                />
                <Button
                  onClick={handleEmailConfirm}
                  size="icon"
                  disabled={!email.includes("@")}
                  title="Continue"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your email and click the checkmark to continue
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                ← Back
              </Button>
              <Badge variant="outline" className="text-sm">
                {email}
              </Badge>
            </div>

            {detectedPreset ? (
              <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 p-3 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span className="text-foreground">
                  Server settings auto-filled for{" "}
                  <span className="font-medium">
                    {APP_PASSWORD_LINKS[detectedPreset]?.label || detectedPreset}
                  </span>
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-2 rounded-md border border-border bg-muted/50 p-3 text-sm">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-foreground">
                      We couldn't auto-detect your email provider. Select your hosting provider or enter settings manually.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(PROVIDER_PRESETS).map(([domain]) => {
                        const link = APP_PASSWORD_LINKS[domain];
                        const label = link?.label || domain;
                        return (
                          <Button
                            key={domain}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleApplyPreset(domain);
                              setShowManualFields(false);
                            }}
                            className="text-xs"
                          >
                            {label}
                          </Button>
                        );
                      })}
                      <Button
                        variant={showManualFields ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setShowManualFields(!showManualFields)}
                        className="text-xs"
                      >
                        Other (Manual)
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showManualFields && !detectedPreset && (
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
                  <Label>SMTP Host</Label>
                  <Input
                    placeholder="smtp.example.com"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Your email password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {(() => {
                const help = getAppPasswordHelp(email);
                if (help.type === "known") {
                  return (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>
                        {help.note || `${help.label} required.`}{" "}
                        <a
                          href={help.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                        >
                          Learn more
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </p>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  const { session } = useAuth();
  const { accounts, isLoading, disconnectAccount } = useEmailAccounts();
  const { data: slaSettings, isLoading: slaLoading, update: updateSla } = useSlaSettings();
  const { data: integrations, isLoading: integrationsLoading, addIntegration, updateIntegration, deleteIntegration } = useIntegrations();
  const [searchParams, setSearchParams] = useSearchParams();
  const [newWhitelistEmail, setNewWhitelistEmail] = useState("");
  const [newBlacklistEmail, setNewBlacklistEmail] = useState("");
  const [whitelistEmails, setWhitelistEmails] = useState<string[]>([]);
  const [blacklistEmails, setBlacklistEmails] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [slaFirstResponse, setSlaFirstResponse] = useState(4);
  const [slaResolution, setSlaResolution] = useState(24);

  // New integration form state
  const [newIntProvider, setNewIntProvider] = useState<"webhook" | "slack">("webhook");
  const [newIntUrl, setNewIntUrl] = useState("");
  const [newIntSecret, setNewIntSecret] = useState("");
  const [newIntEvents, setNewIntEvents] = useState<string[]>([]);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [queueAlerts, setQueueAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);

  // Sync SLA settings from DB
  useEffect(() => {
    if (slaSettings) {
      setSlaFirstResponse(slaSettings.sla_first_response_hours ?? 4);
      setSlaResolution(slaSettings.sla_resolution_hours ?? 24);
    }
  }, [slaSettings]);

  // Handle OAuth callback messages
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success) {
      if (success === "gmail_connected") {
        toast.success("Gmail account connected successfully!");
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
        body: { origin: window.location.origin },
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
      <div className="mb-6">
        <h1 className="text-[20px] font-medium text-[#1A1730]">Settings</h1>
        <p className="mt-0.5 text-[13px] text-[#9490B8]">
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
          <TabsTrigger value="sla" className="gap-2">
            <Clock className="h-4 w-4" />
            SLA
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Webhook className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Email Connections Tab */}
        <TabsContent value="connections">
          {/* Connected Accounts */}
          {accounts.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-4 text-lg font-medium text-foreground">Connected Accounts</h3>
              <div className="space-y-3">
                {Array.from(
                  new Map(
                    accounts.map((a) => [a.email_address.toLowerCase(), a])
                  ).values()
                ).map((account) => (
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
          {/* Unsend Window */}
          <Card className="border border-border mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5 text-primary" />
                Auto-Reply Unsend Window
              </CardTitle>
              <CardDescription>
                How long to wait before sending auto-replies. You can cancel during this window.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select defaultValue="60">
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Off (send immediately)</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">60 seconds</SelectItem>
                  <SelectItem value="120">2 minutes</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
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

        {/* SLA Tab */}
        <TabsContent value="sla">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                SLA Settings
              </CardTitle>
              <CardDescription>
                Configure Service Level Agreement timelines for ticket resolution. New tickets will automatically have SLA deadlines set based on these values.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>First Response Time (hours)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={168}
                    value={slaFirstResponse}
                    onChange={(e) => setSlaFirstResponse(parseInt(e.target.value) || 4)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum time to send the first response to a customer.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Resolution Time (hours)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={720}
                    value={slaResolution}
                    onChange={(e) => setSlaResolution(parseInt(e.target.value) || 24)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum time to fully resolve a ticket. Tickets exceeding this are flagged as SLA breaches.
                  </p>
                </div>
              </div>
              <Button
                onClick={() =>
                  updateSla.mutate({
                    sla_first_response_hours: slaFirstResponse,
                    sla_resolution_hours: slaResolution,
                  })
                }
                disabled={updateSla.isPending || slaLoading}
              >
                {updateSla.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save SLA Settings"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <div className="space-y-6">
            {/* Existing integrations */}
            {(integrations && integrations.length > 0) && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-foreground">Active Integrations</h3>
                {integrations.map((integration) => {
                  const config = (typeof integration.config_json === "string"
                    ? JSON.parse(integration.config_json)
                    : integration.config_json) || {};
                  return (
                    <Card key={integration.id} className="border border-border">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                            {integration.provider === "slack" ? (
                              <MessageSquare className="h-5 w-5" />
                            ) : (
                              <Webhook className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground capitalize">{integration.provider}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {integration.provider === "slack"
                                ? config.webhook_url ? "Webhook configured" : "Not configured"
                                : config.url || "No URL"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={integration.is_active ? "default" : "secondary"}>
                            {integration.is_active ? "Active" : "Paused"}
                          </Badge>
                          <Switch
                            checked={integration.is_active ?? false}
                            onCheckedChange={(checked) =>
                              updateIntegration.mutate({ id: integration.id, is_active: checked })
                            }
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => deleteIntegration.mutate(integration.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Add new integration */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Add Integration</CardTitle>
                <CardDescription>
                  Connect a webhook or Slack to receive ticket events in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={newIntProvider === "webhook" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewIntProvider("webhook")}
                    >
                      <Webhook className="mr-2 h-4 w-4" />
                      Webhook
                    </Button>
                    <Button
                      variant={newIntProvider === "slack" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewIntProvider("slack")}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Slack
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{newIntProvider === "slack" ? "Slack Incoming Webhook URL" : "Webhook URL"}</Label>
                  <Input
                    placeholder={newIntProvider === "slack" ? "https://hooks.slack.com/services/..." : "https://your-api.com/webhook"}
                    value={newIntUrl}
                    onChange={(e) => setNewIntUrl(e.target.value)}
                  />
                </div>

                {newIntProvider === "webhook" && (
                  <div className="space-y-2">
                    <Label>Secret (optional)</Label>
                    <Input
                      placeholder="Signing secret for verification"
                      value={newIntSecret}
                      onChange={(e) => setNewIntSecret(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Sent as X-Webhook-Secret header with each request.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Events to send</Label>
                  <div className="flex flex-wrap gap-2">
                    {["ticket.created", "ticket.updated", "ticket.resolved", "ticket.sla_breached", "ticket.angry_detected"].map((evt) => (
                      <Button
                        key={evt}
                        variant={newIntEvents.includes(evt) ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          setNewIntEvents((prev) =>
                            prev.includes(evt) ? prev.filter((e) => e !== evt) : [...prev, evt]
                          )
                        }
                      >
                        {evt}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave empty to receive all events.
                  </p>
                </div>

                <Button
                  onClick={() => {
                    if (!newIntUrl) {
                      toast.error("Please enter a URL");
                      return;
                    }
                    const config: Record<string, any> = {};
                    if (newIntProvider === "slack") {
                      config.webhook_url = newIntUrl;
                    } else {
                      config.url = newIntUrl;
                      if (newIntSecret) config.secret = newIntSecret;
                    }
                    if (newIntEvents.length > 0) config.events = newIntEvents;

                    addIntegration.mutate(
                      { provider: newIntProvider, config_json: config },
                      {
                        onSuccess: () => {
                          setNewIntUrl("");
                          setNewIntSecret("");
                          setNewIntEvents([]);
                        },
                      }
                    );
                  }}
                  disabled={addIntegration.isPending}
                  className="w-full"
                >
                  {addIntegration.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Integration
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
