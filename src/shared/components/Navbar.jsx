import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { supabase } from "../../services/supabase";
import logo from "../../assets/logo/rave-logo.png";
import useMobile from "../../hooks/useMobile";

const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  fontWeight: "500",
};

const mobileLink = {
  color: "#fff",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: "500",
};

export default function Navbar() {
  const isMobile = useMobile();
  const navigate = useNavigate();

  const [showHosting, setShowHosting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initials, setInitials] = useState("?");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);

  function handleCreateEvent() {
    if (userRole === "host" || userRole === "admin") {
      navigate("/create-event");
    } else {
      navigate("/host-verification");
    }
  }

  useEffect(() => {
    async function loadNavbar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("users")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) {
        setInitials(
          profile.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        );
      }

      if (profile?.role === "admin") setIsAdmin(true);
      setUserRole(profile?.role);

      const { count } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("host_id", user.id);

      if (count > 0) setShowHosting(true);
    }

    loadNavbar();
  }, []);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(11,11,12,0.9)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid #232323",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: isMobile ? "14px 16px" : "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link to="/">
          <img
            src={logo}
            alt="RAVE"
            style={{ height: isMobile ? "38px" : "45px" }}
          />
        </Link>

        {isMobile ? (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "28px",
              cursor: "pointer",
            }}
          >
            ☰
          </button>
        ) : (
          <>
            {/* Desktop center links */}
            <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
              <Link to="/" style={linkStyle}>Discover</Link>
              <Link to="/communities" style={linkStyle}>Communities</Link>
              <Link to="/my-tickets" style={linkStyle}>Tickets</Link>
              {showHosting && (
                <Link to="/host-dashboard" style={linkStyle}>Hosting</Link>
              )}
              {isAdmin && (
                <Link to="/admin" style={{ ...linkStyle, color: "#C7FF41" }}>
                  Admin
                </Link>
              )}
            </div>

            {/* Desktop right actions */}
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <button
                onClick={handleCreateEvent}
                style={{
                  background: "#C7FF41",
                  color: "#000",
                  padding: "10px 18px",
                  borderRadius: "999px",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                + Create Event
              </button>

              <Link to="/profile" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "#C7FF41",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#000",
                    fontWeight: "600",
                  }}
                >
                  {initials}
                </div>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div
          style={{
            borderTop: "1px solid #232323",
            background: "#0B0B0C",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <Link to="/" style={mobileLink}>Discover</Link>
          <Link to="/communities" style={mobileLink}>Communities</Link>
          <Link to="/my-tickets" style={mobileLink}>Tickets</Link>
          {showHosting && (
            <Link to="/host-dashboard" style={mobileLink}>Hosting</Link>
          )}
          {isAdmin && (
            <Link to="/admin" style={{ ...mobileLink, color: "#C7FF41" }}>
              Admin
            </Link>
          )}
          <button onClick={handleCreateEvent} style={{ ...mobileLink, color: "#C7FF41", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
            + Create Event
          </button>
          <Link to="/profile" style={mobileLink}>Profile</Link>
        </div>
      )}
    </nav>
  );
}