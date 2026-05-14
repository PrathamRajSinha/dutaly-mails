import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  };

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
          <p style={{ color: "#7C6FE0", fontSize: 22, fontWeight: 500 }}>dutaly</p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 }}>AI agent for your inbox</p>
        </div>

        <main style={{ background: "#FFFFFF", borderRadius: 16, padding: 40 }}>
          <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "#7C6FE0", textDecoration: "none", marginBottom: 20 }}>
            <ArrowLeft size={14} /> Back to login
          </Link>

          {sent ? (
            <div className="flex flex-col items-center" style={{ paddingTop: 16, paddingBottom: 8 }}>
              <CheckCircle size={48} style={{ color: "#1D9E75" }} aria-hidden="true" />
              <p style={{ color: "#1D9E75", fontSize: 15, fontWeight: 500, marginTop: 16, textAlign: "center" }}>
                Check your inbox - reset link sent.
              </p>
            </div>
          ) : (
            <>
              <h1 style={{ color: "#1A1730", fontSize: 20, fontWeight: 500, marginBottom: 8 }}>
                Reset your Dutaly password
              </h1>
              <p style={{ color: "#6B6890", fontSize: 13, marginBottom: 24 }}>
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: 12 }}>
                <div>
                  <label htmlFor="forgot-email" style={{ display: "block", fontSize: 12, color: "#6B6890", marginBottom: 4 }}>Email address</label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={fieldStyle(!!error)}
                    onFocus={(e) => (e.target.style.borderColor = "#7C6FE0")}
                    onBlur={(e) => (e.target.style.borderColor = error ? "#DC2626" : "rgba(124,111,224,0.2)")}
                  />
                  {error && <p style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>{error}</p>}
                </div>

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
                  Send reset link →
                </button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
