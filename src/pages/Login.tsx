import logoAsset from "@/assets/dutaly-mails-logo.png.asset.json";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
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
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setFormError("We couldn’t sign you in. Check your password or create an account first.");
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
            <img src={logoAsset.url} alt="Dutaly Mails" style={{ height: 28, width: "auto", margin: "0 auto" }} />
          </Link>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 }}>AI agent for your inbox</p>
        </div>

        <main style={{ background: "#FFFFFF", borderRadius: 16, padding: 40 }}>
          <h1 style={{ color: "#1A1730", fontSize: 20, fontWeight: 500, marginBottom: 24, textAlign: "center" }}>
            Sign in to Dutaly
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: 12 }}>
            <div>
              <label htmlFor="login-email" style={{ display: "block", fontSize: 12, color: "#6B6890", marginBottom: 4 }}>Email address</label>
              <input
                id="login-email"
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
              <label htmlFor="login-password" style={{ display: "block", fontSize: 12, color: "#6B6890", marginBottom: 4 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: "#6B6890" }}
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
              Sign in →
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 13, color: "#6B6890", marginTop: 20 }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "#7C6FE0", textDecoration: "none" }}>Sign up →</Link>
          </p>
        </main>
      </div>
    </div>
  );
}
