import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Navbar from "../../../shared/components/Navbar";
import { supabase } from "../../../services/supabase";
import { getEventById } from "../../events/services/eventService";
import { getEventTickets } from "../../tickets/services/ticketService";

function calculateAge(dob) {
  if (!dob) return "N/A";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

export default function EventAttendees() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all"); // "all" | "checkedin" | "pending"

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const eventResult = await getEventById(id);

      if (!eventResult.data) {
        alert("Event not found");
        navigate("/host-dashboard");
        return;
      }

      if (eventResult.data.host_id !== user?.id) {
        alert("Unauthorized");
        navigate("/");
        return;
      }

      setEvent(eventResult.data);

      // Tickets are source of truth — fetch plain tickets then enrich with user data
      const ticketResult = await getEventTickets(id);

      if (ticketResult.data && ticketResult.data.length > 0) {
        const userIds = [...new Set(ticketResult.data.map((t) => t.user_id))];

        const { data: usersData } = await supabase
          .from("users")
          .select("id, full_name, email, sex, date_of_birth")
          .in("id", userIds);

        const usersMap = {};
        if (usersData) usersData.forEach((u) => (usersMap[u.id] = u));

        const enriched = ticketResult.data.map((t) => ({
          ...t,
          users: usersMap[t.user_id] || null,
        }));

        setTickets(enriched);
      }

      setLoading(false);
    }

    load();
  }, [id, navigate]);

  const checkedInTickets = tickets.filter((t) => t.checked_in);
  const pendingTickets = tickets.filter((t) => !t.checked_in);

  const filteredTickets =
    tab === "checkedin" ? checkedInTickets
    : tab === "pending" ? pendingTickets
    : tickets;

  const pillStyle = {
    background: "#1A1A1A",
    border: "1px solid #232323",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "13px",
  };

  const tabStyle = (active) => ({
    padding: "10px 20px",
    borderRadius: "999px",
    border: "1px solid #232323",
    background: active ? "#C7FF41" : "#141414",
    color: active ? "#000" : "#fff",
    cursor: "pointer",
    fontWeight: active ? "700" : "400",
  });

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "20px" }}>

        {/* Hero */}
        <div style={{ marginBottom: "50px" }}>
          <p style={{ color: "#C7FF41", letterSpacing: "2px", textTransform: "uppercase", fontSize: "14px" }}>
            Host · Attendees
          </p>

          <h1 style={{ fontSize: "clamp(48px, 6vw, 80px)", lineHeight: "0.95", margin: "10px 0" }}>
            {loading ? "Loading..." : event?.title}
          </h1>

          {event && (
            <p style={{ color: "#9CA3AF" }}>
              {event.event_date} · {event.city}
            </p>
          )}
        </div>

        {!loading && (
          <>
            {/* Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
                marginBottom: "40px",
              }}
            >
              {[
                { label: "Total Tickets", value: tickets.length, color: "#fff" },
                { label: "Checked In", value: checkedInTickets.length, color: "#C7FF41" },
                { label: "Not Yet", value: pendingTickets.length, color: "#9CA3AF" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  style={{
                    background: "#141414",
                    border: "1px solid #232323",
                    borderRadius: "20px",
                    padding: "24px",
                    textAlign: "center",
                  }}
                >
                  <h2 style={{ color, margin: "0 0 6px" }}>{value}</h2>
                  <p style={{ color: "#9CA3AF", margin: 0, fontSize: "14px" }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "30px", flexWrap: "wrap" }}>
              <button style={tabStyle(tab === "all")} onClick={() => setTab("all")}>
                All ({tickets.length})
              </button>
              <button style={tabStyle(tab === "checkedin")} onClick={() => setTab("checkedin")}>
                ✓ Checked In ({checkedInTickets.length})
              </button>
              <button style={tabStyle(tab === "pending")} onClick={() => setTab("pending")}>
                Not Yet ({pendingTickets.length})
              </button>
            </div>

            {/* Ticket / Attendee List */}
            {filteredTickets.length === 0 ? (
              <p style={{ color: "#9CA3AF" }}>No attendees in this category.</p>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  style={{
                    background: "#141414",
                    border: `1px solid ${ticket.checked_in ? "#2a3d00" : "#232323"}`,
                    borderRadius: "20px",
                    padding: "20px",
                    marginBottom: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 4px" }}>{ticket.users?.full_name}</h3>
                    <p style={{ color: "#9CA3AF", margin: "0 0 10px", fontSize: "14px" }}>
                      {ticket.users?.email}
                    </p>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <div style={pillStyle}>{ticket.users?.sex}</div>
                      <div style={pillStyle}>
                        {calculateAge(ticket.users?.date_of_birth)} yrs
                      </div>
                      <div style={pillStyle}>
                        {ticket.payment_status === "paid" ? "✓ Paid" : ticket.payment_status}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "8px 16px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: "600",
                      background: ticket.checked_in ? "#1E2A00" : "#1A1A1A",
                      color: ticket.checked_in ? "#C7FF41" : "#9CA3AF",
                      border: `1px solid ${ticket.checked_in ? "#C7FF41" : "#232323"}`,
                    }}
                  >
                    {ticket.checked_in ? "✓ Checked In" : "Not Yet"}
                  </div>
                </div>
              ))
            )}

            {/* Back button */}
            <button
              onClick={() => navigate(`/host-event/${id}`)}
              style={{
                marginTop: "40px",
                width: "100%",
                height: "52px",
                background: "#141414",
                border: "1px solid #232323",
                borderRadius: "16px",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              ← Back to Event
            </button>
          </>
        )}
      </div>
    </>
  );
}