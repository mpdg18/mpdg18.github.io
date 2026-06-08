import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../../shared/components/Navbar";
import { supabase } from "../../../services/supabase";
import { submitVerification, getVerification } from "../services/verificationService";

export default function HostVerification() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("pending");
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    async function checkVerification() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const existing = await getVerification(user.id);

      if (existing.data) {
        setSubmitted(true);
        setStatus(existing.data.status || "pending");
        setFullName(existing.data.full_name || "");
        setPhone(existing.data.phone || "");
        setInstagram(existing.data.instagram || "");
        setReason(existing.data.reason || "");
      }

      setLoading(false);
    }

    checkVerification();
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const existing = await getVerification(user.id);

    if (existing.data) {
      alert("Verification already submitted.");
      return;
    }

    const { error } = await submitVerification({
      user_id: user.id,
      full_name: fullName,
      phone,
      instagram,
      reason,
      status: "pending",
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Application submitted successfully.");
    setSubmitted(true);
    setStatus("pending");
  }

  const inputStyle = {
    width: "100%",
    background: "#0F0F0F",
    border: "1px solid #232323",
    borderRadius: "14px",
    padding: "14px 16px",
    color: "white",
    boxSizing: "border-box",
  };

  const sectionStyle = {
    background: "#141414",
    border: "1px solid #232323",
    borderRadius: "24px",
    padding: "24px",
    marginBottom: "24px",
  };

  const labelStyle = {
    display: "block",
    color: "#9CA3AF",
    fontSize: "14px",
    marginBottom: "8px",
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <p style={{ textAlign: "center", marginTop: "40px" }}>Loading...</p>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "20px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <p
            style={{
              color: "#C7FF41",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontSize: "14px",
            }}
          >
            Host Program
          </p>

          <h1
            style={{
              fontSize: "clamp(60px, 8vw, 110px)",
              lineHeight: "0.95",
              margin: "10px 0",
            }}
          >
            Become
            <br />
            A Host
          </h1>

          <p style={{ color: "#9CA3AF", maxWidth: "600px", margin: "0 auto" }}>
            Apply to host premium events on RAVE.
          </p>
        </div>

        {submitted ? (
          <div
            style={{
              background: "#141414",
              border: "1px solid #232323",
              borderRadius: "24px",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <h2>
              {status === "approved"
                ? "🎉 Host Approved"
                : status === "rejected"
                ? "❌ Application Rejected"
                : "⏳ Application Submitted"}
            </h2>

            <p style={{ color: "#9CA3AF", marginTop: "10px" }}>
              {status === "approved"
                ? "You are now a verified RAVE host and can start creating events."
                : status === "rejected"
                ? "Your application was rejected. Contact support or apply again later."
                : "Your host verification is currently under review by the RAVE team."}
            </p>

            {status === "approved" && (
              <button
                onClick={() => navigate("/create-event")}
                style={{
                  marginTop: "24px",
                  width: "100%",
                  height: "60px",
                  background: "#C7FF41",
                  color: "#000",
                  border: "none",
                  borderRadius: "18px",
                  fontWeight: "700",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                Create Event
              </button>
            )}
          </div>
        ) : (
          <form id="verification-form" onSubmit={handleSubmit}>

            <div style={sectionStyle}>
              <h2 style={{ marginBottom: "20px" }}>Personal Details</h2>

              <label style={labelStyle}>Full Name</label>
              <input
                style={{ ...inputStyle, marginBottom: "16px" }}
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <label style={labelStyle}>Phone Number</label>
              <input
                style={inputStyle}
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div style={sectionStyle}>
              <h2 style={{ marginBottom: "20px" }}>Social</h2>

              <label style={labelStyle}>Instagram Username or Link</label>
              <input
                style={inputStyle}
                placeholder="@yourhandle"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
            </div>

            <div style={sectionStyle}>
              <h2 style={{ marginBottom: "20px" }}>Your Pitch</h2>

              <label style={labelStyle}>Why do you want to host events on RAVE?</label>
              <textarea
                style={{ ...inputStyle, minHeight: "160px", resize: "vertical" }}
                placeholder="Tell us about your vision..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <button
              type="button"
              onClick={() => setShowTerms(true)}
              style={{
                width: "100%",
                height: "60px",
                background: "#C7FF41",
                color: "#000",
                border: "none",
                borderRadius: "18px",
                fontWeight: "700",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Review & Submit
            </button>
          </form>
        )}
      </div>
      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div
          onClick={() => setShowTerms(false)}
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
              maxWidth: "600px",
              width: "100%",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2 style={{ margin: "0 0 4px" }}>Host Terms & Conditions</h2>
            <p style={{ color: "#9CA3AF", fontSize: "14px", marginBottom: "20px" }}>
              Please read carefully before submitting.
            </p>

            {/* Scrollable content */}
            <div
              style={{
                overflowY: "auto",
                flex: 1,
                paddingRight: "8px",
                marginBottom: "20px",
                lineHeight: "1.8",
                color: "#9CA3AF",
                fontSize: "14px",
              }}
            >
              {[
                {
                  title: "1. Eligibility",
                  body: "You must be 18 or older to host events on RAVE. By applying, you confirm this is accurate.",
                },
                {
                  title: "2. Event Responsibility",
                  body: "As a host, you are solely responsible for the safety, legality, and conduct of your event. RAVE is a platform — not an organizer or co-host.",
                },
                {
                  title: "3. Payments & Fees",
                  body: "All ticket payments are collected through RAVE's UPI system. Hosts receive payouts after the event is verified as completed. RAVE reserves the right to hold funds for disputed or cancelled events.",
                },
                {
                  title: "4. Cancellations",
                  body: "If you cancel an event, all attendees must be refunded in full. Repeated cancellations may result in account suspension.",
                },
                {
                  title: "5. Prohibited Events",
                  body: "Events promoting illegal activity, hate, discrimination, or explicit content are strictly banned. Violation results in immediate removal.",
                },
                {
                  title: "6. Alcohol & Age Restrictions",
                  body: "If your event involves alcohol or is age-restricted, you are legally responsible for verifying attendee ages at entry.",
                },
                {
                  title: "7. Attendee Data",
                  body: "Attendee data (name, email, age) shared with you through RAVE is for event management only. Misuse of attendee data will result in a permanent ban.",
                },
                {
                  title: "8. Platform Rights",
                  body: "RAVE reserves the right to remove any event, suspend any host account, or withhold payouts for policy violations.",
                },
                {
                  title: "9. Agreement",
                  body: "By submitting this application, you agree to these terms and confirm all information provided is truthful.",
                },
              ].map(({ title, body }) => (
                <div key={title} style={{ marginBottom: "16px" }}>
                  <div style={{ color: "#fff", fontWeight: "600", marginBottom: "4px" }}>{title}</div>
                  <div>{body}</div>
                </div>
              ))}
            </div>

            {/* Accept checkbox */}
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                cursor: "pointer",
                marginBottom: "20px",
                color: "#fff",
                fontSize: "14px",
              }}
            >
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{ marginTop: "2px", accentColor: "#C7FF41", width: "16px", height: "16px", flexShrink: 0 }}
              />
              I have read and agree to the RAVE Host Terms & Conditions.
            </label>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowTerms(false)}
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
                disabled={!termsAccepted}
                onClick={() => {
                  setShowTerms(false);
                  document.getElementById("verification-form").requestSubmit();
                }}
                style={{
                  flex: 2,
                  height: "52px",
                  background: termsAccepted ? "#C7FF41" : "#2a2a2a",
                  color: termsAccepted ? "#000" : "#666",
                  border: "none",
                  borderRadius: "14px",
                  fontWeight: "700",
                  fontSize: "16px",
                  cursor: termsAccepted ? "pointer" : "not-allowed",
                }}
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}