import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("landing");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser({ email: currentUser.signInDetails?.loginId || "User" });
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#111111",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: "1rem",
      }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "9px",
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.1rem",
        }}>💸</div>
        <div style={{
          width: "20px", height: "20px",
          border: "2px solid rgba(255,255,255,0.1)",
          borderTopColor: "#16A34A",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (user) {
    return <Dashboard user={user} setUser={setUser} setPage={setPage} />;
  }

  if (page === "login")  return <Login setUser={setUser} setPage={setPage} />;
  if (page === "signup") return <Signup setPage={setPage} />;
  return <LandingPage setPage={setPage} />;
}

export default App;
