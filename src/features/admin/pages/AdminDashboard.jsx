import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../../shared/components/Navbar";
import { supabase } from "../../../services/supabase";
import {
  getPendingVerifications,
  approveVerification,
  rejectVerification,
} from "../../verification/services/verificationService";

const TABS = ["Overview", "Applications", "Users", "Events", "Payments"];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);

  // Data
  const [stats, setStats] = useState({});
  const [verifications, setVerifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [payments, setPayments] = useState([]);

  // Search
  const [userSearch, setUserSearch] = useState("");
  const [eventSearch, setEventSearch] = useState("");

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) { navigate("/login"); return; }

      const { data: profile } = await supabase
        .from("users").select("role").eq("id", user.id).single();

      if (profile?.role !== "admin") {
        alert("Unauthorized");
        navigate("/");
        return;
      }

      await loadAll();
    }

    init();
  }, [navigate]);

  async function loadAll() {
    setLoading(true);

    const [
      { data: usersData },
      { data: eventsData },
      { data: ticketsData },
      { data: paymentsData },
      { data: verificationsData },
    ] = await Promise.all([
      supabase.from("users").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("*").order("created_at", { ascending: false }),
      supabase.from("tickets").select("id, payment_status"),
      supabase.from("payment_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("host_verifications").select("*").eq("status", "pending"),
    ]);

    setUsers(usersData || []);
    setEvents(eventsData || []);
    setPayments(paymentsData || []);
    setVerifications(verificationsData || []);

    const totalRevenue = (paymentsData || [])
      .filter((p) => p.status === "approved")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    setStats({
      totalUsers: (usersData || []).length,
      totalHosts: (usersData || []).filter((u) => u.role === "host").length,
      totalEvents: (eventsData || []).length,
      activeEvents: (eventsData || []).filter((e) => !e.is_cancelled).length,
      totalTickets: (ticketsData || []).length,
      pendingApplications: (verificationsData || []).length,
      pendingPayments: (paymentsData || []).filter((p) => p.status === "pending").length,
      totalRevenue,
    });

    setLoading(false);
  }

  async function handleApprove(v) {
    await approveVerification(v.id, v.user_id);
    await loadAll();
  }

  async function handleReject(v) {
    await rejectVerification(v.id);
    await loadAll();
  }

  async function handleChangeRole(userId, newRole) {
    await supabase.from("users").update({ role: newRole }).eq("id", userId);
    await loadAll();
  }

  async function handleDeleteUser(userId) {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    await supabase.from("users").delete().eq("id", userId);
    await loadAll();
  }

  async function handleCancelEvent(eventId) {
    if (!window.confirm("Cancel this event?")) return;
    await supabase.from("events").update({ is_cancelled: true }).eq("id", eventId);
    await loadAll();
  }

  async function handleDeleteEvent(eventId) {
    if (!window.confirm("Delete this event permanently?")) return;
    await supabase.from("events").delete().eq("id", eventId);
    await loadAll();
  }

  async function handlePaymentStatus(paymentId, status) {
    await supabase.from("payment_submissions").update({ status }).eq("id", paymentId);
    await loadAll();
  }

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredEvents = events.filter(
    (e) =>
      e.title?.toLowerCase().includes(eventSearch.toLowerCase()) ||
      e.city?.toLowerCase().includes(eventSearch.toLowerCase())
  );

  // Styles
  const card = {
    background: "#141414",
    border: "1px solid #232323",
    borderRadius: "20px",
    padding: "20px",
    marginBottom: "12px",
  };

  const inputStyle = {
    width: "100%",
    background: "#0F0F0F",
    border: "1px solid #232323",
    borderRadius: "12px",
    padding: "12px 16px",
    color: "white",
    boxSizing: "border-box",
    marginBottom: "16px",
  };

  const btnBase = {
    border: "none",
    padding: "8px 14px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  };

  const roleColor = {
    admin: { background: "#2A0A4A", color: "#C084FC" },
    host: { background: "#1E2A00", color: "#C7FF41" },
    guest: { background: "#1A1A1A", color: "#9CA3AF" },
  };

  const tabStyle = (active) => ({
    padding: "10px 20px",
    borderRadius: "999px",
    border: "1px solid #232323",
    background: active ? "#C7FF41" : "#141414",
    color: active ? "#000" : "#fff",
    cursor: "pointer",
    fontWeight: active ? "700" : "400",
    fontSize: "14px",
    whiteSpace: "nowrap",
  });

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "20px" }}>

        {/* Hero */}
        <div style={{ marginBottom: "40px" }}>
          <p style={{ color: "#C7FF41", letterSpacing: "2px", textTransform: "uppercase", fontSize: "14px" }}>
            Admin
          </p>
          <h1 style={{ fontSize: "clamp(50px, 6vw, 90px)", lineHeight: "0.95", margin: "10px 0" }}>
            Dashboard
          </h1>
          <p style={{ color: "#9CA3AF" }}>Full access control panel for RAVE.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "40px", overflowX: "auto", paddingBottom: "4px" }}>
          {TABS.map((tab) => (
            <button key={tab} style={tabStyle(activeTab === tab)} onClick={() => setActiveTab(tab)}>
              {tab}
              {tab === "Applications" && stats.pendingApplications > 0 && (
                <span style={{ marginLeft: "6px", background: "#ff4d4f", color: "#fff", borderRadius: "999px", padding: "2px 7px", fontSize: "11px" }}>
                  {stats.pendingApplications}
                </span>
              )}
              {tab === "Payments" && stats.pendingPayments > 0 && (
                <span style={{ marginLeft: "6px", background: "#FFD166", color: "#000", borderRadius: "999px", padding: "2px 7px", fontSize: "11px" }}>
                  {stats.pendingPayments}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* ── OVERVIEW ── */}
            {activeTab === "Overview" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                  {[
                    { label: "Total Users", value: stats.totalUsers, color: "#fff" },
                    { label: "Hosts", value: stats.totalHosts, color: "#C7FF41" },
                    { label: "Total Events", value: stats.totalEvents, color: "#fff" },
                    { label: "Active Events", value: stats.activeEvents, color: "#C7FF41" },
                    { label: "Tickets Sold", value: stats.totalTickets, color: "#fff" },
                    { label: "Pending Apps", value: stats.pendingApplications, color: "#ff6b6b" },
                    { label: "Pending Payments", value: stats.pendingPayments, color: "#FFD166" },
                    { label: "Total Revenue", value: `₹${stats.totalRevenue}`, color: "#C7FF41" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: "#141414", border: "1px solid #232323", borderRadius: "20px", padding: "24px", textAlign: "center" }}>
                      <h2 style={{ color, margin: "0 0 6px" }}>{value}</h2>
                      <p style={{ color: "#9CA3AF", margin: 0, fontSize: "13px" }}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent users */}
                <h2 style={{ marginBottom: "16px" }}>Recent Users</h2>
                {users.slice(0, 5).map((u) => (
                  <div key={u.id} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <div style={{ fontWeight: "600" }}>{u.full_name}</div>
                      <div style={{ color: "#9CA3AF", fontSize: "13px" }}>{u.email}</div>
                    </div>
                    <div style={{ padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: "600", ...(roleColor[u.role] || roleColor.guest) }}>
                      {u.role}
                    </div>
                  </div>
                ))}

                {/* Recent events */}
                <h2 style={{ marginTop: "40px", marginBottom: "16px" }}>Recent Events</h2>
                {events.slice(0, 5).map((e) => (
                  <div key={e.id} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <div style={{ fontWeight: "600" }}>{e.title}</div>
                      <div style={{ color: "#9CA3AF", fontSize: "13px" }}>📍 {e.city} · 📅 {e.event_date}</div>
                    </div>
                    <div style={{
                      padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: "600",
                      background: e.is_cancelled ? "#4b1d1d" : "#1E2A00",
                      color: e.is_cancelled ? "#ff6b6b" : "#C7FF41",
                    }}>
                      {e.is_cancelled ? "Cancelled" : "Active"}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ── APPLICATIONS ── */}
            {activeTab === "Applications" && (
              <>
                {verifications.length === 0 ? (
                  <div style={{ ...card, textAlign: "center", padding: "60px" }}>
                    <h2>All Clear</h2>
                    <p style={{ color: "#9CA3AF" }}>No pending applications.</p>
                  </div>
                ) : (
                  verifications.map((v) => (
                    <div key={v.id} style={card}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: "0 0 8px" }}>{v.full_name}</h3>
                          <p style={{ color: "#9CA3AF", margin: "4px 0" }}>📞 {v.phone}</p>
                          {v.instagram && <p style={{ color: "#9CA3AF", margin: "4px 0" }}>📸 {v.instagram}</p>}
                          <p style={{ color: "#fff", margin: "12px 0 0", lineHeight: "1.6", background: "#1A1A1A", border: "1px solid #232323", borderRadius: "12px", padding: "12px" }}>
                            {v.reason}
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                          <button onClick={() => handleApprove(v)} style={{ ...btnBase, background: "#C7FF41", color: "#000", padding: "10px 20px" }}>
                            Approve
                          </button>
                          <button onClick={() => handleReject(v)} style={{ ...btnBase, background: "#ff4d4f", color: "#fff", padding: "10px 20px" }}>
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* ── USERS ── */}
            {activeTab === "Users" && (
              <>
                <input
                  style={inputStyle}
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />

                <p style={{ color: "#9CA3AF", marginBottom: "16px", fontSize: "14px" }}>
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
                </p>

                {filteredUsers.map((u) => (
                  <div key={u.id} style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <div style={{ fontWeight: "600", marginBottom: "4px" }}>{u.full_name}</div>
                        <div style={{ color: "#9CA3AF", fontSize: "13px", marginBottom: "4px" }}>{u.email}</div>
                        <div style={{ color: "#9CA3AF", fontSize: "13px" }}>
                          {u.sex && <span style={{ marginRight: "12px" }}>{u.sex}</span>}
                          {u.date_of_birth && <span>DOB: {u.date_of_birth}</span>}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                        {/* Role badge */}
                        <div style={{ padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: "600", ...(roleColor[u.role] || roleColor.guest) }}>
                          {u.role}
                        </div>

                        {/* Role change */}
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, e.target.value)}
                          style={{ background: "#1A1A1A", border: "1px solid #232323", color: "#fff", borderRadius: "999px", padding: "6px 12px", cursor: "pointer", fontSize: "13px" }}
                        >
                          <option value="guest">guest</option>
                          <option value="host">host</option>
                          <option value="admin">admin</option>
                        </select>

                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          style={{ ...btnBase, background: "#ff4d4f", color: "#fff" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ── EVENTS ── */}
            {activeTab === "Events" && (
              <>
                <input
                  style={inputStyle}
                  placeholder="Search by title or city..."
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                />

                <p style={{ color: "#9CA3AF", marginBottom: "16px", fontSize: "14px" }}>
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
                </p>

                {filteredEvents.map((e) => (
                  <div key={e.id} style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <div style={{ fontWeight: "600", marginBottom: "4px" }}>{e.title}</div>
                        <div style={{ color: "#9CA3AF", fontSize: "13px", marginBottom: "4px" }}>
                          📍 {e.area}, {e.city} · 📅 {e.event_date}
                        </div>
                        <div style={{ color: "#9CA3AF", fontSize: "13px" }}>
                          💰 ₹{e.price} · 👥 {e.capacity} capacity
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{
                          padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: "600",
                          background: e.is_cancelled ? "#4b1d1d" : "#1E2A00",
                          color: e.is_cancelled ? "#ff6b6b" : "#C7FF41",
                        }}>
                          {e.is_cancelled ? "Cancelled" : "Active"}
                        </div>

                        <button
                          onClick={() => window.open(`/host-event/${e.id}`, "_blank")}
                          style={{ ...btnBase, background: "#1A1A1A", border: "1px solid #232323", color: "#fff" }}
                        >
                          View
                        </button>

                        {!e.is_cancelled && (
                          <button
                            onClick={() => handleCancelEvent(e.id)}
                            style={{ ...btnBase, background: "#2A1A00", color: "#FFD166", border: "1px solid #FFD166" }}
                          >
                            Cancel
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteEvent(e.id)}
                          style={{ ...btnBase, background: "#ff4d4f", color: "#fff" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ── PAYMENTS ── */}
            {activeTab === "Payments" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                  {[
                    { label: "Total", value: payments.length, color: "#fff" },
                    { label: "Pending", value: payments.filter((p) => p.status === "pending").length, color: "#FFD166" },
                    { label: "Approved", value: payments.filter((p) => p.status === "approved").length, color: "#C7FF41" },
                    { label: "Rejected", value: payments.filter((p) => p.status === "rejected").length, color: "#ff6b6b" },
                    { label: "Revenue", value: `₹${stats.totalRevenue}`, color: "#C7FF41" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: "#141414", border: "1px solid #232323", borderRadius: "20px", padding: "20px", textAlign: "center" }}>
                      <h2 style={{ color, margin: "0 0 6px" }}>{value}</h2>
                      <p style={{ color: "#9CA3AF", margin: 0, fontSize: "13px" }}>{label}</p>
                    </div>
                  ))}
                </div>

                {payments.map((p) => {
                  const statusColor = {
                    pending: { background: "#2A2000", color: "#FFD166" },
                    approved: { background: "#1E2A00", color: "#C7FF41" },
                    rejected: { background: "#4b1d1d", color: "#ff6b6b" },
                  };

                  return (
                    <div key={p.id} style={card}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <div style={{ fontWeight: "600", marginBottom: "4px" }}>₹{p.amount}</div>
                          <div style={{ color: "#9CA3AF", fontSize: "13px", marginBottom: "2px" }}>
                            UTR: <span style={{ color: "#fff", fontFamily: "monospace" }}>{p.utr}</span>
                          </div>
                          <div style={{ color: "#9CA3AF", fontSize: "13px" }}>
                            {new Date(p.created_at).toLocaleString()}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                          <div style={{ padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: "600", ...(statusColor[p.status] || statusColor.pending) }}>
                            {p.status ?? "pending"}
                          </div>

                          {(!p.status || p.status === "pending") && (
                            <>
                              <button
                                onClick={() => handlePaymentStatus(p.id, "approved")}
                                style={{ ...btnBase, background: "#C7FF41", color: "#000" }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handlePaymentStatus(p.id, "rejected")}
                                style={{ ...btnBase, background: "#ff4d4f", color: "#fff" }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}