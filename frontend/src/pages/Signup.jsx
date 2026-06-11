import { useState, useEffect } from "react";
import { signUp, confirmSignUp } from "aws-amplify/auth";
import { T, globalCss, Logo, Label, Input, PrimaryBtn, ErrorBox, AuthFooter } from "./Login";

const passwordRules = [
  { id:"length",    label:"At least 8 characters",  test:(p)=>p.length>=8 },
  { id:"uppercase", label:"One uppercase (A–Z)",     test:(p)=>/[A-Z]/.test(p) },
  { id:"lowercase", label:"One lowercase (a–z)",     test:(p)=>/[a-z]/.test(p) },
  { id:"number",    label:"One number (0–9)",        test:(p)=>/\d/.test(p) },
  { id:"special",   label:"One special character",  test:(p)=>/[^A-Za-z0-9]/.test(p) },
];

function Signup({ setPage }) {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [code, setCode]           = useState("");
  const [step, setStep]           = useState("signup");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [pwTouched, setPwTouched] = useState(false);
  const [visible, setVisible]     = useState(false);

  useEffect(() => { const t = setTimeout(()=>setVisible(true),40); return ()=>clearTimeout(t); }, []);

  const handleSignup = async () => {
    setError("");
    if (!email||!password) { setError("Please fill in all fields"); return; }
    if (password.length<8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await signUp({ username:email, password, options:{ userAttributes:{ email } } });
      setStep("confirm");
    } catch(err) { setError(err.message||"Signup failed"); }
    finally { setLoading(false); }
  };

  const handleConfirm = async () => {
    setError("");
    if (!code) { setError("Please enter the confirmation code"); return; }
    setLoading(true);
    try {
      await confirmSignUp({ username:email, confirmationCode:code });
      alert("Account confirmed! Please log in.");
      setPage("login");
    } catch(err) { setError(err.message||"Confirmation failed"); }
    finally { setLoading(false); }
  };

  const onKey = (e) => { if(e.key==="Enter") step==="signup" ? handleSignup() : handleConfirm(); };

  const passed   = passwordRules.filter(r=>r.test(password)).length;
  const strength = !password ? null : passed<=2 ? "weak" : passed<=4 ? "fair" : "strong";
  const strColor = { weak:"#E53E3E", fair:"#D97706", strong:T.green };
  const strLabel = { weak:"Weak", fair:"Fair", strong:"Strong" };

  const awsServices = [
    "Amazon Cognito","AWS Lambda","Amazon API Gateway",
    "Amazon DynamoDB","AWS SAM","Amazon S3","Amazon CloudFront",
  ];

  return (
    <div style={pg.page}>
      <style>{globalCss}</style>

      {/* ── Left panel ── */}
      <div style={pg.panel}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"3px", background:"linear-gradient(90deg,#16A34A,#22C55E,#16A34A)", backgroundSize:"200%", animation:"shimmerLine 2.5s linear infinite" }} />

        <div style={pg.panelInner}>
          <div style={pg.tagline}>{step==="signup" ? "Join the split\nrevolution." : "Almost\nthere!"}</div>
          <div style={pg.panelSub}>
            {step==="signup"
              ? "No awkward money conversations.\nJust fair splits, instantly."
              : `We've sent a verification code\nto ${email}`}
          </div>

          {/* Step progress */}
          <div style={{ display:"flex", alignItems:"center", marginBottom:"2rem" }}>
            {["Create account","Verify email"].map((lbl,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                  <div style={{ width:"26px", height:"26px", borderRadius:"50%",
                    background: (i===0&&step==="signup")||(i===1&&step==="confirm") ? T.green : "rgba(255,255,255,0.1)",
                    border:`1.5px solid ${(i===0&&step==="signup")||(i===1&&step==="confirm") ? T.green : "rgba(255,255,255,0.2)"}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"0.7rem", fontWeight:"700", color:"#fff", transition:"all 0.3s", flexShrink:0 }}>
                    {step==="confirm"&&i===0 ? "✓" : i+1}
                  </div>
                  <span style={{ fontSize:"0.76rem", whiteSpace:"nowrap", transition:"color 0.3s",
                    color:(i===0&&step==="signup")||(i===1&&step==="confirm") ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)" }}>
                    {lbl}
                  </span>
                </div>
                {i===0 && <div style={{ width:"24px", height:"1px", margin:"0 8px", background:step==="confirm" ? T.green : "rgba(255,255,255,0.15)", transition:"background 0.4s" }} />}
              </div>
            ))}
          </div>

          {/* AWS stack */}
          <div style={pg.techSection}>
            <p style={pg.techLabel}>Powered by AWS</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
              {awsServices.map((svc,i)=>(
                <span key={i} className="se-tech-tag" style={pg.techTag}>{svc}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: form ── */}
      <div style={pg.formSide}>
        <div style={{ ...pg.formWrap, opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)", transition:"opacity 0.5s ease, transform 0.5s ease" }}>
          <Logo />

          <div style={pg.card} className="se-card-hover">
            <div style={pg.accentLine} />
            <h1 style={pg.title}>{step==="signup" ? "Create your account" : "Check your inbox"}</h1>
            <p style={pg.subtitle}>{step==="signup" ? "Start splitting bills effortlessly" : `Enter the 6-digit code sent to ${email}`}</p>
            <ErrorBox msg={error} />

            {step==="signup" ? (
              <>
                <div style={{ marginBottom:"0.9rem", animation:"fadeUp 0.4s ease 0.05s both" }}>
                  <Label>Email address</Label>
                  <Input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={onKey} />
                </div>

                <div style={{ marginBottom:"0.9rem", animation:"fadeUp 0.4s ease 0.1s both" }}>
                  <Label>Password</Label>
                  <Input type="password" placeholder="Create a strong password" value={password}
                    onChange={e=>{ setPassword(e.target.value); setPwTouched(true); }} onKeyDown={onKey} />

                  {pwTouched && password.length>0 && (
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"7px" }}>
                      <div style={{ display:"flex", gap:"3px", flex:1 }}>
                        {[1,2,3,4,5].map(i=>(
                          <div key={i} style={{ flex:1, height:"3px", borderRadius:"2px", background:i<=passed?(strColor[strength]||"#ddd"):"#EDEDE9", transition:"background 0.25s" }} />
                        ))}
                      </div>
                      {strength && <span style={{ fontSize:"0.72rem", fontWeight:"600", color:strColor[strength], minWidth:"34px", textAlign:"right" }}>{strLabel[strength]}</span>}
                    </div>
                  )}

                  <div style={{ marginTop:"8px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 8px" }}>
                    {passwordRules.map(rule=>{
                      const ok=rule.test(password);
                      return (
                        <div key={rule.id} style={{ display:"flex", alignItems:"center", gap:"4px" }}>
                          <span style={{ fontSize:"0.74rem", fontWeight:"700", width:"12px", flexShrink:0, color:ok?T.green:pwTouched&&password.length>0?"#E53E3E":"#ccc", transition:"color 0.2s" }}>{ok?"✓":"○"}</span>
                          <span style={{ fontSize:"0.71rem", color:ok?"#15803D":pwTouched&&password.length>0?"#999":"#c0c0c0", transition:"color 0.2s" }}>{rule.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ animation:"fadeUp 0.4s ease 0.15s both" }}>
                  <PrimaryBtn onClick={handleSignup} disabled={loading} loading={loading} label="Create account →" loadingLabel="Creating account…" />
                </div>
              </>
            ) : (
              <>
                <div style={{ textAlign:"center", marginBottom:"1.25rem", padding:"1rem", background:T.greenFaint, borderRadius:"10px", border:`1px solid ${T.greenMid}`, animation:"pop 0.3s ease both" }}>
                  <div style={{ fontSize:"1.8rem", marginBottom:"0.4rem", animation:"float 2s ease infinite" }}>✉️</div>
                  <p style={{ fontSize:"0.81rem", color:"#15803D", margin:0, lineHeight:1.5 }}>Didn't receive it? Check your spam folder.</p>
                </div>
                <div style={{ marginBottom:"0.9rem", animation:"fadeUp 0.35s ease both" }}>
                  <Label>Confirmation code</Label>
                  <Input type="text" placeholder="000000" value={code} onChange={e=>setCode(e.target.value)} onKeyDown={onKey}
                    extra={{ fontSize:"1.4rem", letterSpacing:"0.45rem", textAlign:"center", fontWeight:"600", padding:"0.75rem 1rem" }} />
                </div>
                <PrimaryBtn onClick={handleConfirm} disabled={loading} loading={loading} label="Verify & continue →" loadingLabel="Verifying…" />
              </>
            )}

            <div style={pg.switchRow}>
              <span style={{ fontSize:"0.83rem", color:T.inkLight }}>Already have an account?</span>
              <button className="se-link" style={pg.linkBtn} onClick={()=>setPage("login")}>Sign in</button>
            </div>
          </div>

          <AuthFooter />
        </div>
      </div>
    </div>
  );
}

const pg = {
  page: { minHeight:"100vh", display:"flex", fontFamily:T.fontSans, background:T.surfaceWarm },
  panel: { flex:"0 0 44%", background:"#1C1C1E", display:"flex", alignItems:"center", justifyContent:"center", padding:"3rem 2.75rem", position:"relative", overflow:"hidden" },
  panelInner: { position:"relative", zIndex:1, maxWidth:"360px", width:"100%" },
  tagline: { fontSize:"2.5rem", fontWeight:"400", color:"#FFFFFF", fontFamily:T.fontSerif, lineHeight:1.2, marginBottom:"0.9rem", letterSpacing:"-0.4px", whiteSpace:"pre-line" },
  panelSub: { fontSize:"0.92rem", color:"rgba(255,255,255,0.55)", lineHeight:1.65, marginBottom:"2rem", whiteSpace:"pre-line" },
  techSection: { borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:"1.25rem" },
  techLabel: { fontSize:"0.68rem", fontWeight:"600", color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.8px", margin:"0 0 0.6rem" },
  techTag: { fontSize:"0.7rem", color:"rgba(255,255,255,0.6)", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"5px", padding:"3px 8px", cursor:"default", fontFamily:T.fontSans },
  formSide: { flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", background:T.surfaceWarm, overflowY:"auto" },
  formWrap: { width:"100%", maxWidth:"390px" },
  card: { background:T.surface, borderRadius:"14px", border:`1px solid ${T.border}`, padding:"2rem 2.25rem", boxShadow:"0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.07)", position:"relative", overflow:"hidden" },
  accentLine: { position:"absolute", top:0, left:0, right:0, height:"3px", background:"linear-gradient(90deg,#16A34A 0%,#22C55E 50%,#16A34A 100%)", backgroundSize:"200% 100%", animation:"shimmerLine 2.5s linear infinite" },
  title: { fontSize:"1.5rem", fontWeight:"400", color:T.ink, margin:"0 0 0.25rem", letterSpacing:"-0.4px", fontFamily:T.fontSerif },
  subtitle: { fontSize:"0.855rem", color:T.inkLight, margin:"0 0 1.25rem" },
  switchRow: { display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", marginTop:"1.5rem", paddingTop:"1.25rem", borderTop:`1px solid ${T.surfaceMid}`, animation:"fadeUp 0.4s ease 0.2s both" },
  linkBtn: { background:"none", border:"none", color:T.ink, fontSize:"0.84rem", fontWeight:"500", cursor:"pointer", padding:0, fontFamily:T.fontSans, textDecoration:"underline", textUnderlineOffset:"2px", transition:"color 0.15s" },
};

export default Signup;