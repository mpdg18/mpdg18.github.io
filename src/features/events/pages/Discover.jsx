import { useEffect, useState } from "react";

import Navbar from "../../../shared/components/Navbar";
import PageContainer from "../../../shared/components/PageContainer";
import EventCard from "../components/EventCard";
import { getUpcomingEvents, getPastEvents } from "../services/eventService";
import { getJoinedEventIds } from "../services/attendeeService";
import { supabase } from "../../../services/supabase";
import useMobile from "../../../hooks/useMobile";

export default function Discover() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinedEventIds, setJoinedEventIds] = useState(new Set());

  // Use the hook for reactivity — never read window.innerWidth directly
  const isMobile = useMobile();

  useEffect(() => {
    async function loadEvents() {
      const [upcoming, past] = await Promise.all([
        getUpcomingEvents(),
        getPastEvents(),
      ]);

      if (upcoming.data) setUpcomingEvents(upcoming.data);
      if (past.data) setPastEvents(past.data);

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: ids } = await getJoinedEventIds(user.id);
        if (ids) setJoinedEventIds(new Set(ids));
      }

      setLoading(false);
    }

    loadEvents();
  }, []);

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(380px, 1fr))",
    gap: isMobile ? "16px" : "24px",
  };

  return (
    <>
      <Navbar />

      <PageContainer>

        {/* Hero */}
        <div
          style={{
            minHeight: isMobile ? "100svh" : "90vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            padding: isMobile ? "80px 20px 60px" : "0",
          }}
        >
          {/* Glow */}
          <div
            style={{
              position: "absolute",
              width: isMobile ? "340px" : "600px",
              height: isMobile ? "340px" : "600px",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              background: "#C7FF41",
              filter: isMobile ? "blur(100px)" : "blur(220px)",
              opacity: 0.1,
              zIndex: 0,
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
            <p
              style={{
                color: "#C7FF41",
                fontSize: isMobile ? "11px" : "14px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: isMobile ? "20px" : "24px",
              }}
            >
              RAVE Experiences
            </p>

            <h1
              style={{
                fontSize: isMobile ? "clamp(48px, 13vw, 72px)" : "clamp(70px, 10vw, 140px)",
                lineHeight: "0.92",
                margin: 0,
                fontWeight: "800",
                letterSpacing: "-1px",
              }}
            >
              Find Your
              <br />
              Next
              <br />
              Experience
            </h1>

            <p
              style={{
                color: "#9CA3AF",
                maxWidth: isMobile ? "340px" : "600px",
                margin: isMobile ? "28px auto 0" : "32px auto 0",
                fontSize: isMobile ? "16px" : "20px",
                lineHeight: "1.7",
              }}
            >
              Discover parties, communities, networking events
              and unforgettable nights around you.
            </p>

            {/* Scroll CTA */}
            <div
              onClick={() =>
                document.getElementById("events-section")?.scrollIntoView({ behavior: "smooth" })
              }
              style={{
                marginTop: isMobile ? "48px" : "64px",
                cursor: "pointer",
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                color: "#9CA3AF",
                userSelect: "none",
              }}
            >
              <span style={{ fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase" }}>
                Scroll to Explore
              </span>
              <span
                style={{
                  fontSize: "28px",
                  animation: "bounce 1.6s infinite",
                }}
              >
                ↓
              </span>
            </div>
          </div>
        </div>

        {/* Bounce animation */}
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(6px); }
          }
        `}</style>

        {/* Events */}
        {loading ? (
          <p style={{ textAlign: "center", padding: "40px 0" }}>Loading events...</p>
        ) : (
          <div id="events-section" style={{ paddingBottom: "60px" }}>

            <h2
              style={{
                fontSize: isMobile ? "28px" : "42px",
                marginTop: isMobile ? "60px" : "100px",
                marginBottom: isMobile ? "20px" : "30px",
              }}
            >
              Upcoming Events
            </h2>

            {upcomingEvents.length === 0 ? (
              <p style={{ color: "#9CA3AF" }}>No upcoming events.</p>
            ) : (
              <div style={gridStyle}>
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isJoined={joinedEventIds.has(event.id)}
                  />
                ))}
              </div>
            )}

            <h2
              style={{
                fontSize: isMobile ? "24px" : "36px",
                color: "#9CA3AF",
                marginTop: isMobile ? "50px" : "70px",
                marginBottom: isMobile ? "16px" : "24px",
              }}
            >
              Past Events
            </h2>

            {pastEvents.length === 0 ? (
              <p style={{ color: "#9CA3AF" }}>No past events.</p>
            ) : (
              <div style={gridStyle}>
                {pastEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isJoined={joinedEventIds.has(event.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </>
  );
}