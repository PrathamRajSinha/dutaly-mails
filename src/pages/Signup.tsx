import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
        emailRedirectTo: `${window.location.origin}/onboarding/plan`,
      },
    });
    setLoading(false);

    if (error) {
      setFormError(error.message);
    } else if (data.user) {
      navigate("/onboarding/plan", { replace: true });
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "#0A0A0F" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#7C6FE0" }} />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ background: "#0A0A0F" }}
    >
      <div className="w-full" style={{ maxWidth: 420 }}>
        {/* Logo area on dark bg */}
        <div className="mb-6 text-center">
          <h1 style={{ color: "#7C6FE0", fontSize: 22, fontWeight: 500 }}>dutaly</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 4 }}>
            AI agent for your inbox
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 40,
          }}
        >
          <h2
            style={{
              color: "#1A1730",
              fontSize: 20,
              fontWeight: 500,
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            Create your account
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: 12 }}>
            {/* Full Name */}
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#9490B8", marginBottom: 4 }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: "100%",
                  background: "#F4F3FF",
                  border: errors.fullName ? "1px solid #DC2626" : "1px solid rgba(124,111,224,0.2)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 14,
                  color: "#1A1730",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#7C6FE0")}
                onBlur={(e) => (e.target.style.borderColor = errors.fullName ? "#DC2626" : "rgba(124,111,224,0.2)")}
              />
              {errors.fullName && (
                <p style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#9490B8", marginBottom: 4 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  background: "#F4F3FF",
                  border: errors.email ? "1px solid #DC2626" : "1px solid rgba(124,111,224,0.2)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 14,
                  color: "#1A1730",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#7C6FE0")}
                onBlur={(e) => (e.target.style.borderColor = errors.email ? "#DC2626" : "rgba(124,111,224,0.2)")}
              />
              {errors.email && (
                <p style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#9490B8", marginBottom: 4 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#F4F3FF",
                    border: errors.password ? "1px solid #DC2626" : "1px solid rgba(124,111,224,0.2)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    paddingRight: 42,
                    fontSize: 14,
                    color: "#1A1730",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#7C6FE0")}
                  onBlur={(e) => (e.target.style.borderColor = errors.password ? "#DC2626" : "rgba(124,111,224,0.2)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "#9490B8",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#9490B8", marginBottom: 4 }}>
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#F4F3FF",
                    border: errors.confirmPassword ? "1px solid #DC2626" : "1px solid rgba(124,111,224,0.2)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    paddingRight: 42,
                    fontSize: 14,
                    color: "#1A1730",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#7C6FE0")}
                  onBlur={(e) => (e.target.style.borderColor = errors.confirmPassword ? "#DC2626" : "rgba(124,111,224,0.2)")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "#9490B8",
                  }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>{errors.confirmPassword}</p>
              )}
            </div>

            {/* Form-level error */}
            {formError && (
              <p style={{ fontSize: 13, color: "#DC2626", textAlign: "center" }}>{formError}</p>
            )}

            {/* Submit */}
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
              Create free account →
            </button>
          </form>

          {/* Sign in link */}
          <p
            style={{
              textAlign: "center",
              fontSize: 13,
              color: "#9490B8",
              marginTop: 20,
            }}
          >
            Already have an account?{" "}
            <Link to="/auth" style={{ color: "#7C6FE0", textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
