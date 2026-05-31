import { useState, useEffect } from "react";
import { signOut, fetchAuthSession } from "aws-amplify/auth";

function Dashboard({ user, setUser }) {
  const [splits, setSplits]     = useState([]);
  const [billName, setBillName] = useState("");
  const [amount, setAmount]     = useState("");
  const [people, setPeople]     = useState("");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const getToken = async () => {
    const session = await fetchAuthSession();
    return session.tokens.idToken.toString();
  };

  const fetchSplits = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/splits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSplits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch splits", err);
    }
  };

  useEffect(() => { fetchSplits(); }, []);

  const handleCreate = async () => {
    setError(""); setSuccess("");
    if (!billName.trim()) return setError("Bill name is required");
    if (!amount || isNaN(amount) || Number(amount) < 0) return setError("Enter a valid amount");
    const peopleList = people.split(",").map(p => p.trim()).filter(Boolean);
    if (peopleList.length === 0) return setError("Add at least one person");

    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/splits`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ billName, totalAmount: Number(amount), people: peopleList }),
      });
      if (res.status === 201) {
        setSuccess("Split created successfully");
        setBillName(""); setAmount(""); setPeople("");
        fetchSplits();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create split");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
  };

  const totalSplitAmount = splits.reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <div style={styles.page}>
      <style>{cssAnimations}</style>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navInner}>
          <div style={styles.navBrand}>
            <span style={styles.navIcon}>💸</span>
            <span style={styles.navName}>SplitEasy</span>
          </div>
          <div style={styles.navRight}>
            <span style={styles.navEmail}>{user.email}</span>
            <button style={styles.logoutBtn} onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div style={styles.main}>
        {/* Page heading */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Your Splits</h1>
          <p style={styles.pageSubtitle}>Track shared expenses and who owes what.</p>
        </div>

        {/* Stats bar */}
        {splits.length > 0 && (
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <span style={styles.statValue}>{splits.length}</span>
              <span style={styles.statLabel}>Total splits</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statCard}>
              <span style={styles.statValue}>${totalSplitAmount.toFixed(2)}</span>
              <span style={styles.statLabel}>Total tracked</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statCard}>
              <span style={styles.statValue}>
                {splits.reduce((sum, s) => sum + (s.people?.length || 0), 0)}
              </span>
              <span style={styles.statLabel}>People involved</span>
            </div>
          </div>
        )}

        <div style={styles.grid}>
          {/* Create Split Form */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>New split</h2>
              <span style={styles.cardBadge}>+</span>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <span>⚠</span> {error}
              </div>
            )}
            {success && (
              <div style={styles.successBox}>
                <span>✓</span> {success}
              </div>
            )}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Bill name</label>
              <input
                style={{ ...styles.input, ...(focused === "bill" ? styles.inputFocused : {}) }}
                placeholder="e.g. Dinner at Kolachi"
                value={billName}
                onChange={e => setBillName(e.target.value)}
                onFocus={() => setFocused("bill")}
                onBlur={() => setFocused(null)}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Total amount (PKR / $)</label>
              <div style={styles.amountWrapper}>
                <span style={styles.currencySymbol}>$</span>
                <input
                  style={{
                    ...styles.input,
                    ...(focused === "amount" ? styles.inputFocused : {}),
                    paddingLeft: "2rem",
                  }}
                  placeholder="0.00"
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  onFocus={() => setFocused("amount")}
                  onBlur={() => setFocused(null)}
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Split between</label>
              <input
                style={{ ...styles.input, ...(focused === "people" ? styles.inputFocused : {}) }}
                placeholder="Ali, Sara, Usman"
                value={people}
                onChange={e => setPeople(e.target.value)}
                onFocus={() => setFocused("people")}
                onBlur={() => setFocused(null)}
              />
              <p style={styles.hint}>Separate names with commas</p>
            </div>

            <button
              style={{ ...styles.button, ...(loading ? styles.buttonLoading : {}) }}
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <span style={styles.loadingContent}>
                  <span style={styles.spinner} />
                  Creating…
                </span>
              ) : "Split bill"}
            </button>
          </div>

          {/* Split History */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>History</h2>
              {splits.length > 0 && (
                <span style={styles.countBadge}>{splits.length}</span>
              )}
            </div>

            {splits.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🧾</div>
                <p style={styles.emptyTitle}>No splits yet</p>
                <p style={styles.emptySubtitle}>Create your first bill split on the left.</p>
              </div>
            ) : (
              <div style={styles.splitList}>
                {splits.map((split, i) => (
                  <div
                    key={split.splitId}
                    style={{
                      ...styles.splitItem,
                      ...(i === splits.length - 1 ? { borderBottom: "none", marginBottom: 0, paddingBottom: 0 } : {}),
                      animationDelay: `${i * 0.05}s`,
                    }}
                  >
                    <div style={styles.splitTop}>
                      <div>
                        <p style={styles.splitName}>{split.billName}</p>
                        <p style={styles.splitDate}>
                          {new Date(split.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric"
                          })}
                        </p>
                      </div>
                      <span style={styles.splitAmount}>${split.amount}</span>
                    </div>
                    <div style={styles.tags}>
                      {split.people.map(p => (
                        <span key={p.name} style={styles.tag}>
                          <span style={styles.tagName}>{p.name}</span>
                          <span style={styles.tagOwes}>${p.owes}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const cssAnimations = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const styles = {
  page: {
    minHeight: "100vh",
    background: "#FAFAF9",
    fontFamily: "'DM Sans', sans-serif",
  },

  /* Navbar */
  navbar: {
    background: "#fff",
    borderBottom: "1px solid #E8E8E5",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  navInner: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "0.9rem 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navBrand: { display: "flex", alignItems: "center", gap: "8px" },
  navIcon:  { fontSize: "1.2rem" },
  navName:  { fontSize: "1rem", fontWeight: "600", color: "#1a1a1a", letterSpacing: "-0.3px" },
  navRight: { display: "flex", alignItems: "center", gap: "1rem" },
  navEmail: { fontSize: "0.82rem", color: "#999" },
  logoutBtn: {
    background: "none",
    border: "1px solid #E0DDD8",
    color: "#555",
    padding: "0.35rem 0.9rem",
    borderRadius: "6px",
    fontSize: "0.82rem",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "500",
    transition: "border-color 0.15s, color 0.15s",
  },

  /* Main layout */
  main: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "2.5rem 2rem",
    animation: "fadeUp 0.4s ease both",
  },
  pageHeader: { marginBottom: "2rem" },
  pageTitle: {
    fontSize: "1.75rem",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 0.3rem",
    letterSpacing: "-0.5px",
    fontFamily: "'DM Serif Display', serif",
  },
  pageSubtitle: { fontSize: "0.9rem", color: "#999", margin: 0 },

  /* Stats */
  statsRow: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    border: "1px solid #E8E8E5",
    borderRadius: "10px",
    padding: "1rem 2rem",
    marginBottom: "2rem",
    gap: "1.5rem",
  },
  statCard: { display: "flex", flexDirection: "column", gap: "2px" },
  statValue: { fontSize: "1.3rem", fontWeight: "600", color: "#1a1a1a", letterSpacing: "-0.3px" },
  statLabel: { fontSize: "0.75rem", color: "#aaa", fontWeight: "400" },
  statDivider: { width: "1px", height: "36px", background: "#F0EDE8", margin: "0 0.5rem" },

  /* Grid */
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
    "@media (max-width: 640px)": { gridTemplateColumns: "1fr" },
  },

  /* Card */
  card: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #E8E8E5",
    padding: "1.75rem",
    boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: 0,
    letterSpacing: "-0.2px",
  },
  cardBadge: {
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    background: "#1a1a1a",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
    lineHeight: 1,
  },
  countBadge: {
    background: "#F0EDE8",
    color: "#555",
    fontSize: "0.75rem",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "20px",
  },

  /* Form */
  fieldGroup: { marginBottom: "1.1rem" },
  label: {
    display: "block",
    fontSize: "0.78rem",
    fontWeight: "500",
    color: "#666",
    marginBottom: "0.4rem",
    letterSpacing: "0.1px",
  },
  amountWrapper: { position: "relative" },
  currencySymbol: {
    position: "absolute",
    left: "0.75rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#aaa",
    fontSize: "0.9rem",
    pointerEvents: "none",
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "0.65rem 0.85rem",
    borderRadius: "8px",
    border: "1px solid #E0DDD8",
    fontSize: "0.875rem",
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
  hint: { fontSize: "0.75rem", color: "#c0c0bb", margin: "4px 0 0", },

  /* Messages */
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#FFF5F5",
    border: "1px solid #FED7D7",
    borderRadius: "8px",
    padding: "0.65rem 0.9rem",
    fontSize: "0.83rem",
    color: "#C53030",
    marginBottom: "1rem",
  },
  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#F0FFF4",
    border: "1px solid #C6F6D5",
    borderRadius: "8px",
    padding: "0.65rem 0.9rem",
    fontSize: "0.83rem",
    color: "#276749",
    marginBottom: "1rem",
  },

  /* Button */
  button: {
    width: "100%",
    padding: "0.7rem",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: "0.25rem",
    transition: "background 0.15s",
  },
  buttonLoading: { background: "#555", cursor: "not-allowed" },
  loadingContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinner: {
    width: "13px",
    height: "13px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },

  /* Split list */
  splitList: { display: "flex", flexDirection: "column" },
  splitItem: {
    paddingBottom: "1rem",
    marginBottom: "1rem",
    borderBottom: "1px solid #F3F2EF",
    animation: "fadeUp 0.3s ease both",
  },
  splitTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "0.6rem",
  },
  splitName: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 2px",
  },
  splitDate: {
    fontSize: "0.75rem",
    color: "#bbb",
    margin: 0,
  },
  splitAmount: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: "-0.3px",
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.4rem",
  },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    background: "#F7F7F5",
    border: "1px solid #EBEBEB",
    borderRadius: "6px",
    padding: "3px 8px",
    fontSize: "0.78rem",
  },
  tagName: { color: "#555", fontWeight: "500" },
  tagOwes: { color: "#888", fontWeight: "400" },

  /* Empty state */
  emptyState: {
    textAlign: "center",
    padding: "3rem 1rem",
  },
  emptyIcon: { fontSize: "2.5rem", marginBottom: "0.75rem" },
  emptyTitle: { fontSize: "0.95rem", fontWeight: "600", color: "#555", margin: "0 0 0.3rem" },
  emptySubtitle: { fontSize: "0.82rem", color: "#bbb", margin: 0 },
};

export default Dashboard;