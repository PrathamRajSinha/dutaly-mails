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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      const { data, error } = await supabase.functions.invoke("fetch-gmail-emails", {
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

  return (
    <Card className="border border-border">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            account.provider === "gmail" ? "bg-red-100" : "bg-blue-100"
          }`}>
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-card-foreground">{account.email_address}</p>
            <p className="text-sm text-muted-foreground capitalize">{account.provider}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={account.is_active ? "default" : "secondary"}>
            {account.is_active ? "Active" : "Paused"}
          </Badge>
          {account.provider === "gmail" && (
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
                  We never store your email password and you can disconnect at any time.
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
