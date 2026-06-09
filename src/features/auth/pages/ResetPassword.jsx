import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../../services/supabase";
import logo from "../../../assets/logo/rave-logo.png";
import useMobile from "../../../hooks/useMobile";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  const navigate = useNavigate();
  const isMobile = useMobile();

  useEffect(() => {
    // Supabase puts the token in the URL hash — onAuthStateChange picks it up
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setValidSession(true);
        }
        setChecking(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function handleReset(e) {
    e.preventDefault();

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password updated successfully!");
    navigate("/");
  }

  const inputStyle = {
    width: "100%",
    background: "#0F0F0F",
    border: "1px solid #232323",
    borderRadius: "14px",
    padding: "14px 16px",
    color: "white",
    marginBottom: "16px",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        background: "#0B0B0C",
      }}
    >
      {/* Left panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: isMobile ? "40px 24px" : "80px",
          position: "relative",
          overflow: "hidden",
          minHeight: isMobile ? "auto" : "100vh",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: isMobile ? "250px" : "500px",
            height: isMobile ? "250px" : "500px",
            background: "#C7FF41",
            filter: "blur(180px)",
            opacity: 0.08,
          }}
        />

        <img
          src={logo}
          alt="RAVE"
          style={{ width: isMobile ? "180px" : "300px", marginBottom: "30px", position: "relative" }}
        />

        <h1
          style={{
            fontSize: isMobile ? "48px" : "72px",
            lineHeight: "0.95",
            margin: 0,
            position: "relative",
          }}
        >
          Reset
          <br />
          Your
          <br />
          Password
        </h1>

        <p style={{ color: "#9CA3AF", maxWidth: "500px", marginTop: "30px", lineHeight: "1.8", position: "relative" }}>
          Choose a new password for your RAVE account.
        </p>
      </div>

      {/* Right panel */}
      <div
        style={{
          width: isMobile ? "100%" : "520px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobile ? "20px" : "40px",
        }}
      >
        <div
          style={{
            width: "100%",
            background: "#141414",
            border: "1px solid #232323",
            borderRadius: isMobile ? "24px" : "32px",
            padding: isMobile ? "24px" : "40px",
          }}
        >
          {checking ? (
            <p style={{ color: "#9CA3AF" }}>Verifying reset link...</p>
          ) : !validSession ? (
            <>
              <h2 style={{ marginBottom: "12px" }}>Link Expired</h2>
              <p style={{ color: "#9CA3AF", marginBottom: "24px" }}>
                This reset link is invalid or has expired. Please request a new one.
              </p>
              <button
                onClick={() => navigate("/login")}
                style={{
                  width: "100%",
                  height: "56px",
                  background: "#C7FF41",
                  color: "#000",
                  border: "none",
                  borderRadius: "16px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Back to Login
              </button>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: isMobile ? "28px" : "34px", marginBottom: "10px" }}>
                New Password
              </h2>
              <p style={{ color: "#9CA3AF", marginBottom: "28px" }}>
                Must be at least 6 characters.
              </p>

              <form onSubmit={handleReset}>
                <input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  required
                />

                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "56px",
                    border: "none",
                    borderRadius: "16px",
                    background: "#C7FF41",
                    color: "#000",
                    fontWeight: "700",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    marginTop: "8px",
                  }}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}