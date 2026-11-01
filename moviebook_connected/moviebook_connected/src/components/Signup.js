
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../api";

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const showPopup = (type, title, message) => {
    setPopup({
      show: true,
      type,
      title,
      message,
    });
  };

  const closePopup = () => {
    setPopup({
      show: false,
      type: "success",
      title: "",
      message: "",
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.trim();
    const cleanAddress = address.trim();

    if (!cleanName) {
      showPopup(
        "error",
        "Name Required",
        "Please enter your name."
      );
      return;
    }

    if (!cleanEmail) {
      showPopup(
        "error",
        "Email Required",
        "Please enter your email."
      );
      return;
    }

    if (!cleanMobile) {
      showPopup(
        "error",
        "Mobile Required",
        "Please enter your mobile number."
      );
      return;
    }

    if (!/^[0-9]{10}$/.test(cleanMobile)) {
      showPopup(
        "error",
        "Invalid Mobile",
        "Mobile number must contain exactly 10 digits."
      );
      return;
    }

    if (!cleanAddress) {
      showPopup(
        "error",
        "Address Required",
        "Please enter your address."
      );
      return;
    }

    if (!password) {
      showPopup(
        "error",
        "Password Required",
        "Please enter your password."
      );
      return;
    }

    if (password.length < 6) {
      showPopup(
        "error",
        "Weak Password",
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (!confirmPassword) {
      showPopup(
        "error",
        "Confirm Password",
        "Please confirm your password."
      );
      return;
    }

    if (password !== confirmPassword) {
      showPopup(
        "error",
        "Password Error",
        "Password and confirm password do not match."
      );
      return;
    }

    try {
      await signupUser({
        name: cleanName,
        email: cleanEmail,
        mobile: cleanMobile,
        address: cleanAddress,
        password,
      });

      // Save email for automatic login-page filling
      localStorage.setItem(
        "signupEmail",
        cleanEmail
      );

      showPopup(
        "success",
        "Signup Successful",
        "Your account has been created successfully."
      );

      setName("");
      setEmail("");
      setMobile("");
      setAddress("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/Login");
      }, 1200);

    } catch (error) {
      console.error("Signup Error:", error);

      showPopup(
        "error",
        "Signup Failed",
        error.message || "Something went wrong."
      );
    }
  };

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        .signup-page {
          min-height: 100vh;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 30px 20px;

          background:
            linear-gradient(
              135deg,
              #dbeafe,
              #eff6ff
            );

          font-family: Arial, sans-serif;
        }

        .signup-container {
          width: 100%;
          max-width: 900px;

          min-height: 570px;

          display: grid;

          grid-template-columns: 1fr 1fr;

          background: white;

          border-radius: 12px;

          overflow: hidden;

          box-shadow:
            0 12px 35px
            rgba(0, 0, 0, 0.16);
        }

        .signup-form-section {
          padding: 35px 42px;

          display: flex;
          flex-direction: column;
          justify-content: center;

          background: white;
        }

        .signup-brand {
          text-align: center;

          font-size: 28px;

          font-weight: 800;

          color: #111827;

          margin-bottom: 5px;
        }

        .signup-heading {
          text-align: center;

          font-size: 24px;

          color: #111827;

          margin:
            5px 0 8px;
        }

        .signup-subtitle {
          text-align: center;

          color: #6b7280;

          font-size: 14px;

          margin-bottom: 25px;
        }

        .signup-input-group {
          margin-bottom: 14px;
        }

        .signup-input-group label {
          display: block;

          font-size: 13px;

          font-weight: 700;

          color: #374151;

          margin-bottom: 6px;
        }

        .signup-input-group input,
        .signup-input-group textarea {
          width: 100%;

          border:
            1px solid #d1d5db;

          border-radius: 6px;

          padding:
            10px 12px;

          font-size: 13px;

          color: #111827;

          outline: none;

          background: white;

          transition: .2s;
        }

        .signup-input-group input {
          height: 40px;
        }

        .signup-input-group textarea {
          min-height: 55px;

          resize: none;

          font-family: Arial, sans-serif;
        }

        .signup-input-group input::placeholder,
        .signup-input-group textarea::placeholder {
          color: #a1a1aa;
        }

        .signup-input-group input:focus,
        .signup-input-group textarea:focus {
          border-color: #147df5;

          box-shadow:
            0 0 0 3px
            rgba(20, 125, 245, .10);
        }

        .signup-row {
          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 12px;
        }

        .signup-submit {
          width: 100%;

          height: 42px;

          margin-top: 5px;

          border: none;

          border-radius: 6px;

          background:
            linear-gradient(
              90deg,
              #087ff5,
              #1677e8
            );

          color: white;

          font-size: 15px;

          font-weight: 700;

          cursor: pointer;

          transition: .2s;
        }

        .signup-submit:hover {
          background:
            linear-gradient(
              90deg,
              #066bd0,
              #1267ca
            );

          transform: translateY(-1px);
        }

        .signup-login {
          text-align: center;

          margin-top: 16px;

          font-size: 13px;

          color: #6b7280;
        }

        .signup-login a {
          color: #087ff5;

          font-weight: 700;

          text-decoration: none;
        }

        .signup-login a:hover {
          text-decoration: underline;
        }

        .signup-image-section {
          position: relative;

          min-height: 570px;

          background:
            linear-gradient(
              rgba(3, 15, 30, .25),
              rgba(3, 15, 30, .60)
            ),
            url("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1000")
            center / cover no-repeat;

          display: flex;

          align-items: flex-end;

          padding: 35px;
        }

        .signup-image-overlay {
          color: white;

          width: 100%;
        }

        .signup-image-overlay h2 {
          font-size: 31px;

          line-height: 1.1;

          margin: 0 0 10px;

          text-shadow:
            0 2px 8px
            rgba(0,0,0,.5);
        }

        .signup-image-overlay p {
          font-size: 15px;

          line-height: 1.5;

          margin: 0;

          color: #f3f4f6;
        }

        /* POPUP */

        .signup-popup-overlay {
          position: fixed;

          inset: 0;

          background:
            rgba(0, 0, 0, .55);

          display: flex;

          align-items: center;
          justify-content: center;

          z-index: 99999;

          padding: 20px;
        }

        .signup-popup {
          width: 90%;

          max-width: 380px;

          background: white;

          padding: 30px;

          border-radius: 15px;

          text-align: center;

          box-shadow:
            0 15px 45px
            rgba(0,0,0,.3);

          animation:
            popupIn .2s ease;
        }

        @keyframes popupIn {
          from {
            opacity: 0;
            transform: scale(.9);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .signup-popup-icon {
          width: 65px;
          height: 65px;

          margin: 0 auto 15px;

          border-radius: 50%;

          display: flex;

          align-items: center;
          justify-content: center;

          color: white;

          font-size: 38px;

          font-weight: bold;
        }

        .signup-popup-success {
          background: #22c55e;
        }

        .signup-popup-error {
          background: #ef4444;
        }

        .signup-popup h2 {
          margin:
            5px 0 10px;

          color: #111827;
        }

        .signup-popup p {
          color: #6b7280;

          line-height: 1.5;

          margin: 0;
        }

        .signup-popup button {
          margin-top: 18px;

          padding:
            10px 28px;

          border: none;

          border-radius: 6px;

          background: #111827;

          color: white;

          font-weight: bold;

          cursor: pointer;
        }

        @media (max-width: 800px) {

          .signup-container {
            max-width: 520px;

            grid-template-columns: 1fr;
          }

          .signup-image-section {
            display: none;
          }

          .signup-form-section {
            padding: 35px;
          }

        }

        @media (max-width: 520px) {

          .signup-page {
            padding: 20px 12px;
          }

          .signup-form-section {
            padding: 28px 20px;
          }

          .signup-brand {
            font-size: 25px;
          }

          .signup-heading {
            font-size: 22px;
          }

          .signup-row {
            grid-template-columns: 1fr;

            gap: 0;
          }

        }

      `}</style>

      <div className="signup-page">

        <div className="signup-container">

          {/* LEFT FORM */}

          <div className="signup-form-section">

            <div className="signup-brand">
              🎬 MovieBook
            </div>

            <h1 className="signup-heading">
              Create Account
            </h1>

            <p className="signup-subtitle">
              Sign up to book your favourite movies
            </p>

            <form onSubmit={handleSignup}>

              {/* NAME + EMAIL */}

              <div className="signup-row">

                <div className="signup-input-group">

                  <label>Name</label>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                  />

                </div>

                <div className="signup-input-group">

                  <label>Email</label>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                  />

                </div>

              </div>

              {/* MOBILE */}

              <div className="signup-input-group">

                <label>Mobile Number</label>

                <input
                  type="tel"
                  placeholder="Enter 10 digit mobile number"
                  value={mobile}
                  maxLength="10"
                  inputMode="numeric"
                  onChange={(e) => {
                    const value =
                      e.target.value.replace(
                        /[^0-9]/g,
                        ""
                      );

                    setMobile(value);
                  }}
                />

              </div>

              {/* ADDRESS */}

              <div className="signup-input-group">

                <label>Address</label>

                <textarea
                  placeholder="Enter your address"
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                />

              </div>

              {/* PASSWORD */}

              <div className="signup-row">

                <div className="signup-input-group">

                  <label>Password</label>

                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                  />

                </div>

                <div className="signup-input-group">

                  <label>Confirm Password</label>

                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                  />

                </div>

              </div>

              <button
                type="submit"
                className="signup-submit"
              >
                Create Account
              </button>

            </form>

            <div className="signup-login">

              Already have an account?{" "}

              <Link to="/Login">
                Login
              </Link>

            </div>

          </div>

          {/* RIGHT IMAGE */}

          <div className="signup-image-section">

            <div className="signup-image-overlay">

              <h2>
                Your Next Movie
                <br />
                Experience Awaits
              </h2>

              <p>
                Create your MovieBook account
                and start booking your favourite
                movies and theatres.
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* POPUP */}

      {popup.show && (

        <div className="signup-popup-overlay">

          <div className="signup-popup">

            <div
              className={`
                signup-popup-icon
                ${
                  popup.type === "success"
                    ? "signup-popup-success"
                    : "signup-popup-error"
                }
              `}
            >
              {popup.type === "success"
                ? "✓"
                : "!"}
            </div>

            <h2>
              {popup.title}
            </h2>

            <p>
              {popup.message}
            </p>

            {popup.type === "error" && (

              <button onClick={closePopup}>
                OK
              </button>

            )}

          </div>

        </div>

      )}

    </>
  );
};

export default Signup;
