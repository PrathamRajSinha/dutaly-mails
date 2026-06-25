import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Mail, Server, Shield, Check, Loader2, AlertTriangle, ArrowLeft,
  ExternalLink, ChevronRight, Lock, Sparkles, Eye, EyeOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PROVIDER_PRESETS, APP_PASSWORD_LINKS, GMAIL_SCOPES } from "./presets";

type Provider = "gmail" | "imap";
type Step = 1 | 2 | 3 | 4 | 5;
type CheckState = "pending" | "running" | "ok" | "fail";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: () => void;
}

export function ConnectInboxWizard({ open, onOpenChange, onConnected }: Props) {
  const { session, user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>(1);
  const [provider, setProvider] = useState<Provider>("gmail");

  // IMAP state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [imapHost, setImapHost] = useState("");
  const [imapPort, setImapPort] = useState("993");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [showManual, setShowManual] = useState(false);

  // Auth / verify state
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [checks, setChecks] = useState<{ label: string; state: CheckState; detail?: string }[]>([]);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);

  const reset = () => {
    setStep(1); setProvider("gmail"); setEmail(""); setPassword("");
    setImapHost(""); setImapPort("993"); setSmtpHost(""); setSmtpPort("587");
    setShowManual(false); setBusy(false); setErrorMsg(null); setChecks([]);
    setConnectedEmail(null);
  };

  const close = () => { reset(); onOpenChange(false); };

  const detectPreset = (value: string) => {
    const domain = value.split("@")[1]?.toLowerCase();
    if (domain && PROVIDER_PRESETS[domain]) {
      const p = PROVIDER_PRESETS[domain];
      setImapHost(p.imap_host); setImapPort(String(p.imap_port));
      setSmtpHost(p.smtp_host); setSmtpPort(String(p.smtp_port));
      return domain;
    }
    return null;
  };

  // ----- Step 3: Gmail OAuth -----
  const startGmail = async () => {
    if (!session?.access_token) { toast.error("Please sign in"); return; }
    setBusy(true); setErrorMsg(null);
    try {
      const { data, error } = await supabase.functions.invoke("gmail-auth-init", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { origin: window.location.origin },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to start Google sign-in. Try again.");
      setBusy(false);
    }
  };

  // ----- Step 3: IMAP authenticate + verify -----
  const runImapConnect = async () => {
    if (!session?.access_token || !user) { toast.error("Please sign in"); return; }
    if (!email || !password) { setErrorMsg("Email and password are required."); return; }
    if (!imapHost || !smtpHost) { setErrorMsg("Server host fields are required."); return; }
    setBusy(true); setErrorMsg(null);
    setStep(4);
    type Check = { label: string; state: CheckState; detail?: string };
    const initial: Check[] = [
      { label: "Reach IMAP server", state: "running" },
      { label: "Authenticate inbox credentials", state: "pending" },
      { label: "Verify SMTP server", state: "pending" },
      { label: "Save connection", state: "pending" },
    ];
    setChecks(initial);

    try {
      // Test IMAP/SMTP via edge function
      const { data, error } = await supabase.functions.invoke("test-imap-connection", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { email, password, imap_host: imapHost, imap_port: Number(imapPort), smtp_host: smtpHost, smtp_port: Number(smtpPort) },
      });
      if (error) throw error;

      const next = [...initial];
      // IMAP reachability + auth
      if (data.imap === "ok") {
        next[0] = { label: "Reach IMAP server", state: "ok" };
        next[1] = { label: "Authenticate inbox credentials", state: "ok" };
      } else if (data.imap === "auth_failed") {
        next[0] = { label: "Reach IMAP server", state: "ok" };
        next[1] = { label: "Authenticate inbox credentials", state: "fail", detail: "Wrong password or app password required." };
      } else {
        next[0] = { label: "Reach IMAP server", state: "fail", detail: "Could not reach the IMAP host. Check the address." };
        next[1] = { label: "Authenticate inbox credentials", state: "fail" };
      }
      // SMTP
      if (data.smtp === "ok") next[2] = { label: "Verify SMTP server", state: "ok" };
      else if (data.smtp === "skipped") next[2] = { label: "Verify SMTP server", state: "fail", detail: "Skipped — IMAP failed first." };
      else next[2] = { label: "Verify SMTP server", state: "fail", detail: "Could not reach SMTP host." };

      setChecks([...next]);

      if (!data.ok) {
        setBusy(false);
        return;
      }

      // Persist
      next[3] = { label: "Save connection", state: "running" };
      setChecks([...next]);

      const { data: existing } = await supabase
        .from("email_accounts")
        .select("id")
        .eq("user_id", user.id)
        .ilike("email_address", email)
        .maybeSingle();
      if (existing) {
        next[3] = { label: "Save connection", state: "fail", detail: "This email is already connected." };
        setChecks([...next]); setBusy(false);
        return;
      }

      const { error: insErr } = await supabase.from("email_accounts").insert({
        user_id: user.id,
        email_address: email,
        provider: "imap",
        is_active: true,
        imap_host: imapHost, imap_port: Number(imapPort),
        smtp_host: smtpHost, smtp_port: Number(smtpPort),
        imap_password: password,
        last_status: "ok",
      });
      if (insErr) {
        next[3] = { label: "Save connection", state: "fail", detail: insErr.message };
        setChecks([...next]); setBusy(false);
        return;
      }
      next[3] = { label: "Save connection", state: "ok" };
      setChecks([...next]);
      setConnectedEmail(email);
      queryClient.invalidateQueries({ queryKey: ["email-accounts"] });
      setBusy(false);
      setStep(5);
      onConnected?.();
    } catch (e) {
      console.error(e);
      setErrorMsg("Connection test failed. Try again.");
      setBusy(false);
    }
  };

  const allChecksOk = checks.length > 0 && checks.every((c) => c.state === "ok");
  const someFail = checks.some((c) => c.state === "fail");

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-[560px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[16px] font-medium text-[#1A1730]">
              Connect your inbox
            </DialogTitle>
            <Badge variant="outline" className="text-[11px] font-medium">
              Step {step} of 5
            </Badge>
          </div>
          <DialogDescription className="text-[12px] text-[#9490B8]">
            {step === 1 && "Pick the email provider you want Dutaly to manage."}
            {step === 2 && "Review the permissions Dutaly will request."}
            {step === 3 && (provider === "gmail" ? "Sign in with Google to authorize Dutaly." : "Enter your IMAP credentials.")}
            {step === 4 && (busy ? "Running connection checks…" : someFail ? "Some checks failed. Fix the issue and try again." : "All checks passed.")}
            {step === 5 && "Your inbox is connected."}
          </DialogDescription>
          {/* Progress */}
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-[3px] flex-1 rounded-full transition-colors"
                style={{ backgroundColor: i <= step ? "#7C6FE0" : "rgba(124,111,224,0.18)" }}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {/* STEP 1 — Choose provider */}
          {step === 1 && (
            <div className="space-y-3">
              <button
                onClick={() => { setProvider("gmail"); setStep(2); }}
                className="w-full flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left hover:border-[#7C6FE0] transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2l.01 12c0 1.1.89 2 1.99 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-medium text-[#1A1730]">Gmail</p>
                    <Badge className="bg-[#7C6FE0] hover:bg-[#7C6FE0] text-white text-[10px] px-1.5 py-0">Recommended</Badge>
                  </div>
                  <p className="text-[12px] text-[#9490B8]">Sign in with Google · OAuth, no password</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#9490B8]" />
              </button>

              <button
                onClick={() => { setProvider("imap"); setStep(2); }}
                className="w-full flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left hover:border-[#7C6FE0] transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Server className="h-5 w-5 text-[#1A1730]" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-[#1A1730]">Other (IMAP / SMTP)</p>
                  <p className="text-[12px] text-[#9490B8]">Yahoo, iCloud, Zoho, GoDaddy, or any IMAP provider</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#9490B8]" />
              </button>

              <div className="mt-4 rounded-lg bg-[#F4F3FF] p-3 flex gap-2.5">
                <Lock className="h-4 w-4 text-[#7C6FE0] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#1A1730] leading-relaxed">
                  Dutaly never stores Google passwords. IMAP passwords are stored encrypted and only used to fetch &amp; send mail.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2 — Permissions / preview */}
          {step === 2 && provider === "gmail" && (
            <div className="space-y-3">
              <p className="text-[12px] text-[#9490B8]">
                Google will ask you to approve these scopes. You can revoke them anytime in your{" "}
                <a className="text-[#7C6FE0] underline" href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">
                  Google Account → Security
                </a>.
              </p>
              {GMAIL_SCOPES.map((s) => (
                <div key={s.scope} className="rounded-lg border border-border p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F4F3FF] shrink-0">
                      <Shield className="h-3.5 w-3.5 text-[#7C6FE0]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-[#1A1730]">{s.title}</p>
                      <p className="mt-0.5 text-[12px] text-[#9490B8] leading-relaxed">{s.description}</p>
                      <code className="mt-1 inline-block text-[10px] text-[#9490B8] font-mono">{s.scope}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 2 && provider === "imap" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[12px]">Email address</Label>
                <Input
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); detectPreset(e.target.value); }}
                />
                {(() => {
                  const d = email.split("@")[1]?.toLowerCase();
                  if (d && PROVIDER_PRESETS[d]) {
                    return (
                      <div className="flex items-center gap-2 text-[11px] text-[#1D9E75]">
                        <Check className="h-3 w-3" />
                        Server settings auto-filled for {APP_PASSWORD_LINKS[d]?.label || d}
                      </div>
                    );
                  }
                  if (d) {
                    return (
                      <p className="text-[11px] text-[#9490B8]">
                        We don't have presets for this domain. You can enter server settings manually in the next step.
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
              <div className="rounded-lg bg-[#F4F3FF] p-3 text-[11px] text-[#1A1730] leading-relaxed flex gap-2.5">
                <Sparkles className="h-4 w-4 text-[#7C6FE0] shrink-0 mt-0.5" />
                <div>
                  Most providers require an <span className="font-medium">app-specific password</span> instead of your normal one.
                  {(() => {
                    const d = email.split("@")[1]?.toLowerCase();
                    const link = d ? APP_PASSWORD_LINKS[d] : null;
                    if (link) {
                      return (
                        <>
                          {" "}
                          <a className="text-[#7C6FE0] underline inline-flex items-center gap-1" href={link.url} target="_blank" rel="noreferrer">
                            Get one for {link.label} <ExternalLink className="h-3 w-3" />
                          </a>
                          {link.note && <span className="text-[#9490B8]"> — {link.note}</span>}
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Authorize */}
          {step === 3 && provider === "gmail" && (
            <div className="space-y-4 text-center py-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <Mail className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#1A1730]">Sign in with Google</p>
                <p className="mt-1 text-[12px] text-[#9490B8]">A new tab will open. After approving, you'll come back here.</p>
              </div>
              {errorMsg && (
                <div className="rounded-md bg-destructive/10 p-2 text-[11px] text-destructive">{errorMsg}</div>
              )}
            </div>
          )}

          {step === 3 && provider === "imap" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-[12px]">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="App-specific password"
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9490B8] hover:text-[#1A1730]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {!showManual ? (
                <div className="grid grid-cols-2 gap-3 text-[11px] text-[#9490B8]">
                  <div>IMAP: <span className="text-[#1A1730] font-mono">{imapHost || "—"}:{imapPort}</span></div>
                  <div>SMTP: <span className="text-[#1A1730] font-mono">{smtpHost || "—"}:{smtpPort}</span></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-[#9490B8]">Pick your hosting provider to auto-fill</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(PROVIDER_PRESETS).map(([domain, p]) => {
                        const label = APP_PASSWORD_LINKS[domain]?.label || domain;
                        const active = imapHost === p.imap_host && smtpHost === p.smtp_host;
                        return (
                          <button
                            key={domain}
                            type="button"
                            onClick={() => {
                              setImapHost(p.imap_host); setImapPort(String(p.imap_port));
                              setSmtpHost(p.smtp_host); setSmtpPort(String(p.smtp_port));
                            }}
                            className={`px-2.5 py-1 rounded-md border text-[11px] transition ${active ? "border-[#7C6FE0] bg-[#F4F3FF] text-[#1A1730]" : "border-border text-[#9490B8] hover:text-[#1A1730] hover:border-[#7C6FE0]/40"}`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-[11px]">IMAP host</Label><Input value={imapHost} onChange={(e) => setImapHost(e.target.value)} /></div>
                    <div className="space-y-1"><Label className="text-[11px]">IMAP port</Label><Input value={imapPort} onChange={(e) => setImapPort(e.target.value)} /></div>
                    <div className="space-y-1"><Label className="text-[11px]">SMTP host</Label><Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} /></div>
                    <div className="space-y-1"><Label className="text-[11px]">SMTP port</Label><Input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} /></div>
                  </div>
                </div>
              )}

              <button type="button" onClick={() => setShowManual((s) => !s)} className="text-[11px] text-[#7C6FE0] hover:underline">
                {showManual ? "Hide server settings" : "Edit server settings manually"}
              </button>
              {errorMsg && (
                <div className="rounded-md bg-destructive/10 p-2 text-[11px] text-destructive">{errorMsg}</div>
              )}
            </div>
          )}

          {/* STEP 4 — Verification */}
          {step === 4 && (
            <div className="space-y-2">
              {checks.map((c, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <div className="mt-0.5">
                    {c.state === "ok" && <Check className="h-4 w-4 text-[#1D9E75]" />}
                    {c.state === "running" && <Loader2 className="h-4 w-4 animate-spin text-[#7C6FE0]" />}
                    {c.state === "fail" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    {c.state === "pending" && <div className="h-4 w-4 rounded-full border border-[#9490B8]/40" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-[#1A1730]">{c.label}</p>
                    {c.detail && <p className="mt-0.5 text-[11px] text-[#9490B8]">{c.detail}</p>}
                  </div>
                </div>
              ))}
              {someFail && (
                <p className="pt-1 text-[11px] text-[#9490B8]">
                  Fix the issue above and try again. Common cause: missing app-specific password.
                </p>
              )}
            </div>
          )}

          {/* STEP 5 — Success */}
          {step === 5 && (
            <div className="py-6 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1D9E75]/10">
                <Check className="h-6 w-6 text-[#1D9E75]" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[15px] font-medium text-[#1A1730]">Inbox connected</p>
                <p className="mt-1 text-[12px] text-[#9490B8]">
                  {connectedEmail || "Your inbox"} is ready. Add a knowledge base entry next so Dutaly can start drafting replies.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4 bg-[#FAFAFE]">
          <div>
            {step > 1 && step < 5 && step !== 4 && (
              <Button variant="ghost" size="sm" onClick={() => setStep((step - 1) as Step)} disabled={busy}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
              </Button>
            )}
            {step === 4 && someFail && (
              <Button variant="ghost" size="sm" onClick={() => { setChecks([]); setErrorMsg(null); setStep(3); }} disabled={busy}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step === 1 && (
              <Button variant="ghost" size="sm" onClick={close}>Cancel</Button>
            )}
            {step === 2 && provider === "gmail" && (
              <Button size="sm" onClick={() => setStep(3)} style={{ backgroundColor: "#7C6FE0" }}>Continue</Button>
            )}
            {step === 2 && provider === "imap" && (
              <Button
                size="sm"
                disabled={!email.includes("@")}
                onClick={() => {
                  if (!PROVIDER_PRESETS[email.split("@")[1]?.toLowerCase() || ""]) setShowManual(true);
                  setStep(3);
                }}
                style={{ backgroundColor: "#7C6FE0" }}
              >
                Continue
              </Button>
            )}
            {step === 3 && provider === "gmail" && (
              <Button size="sm" onClick={startGmail} disabled={busy} style={{ backgroundColor: "#7C6FE0" }}>
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <ExternalLink className="h-3.5 w-3.5 mr-1" />}
                Continue with Google
              </Button>
            )}
            {step === 3 && provider === "imap" && (
              <Button size="sm" onClick={runImapConnect} disabled={busy} style={{ backgroundColor: "#7C6FE0" }}>
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                Test &amp; connect
              </Button>
            )}
            {step === 4 && allChecksOk && (
              <Button size="sm" onClick={() => setStep(5)} style={{ backgroundColor: "#7C6FE0" }}>Continue</Button>
            )}
            {step === 4 && someFail && (
              <>
                <Button variant="outline" size="sm" onClick={() => { setChecks([]); setErrorMsg(null); setStep(3); }} disabled={busy}>
                  Edit settings
                </Button>
                <Button size="sm" onClick={runImapConnect} disabled={busy} style={{ backgroundColor: "#7C6FE0" }}>
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                  Try again
                </Button>
              </>
            )}
            {step === 5 && (
              <Button size="sm" onClick={close} style={{ backgroundColor: "#7C6FE0" }}>Done</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
