import { useState } from "react";
import { signUp, confirmSignUp } from "aws-amplify/auth";

const passwordRules = [
  { id: "length",    label: "At least 8 characters",             test: (p) => p.length >= 8 },
  { id: "uppercase", label: "One uppercase letter (A–Z)",        test: (p) => /[A-Z]/.test(p) },
  { id: "lowercase", label: "One lowercase letter (a–z)",        test: (p) => /[a-z]/.test(p) },
  { id: "number",    label: "One number (0–9)",                  test: (p) => /\d/.test(p) },
  { id: "special",   label: "One special character (!@#$…)",     test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function Signup({ setPage }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode]         = useState("");
  const [step, setStep]         = useState("signup");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState(null);
  const [pwTouched, setPwTouched] = useState(false);

  const handleSignup = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields"); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await signUp({ username: email, password, options: { userAttributes: { email } } });
      setStep("confirm");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setError("");
    if (!code) { setError("Please enter the confirmation code"); return; }
    setLoading(true);
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      alert("Account confirmed! Please log in.");
      setPage("login");
    } catch (err) {
      setError(err.message || "Confirmation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") step === "signup" ? handleSignup() : handleConfirm();
  };

  const passedCount = passwordRules.filter(r => r.test(password)).length;
  const strength = password.length === 0 ? null : passedCount <= 2 ? "weak" : passedCount <= 4 ? "fair" : "strong";
  const strengthColor = { weak: "#E53E3E", fair: "#DD6B20", strong: "#38A169" };
  const strengthLabel = { weak: "Weak", fair: "Fair", strong: "Strong" };

  return (
    <div style={styles.page}>
      <style>{cssAnimations}</style>
      <div style={styles.wrapper}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>💸</span>
          <span style={styles.brandName}>SplitEasy</span>
        </div>

        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>
              {step === "signup" ? "Create your account" : "Check your email"}
            </h1>
            <p style={styles.subtitle}>
              {step === "signup"
                ? "Start splitting bills effortlessly"
                : `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠</span> {error}
            </div>
          )}

          {step === "signup" ? (
            <>
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
                <label style={styles.label}>Password</label>
                <input
                  style={{ ...styles.input, ...(focused === "password" ? styles.inputFocused : {}) }}
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPwTouched(true); }}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  onKeyDown={handleKeyDown}
                />

                {/* Strength bar */}
                {pwTouched && password.length > 0 && (
                  <div style={styles.strengthRow}>
                    <div style={styles.strengthBars}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          style={{
                            ...styles.strengthBar,
                            background: i <= passedCount
                              ? (strengthColor[strength] || "#ddd")
                              : "#EDEDE9",
                            transition: "background 0.2s",
                          }}
                        />
                      ))}
                    </div>
                    {strength && (
                      <span style={{ ...styles.strengthLabel, color: strengthColor[strength] }}>
                        {strengthLabel[strength]}
                      </span>
                    )}
                  </div>
                )}

                {/* Password rules checklist */}
                <div style={styles.rulesList}>
                  {passwordRules.map(rule => {
                    const passed = rule.test(password);
                    return (
                      <div key={rule.id} style={styles.ruleItem}>
                        <span style={{
                          ...styles.ruleIcon,
                          color: passed ? "#38A169" : pwTouched && password.length > 0 ? "#E53E3E" : "#ccc",
                        }}>
                          {passed ? "✓" : "○"}
                        </span>
                        <span style={{
                          ...styles.ruleText,
                          color: passed ? "#2D6A4F" : pwTouched && password.length > 0 ? "#9b9b9b" : "#c0c0c0",
                        }}>
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                style={{ ...styles.button, ...(loading ? styles.buttonLoading : {}) }}
                onClick={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <span style={styles.loadingContent}><span style={styles.spinner} />Creating account…</span>
                ) : "Create account"}
              </button>
            </>
          ) : (
            <>
              <div style={styles.confirmHint}>
                <div style={styles.codeIcon}>✉️</div>
                <p style={styles.codeHelp}>
                  Didn't receive it? Check your spam folder or wait a minute.
                </p>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Confirmation code</label>
                <input
                  style={{
                    ...styles.input,
                    ...(focused === "code" ? styles.inputFocused : {}),
                    fontSize: "1.4rem",
                    letterSpacing: "0.4rem",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  onFocus={() => setFocused("code")}
                  onBlur={() => setFocused(null)}
                  onKeyDown={handleKeyDown}
                  maxLength={6}
                />
              </div>

              <button
                style={{ ...styles.button, ...(loading ? styles.buttonLoading : {}) }}
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? (
                  <span style={styles.loadingContent}><span style={styles.spinner} />Verifying…</span>
                ) : "Verify & continue"}
              </button>
            </>
          )}

          <div style={styles.divider}>
            <span style={styles.dividerText}>Already have an account?</span>
            <button style={styles.linkBtn} onClick={() => setPage("login")}>Sign in</button>
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
  @keyframes spin { to { transform: rotate(360deg); } }
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
    maxWidth: "420px",
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
    padding: "2.5rem",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.06)",
  },
  header: { marginBottom: "2rem" },
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
  fieldGroup: { marginBottom: "1.25rem" },
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
  strengthRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "8px",
  },
  strengthBars: {
    display: "flex",
    gap: "4px",
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: "4px",
    borderRadius: "2px",
  },
  strengthLabel: {
    fontSize: "0.75rem",
    fontWeight: "500",
    minWidth: "40px",
    textAlign: "right",
  },
  rulesList: {
    marginTop: "12px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "6px 12px",
  },
  ruleItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  ruleIcon: {
    fontSize: "0.8rem",
    fontWeight: "700",
    width: "14px",
    flexShrink: 0,
    transition: "color 0.2s",
  },
  ruleText: {
    fontSize: "0.78rem",
    transition: "color 0.2s",
    lineHeight: 1.3,
  },
  confirmHint: {
    textAlign: "center",
    marginBottom: "1.5rem",
    padding: "1.25rem",
    background: "#F7F7F5",
    borderRadius: "10px",
  },
  codeIcon: { fontSize: "2rem", marginBottom: "0.5rem" },
  codeHelp: {
    fontSize: "0.82rem",
    color: "#888",
    margin: 0,
    lineHeight: 1.5,
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
    transition: "background 0.15s",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.1px",
    marginTop: "0.5rem",
  },
  buttonLoading: { background: "#555", cursor: "not-allowed" },
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
  dividerText: { fontSize: "0.85rem", color: "#aaa" },
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

export default Signup;