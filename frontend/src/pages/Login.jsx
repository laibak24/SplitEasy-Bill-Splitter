import { useState } from "react";
import { signIn } from "aws-amplify/auth";

function Login({ setUser, setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      if (isSignedIn) {
        setUser({ email });
      } else {
        setError("Login incomplete: " + nextStep.signInStep);
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={styles.page}>
      <style>{cssAnimations}</style>
      <div style={styles.wrapper}>
        {/* Logo / Brand */}
        <div style={styles.brand}>
          <span style={styles.brandIcon}>💸</span>
          <span style={styles.brandName}>SplitEasy</span>
        </div>

        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Welcome back</h1>
            <p style={styles.subtitle}>Sign in to continue to SplitEasy</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span style={styles.errorIcon}>⚠</span>
              {error}
            </div>
          )}

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email address</label>
            <input
              style={{ ...styles.input, ...(focused === "email" ? styles.inputFocused : {}) }}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div style={styles.fieldGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Password</label>
            </div>
            <input
              style={{ ...styles.input, ...(focused === "password" ? styles.inputFocused : {}) }}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button
            style={{ ...styles.button, ...(loading ? styles.buttonLoading : {}) }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <span style={styles.loadingContent}>
                <span style={styles.spinner} />
                Signing in…
              </span>
            ) : (
              "Continue"
            )}
          </button>

          <div style={styles.divider}>
            <span style={styles.dividerText}>Don't have an account?</span>
            <button style={styles.linkBtn} onClick={() => setPage("signup")}>
              Sign up for free
            </button>
          </div>
        </div>

        <p style={styles.footer}>Secure · Private · Simple</p>
      </div>
    </div>
  );
}

const cssAnimations = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const styles = {
  page: {
    minHeight: "100vh",
    background: "#FAFAF9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
    padding: "2rem 1rem",
  },
  wrapper: {
    width: "100%",
    maxWidth: "400px",
    animation: "fadeUp 0.4s ease both",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "2.5rem",
  },
  brandIcon: { fontSize: "1.4rem" },
  brandName: {
    fontSize: "1.15rem",
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: "-0.3px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #E8E8E5",
    padding: "2.5rem 2.5rem",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.06)",
  },
  header: {
    marginBottom: "2rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 0.4rem",
    letterSpacing: "-0.4px",
    fontFamily: "'DM Serif Display', serif",
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "#9b9b9b",
    margin: 0,
    fontWeight: "400",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#FFF5F5",
    border: "1px solid #FED7D7",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    color: "#C53030",
    marginBottom: "1.5rem",
  },
  errorIcon: { fontSize: "0.85rem" },
  fieldGroup: {
    marginBottom: "1.25rem",
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: "500",
    color: "#555",
    marginBottom: "0.5rem",
    letterSpacing: "0.1px",
  },
  input: {
    width: "100%",
    padding: "0.7rem 0.9rem",
    borderRadius: "8px",
    border: "1px solid #E0DDD8",
    fontSize: "0.9rem",
    color: "#1a1a1a",
    background: "#FAFAF9",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
  },
  inputFocused: {
    borderColor: "#1a1a1a",
    boxShadow: "0 0 0 3px rgba(26,26,26,0.06)",
    background: "#fff",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background 0.15s, transform 0.1s",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.1px",
    marginTop: "0.5rem",
  },
  buttonLoading: {
    background: "#555",
    cursor: "not-allowed",
  },
  loadingContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinner: {
    width: "14px",
    height: "14px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
  divider: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    marginTop: "1.75rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid #f0f0ec",
  },
  dividerText: {
    fontSize: "0.85rem",
    color: "#aaa",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#1a1a1a",
    fontSize: "0.85rem",
    fontWeight: "500",
    cursor: "pointer",
    padding: 0,
    fontFamily: "'DM Sans', sans-serif",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
  footer: {
    textAlign: "center",
    marginTop: "1.5rem",
    fontSize: "0.75rem",
    color: "#ccc",
    letterSpacing: "0.5px",
  },
};

export default Login;