import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { signIn } from "../services/authService";
import { supabase } from "../../../services/supabase";
import logo from "../../../assets/logo/rave-logo.png";
import useMobile from "../../../hooks/useMobile";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();
  const isMobile = useMobile();

  async function handleLogin(e) {
    e.preventDefault();

    const { error } = await signIn(email, password);

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/");
  }

  async function handleResetPassword() {
    if (!resetEmail.trim()) {
      alert("Please enter your email.");
      return;
    }

    setResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      resetEmail.trim(),
      { redirectTo: `${window.location.origin}/reset-password` }
    );

    setResetLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setResetSent(true);
  }

  function closeForgot() {
    setShowForgot(false);
    setResetEmail("");
    setResetSent(false);
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
      {/* Hero */}
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
          Welcome
          <br />
          Back To
          <br />
          RAVE
        </h1>

        <p
          style={{
            color: "#9CA3AF",
            maxWidth: "500px",
            marginTop: "30px",
            lineHeight: "1.8",
            fontSize: isMobile ? "15px" : "16px",
            position: "relative",
          }}
        >
          Discover parties, join communities, meet new people and create
          unforgettable experiences.
        </p>
      </div>

      {/* Login Form */}
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
          <h2 style={{ fontSize: isMobile ? "30px" : "36px", marginBottom: "10px" }}>
            Login
          </h2>

          <p style={{ color: "#9CA3AF", marginBottom: "30px" }}>
            Enter your account
          </p>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />

            {/* Forgot password link */}
            <div style={{ textAlign: "right", marginTop: "-8px", marginBottom: "16px" }}>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#9CA3AF",
                  cursor: "pointer",
                  fontSize: "13px",
                  padding: 0,
                }}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                height: "56px",
                border: "none",
                borderRadius: "16px",
                background: "#C7FF41",
                color: "#000",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Login
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "20px",
              color: "#9CA3AF",
              fontSize: isMobile ? "14px" : "16px",
            }}
          >
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#C7FF41" }}>
              Join RAVE
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div
          onClick={closeForgot}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#141414",
              border: "1px solid #232323",
              borderRadius: "24px",
              padding: "32px",
              maxWidth: "440px",
              width: "100%",
            }}
          >
            {resetSent ? (
              <>
                <h2 style={{ margin: "0 0 12px" }}>Check Your Email</h2>
                <p style={{ color: "#9CA3AF", lineHeight: "1.7", marginBottom: "24px" }}>
                  We sent a password reset link to{" "}
                  <span style={{ color: "#fff" }}>{resetEmail}</span>.
                  Click the link in the email to set a new password.
                </p>
                <p style={{ color: "#9CA3AF", fontSize: "13px", marginBottom: "24px" }}>
                  Didn't receive it? Check your spam folder or try again.
                </p>
                <button
                  onClick={closeForgot}
                  style={{
                    width: "100%",
                    height: "52px",
                    background: "#C7FF41",
                    color: "#000",
                    border: "none",
                    borderRadius: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Back to Login
                </button>
              </>
            ) : (
              <>
                <h2 style={{ margin: "0 0 8px" }}>Reset Password</h2>
                <p style={{ color: "#9CA3AF", fontSize: "14px", marginBottom: "24px" }}>
                  Enter your email and we'll send you a reset link.
                </p>

                <input
                  type="email"
                  placeholder="Your email address"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                  style={{
                    width: "100%",
                    background: "#0F0F0F",
                    border: "1px solid #232323",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    color: "white",
                    boxSizing: "border-box",
                    marginBottom: "16px",
                  }}
                  autoFocus
                />

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={closeForgot}
                    style={{
                      flex: 1,
                      height: "52px",
                      background: "#1A1A1A",
                      border: "1px solid #232323",
                      borderRadius: "14px",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleResetPassword}
                    disabled={resetLoading}
                    style={{
                      flex: 2,
                      height: "52px",
                      background: "#C7FF41",
                      color: "#000",
                      border: "none",
                      borderRadius: "14px",
                      fontWeight: "700",
                      fontSize: "15px",
                      cursor: resetLoading ? "not-allowed" : "pointer",
                      opacity: resetLoading ? 0.7 : 1,
                    }}
                  >
                    {resetLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}