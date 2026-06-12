import { useEffect, useState } from "react";
import { T, globalCss } from "./Login";

const features = [
  { icon: "⚡", title: "Instant Equal Splits", desc: "Enter a bill and names — we calculate everyone's share in milliseconds." },
  { icon: "🔒", title: "Enterprise-grade Auth", desc: "Amazon Cognito secures every account. JWT tokens protect every API call." },
  { icon: "📊", title: "Full Expense History", desc: "Every split saved and searchable. Know exactly who owed what, and when." },
  { icon: "☁️", title: "Serverless & Always On", desc: "Runs on AWS Lambda + DynamoDB. Zero downtime, infinite scale, minimal cost." },
];

const steps = [
  { num: "01", title: "Create a split", desc: "Enter the bill name, total amount, and the names of everyone involved." },
  { num: "02", title: "Instant calculation", desc: "We divide the total equally among all participants, rounded to the cent." },
  { num: "03", title: "Track & share", desc: "Your history is saved in the cloud. Review past splits any time." },
];

const awsServices = [
  "Amazon Cognito", "AWS Lambda", "Amazon API Gateway",
  "Amazon DynamoDB", "AWS SAM", "Amazon S3", "Amazon CloudFront",
];

function LandingPage({ setPage }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 40); return () => clearTimeout(t); }, []);

  return (
    <div style={l.root}>
      <style>{globalCss + landingCss}</style>

      {/* ── Fixed Nav ── */}
      <nav style={l.nav}>
        <div style={l.navInner}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={l.logoBadge}>
              <span style={{ fontSize: "0.9rem", lineHeight: 1 }}>💸</span>
              <div style={l.logoDot} />
            </div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: "600", color: "#fff", letterSpacing: "-0.3px", fontFamily: T.fontSans, lineHeight: 1.1 }}>SplitEasy</div>
              <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.2px" }}>Smart Bill Splitting</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button className="se-btn" style={l.navSignIn} onClick={() => setPage("login")}>Sign in</button>
            <button className="se-btn" style={l.navCta} onClick={() => setPage("signup")}>Get started →</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        ...l.hero,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(22px)",
        transition: "opacity 0.65s ease, transform 0.65s ease",
      }}>
        <div style={l.heroTopBar} />

        <div style={l.heroBadge}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: T.green, animation: "pulseGreen 2s ease infinite" }} />
          <span>Built on AWS Serverless Infrastructure</span>
        </div>

        <h1 style={l.heroTitle}>
          Split bills.<br />Not friendships.
        </h1>

        <p style={l.heroSub}>
          The fairest way to share expenses with anyone, anywhere.
          Create bills, split costs equally, and track who owes what — all in seconds.
        </p>

        <div style={l.ctaRow}>
          <button className="se-btn" style={l.ctaPrimary} onClick={() => setPage("signup")}>
            Get started free →
          </button>
          <button className="se-btn" style={l.ctaGhost} onClick={() => setPage("login")}>
            Sign in
          </button>
        </div>

        <div style={l.heroStats}>
          {[
            { val: "100%", label: "Serverless" },
            { val: "$0", label: "Idle cost" },
            { val: "7", label: "AWS services" },
          ].map((s, i) => (
            <div key={i} style={l.heroStat}>
              <span style={l.heroStatVal}>{s.val}</span>
              <span style={l.heroStatLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={l.section}>
        <div style={l.sectionInner}>
          <p style={l.sectionTag}>WHY SPLITEASY</p>
          <h2 style={l.sectionTitle}>Everything you need to split fairly</h2>
          <div style={l.featureGrid}>
            {features.map((f, i) => (
              <div key={i} className="se-card-hover" style={{ ...l.featureCard, animationDelay: `${i * 0.1}s` }}>
                <div style={l.featureIcon}>{f.icon}</div>
                <h3 style={l.featureTitle}>{f.title}</h3>
                <p style={l.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ ...l.section, background: "rgba(255,255,255,0.025)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={l.sectionInner}>
          <p style={l.sectionTag}>HOW IT WORKS</p>
          <h2 style={l.sectionTitle}>Three steps to a fair split</h2>
          <div style={l.stepsRow}>
            {steps.map((step, i) => (
              <div key={i} style={{ ...l.stepCard, animationDelay: `${i * 0.12}s` }}>
                <div style={l.stepNum}>{step.num}</div>
                <h3 style={l.stepTitle}>{step.title}</h3>
                <p style={l.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AWS Stack ── */}
      <section style={l.section}>
        <div style={{ ...l.sectionInner, textAlign: "center" }}>
          <p style={l.sectionTag}>POWERED BY</p>
          <h2 style={l.sectionTitle}>AWS Serverless Infrastructure</h2>
          <p style={l.awsSubtitle}>
            Enterprise-grade AWS services deliver security, scalability, and reliability at near-zero cost.
          </p>
          <div style={l.techGrid}>
            {awsServices.map((svc, i) => (
              <span key={i} className="se-tech-tag" style={l.techTag}>{svc}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ ...l.section, borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
        <div style={l.sectionInner}>
          <h2 style={{ ...l.sectionTitle, marginBottom: "0.5rem" }}>Ready to split fairly?</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.92rem", margin: "0 0 2rem", lineHeight: 1.7 }}>
            Free to use. No credit card required. Powered by AWS.
          </p>
          <button className="se-btn" style={{ ...l.ctaPrimary, fontSize: "1rem", padding: "0.9rem 2.25rem" }} onClick={() => setPage("signup")}>
            Create your free account →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={l.footer}>
        <div style={l.sectionInner}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: T.green, animation: "pulseGreen 2s ease infinite" }} />
              <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.28)", letterSpacing: "0.3px" }}>
                SplitEasy · Secure · Private · Simple
              </span>
            </div>
            <span style={{ fontSize: "0.72rem", color: T.green, fontWeight: "500", letterSpacing: "0.2px" }}>
              Laiba Khan [22k-4610] &amp; Ansharah Asad [22K-4411]
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Styles ── */
const l = {
  root: { minHeight: "100vh", background: "#111111", fontFamily: T.fontSans, color: "#fff" },

  nav: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    backdropFilter: "blur(20px)",
    background: "rgba(17,17,17,0.88)",
  },
  navInner: {
    maxWidth: "1140px", margin: "0 auto", padding: "0 2rem",
    height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  logoBadge: {
    width: "34px", height: "34px", borderRadius: "9px",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative", flexShrink: 0,
  },
  logoDot: {
    position: "absolute", bottom: "2px", right: "2px",
    width: "7px", height: "7px", borderRadius: "50%",
    background: T.green, border: "1.5px solid #111",
    animation: "pulseGreen 2s ease infinite",
  },
  navSignIn: {
    background: "none", border: "1px solid rgba(255,255,255,0.15)",
    color: "rgba(255,255,255,0.65)", padding: "0.38rem 1rem",
    borderRadius: "7px", fontSize: "0.82rem", cursor: "pointer",
    fontFamily: T.fontSans, fontWeight: "500",
  },
  navCta: {
    background: T.green, border: "none", color: "#fff",
    padding: "0.38rem 1.1rem", borderRadius: "7px",
    fontSize: "0.82rem", cursor: "pointer",
    fontFamily: T.fontSans, fontWeight: "500",
  },

  hero: {
    paddingTop: "150px", paddingBottom: "100px",
    textAlign: "center", maxWidth: "760px",
    margin: "0 auto", padding: "150px 2rem 90px",
    position: "relative",
  },
  heroTopBar: {
    position: "absolute", top: 0, left: "-50vw", right: "-50vw",
    height: "3px",
    background: "linear-gradient(90deg,#16A34A,#22C55E,#16A34A)",
    backgroundSize: "200%", animation: "shimmerLine 2.5s linear infinite",
  },
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: "7px",
    background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.3)",
    borderRadius: "20px", padding: "5px 14px",
    fontSize: "0.73rem", color: T.green, fontWeight: "500",
    marginBottom: "1.5rem", animation: "fadeUp 0.5s ease both",
  },
  heroTitle: {
    fontSize: "3.8rem", fontWeight: "400", color: "#fff",
    fontFamily: T.fontSerif, lineHeight: 1.1,
    margin: "0 0 1.25rem", letterSpacing: "-0.5px",
    animation: "fadeUp 0.55s ease 0.08s both",
  },
  heroSub: {
    fontSize: "1rem", color: "rgba(255,255,255,0.52)", lineHeight: 1.75,
    maxWidth: "500px", margin: "0 auto 2.25rem",
    animation: "fadeUp 0.55s ease 0.16s both",
  },
  ctaRow: {
    display: "flex", gap: "12px", justifyContent: "center",
    flexWrap: "wrap", animation: "fadeUp 0.55s ease 0.24s both",
    marginBottom: "3rem",
  },
  ctaPrimary: {
    background: T.green, border: "none", color: "#fff",
    padding: "0.78rem 1.75rem", borderRadius: "9px",
    fontSize: "0.95rem", cursor: "pointer",
    fontFamily: T.fontSans, fontWeight: "500",
  },
  ctaGhost: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "rgba(255,255,255,0.75)",
    padding: "0.78rem 1.75rem", borderRadius: "9px",
    fontSize: "0.95rem", cursor: "pointer",
    fontFamily: T.fontSans, fontWeight: "500",
  },
  heroStats: {
    display: "flex", gap: "2.5rem", justifyContent: "center", flexWrap: "wrap",
    animation: "fadeUp 0.55s ease 0.32s both",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    paddingTop: "2rem",
  },
  heroStat: { display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" },
  heroStatVal: { fontSize: "1.6rem", fontWeight: "600", color: "#fff", fontFamily: T.fontSerif, letterSpacing: "-0.4px" },
  heroStatLabel: { fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.3px" },

  section: { padding: "5rem 2rem" },
  sectionInner: { maxWidth: "1100px", margin: "0 auto" },
  sectionTag: {
    fontSize: "0.66rem", fontWeight: "600", color: T.green,
    letterSpacing: "1.2px", textTransform: "uppercase", margin: "0 0 0.65rem",
  },
  sectionTitle: {
    fontSize: "1.9rem", fontWeight: "400", color: "#fff",
    fontFamily: T.fontSerif, margin: "0 0 2.5rem", letterSpacing: "-0.3px",
  },

  featureGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1.25rem" },
  featureCard: {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px", padding: "1.75rem",
    animation: "fadeUp 0.5s ease both", transition: "box-shadow 0.22s, transform 0.22s",
  },
  featureIcon: { fontSize: "1.5rem", marginBottom: "0.75rem" },
  featureTitle: { fontSize: "0.93rem", fontWeight: "600", color: "#fff", margin: "0 0 0.4rem" },
  featureDesc: { fontSize: "0.82rem", color: "rgba(255,255,255,0.48)", margin: 0, lineHeight: 1.7 },

  stepsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2.5rem" },
  stepCard: { animation: "fadeUp 0.5s ease both" },
  stepNum: {
    fontSize: "2.8rem", fontWeight: "700",
    color: "rgba(255,255,255,0.07)", fontFamily: T.fontSerif,
    marginBottom: "0.65rem", letterSpacing: "-1px", lineHeight: 1,
  },
  stepTitle: { fontSize: "0.93rem", fontWeight: "600", color: "#fff", margin: "0 0 0.4rem" },
  stepDesc: { fontSize: "0.82rem", color: "rgba(255,255,255,0.48)", margin: 0, lineHeight: 1.7 },

  awsSubtitle: {
    color: "rgba(255,255,255,0.48)", fontSize: "0.9rem",
    maxWidth: "480px", margin: "0 auto 2rem", lineHeight: 1.7,
  },
  techGrid: { display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" },
  techTag: {
    fontSize: "0.74rem", color: "rgba(255,255,255,0.6)",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "6px", padding: "5px 12px", cursor: "default",
    fontFamily: T.fontSans, letterSpacing: "0.15px",
  },

  footer: {
    padding: "1.25rem 2rem",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
};

const landingCss = `
  body { background: #111111 !important; }
  @media (max-width: 640px) {
    h1 { font-size: 2.5rem !important; }
  }
`;

export default LandingPage;
