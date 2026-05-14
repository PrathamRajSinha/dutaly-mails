import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function Signup() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  // OTP verification state
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!authLoading && user) {
      supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle()
        .then(async ({ data }) => {
          if (!data) {
            await supabase.auth.signOut();
            return;
          }

          if (data.onboarding_completed) {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/onboarding/plan", { replace: true });
          }
        });
    }
  }, [user, authLoading, navigate]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (!confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    setLoading(false);

    if (error) {
      setFormError(error.message);
    } else if (data.user) {
      // Supabase returns a user with empty identities for already-registered emails
      const isExistingUser = data.user.identities && data.user.identities.length === 0;
      if (isExistingUser) {
        setFormError("An account with this email already exists. Please sign in instead.");
        return;
      }
      setStep("otp");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerifyOtp = async () => {
    const token = otp.join("");
    if (token.length < 6) {
      setOtpError("Please enter the full 6-digit code");
      return;
    }

    setVerifying(true);
    setOtpError("");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });

    setVerifying(false);

    if (error) {
      setOtpError("Invalid or expired code. Please try again.");
    }
    // On success, the auth state listener will pick up the session and redirect
  };

  const handleResendOtp = async () => {
    setResending(true);
    setOtpError("");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    setResending(false);
    if (error) {
      setOtpError(error.message);
    }
  };

  const handleGoToLogin = async () => {
    localStorage.removeItem("dutaly_selected_plan");
    await supabase.auth.signOut({ scope: "local" });
    navigate("/login");
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "#0A0A0F" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#7C6FE0" }} />
      </div>
    );
  }

  const fieldStyle = (hasError: boolean) => ({
    width: "100%",
    background: "#F4F3FF",
    border: hasError ? "1px solid #DC2626" : "1px solid rgba(124,111,224,0.2)",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    color: "#1A1730",
    outline: "none",
    boxSizing: "border-box" as const,
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4" style={{ background: "#0A0A0F" }}>
      <Link
        to="/mails"
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "rgba(255,255,255,0.55)",
          fontSize: 13,
          fontWeight: 500,
          textDecoration: "none",
        }}
      >
        <ArrowLeft size={14} />
        Back to home
      </Link>

      <div className="w-full" style={{ maxWidth: 420 }}>
        <div className="mb-6 text-center">
          <Link to="/mails" style={{ textDecoration: "none" }} aria-label="Dutaly home">
            <span style={{ color: "#7C6FE0", fontSize: 22, fontWeight: 500 }}>dutaly</span>
          </Link>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 }}>AI agent for your inbox</p>
        </div>

        <main style={{ background: "#FFFFFF", borderRadius: 16, padding: 40 }}>
          {step === "otp" ? (
            <>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#F4F3FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Mail size={24} style={{ color: "#7C6FE0" }} />
                </div>
                <h2 style={{ color: "#1A1730", fontSize: 20, fontWeight: 500, marginBottom: 8 }}>Verify your email</h2>
                <p style={{ color: "#9490B8", fontSize: 13, lineHeight: 1.5 }}>
                  Enter the 6-digit code sent to<br />
                  <strong style={{ color: "#1A1730" }}>{email}</strong>
                </p>
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    style={{
                      width: 48,
                      height: 52,
                      textAlign: "center",
                      fontSize: 20,
                      fontWeight: 600,
                      color: "#1A1730",
                      background: "#F4F3FF",
                      border: otpError ? "1px solid #DC2626" : "1px solid rgba(124,111,224,0.2)",
                      borderRadius: 8,
                      outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#7C6FE0")}
                    onBlur={(e) => (e.target.style.borderColor = otpError ? "#DC2626" : "rgba(124,111,224,0.2)")}
                  />
                ))}
              </div>

              {otpError && <p style={{ fontSize: 13, color: "#DC2626", textAlign: "center", marginBottom: 12 }}>{otpError}</p>}

              <button
                onClick={handleVerifyOtp}
                disabled={verifying}
                style={{
                  width: "100%",
                  background: verifying ? "#9d94e8" : "#7C6FE0",
                  color: "#FFFFFF",
                  borderRadius: 8,
                  height: 44,
                  fontSize: 14,
                  fontWeight: 500,
                  border: "none",
                  cursor: verifying ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {verifying && <Loader2 size={16} className="animate-spin" />}
                Verify →
              </button>

              <p style={{ textAlign: "center", fontSize: 13, color: "#9490B8", marginTop: 16 }}>
                Didn't receive the code?{" "}
                <button
                  onClick={handleResendOtp}
                  disabled={resending}
                  style={{ color: "#7C6FE0", background: "none", border: "none", cursor: "pointer", fontSize: 13, textDecoration: "underline", padding: 0 }}
                >
                  {resending ? "Sending..." : "Resend"}
                </button>
              </p>
            </>
          ) : (
            <>
              <h2 style={{ color: "#1A1730", fontSize: 20, fontWeight: 500, marginBottom: 24, textAlign: "center" }}>
                Create your account
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#9490B8", marginBottom: 4 }}>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={fieldStyle(!!errors.fullName)}
                    onFocus={(e) => (e.target.style.borderColor = "#7C6FE0")}
                    onBlur={(e) => (e.target.style.borderColor = errors.fullName ? "#DC2626" : "rgba(124,111,224,0.2)")}
                  />
                  {errors.fullName && <p style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>{errors.fullName}</p>}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#9490B8", marginBottom: 4 }}>Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={fieldStyle(!!errors.email)}
                    onFocus={(e) => (e.target.style.borderColor = "#7C6FE0")}
                    onBlur={(e) => (e.target.style.borderColor = errors.email ? "#DC2626" : "rgba(124,111,224,0.2)")}
                  />
                  {errors.email && <p style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>{errors.email}</p>}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#9490B8", marginBottom: 4 }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ ...fieldStyle(!!errors.password), paddingRight: 42 }}
                      onFocus={(e) => (e.target.style.borderColor = "#7C6FE0")}
                      onBlur={(e) => (e.target.style.borderColor = errors.password ? "#DC2626" : "rgba(124,111,224,0.2)")}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: "#9490B8" }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>{errors.password}</p>}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#9490B8", marginBottom: 4 }}>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ ...fieldStyle(!!errors.confirmPassword), paddingRight: 42 }}
                      onFocus={(e) => (e.target.style.borderColor = "#7C6FE0")}
                      onBlur={(e) => (e.target.style.borderColor = errors.confirmPassword ? "#DC2626" : "rgba(124,111,224,0.2)")}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: "#9490B8" }}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>{errors.confirmPassword}</p>}
                </div>

                {formError && <p style={{ fontSize: 13, color: "#DC2626", textAlign: "center" }}>{formError}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    background: loading ? "#9d94e8" : "#7C6FE0",
                    color: "#FFFFFF",
                    borderRadius: 8,
                    height: 44,
                    fontSize: 14,
                    fontWeight: 500,
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Create account →
                </button>
              </form>

              <p style={{ textAlign: "center", fontSize: 13, color: "#9490B8", marginTop: 20 }}>
                Already have an account?{" "}
                <button type="button" onClick={handleGoToLogin} style={{ color: "#7C6FE0", textDecoration: "none", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Sign in</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
