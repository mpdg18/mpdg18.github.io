import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../../shared/components/Navbar";
import { createEvent } from "../services/eventService";
import { uploadEventImage } from "../services/imageService";
import { saveFeatures } from "../services/featureService";
import { supabase } from "../../../services/supabase";
import { getCommunitiesForDropdown } from "../../communities/services/communityService";

const FEATURE_OPTIONS = [
  "Pool",
  "Alcohol",
  "Food Included",
  "DJ",
  "Snooker",
  "Rooftop",
  "Bonfire",
  "Live Music",
  "Games",
  "BYOB",
];

export default function CreateEvent() {
  const navigate = useNavigate();

  // Verification guard — runs once on mount
  useEffect(() => {
    async function checkAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "host" && profile?.role !== "admin") {
        // Not approved yet — send to verification page
        navigate("/host-verification");
      }
    }

    checkAccess();
  }, [navigate]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [image, setImage] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(true);
  const [minimumAge, setMinimumAge] = useState(0);

  useEffect(() => {
    async function loadCommunities() {
      const { data } = await getCommunitiesForDropdown();
      if (data) setCommunities(data);
    }

    loadCommunities();
  }, []);

  function toggleFeature(feature) {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((item) => item !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      let imageUrl = "";

      if (image) {
        const uploadResult = await uploadEventImage(image);

        if (uploadResult.error) {
          alert(uploadResult.error.message);
          return;
        }

        imageUrl = uploadResult.publicUrl;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await createEvent({
        title,
        description,
        city,
        area,
        minimum_age: minimumAge,
        price: Number(price),
        capacity: Number(capacity),
        cover_image: imageUrl,
        community_id: selectedCommunity || null,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime || null,
        status: "upcoming",
        host_id: user.id,
        is_paid: isPaid,
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (selectedFeatures.length > 0) {
        await saveFeatures(data.id, selectedFeatures);
      }

      alert("Event Created Successfully!");

      setTitle("");
      setDescription("");
      setCity("");
      setArea("");
      setPrice("");
      setCapacity("");
      setImage(null);
      setSelectedFeatures([]);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
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

  return (
    <>
      <Navbar />

      <div
        style={{
          maxWidth: "1200px",
          margin: "40px auto",
          padding: "20px",
        }}
      >
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
            Host an Experience
          </p>

          <h1
            style={{
              fontSize: "clamp(60px, 8vw, 110px)",
              margin: "10px 0",
              lineHeight: "0.95",
            }}
          >
            Create
            <br />
            Event
          </h1>

          <p style={{ color: "#9CA3AF", maxWidth: "600px", margin: "0 auto" }}>
            Create unforgettable experiences for your community.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: "20px" }}>Basic Information</h2>

            <label style={labelStyle}>Event Title</label>
            <input
              type="text"
              placeholder="Event Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ ...inputStyle, marginBottom: "16px" }}
              required
            />

            <label style={labelStyle}>Description</label>
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...inputStyle, minHeight: "140px", resize: "vertical" }}
              required
            />
          </div>

          {/* Location */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: "20px" }}>Location</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label style={labelStyle}>City</label>
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Area</label>
                <input
                  type="text"
                  placeholder="Area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>
          </div>

          {/* Community & Access */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: "20px" }}>Community & Access</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label style={labelStyle}>Community (Optional)</label>
                <select
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select Community</option>
                  {communities.map((community) => (
                    <option key={community.id} value={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Minimum Age</label>
                <select
                  value={minimumAge}
                  onChange={(e) => setMinimumAge(Number(e.target.value))}
                  style={inputStyle}
                >
                  <option value={0}>Everyone</option>
                  <option value={13}>13+</option>
                  <option value={18}>18+</option>
                  <option value={21}>21+</option>
                  <option value={25}>25+</option>
                </select>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: "20px" }}>Date & Time</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label style={labelStyle}>Event Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>End Time (Optional)</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: "20px" }}>Pricing</h2>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
              />
              <span style={{ color: "#9CA3AF" }}>Paid Event</span>
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label style={labelStyle}>Price (₹)</label>
                <input
                  type="number"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Capacity</label>
                <input
                  type="number"
                  placeholder="Capacity"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: "20px" }}>Cover Image</h2>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              style={{ color: "white" }}
            />

            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: "300px",
                  objectFit: "cover",
                  borderRadius: "16px",
                  marginTop: "20px",
                }}
              />
            )}
          </div>

          {/* Features */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: "20px" }}>Party Features</h2>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {FEATURE_OPTIONS.map((feature) => (
                <div
                  key={feature}
                  onClick={() => toggleFeature(feature)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "999px",
                    cursor: "pointer",
                    background: selectedFeatures.includes(feature)
                      ? "#C7FF41"
                      : "#1A1A1A",
                    color: selectedFeatures.includes(feature) ? "#000" : "#fff",
                    border: "1px solid #232323",
                    userSelect: "none",
                  }}
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: "60px",
              border: "none",
              borderRadius: "18px",
              background: "#C7FF41",
              color: "#000",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "18px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating..." : "Publish Event"}
          </button>
        </form>
      </div>
    </>
  );
}