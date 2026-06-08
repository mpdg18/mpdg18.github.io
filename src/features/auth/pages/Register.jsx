import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { signUp } from "../services/authService";
import { supabase } from "../../../services/supabase";

import logo from "../../../assets/logo/rave-logo.png";

import useMobile from "../../../hooks/useMobile";

export default function Register() {
  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [sex, setSex] =
    useState("");

  const [
    dateOfBirth,
    setDateOfBirth,
  ] = useState("");

  const navigate =
    useNavigate();

  const isMobile =
    useMobile();

  async function handleRegister(e) {
    e.preventDefault();

    if (!fullName.trim()) {
      alert(
        "Full Name is required"
      );
      return;
    }

    if (!email.trim()) {
      alert(
        "Email is required"
      );
      return;
    }

    if (password.length < 6) {
      alert(
        "Password must be at least 6 characters"
      );
      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      alert(
        "Passwords do not match"
      );
      return;
    }

    const {
      data,
      error,
    } = await signUp(
      email,
      password
    );

    if (error) {
      alert(
        error.message
      );
      return;
    }

    if (data?.user) {
      const {
        error:
          profileError,
      } = await supabase
        .from("users")
        .insert([
          {
            id:
              data.user.id,

            full_name:
              fullName,

            email:
              data.user.email,

            sex,

            date_of_birth:
              dateOfBirth,

            role:
              "guest",

            reputation: 0,
          },
        ]);

      if (
        profileError
      ) {
        console.error(
          profileError
        );

        await supabase.auth.signOut();

        alert(
          "Registration failed: " +
            profileError.message
        );

        return;
      }
    }

    alert(
      "Registration successful!"
    );

    navigate("/");
  }

  const inputStyle = {
    width: "100%",

    background:
      "#0F0F0F",

    border:
      "1px solid #232323",

    borderRadius:
      "14px",

    padding:
      "14px 16px",

    color:
      "white",

    marginBottom:
      "16px",

    boxSizing:
      "border-box",
  };

  return (
    <div
      style={{
        minHeight:
          "100vh",

        display:
          "flex",

        flexDirection:
          isMobile
            ? "column"
            : "row",

        background:
          "#0B0B0C",
      }}
    >
      {/* Left Panel */}

      <div
        style={{
          flex: 1,

          display:
            "flex",

          flexDirection:
            "column",

          justifyContent:
            "center",

          padding:
            isMobile
              ? "40px 24px"
              : "80px",

          position:
            "relative",

          overflow:
            "hidden",
        }}
      >
        <div
          style={{
            position:
              "absolute",

            width:
              isMobile
                ? "250px"
                : "500px",

            height:
              isMobile
                ? "250px"
                : "500px",

            background:
              "#C7FF41",

            filter:
              "blur(180px)",

            opacity:
              0.08,
          }}
        />

        <img
          src={logo}
          alt="RAVE"
          style={{
            width:
              isMobile
                ? "180px"
                : "300px",

            marginBottom:
              "30px",

            position:
              "relative",
          }}
        />

        <h1
          style={{
            fontSize:
              isMobile
                ? "48px"
                : "72px",

            lineHeight:
              "0.95",

            margin: 0,

            position:
              "relative",
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
            color:
              "#9CA3AF",

            maxWidth:
              "500px",

            marginTop:
              "30px",

            lineHeight:
              "1.8",

            fontSize:
              isMobile
                ? "15px"
                : "16px",

            position:
              "relative",
          }}
        >
          Join
          communities,
          discover
          events and
          create
          unforgettable
          experiences.
        </p>
      </div>

      {/* Right Panel */}

      <div
        style={{
          width:
            isMobile
              ? "100%"
              : "520px",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          padding:
            isMobile
              ? "20px"
              : "40px",
        }}
      >
        <div
          style={{
            width:
              "100%",

            background:
              "#141414",

            border:
              "1px solid #232323",

            borderRadius:
              isMobile
                ? "24px"
                : "32px",

            padding:
              isMobile
                ? "24px"
                : "40px",
          }}
        >
          <h2
            style={{
              fontSize:
                isMobile
                  ? "30px"
                  : "36px",

              marginBottom:
                "10px",
            }}
          >
            Join RAVE
          </h2>

          <p
            style={{
              color:
                "#9CA3AF",

              marginBottom:
                "30px",
            }}
          >
            Create your
            account
          </p>

          <form
            onSubmit={
              handleRegister
            }
          >
            <input
              type="text"
              placeholder="Full Name"
              value={
                fullName
              }
              onChange={(
                e
              ) =>
                setFullName(
                  e.target
                    .value
                )
              }
              style={
                inputStyle
              }
            />

            <select
              value={sex}
              onChange={(
                e
              ) =>
                setSex(
                  e.target
                    .value
                )
              }
              style={
                inputStyle
              }
            >
              <option value="">
                Select Sex
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Gay">
                Gay
              </option>

              <option value="Lesbian">
                Lesbian
              </option>

              <option value="Bisexual">
                Bisexual
              </option>

              <option value="Transgender">
                Transgender
              </option>

              <option value="Other">
                Other
              </option>

              <option value="Prefer Not To Say">
                Prefer Not To Say
              </option>
            </select>

            <input
              type="date"
              placeholder="Date of Birth"
              value={
                dateOfBirth
              }
              onChange={(
                e
              ) =>
                setDateOfBirth(
                  e.target
                    .value
                )
              }
              style={
                inputStyle
              }
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(
                e
              ) =>
                setEmail(
                  e.target
                    .value
                )
              }
              style={
                inputStyle
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={
                password
              }
              onChange={(
                e
              ) =>
                setPassword(
                  e.target
                    .value
                )
              }
              style={
                inputStyle
              }
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={
                confirmPassword
              }
              onChange={(
                e
              ) =>
                setConfirmPassword(
                  e.target
                    .value
                )
              }
              style={
                inputStyle
              }
            />

            <button
              type="submit"
              style={{
                width:
                  "100%",

                height:
                  "56px",

                border:
                  "none",

                borderRadius:
                  "16px",

                background:
                  "#C7FF41",

                color:
                  "#000",

                fontWeight:
                  "700",

                cursor:
                  "pointer",

                marginTop:
                  "10px",
              }}
            >
              Create
              Account
            </button>
          </form>

          <p
            style={{
              textAlign:
                "center",

              marginTop:
                "20px",

              color:
                "#9CA3AF",

              fontSize:
                isMobile
                  ? "14px"
                  : "16px",
            }}
          >
            Already
            have an
            account?{" "}
            <Link
              to="/login"
              style={{
                color:
                  "#C7FF41",
              }}
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}