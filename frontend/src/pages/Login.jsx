import { useState, useEffect } from "react";
import { signIn } from "aws-amplify/auth";

/* ── Design tokens ── */
export const T = {
  ink:         "#111111",
  inkMid:      "#555555",
  inkLight:    "#888888",
  inkFaint:    "#BBBBBB",
  surface:     "#FFFFFF",
  surfaceWarm: "#F9F8F6",
  surfaceMid:  "#F2F0EC",
  border:      "#E6E3DD",
  green:       "#16A34A",
  greenLight:  "#DCFCE7",
  greenMid:    "#BBF7D0",
  greenFaint:  "#F0FDF4",
  fontSans:    "'DM Sans', sans-serif",
  fontSerif:   "'DM Serif Display', serif",
};

/* ── Global CSS injected once ── */
export const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=DM+Serif+Display&display=swap');

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes pop {
    0%  { transform:scale(0.94); opacity:0; }
    60% { transform:scale(1.02); }
    100%{ transform:scale(1); opacity:1; }
  }
  @keyframes slideInRight {
    from { opacity:0; transform:translateX(12px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes shimmerLine {
    0%   { background-position:-200% center; }
    100% { background-position:200% center; }
  }
  @keyframes skeletonPulse {
    0%,100%{ opacity:0.45; }
    50%    { opacity:0.9; }
  }
  @keyframes ripple {
    to { transform:scale(4); opacity:0; }
  }
  @keyframes pulseGreen {
    0%,100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.4); }
    50%     { box-shadow: 0 0 0 6px rgba(22,163,74,0); }
  }
  @keyframes float {
    0%,100% { transform: translateY(0px); }
    50%     { transform: translateY(-6px); }
  }

  .se-btn {
    position: relative; overflow: hidden;
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
  }
  .se-btn:not(:disabled):hover  { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.18); }
  .se-btn:not(:disabled):active { transform:scale(0.97) translateY(0); box-shadow:none; }

  .se-input { transition: border-color 0.18s, box-shadow 0.18s, background 0.18s; }
  .se-input:focus {
    border-color: #16A34A !important;
    box-shadow: 0 0 0 3px rgba(22,163,74,0.13) !important;
    background: #fff !important;
    outline: none;
  }
  .se-card-hover { transition: box-shadow 0.22s, transform 0.22s; }
  .se-card-hover:hover { box-shadow: 0 2px 6px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.09); transform:translateY(-1px); }
  .se-logout:hover { border-color: #16A34A !important; color: #16A34A !important; }
  .se-stat { transition: box-shadow 0.22s, transform 0.22s; cursor: default; }
  .se-stat:hover { box-shadow: 0 0 0 2px #16A34A, 0 6px 24px rgba(22,163,74,0.1); transform: translateY(-2px); }
  .se-link:hover { color: #16A34A !important; }
  .se-tech-tag { transition: background 0.18s, border-color 0.18s, color 0.18s; }
  .se-tech-tag:hover { background: rgba(22,163,74,0.15) !important; border-color: rgba(22,163,74,0.4) !important; color: #16A34A !important; }
`;

/* ── Shared UI components ── */
export function NavLogo() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
      <div style={{ width:"34px", height:"34px", borderRadius:"9px", background:T.ink, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", flexShrink:0 }}>
        <span style={{ fontSize:"0.95rem", lineHeight:1 }}>💸</span>
        <div style={{ position:"absolute", bottom:"2px", right:"2px", width:"7px", height:"7px", borderRadius:"50%", background:T.green, border:"1.5px solid #fff", animation:"pulseGreen 2s ease infinite" }} />
      </div>
      <div>
        <div style={{ fontSize:"1rem", fontWeight:"600", color:T.ink, letterSpacing:"-0.3px", fontFamily:T.fontSans, lineHeight:1.1 }}>SplitEasy</div>
        <div style={{ fontSize:"0.62rem", color:T.inkLight, letterSpacing:"0.2px" }}>Smart Bill Splitting · Powered by AWS</div>
      </div>
    </div>
  );
}

export function Logo({ center = true }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent: center ? "center" : "flex-start", gap:"10px", marginBottom:"1.75rem" }}>
      <div style={{ width:"36px", height:"36px", borderRadius:"9px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", flexShrink:0 }}>
        <span style={{ fontSize:"1rem", lineHeight:1 }}>💸</span>
        <div style={{ position:"absolute", bottom:"2px", right:"2px", width:"7px", height:"7px", borderRadius:"50%", background:T.green, border:"1.5px solid #1C1C1E", animation:"pulseGreen 2s ease infinite" }} />
      </div>
      <div>
        <div style={{ fontSize:"1rem", fontWeight:"600", color:"#fff", letterSpacing:"-0.3px", fontFamily:T.fontSans, lineHeight:1.1 }}>SplitEasy</div>
        <div style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.4)", letterSpacing:"0.2px" }}>Smart Bill Splitting · Powered by AWS</div>
      </div>
    </div>
  );
}

export function Label({ children }) {
  return <label style={{ display:"block", fontSize:"0.78rem", fontWeight:"500", color:"rgba(255,255,255,0.55)", marginBottom:"0.4rem" }}>{children}</label>;
}

export function Input({ type="text", placeholder, value, onChange, onKeyDown, extra={} }) {
  return (
    <input className="se-input"
      style={{ width:"100%", padding:"0.65rem 0.9rem", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.12)", fontSize:"0.88rem", color:"#fff", background:"rgba(255,255,255,0.06)", outline:"none", boxSizing:"border-box", fontFamily:T.fontSans, ...extra }}
      type={type} placeholder={placeholder} value={value} onChange={onChange} onKeyDown={onKeyDown} />
  );
}

export function PrimaryBtn({ onClick, disabled, loading, label, loadingLabel }) {
  const handleClick = (e) => {
    if (disabled) return;
    const btn = e.currentTarget;
    const ripple = document.createElement("span");
    const rect = btn.getBoundingClientRect();
    ripple.style.cssText = `position:absolute;border-radius:50%;width:${Math.max(rect.width,rect.height)}px;height:${Math.max(rect.width,rect.height)}px;left:${e.clientX-rect.left-Math.max(rect.width,rect.height)/2}px;top:${e.clientY-rect.top-Math.max(rect.width,rect.height)/2}px;background:rgba(255,255,255,0.25);transform:scale(0);animation:ripple 0.55s ease-out forwards;pointer-events:none;`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    onClick && onClick(e);
  };
  return (
    <button className="se-btn"
      style={{ width:"100%", padding:"0.74rem", background:T.green, color:"#fff", border:"none", borderRadius:"9px", fontSize:"0.9rem", fontWeight:"500", cursor:disabled?"not-allowed":"pointer", fontFamily:T.fontSans, marginTop:"0.5rem", opacity:disabled?0.6:1 }}
      onClick={handleClick} disabled={disabled}>
      {loading ? (
        <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
          <span style={{ width:"13px", height:"13px", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
          {loadingLabel}
        </span>
      ) : label}
    </button>
  );
}

export function ErrorBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"8px", background:"rgba(229,62,62,0.12)", border:"1px solid rgba(229,62,62,0.3)", borderRadius:"8px", padding:"0.65rem 0.9rem", fontSize:"0.84rem", color:"#FC8181", marginBottom:"1.1rem", animation:"pop 0.25s ease both" }}>
      <span>⚠</span> {msg}
    </div>
  );
}

export function AuthFooter() {
  return (
    <div style={{ marginTop:"1.5rem", textAlign:"center" }}>
      <span style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.25)", letterSpacing:"0.3px" }}>
        Secure · Private · Simple ·{" "}
      </span>
      <span style={{ fontSize:"0.7rem", color:T.green, fontWeight:"500" }}>
        Laiba Khan [22k-4610] &amp; Ansharah Asad [22K-4411]
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════════════════════════════════ */
function Login({ setUser, setPage }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [visible, setVisible]   = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 40); return () => clearTimeout(t); }, []);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      if (isSignedIn) setUser({ email });
      else setError("Login incomplete: " + nextStep.signInStep);
    } catch (err) { setError(err.message || "Login failed"); }
    finally { setLoading(false); }
  };

  const onKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div style={pg.page}>
      <style>{globalCss + authCss}</style>

      {/* Shimmer line at top */}
      <div style={pg.topBar} />

      {/* Back link */}
      <div style={pg.backRow}>
        <button style={pg.backBtn} onClick={() => setPage("landing")}>← Back to home</button>
      </div>

      {/* Centered form */}
      <div style={pg.center}>
        <div style={{
          ...pg.formWrap,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}>
          <Logo center={true} />

          <div style={pg.card} className="se-card-hover">
            <div style={pg.accentLine} />
            <h1 style={pg.title}>Welcome back</h1>
            <p style={pg.subtitle}>Sign in to continue to SplitEasy</p>

            <ErrorBox msg={error} />

            <div style={{ marginBottom:"1rem", animation:"fadeUp 0.4s ease 0.05s both" }}>
              <Label>Email address</Label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={onKey} />
            </div>
            <div style={{ marginBottom:"1rem", animation:"fadeUp 0.4s ease 0.1s both" }}>
              <Label>Password</Label>
              <Input type="password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={onKey} />
            </div>
            <div style={{ animation:"fadeUp 0.4s ease 0.15s both" }}>
              <PrimaryBtn onClick={handleLogin} disabled={loading} loading={loading} label="Continue →" loadingLabel="Signing in…" />
            </div>

            <div style={pg.switchRow}>
              <span style={{ fontSize:"0.83rem", color:"rgba(255,255,255,0.45)" }}>Don't have an account?</span>
              <button className="se-link" style={pg.linkBtn} onClick={()=>setPage("signup")}>Sign up for free</button>
            </div>
          </div>

          <AuthFooter />
        </div>
      </div>
    </div>
  );
}

const pg = {
  page: {
    minHeight: "100vh", background: "#111111",
    fontFamily: T.fontSans, display: "flex", flexDirection: "column",
  },
  topBar: {
    height: "3px",
    background: "linear-gradient(90deg,#16A34A,#22C55E,#16A34A)",
    backgroundSize: "200%", animation: "shimmerLine 2.5s linear infinite",
    flexShrink: 0,
  },
  backRow: { padding: "1rem 1.5rem" },
  backBtn: {
    background: "none", border: "none",
    color: "rgba(255,255,255,0.4)", cursor: "pointer",
    fontSize: "0.82rem", fontFamily: T.fontSans,
    display: "flex", alignItems: "center", gap: "5px",
    transition: "color 0.15s", padding: 0,
  },
  center: {
    flex: 1, display: "flex", alignItems: "center",
    justifyContent: "center", padding: "1.5rem 2rem 3rem",
  },
  formWrap: { width: "100%", maxWidth: "400px" },
  card: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px", padding: "2rem 2.25rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.3), 0 16px 48px rgba(0,0,0,0.4)",
    position: "relative", overflow: "hidden",
  },
  accentLine: {
    position: "absolute", top: 0, left: 0, right: 0, height: "3px",
    background: "linear-gradient(90deg,#16A34A 0%,#22C55E 50%,#16A34A 100%)",
    backgroundSize: "200% 100%", animation: "shimmerLine 2.5s linear infinite",
  },
  title: {
    fontSize: "1.5rem", fontWeight: "400", color: "#fff",
    margin: "0 0 0.25rem", letterSpacing: "-0.4px", fontFamily: T.fontSerif,
  },
  subtitle: { fontSize: "0.855rem", color: "rgba(255,255,255,0.4)", margin: "0 0 1.5rem" },
  switchRow: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "4px", marginTop: "1.5rem", paddingTop: "1.25rem",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    animation: "fadeUp 0.4s ease 0.2s both",
  },
  linkBtn: {
    background: "none", border: "none", color: "rgba(255,255,255,0.7)",
    fontSize: "0.84rem", fontWeight: "500", cursor: "pointer",
    padding: 0, fontFamily: T.fontSans,
    textDecoration: "underline", textUnderlineOffset: "2px",
  },
};

const authCss = `
  .se-input::placeholder { color: rgba(255,255,255,0.28) !important; }
  .se-input:focus { border-color: #16A34A !important; box-shadow: 0 0 0 3px rgba(22,163,74,0.18) !important; background: rgba(255,255,255,0.09) !important; }
  .se-link:hover { color: #22C55E !important; }
`;

export default Login;
