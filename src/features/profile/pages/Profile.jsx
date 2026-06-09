import { useEffect, useState } from "react";

import Navbar from "../../../shared/components/Navbar";
import { supabase } from "../../../services/supabase";
import { getHostedEvents } from "../../events/services/eventService";
import { getJoinedEvents } from "../../events/services/attendeeService";
import { getUserCommunities } from "../../communities/services/communityMemberService";
import { signOut } from "../../auth/services/authService";
import useMobile from "../../../hooks/useMobile";

const SEX_OPTIONS = [
  "Male", "Female", "Gay", "Lesbian",
  "Bisexual", "Transgender", "Other", "Prefer Not To Say",
];

export default function Profile() {
  const isMobile = useMobile();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [hostedEvents, setHostedEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editSex, setEditSex] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      if (!user) return;

      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      const [hosted, joined, communityResult] = await Promise.all([
        getHostedEvents(user.id),
        getJoinedEvents(user.id),
        getUserCommunities(user.id),
      ]);

      if (hosted.data) setHostedEvents(hosted.data);
      if (joined.data) setJoinedEvents(joined.data);
      if (communityResult.data) setCommunities(communityResult.data);
    }

    loadProfile();
  }, []);

  function openEdit() {
    setEditName(profile?.full_name || "");
    setEditEmail(profile?.email || "");
    setEditSex(profile?.sex || "");
    setEditing(true);
  }

  async function handleSave() {
    if (!editName.trim()) { alert("Name cannot be empty."); return; }
    if (!editEmail.trim()) { alert("Email cannot be empty."); return; }

    setSaving(true);

    const { error } = await supabase
      .from("users")
      .update({ full_name: editName, email: editEmail, sex: editSex })
      .eq("id", user.id);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    // Refresh profile
    const { data: updated } = await supabase
      .from("users").select("*").eq("id", user.id).single();

    setProfile(updated);
    setEditing(false);
    setSaving(false);
  }

  async function handleLogout() {
    const { error } = await signOut();
    if (error) { alert(error.message); return; }
    window.location.href = "/login";
  }

  const pillStyle = {
    background: "#1A1A1A",
    border: "1px solid #232323",
    padding: isMobile ? "8px 12px" : "10px 16px",
    borderRadius: "999px",
    fontSize: isMobile ? "13px" : "14px",
  };

  const inputStyle = {
    width: "100%",
    background: "#0F0F0F",
    border: "1px solid #232323",
    borderRadius: "14px",
    padding: "14px 16px",
    color: "white",
    boxSizing: "border-box",
    marginBottom: "16px",
  };

  const labelStyle = {
    display: "block",
    color: "#9CA3AF",
    fontSize: "13px",
    marginBottom: "6px",
  };

  return (
    <>
      <Navbar />

      <div
        style={{
          maxWidth: "1200px",
          margin: isMobile ? "20px auto" : "40px auto",
          padding: isMobile ? "16px" : "20px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "center",
            gap: "16px",
            marginBottom: "30px",
          }}
        >
          <h1 style={{ fontSize: isMobile ? "38px" : "48px", margin: 0 }}>Profile</h1>

          <div style={{ display: "flex", gap: "10px", flexDirection: isMobile ? "column" : "row" }}>
            <button
              onClick={openEdit}
              style={{
                background: "#141414",
                color: "#fff",
                border: "1px solid #232323",
                padding: "12px 18px",
                borderRadius: "999px",
                cursor: "pointer",
                fontWeight: "600",
                width: isMobile ? "100%" : "auto",
              }}
            >
              Edit Profile
            </button>

            {user ? (
              <button
                onClick={handleLogout}
                style={{
                  background: "#ff4d4f",
                  color: "#fff",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: "999px",
                  cursor: "pointer",
                  fontWeight: "600",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => window.location.href = "/login"}
                style={{
                  background: "#C7FF41",
                  color: "#000",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: "999px",
                  cursor: "pointer",
                  fontWeight: "600",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* Profile Card */}
        {profile && (
          <div
            style={{
              background: "#141414",
              border: "1px solid #232323",
              borderRadius: "32px",
              padding: isMobile ? "20px" : "40px",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: "center",
                textAlign: isMobile ? "center" : "left",
                gap: "24px",
              }}
            >
              <div
                style={{
                  width: isMobile ? "80px" : "100px",
                  height: isMobile ? "80px" : "100px",
                  borderRadius: "50%",
                  background: "#C7FF41",
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? "28px" : "36px",
                  fontWeight: "700",
                  flexShrink: 0,
                }}
              >
                {profile.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>

              <div>
                <h2 style={{ margin: "0 0 8px" }}>{profile.full_name}</h2>
                <p style={{ color: "#9CA3AF", margin: 0 }}>{profile.email}</p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "25px",
                justifyContent: isMobile ? "center" : "flex-start",
              }}
            >
              <div style={pillStyle}>{profile.sex}</div>
              <div style={pillStyle}>DOB: {profile.date_of_birth}</div>
              <div style={pillStyle}>⭐ Reputation: {profile.reputation}</div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "20px",
            marginBottom: "50px",
          }}
        >
          {[
            { label: "Communities", value: communities.length },
            { label: "Hosted Events", value: hostedEvents.length },
            { label: "Joined Events", value: joinedEvents.length },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                background: "#141414",
                border: "1px solid #232323",
                borderRadius: "24px",
                padding: isMobile ? "20px" : "30px",
                textAlign: "center",
              }}
            >
              <h2>{value}</h2>
              <p>{label}</p>
            </div>
          ))}
        </div>

        <Section title="Communities" items={communities} />
        <Section title="Hosted Events" items={hostedEvents} />
        <Section title="Joined Events" items={joinedEvents} />
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div
          onClick={() => setEditing(false)}
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
              maxWidth: "480px",
              width: "100%",
            }}
          >
            <h2 style={{ margin: "0 0 6px" }}>Edit Profile</h2>
            <p style={{ color: "#9CA3AF", fontSize: "14px", marginBottom: "24px" }}>
              Date of birth cannot be changed.
            </p>

            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              style={inputStyle}
              placeholder="Full Name"
            />

            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              style={inputStyle}
              placeholder="Email"
            />

            <label style={labelStyle}>Gender / Sex</label>
            <select
              value={editSex}
              onChange={(e) => setEditSex(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select</option>
              {SEX_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button
                onClick={() => setEditing(false)}
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
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 2,
                  height: "52px",
                  background: "#C7FF41",
                  color: "#000",
                  border: "none",
                  borderRadius: "14px",
                  fontWeight: "700",
                  fontSize: "16px",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, items }) {
  return (
    <>
      <h2 style={{ fontSize: "32px", marginTop: "50px", marginBottom: "20px" }}>
        {title}
      </h2>

      {items.length === 0 ? (
        <p>No {title.toLowerCase()}.</p>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            style={{
              background: "#141414",
              border: "1px solid #232323",
              padding: "18px",
              marginBottom: "12px",
              borderRadius: "20px",
            }}
          >
            {item.name || item.title}
          </div>
        ))
      )}
    </>
  );
}
