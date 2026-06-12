import { useState, useEffect, useRef } from "react";
import { signOut, fetchAuthSession } from "aws-amplify/auth";
import { T, globalCss, NavLogo, Label, PrimaryBtn, ErrorBox } from "./Login";

const CURRENCIES = [
  { code: "USD", symbol: "$",  label: "USD ($)"  },
  { code: "PKR", symbol: "₨", label: "PKR (₨)"  },
  { code: "EUR", symbol: "€",  label: "EUR (€)"  },
  { code: "GBP", symbol: "£",  label: "GBP (£)"  },
];

function Dashboard({ user, setUser, setPage }) {
  const [splits, setSplits]       = useState([]);
  const [billName, setBillName]   = useState("");
  const [amount, setAmount]       = useState("");
  const [people, setPeople]       = useState("");
  const [currency, setCurrency]   = useState(() => localStorage.getItem("se_currency") || "USD");
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);
  const [deleting, setDeleting]   = useState(null);
  const [focused, setFocused]     = useState(null);
  const [visible, setVisible]     = useState(false);
  const [search, setSearch]       = useState("");
  const historyRef                = useRef(null);
  const API_URL                   = import.meta.env.VITE_API_URL;

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

  const currSymbol = CURRENCIES.find(c => c.code === currency)?.symbol || "$";

  const getToken = async () => {
    const session = await fetchAuthSession();
    return session.tokens.idToken.toString();
  };

  const fetchSplits = async () => {
    setFetching(true);
    try {
      const token = await getToken();
      const res   = await fetch(`${API_URL}/splits`, { headers: { Authorization: token } });
      const data  = await res.json();
      setSplits(data.splits || []);
    } catch (err) { console.error("Failed to fetch splits", err); }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchSplits(); }, []);

  const handleCreate = async () => {
    setError(""); setSuccess("");
    if (!billName.trim())                                return setError("Bill name is required");
    if (!amount || isNaN(amount) || Number(amount) < 0) return setError("Enter a valid amount");
    const peopleList = people.split(",").map(p => p.trim()).filter(Boolean);
    if (peopleList.length === 0)                         return setError("Add at least one person");
    setLoading(true);
    try {
      const token = await getToken();
      const res   = await fetch(`${API_URL}/splits`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ billName, totalAmount: Number(amount), people: peopleList }),
      });
      if (res.status === 201) {
        setSuccess("Split created! 🎉");
        setBillName(""); setAmount(""); setPeople("");
        await fetchSplits();
        setTimeout(() => setSuccess(""), 4000);
        if (historyRef.current) historyRef.current.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const data = await res.json();
        setError(data.error || data.message || "Failed to create split");
      }
    } catch { setError("Something went wrong. Try again."); }
    finally { setLoading(false); }
  };

  const handleDelete = async (split) => {
    if (!window.confirm(`Delete "${split.billName}"?`)) return;
    setDeleting(split.createdAt);
    try {
      const token = await getToken();
      const res   = await fetch(`${API_URL}/splits/${encodeURIComponent(split.createdAt)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSplits(prev => prev.filter(s => s.createdAt !== split.createdAt));
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete split");
      }
    } catch { alert("Something went wrong. Try again."); }
    finally { setDeleting(null); }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setPage("landing");
  };

  const handleCurrencyChange = (e) => {
    const val = e.target.value;
    setCurrency(val);
    localStorage.setItem("se_currency", val);
  };

  const totalAmount = splits.reduce((s, x) => s + (x.totalAmount || 0), 0);
  const totalPeople = splits.reduce((s, x) => s + (x.people?.length || 0), 0);

  const filteredSplits = search.trim()
    ? splits.filter(sp => sp.billName?.toLowerCase().includes(search.toLowerCase()))
    : splits;

  const fmt = (n) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={s.page}>
      <style>{globalCss + extraCss}</style>

      {/* ── Navbar ── */}
      <nav style={s.navbar}>
        <div style={s.navInner}>
          <NavLogo />
          <div style={s.navRight}>
            <div style={s.userChip}>
              <div style={s.avatar}>{(user.email?.[0] || "U").toUpperCase()}</div>
              <span style={s.navEmail}>{user.email}</span>
            </div>
            <button style={s.logoutBtn} className="se-logout se-btn" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main style={{
        ...s.main,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>

        {/* Page heading */}
        <div style={s.pageHead}>
          <h1 style={s.pageTitle}>Your Splits</h1>
          <p style={s.pageSub}>Track shared expenses and who owes what.</p>
        </div>

        {/* ── Stat cards ── */}
        <div style={s.statsRow}>
          {[
            { icon:"🧾", value: splits.length,  label:"Total Splits",    sub:"bills created",       hi: false },
            { icon:"💰", value: `${currSymbol}${fmt(totalAmount)}`, label:"Total Tracked", sub:"across all splits", hi: true  },
            { icon:"👥", value: totalPeople,     label:"People Involved", sub:"unique participants", hi: false },
          ].map((c, i) => (
            <div key={i} className="se-stat" style={{ ...s.statCard, ...(c.hi ? s.statCardHi : {}), animationDelay:`${i*0.07}s` }}>
              {c.hi && <div style={s.statTopBar} />}
              <span style={{ fontSize:"1.35rem", display:"block", marginBottom:"0.6rem" }}>{c.icon}</span>
              <div style={{ ...s.statValue, color: c.hi ? T.green : T.ink }}>{c.value}</div>
              <div style={s.statLabel}>{c.label}</div>
              <div style={s.statSub}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Two-column body ── */}
        <div style={s.grid}>

          {/* ── NEW SPLIT ── */}
          <div style={s.card}>
            <div style={s.cardAccentBar} />
            <div style={s.cardHead}>
              <div>
                <h2 style={s.cardTitle}>New Split</h2>
                <p style={s.cardSub}>Equal split, instantly calculated</p>
              </div>
              <div style={s.plusBadge}>+</div>
            </div>

            <ErrorBox msg={error} />
            {success && (
              <div style={{ ...s.successBox, animation:"pop 0.25s ease both" }}>
                <span style={{ fontWeight:700, color:T.green }}>✓</span> {success}
              </div>
            )}

            <div style={{ ...s.field, animationDelay:"0.04s" }}>
              <Label>Bill name</Label>
              <input className="se-input" style={{ ...s.input, ...(focused==="bill" ? s.inputFocused : {}) }}
                placeholder="e.g. Dinner at Kolachi" value={billName}
                onChange={e => setBillName(e.target.value)}
                onFocus={() => setFocused("bill")} onBlur={() => setFocused(null)} />
            </div>

            <div style={{ ...s.field, animationDelay:"0.08s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.4rem" }}>
                <Label>Total amount</Label>
                <select
                  value={currency}
                  onChange={handleCurrencyChange}
                  style={s.currencySelect}
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ position:"relative" }}>
                <span style={s.currencySymbol}>{currSymbol}</span>
                <input className="se-input" style={{ ...s.input, ...(focused==="amount" ? s.inputFocused : {}), paddingLeft:"1.9rem" }}
                  placeholder="0.00" type="number" value={amount}
                  onChange={e => setAmount(e.target.value)}
                  onFocus={() => setFocused("amount")} onBlur={() => setFocused(null)} />
              </div>
            </div>

            <div style={{ ...s.field, animationDelay:"0.12s" }}>
              <Label>Split between</Label>
              <input className="se-input" style={{ ...s.input, ...(focused==="people" ? s.inputFocused : {}) }}
                placeholder="Ali, Sara, Usman" value={people}
                onChange={e => setPeople(e.target.value)}
                onFocus={() => setFocused("people")} onBlur={() => setFocused(null)} />
              <p style={s.hint}>Separate names with commas</p>
            </div>

            <div style={{ animation:"fadeUp 0.4s ease 0.16s both" }}>
              <PrimaryBtn onClick={handleCreate} disabled={loading} loading={loading} label="Split bill" loadingLabel="Creating…" />
            </div>

            {/* How it works */}
            <div style={s.howBox}>
              <p style={s.howTitle}>How it works</p>
              {[
                "Enter the bill name & total amount",
                "Add everyone's name, separated by commas",
                "We calculate equal shares instantly",
              ].map((step, i) => (
                <div key={i} style={s.howRow}>
                  <div style={s.howNum}>{i + 1}</div>
                  <span style={s.howText}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── HISTORY ── */}
          <div style={s.card}>
            <div style={s.cardAccentBar} />
            <div style={s.cardHead}>
              <div>
                <h2 style={s.cardTitle}>History</h2>
                <p style={s.cardSub}>Your recent bill splits</p>
              </div>
              {splits.length > 0 && <div style={s.countBadge}>{splits.length}</div>}
            </div>

            {/* Search bar */}
            {splits.length > 0 && (
              <div style={{ marginBottom: "1rem", position: "relative" }}>
                <span style={s.searchIcon}>🔍</span>
                <input
                  className="se-input"
                  style={{ ...s.input, ...(focused==="search" ? s.inputFocused : {}), paddingLeft: "2rem", fontSize: "0.82rem" }}
                  placeholder="Search splits…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => setFocused("search")}
                  onBlur={() => setFocused(null)}
                />
              </div>
            )}

            <div ref={historyRef} style={s.historyScroll}>
              {fetching ? (
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  {[1,2,3].map(i => <div key={i} style={{ ...s.skeleton, animationDelay:`${i*0.1}s` }} />)}
                </div>
              ) : splits.length === 0 ? (
                <div style={s.empty}>
                  <div style={{ fontSize:"2.5rem", marginBottom:"0.75rem" }}>🧾</div>
                  <p style={{ fontSize:"0.93rem", fontWeight:"600", color:T.inkMid, margin:"0 0 0.3rem" }}>No splits yet</p>
                  <p style={{ fontSize:"0.81rem", color:T.inkFaint, margin:0, lineHeight:1.6 }}>Create your first bill split using the form on the left.</p>
                </div>
              ) : filteredSplits.length === 0 ? (
                <div style={s.empty}>
                  <div style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>🔍</div>
                  <p style={{ fontSize:"0.88rem", color:T.inkMid, margin:0 }}>No splits match "{search}"</p>
                </div>
              ) : (
                filteredSplits.map((split, i) => (
                  <div key={split.splitId || i} style={{
                    ...s.splitItem,
                    ...(i === filteredSplits.length-1 ? { borderBottom:"none", marginBottom:0, paddingBottom:0 } : {}),
                    animation:"slideInRight 0.35s ease both",
                    animationDelay:`${i*0.05}s`,
                    opacity: deleting === split.createdAt ? 0.5 : 1,
                    transition: "opacity 0.2s",
                  }}>
                    <div style={s.splitRow}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={s.splitName}>{split.billName}</p>
                        <p style={s.splitDate}>
                          {new Date(split.createdAt).toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" })}
                        </p>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:"6px", flexShrink:0 }}>
                        <div style={s.amountBadge}>{currSymbol}{fmt(split.totalAmount)}</div>
                        <button
                          style={s.deleteBtn}
                          className="se-delete-btn"
                          onClick={() => handleDelete(split)}
                          disabled={deleting === split.createdAt}
                          title="Delete split"
                        >
                          {deleting === split.createdAt ? (
                            <span style={{ width:"11px", height:"11px", border:"2px solid rgba(0,0,0,0.2)", borderTopColor:"#666", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
                          ) : "✕"}
                        </button>
                      </div>
                    </div>
                    <div style={s.tags}>
                      {split.people.map(p => (
                        <span key={p.name} style={s.tag}>
                          <span style={s.tagInitial}>{p.name?.[0]?.toUpperCase()}</span>
                          <span style={s.tagName}>{p.name}</span>
                          <span style={s.tagOwes}>{currSymbol}{fmt(p.owes)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
            <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:T.green, animation:"pulseGreen 2s ease infinite" }} />
            <span style={s.footerMuted}>SplitEasy · Secure · Private · Simple</span>
          </div>
          <span style={s.footerDevs}>
            Laiba Khan [22k-4610] &amp; Ansharah Asad [22K-4411]
          </span>
        </div>
      </footer>
    </div>
  );
}

/* ── Extra CSS ── */
const extraCss = `
  @keyframes shimmerLine {
    0%   { background-position:-200% center; }
    100% { background-position:200% center; }
  }
  @keyframes slideInRight {
    from { opacity:0; transform:translateX(12px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes skeletonPulse {
    0%,100%{ opacity:0.45; }
    50%    { opacity:0.9; }
  }
  @keyframes pulseGreen {
    0%,100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.5); }
    50%     { box-shadow: 0 0 0 5px rgba(22,163,74,0); }
  }
  .se-logout {
    background: none;
    transition: border-color 0.18s, color 0.18s, transform 0.15s, box-shadow 0.15s !important;
  }
  .se-logout:hover { border-color: #16A34A !important; color: #16A34A !important; }
  .se-stat { transition: box-shadow 0.22s, transform 0.22s; cursor: default; }
  .se-stat:hover {
    box-shadow: 0 0 0 2px #16A34A, 0 6px 24px rgba(22,163,74,0.1);
    transform: translateY(-2px);
  }
  .se-delete-btn {
    transition: background 0.15s, color 0.15s, transform 0.15s;
  }
  .se-delete-btn:hover:not(:disabled) {
    background: #FEE2E2 !important;
    color: #DC2626 !important;
    border-color: #FCA5A5 !important;
    transform: scale(1.08);
  }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
  input[type=number] { -moz-appearance:textfield; }
`;

/* ── Styles ── */
const s = {
  page: {
    minHeight: "100vh",
    background: T.surfaceWarm,
    fontFamily: T.fontSans,
    display: "flex",
    flexDirection: "column",
  },

  navbar: {
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(14px)",
    borderBottom: `1px solid ${T.border}`,
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  navInner: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 2.5rem",
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navRight: { display:"flex", alignItems:"center", gap:"0.85rem" },
  userChip: {
    display:"flex", alignItems:"center", gap:"7px",
    background: T.surfaceMid, border:`1px solid ${T.border}`,
    borderRadius:"8px", padding:"0.25rem 0.75rem 0.25rem 0.3rem",
  },
  avatar: {
    width:"24px", height:"24px", borderRadius:"50%",
    background: T.ink, color:"#fff",
    fontSize:"0.63rem", fontWeight:"700",
    display:"flex", alignItems:"center", justifyContent:"center",
  },
  navEmail: { fontSize:"0.76rem", color:T.inkMid, maxWidth:"190px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  logoutBtn: {
    background:"none", border:`1px solid ${T.border}`, color:T.inkLight,
    padding:"0.3rem 0.85rem", borderRadius:"7px", fontSize:"0.76rem",
    cursor:"pointer", fontFamily:T.fontSans, fontWeight:"500",
  },

  main: {
    maxWidth: "1400px",
    width: "100%",
    margin: "0 auto",
    padding: "2.25rem 2.5rem 1.5rem",
    flex: 1,
  },
  pageHead: { marginBottom: "1.75rem" },
  pageTitle: {
    fontSize: "2rem", fontWeight:"400", color:T.ink,
    margin: "0 0 0.25rem", letterSpacing:"-0.55px",
    fontFamily: T.fontSerif,
  },
  pageSub: { fontSize:"0.88rem", color:T.inkLight, margin:0 },

  statsRow: {
    display:"grid", gridTemplateColumns:"repeat(3, 1fr)",
    gap:"1rem", marginBottom:"1.75rem",
  },
  statCard: {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius:"12px", padding:"1.25rem 1.5rem",
    animation:"fadeUp 0.45s ease both",
    position:"relative", overflow:"hidden",
  },
  statCardHi: { borderLeft: `3px solid ${T.green}` },
  statTopBar: {
    position:"absolute", top:0, left:0, right:0, height:"2px",
    background:"linear-gradient(90deg,#16A34A 0%,#22C55E 50%,#16A34A 100%)",
    backgroundSize:"200% 100%", animation:"shimmerLine 2.5s linear infinite",
  },
  statValue: {
    fontSize:"1.6rem", fontWeight:"600",
    letterSpacing:"-0.5px", lineHeight:1,
    marginBottom:"0.28rem", fontFamily:T.fontSerif,
  },
  statLabel: { fontSize:"0.78rem", fontWeight:"500", color:T.inkMid, marginBottom:"1px" },
  statSub:   { fontSize:"0.68rem", color:T.inkFaint, letterSpacing:"0.2px" },

  grid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem", alignItems:"start" },

  card: {
    background: T.surface, borderRadius:"14px",
    border:`1px solid ${T.border}`,
    padding:"1.75rem",
    boxShadow:"0 1px 3px rgba(0,0,0,0.03), 0 6px 24px rgba(0,0,0,0.05)",
    position:"relative", overflow:"hidden",
    animation:"fadeUp 0.5s ease both",
  },
  cardAccentBar: {
    position:"absolute", top:0, left:0, right:0, height:"3px",
    background:"linear-gradient(90deg,#16A34A 0%,#22C55E 50%,#16A34A 100%)",
    backgroundSize:"200% 100%", animation:"shimmerLine 2.5s linear infinite",
  },
  cardHead: { display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"1.4rem" },
  cardTitle: { fontSize:"0.98rem", fontWeight:"600", color:T.ink, margin:"0 0 2px", letterSpacing:"-0.15px" },
  cardSub: { fontSize:"0.74rem", color:T.inkFaint, margin:0 },
  plusBadge: {
    width:"27px", height:"27px", borderRadius:"7px", background:T.ink, color:"#fff",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:"1.15rem", fontWeight:"300", lineHeight:1, flexShrink:0,
  },
  countBadge: {
    background:T.greenFaint, color:T.green,
    border:`1px solid ${T.greenMid}`,
    fontSize:"0.73rem", fontWeight:"600",
    padding:"3px 10px", borderRadius:"20px", flexShrink:0,
  },

  field: { marginBottom:"1rem", animation:"fadeUp 0.4s ease both" },
  input: {
    width:"100%", padding:"0.62rem 0.9rem", borderRadius:"8px",
    border:`1px solid ${T.border}`, fontSize:"0.88rem", color:T.ink,
    background:T.surfaceWarm, outline:"none",
    boxSizing:"border-box", fontFamily:T.fontSans,
    transition:"border-color 0.18s, box-shadow 0.18s, background 0.18s",
  },
  inputFocused: { borderColor:T.green, boxShadow:"0 0 0 3px rgba(22,163,74,0.1)", background:"#fff" },
  currencySymbol: {
    position:"absolute", left:"0.75rem", top:"50%",
    transform:"translateY(-50%)", color:T.inkFaint,
    fontSize:"0.88rem", pointerEvents:"none", zIndex:1,
  },
  currencySelect: {
    background:T.surfaceMid, border:`1px solid ${T.border}`,
    borderRadius:"6px", padding:"2px 6px",
    fontSize:"0.72rem", color:T.inkMid,
    cursor:"pointer", fontFamily:T.fontSans,
    outline:"none",
  },
  hint: { fontSize:"0.71rem", color:T.inkFaint, margin:"3px 0 0" },

  searchIcon: {
    position:"absolute", left:"0.65rem", top:"50%",
    transform:"translateY(-50%)",
    fontSize:"0.75rem", pointerEvents:"none", zIndex:1,
  },

  successBox: {
    display:"flex", alignItems:"center", gap:"8px",
    background:T.greenFaint, border:`1px solid ${T.greenMid}`,
    borderRadius:"8px", padding:"0.62rem 0.9rem",
    fontSize:"0.83rem", color:"#15803D", marginBottom:"1rem",
  },

  howBox: { marginTop:"1.4rem", paddingTop:"1.1rem", borderTop:`1px solid ${T.surfaceMid}` },
  howTitle: { fontSize:"0.7rem", fontWeight:"600", color:T.inkFaint, textTransform:"uppercase", letterSpacing:"0.6px", margin:"0 0 0.65rem" },
  howRow: { display:"flex", alignItems:"center", gap:"9px", marginBottom:"0.45rem" },
  howNum: {
    width:"19px", height:"19px", borderRadius:"50%",
    background:T.greenFaint, color:T.green, border:`1px solid ${T.greenMid}`,
    fontSize:"0.66rem", fontWeight:"700",
    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
  },
  howText: { fontSize:"0.77rem", color:T.inkMid },

  historyScroll: {
    maxHeight:"520px", overflowY:"auto", overflowX:"hidden",
    paddingRight:"2px", scrollbarWidth:"thin",
    scrollbarColor:`${T.border} transparent`,
  },
  splitItem: { paddingBottom:"0.9rem", marginBottom:"0.9rem", borderBottom:`1px solid ${T.surfaceMid}` },
  splitRow: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"0.6rem", marginBottom:"0.5rem" },
  splitName: { fontSize:"0.88rem", fontWeight:"600", color:T.ink, margin:"0 0 2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  splitDate: { fontSize:"0.7rem", color:T.inkFaint, margin:0 },
  amountBadge: { background:T.ink, color:"#fff", fontSize:"0.8rem", fontWeight:"600", padding:"3px 9px", borderRadius:"20px", flexShrink:0, whiteSpace:"nowrap" },
  deleteBtn: {
    width:"24px", height:"24px", borderRadius:"6px",
    background:T.surfaceMid, border:`1px solid ${T.border}`,
    color:T.inkLight, fontSize:"0.62rem",
    display:"flex", alignItems:"center", justifyContent:"center",
    cursor:"pointer", flexShrink:0, fontFamily:T.fontSans,
  },
  tags: { display:"flex", flexWrap:"wrap", gap:"4px" },
  tag: { display:"inline-flex", alignItems:"center", gap:"4px", background:T.surfaceMid, border:`1px solid ${T.border}`, borderRadius:"6px", padding:"2px 7px", fontSize:"0.74rem" },
  tagInitial: { width:"15px", height:"15px", borderRadius:"50%", background:T.ink, color:"#fff", fontSize:"0.52rem", fontWeight:"700", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  tagName: { color:T.inkMid, fontWeight:"500" },
  tagOwes: { color:T.green, fontWeight:"700", fontSize:"0.73rem" },

  skeleton: { height:"78px", borderRadius:"8px", background:"linear-gradient(90deg,#f0ede8 25%,#e8e5df 50%,#f0ede8 75%)", backgroundSize:"200% 100%", animation:"shimmerLine 1.4s linear infinite, skeletonPulse 1.4s ease infinite" },
  empty: { textAlign:"center", padding:"3rem 1rem" },

  footer: { background: T.ink, marginTop: "auto", flexShrink: 0 },
  footerInner: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0.9rem 2.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "8px",
  },
  footerMuted: { fontSize:"0.73rem", color:"rgba(255,255,255,0.35)", letterSpacing:"0.3px" },
  footerDevs:  { fontSize:"0.73rem", color:T.green, fontWeight:"500", letterSpacing:"0.2px" },
};

export default Dashboard;
