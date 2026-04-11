import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.onboarding_completed) {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/onboarding/plan", { replace: true });
          }
        });
    }
  }, [user, authLoading, navigate]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    if (mode === "password" && !password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setLoading(true);

    if (mode === "magic") {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      setLoading(false);
      if (error) {
        setFormError(error.message);
      } else {
        setMagicLinkSent(true);
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setFormError("Incorrect email or password");
    }
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
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background: "#0A0A0F" }}>
      <div className="w-full" style={{ maxWidth: 420 }}>
        <div className="mb-6 text-center">
          <h1 style={{ color: "#7C6FE0", fontSize: 22, fontWeight: 500 }}>dutaly</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 4 }}>AI agent for your inbox</p>
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 40 }}>
          <h2 style={{ color: "#1A1730", fontSize: 20, fontWeight: 500, marginBottom: 24, textAlign: "center" }}>
            Welcome back
          </h2>

          {magicLinkSent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#F4F3FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Mail size={24} style={{ color: "#7C6FE0" }} />
              </div>
              <p style={{ color: "#1A1730", fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Check your email</p>
              <p style={{ color: "#9490B8", fontSize: 13, lineHeight: 1.5 }}>
                We sent a magic link to <strong style={{ color: "#1A1730" }}>{email}</strong>. Click the link to sign in.
              </p>
              <button
                onClick={() => { setMagicLinkSent(false); setEmail(""); }}
                style={{ marginTop: 20, fontSize: 13, color: "#7C6FE0", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              {/* Mode toggle */}
              <div style={{ display: "flex", background: "#F4F3FF", borderRadius: 8, padding: 3, marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={() => { setMode("password"); setFormError(""); setErrors({}); }}
                  style={{
                    flex: 1, padding: "8px 0", fontSize: 13, fontWeight: 500, borderRadius: 6, border: "none", cursor: "pointer",
                    background: mode === "password" ? "#FFFFFF" : "transparent",
                    color: mode === "password" ? "#1A1730" : "#9490B8",
                    boxShadow: mode === "password" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("magic"); setFormError(""); setErrors({}); }}
                  style={{
                    flex: 1, padding: "8px 0", fontSize: 13, fontWeight: 500, borderRadius: 6, border: "none", cursor: "pointer",
                    background: mode === "magic" ? "#FFFFFF" : "transparent",
                    color: mode === "magic" ? "#1A1730" : "#9490B8",
                    boxShadow: mode === "magic" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  Magic link
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: 12 }}>
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

                {mode === "password" && (
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
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: "#9490B8" }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>{errors.password}</p>}
                    <div style={{ textAlign: "right", marginTop: 4 }}>
                      <Link to="/forgot-password" style={{ fontSize: 12, color: "#7C6FE0", textDecoration: "none" }}>
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                )}

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
                  {mode === "magic" ? "Send magic link →" : "Sign in →"}
                </button>
              </form>

              <p style={{ textAlign: "center", fontSize: 13, color: "#9490B8", marginTop: 20 }}>
                Don't have an account?{" "}
                <Link to="/signup" style={{ color: "#7C6FE0", textDecoration: "none" }}>Start free →</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
