
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    loginUser,
    sendOTP,
    verifyOTP,
    requestPasswordReset,
    verifyPasswordResetOTP,
    resetPassword as resetPasswordApi
} from "../api";


const Login = () => {

    const navigate = useNavigate();


    // ======================================================
    // LOGIN MODE
    // ======================================================

    const [loginMode, setLoginMode] =
        useState("password");


    // ======================================================
    // EMAIL
    // ======================================================

    const [email, setEmail] = useState(
        localStorage.getItem("signupEmail") || ""
    );


    // ======================================================
    // PASSWORD
    // ======================================================

    const [password, setPassword] =
        useState("");


    // ======================================================
    // OTP
    // ======================================================

    const [otp, setOtp] =
        useState("");

    const [otpSent, setOtpSent] =
        useState(false);

    const [otpLoading, setOtpLoading] =
        useState(false);

    const [recoveryStage, setRecoveryStage] =
        useState("email");

    const [resetToken, setResetToken] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmNewPassword, setConfirmNewPassword] =
        useState("");


    // ======================================================
    // LOGIN LOADING
    // ======================================================

    const [loginLoading, setLoginLoading] =
        useState(false);


    // ======================================================
    // REMEMBER ME
    // ======================================================

    const [rememberMe, setRememberMe] =
        useState(false);


    // ======================================================
    // POPUP
    // ======================================================

    const [popup, setPopup] = useState({
        show: false,
        type: "success",
        title: "",
        message: ""
    });


    // ======================================================
    // SHOW POPUP
    // ======================================================

    const showPopup = (
        type,
        title,
        message
    ) => {

        setPopup({
            show: true,
            type,
            title,
            message
        });
    };


    // ======================================================
    // CLOSE POPUP
    // ======================================================

    const closePopup = () => {

        setPopup({
            show: false,
            type: "success",
            title: "",
            message: ""
        });
    };


    // ======================================================
    // LOGIN SUCCESS
    // ======================================================

    const handleLoginSuccess = (data) => {

        const user = data.user;


        // =========================
        // SAVE JWT
        // =========================

        localStorage.setItem(
            "token",
            data.token
        );


        // =========================
        // SAVE USER
        // =========================

        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(user)
        );


        // =========================
        // REMOVE SIGNUP EMAIL
        // =========================

        localStorage.removeItem(
            "signupEmail"
        );


        // =========================
        // REMEMBER ME
        // =========================

        if (rememberMe) {

            localStorage.setItem(
                "rememberMe",
                "true"
            );

        } else {

            localStorage.removeItem(
                "rememberMe"
            );
        }


        // =========================
        // HEADER UPDATE
        // =========================

        window.dispatchEvent(
            new Event("userLogin")
        );


        // =========================
        // SUCCESS POPUP
        // =========================

        showPopup(
            "success",
            "Login Successful",
            `Welcome ${user.name}!`
        );


        // =========================
        // REDIRECT
        // =========================

        setTimeout(() => {

            const redirectPage =
                localStorage.getItem(
                    "redirectAfterLogin"
                );


            if (redirectPage) {

                localStorage.removeItem(
                    "redirectAfterLogin"
                );

                navigate(
                    redirectPage
                );

            } else if (
                user.role === "admin"
            ) {

                navigate(
                    "/AdminPanel"
                );

            } else {

                navigate(
                    "/Movies"
                );
            }

        }, 1000);
    };


    // ======================================================
    // PASSWORD LOGIN
    // ======================================================

    const handleLogin = async (e) => {

        e.preventDefault();


        const cleanEmail =
            email.trim().toLowerCase();


        // =========================
        // EMAIL VALIDATION
        // =========================

        if (!cleanEmail) {

            showPopup(
                "error",
                "Email Required",
                "Please enter your email."
            );

            return;
        }


        // =========================
        // PASSWORD VALIDATION
        // =========================

        if (!password) {

            showPopup(
                "error",
                "Password Required",
                "Please enter your password."
            );

            return;
        }


        try {

            setLoginLoading(true);


            const data =
                await loginUser({
                    email: cleanEmail,
                    password
                });


            handleLoginSuccess(data);


        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            showPopup(
                "error",
                "Login Failed",
                error.message ||
                "Invalid email or password."
            );


        } finally {

            setLoginLoading(false);

        }
    };


    // ======================================================
    // SEND OTP
    // ======================================================

    const handleSendOTP = async () => {

        const cleanEmail =
            email.trim().toLowerCase();


        // =========================
        // EMAIL VALIDATION
        // =========================

        if (!cleanEmail) {

            showPopup(
                "error",
                "Email Required",
                "Please enter your email first."
            );

            return;
        }


        // =========================
        // EMAIL FORMAT
        // =========================

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailPattern.test(cleanEmail)) {

            showPopup(
                "error",
                "Invalid Email",
                "Please enter a valid email address."
            );

            return;
        }


        try {

            setOtpLoading(true);


            // =========================
            // SEND OTP
            // =========================

            await sendOTP(cleanEmail);


            // =========================
            // OTP SENT
            // =========================

            setOtpSent(true);

            setOtp("");


            // =========================
            // SUCCESS POPUP
            // =========================

            showPopup(
                "success",
                "OTP Sent",
                "OTP has been sent to your email. Please check your inbox."
            );


            // =========================
            // AUTO CLOSE POPUP
            // =========================

            setTimeout(() => {

                setPopup(prev => ({
                    ...prev,
                    show: false
                }));

            }, 2000);


        } catch (error) {

            console.error(
                "SEND OTP ERROR:",
                error
            );

            showPopup(
                "error",
                "OTP Failed",
                error.message ||
                "Failed to send OTP."
            );


        } finally {

            setOtpLoading(false);

        }
    };


    // ======================================================
    // VERIFY OTP
    // ======================================================

    const handleVerifyOTP = async (e) => {

        e.preventDefault();


        const cleanEmail =
            email.trim().toLowerCase();

        const cleanOTP =
            otp.trim();


        // =========================
        // EMAIL
        // =========================

        if (!cleanEmail) {

            showPopup(
                "error",
                "Email Required",
                "Please enter your email."
            );

            return;
        }


        // =========================
        // OTP
        // =========================

        if (!cleanOTP) {

            showPopup(
                "error",
                "OTP Required",
                "Please enter the OTP."
            );

            return;
        }


        // =========================
        // OTP FORMAT
        // =========================

        if (
            !/^[0-9]{6}$/.test(cleanOTP)
        ) {

            showPopup(
                "error",
                "Invalid OTP",
                "OTP must contain exactly 6 digits."
            );

            return;
        }


        try {

            setOtpLoading(true);


            const data =
                await verifyOTP(
                    cleanEmail,
                    cleanOTP
                );


            handleLoginSuccess(data);


        } catch (error) {

            console.error(
                "VERIFY OTP ERROR:",
                error
            );

            showPopup(
                "error",
                "OTP Verification Failed",
                error.message ||
                "Invalid or expired OTP."
            );


        } finally {

            setOtpLoading(false);

        }
    };


    const handleOTPFormSubmit = (e) => {

        e.preventDefault();

        if (!otpSent) {
            handleSendOTP();
            return;
        }

        handleVerifyOTP(e);
    };


    const startPasswordReset = () => {
        setLoginMode("forgot");
        setRecoveryStage("email");
        setOtp("");
        setResetToken("");
        setNewPassword("");
        setConfirmNewPassword("");
        closePopup();
    };


    const handleRequestPasswordReset = async (e) => {
        e.preventDefault();

        const cleanEmail = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            showPopup("error", "Invalid Email", "Please enter a valid email address.");
            return;
        }

        try {
            setOtpLoading(true);
            await requestPasswordReset(cleanEmail);
            setEmail(cleanEmail);
            setOtp("");
            setRecoveryStage("otp");
            showPopup(
                "success",
                "Reset Code Sent",
                "A password reset code has been sent to your email."
            );
        } catch (error) {
            showPopup(
                "error",
                "Unable to Send Code",
                error.message || "Please check your email and try again."
            );
        } finally {
            setOtpLoading(false);
        }
    };


    const handleVerifyPasswordResetOTP = async (e) => {
        e.preventDefault();

        const cleanOTP = otp.trim();
        if (!/^[0-9]{6}$/.test(cleanOTP)) {
            showPopup("error", "Invalid OTP", "Enter the 6-digit code sent to your email.");
            return;
        }

        try {
            setOtpLoading(true);
            const data = await verifyPasswordResetOTP(
                email.trim().toLowerCase(),
                cleanOTP
            );
            setResetToken(data.resetToken);
            setOtp("");
            setRecoveryStage("password");
            closePopup();
        } catch (error) {
            showPopup(
                "error",
                "Code Verification Failed",
                error.message || "The code is invalid or expired."
            );
        } finally {
            setOtpLoading(false);
        }
    };


    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            showPopup("error", "Password Too Short", "Password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showPopup("error", "Passwords Do Not Match", "Enter the same password in both fields.");
            return;
        }

        try {
            setOtpLoading(true);
            await resetPasswordApi(resetToken, newPassword);
            setLoginMode("password");
            setRecoveryStage("email");
            setResetToken("");
            setNewPassword("");
            setConfirmNewPassword("");
            setPassword("");
            showPopup("success", "Password Updated", "Your password was updated. You can now log in.");
        } catch (error) {
            showPopup(
                "error",
                "Password Reset Failed",
                error.message || "Please request a new password reset code."
            );
        } finally {
            setOtpLoading(false);
        }
    };


    // ======================================================
    // CHANGE LOGIN MODE
    // ======================================================

    const changeLoginMode = (mode) => {

        setLoginMode(mode);

        setOtpSent(false);

        setOtp("");

        closePopup();
    };


    // ======================================================
    // UI
    // ======================================================

    return (
        <>
            <style>{`

                * {
                    box-sizing: border-box;
                }


                .login-page {
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

                    font-family:
                        Arial,
                        sans-serif;
                }


                .login-container {
                    width: 100%;

                    max-width: 850px;

                    min-height: 500px;

                    display: grid;

                    grid-template-columns:
                        1fr 1fr;

                    background: white;

                    border-radius: 12px;

                    overflow: hidden;

                    box-shadow:
                        0 12px 35px
                        rgba(0, 0, 0, .16);
                }


                /* =========================
                   LEFT
                ========================= */

                .login-left {
                    background: white;

                    padding: 40px;

                    display: flex;

                    flex-direction: column;

                    justify-content: center;
                }


                .login-brand {
                    text-align: center;

                    font-size: 28px;

                    font-weight: 800;

                    color: #111827;

                    margin-bottom: 5px;
                }


                .login-heading {
                    text-align: center;

                    font-size: 24px;

                    color: #111827;

                    margin:
                        5px 0 8px;
                }


                .login-subheading {
                    text-align: center;

                    color: #6b7280;

                    font-size: 14px;

                    margin-bottom: 25px;
                }


                /* =========================
                   MODE BUTTONS
                ========================= */

                .mode-buttons {
                    display: grid;

                    grid-template-columns:
                        1fr 1fr;

                    gap: 8px;

                    margin-bottom: 20px;
                }


                .mode-btn {
                    height: 38px;

                    border:
                        1px solid #d1d5db;

                    background: white;

                    color: #64748b;

                    border-radius: 6px;

                    font-size: 13px;

                    font-weight: 700;

                    cursor: pointer;

                    transition: .2s;
                }


                .mode-btn.active {
                    background: #087ff5;

                    color: white;

                    border-color: #087ff5;
                }


                .mode-btn:hover {
                    border-color: #087ff5;
                }


                /* =========================
                   INPUT
                ========================= */

                .input-group {
                    margin-bottom: 17px;
                }


                .input-group label {
                    display: block;

                    margin-bottom: 6px;

                    font-size: 13px;

                    font-weight: 700;

                    color: #374151;
                }


                .input-group input {
                    width: 100%;

                    height: 42px;

                    padding:
                        0 12px;

                    border:
                        1px solid #d1d5db;

                    border-radius: 6px;

                    outline: none;

                    font-size: 13px;
                }


                .input-group input:focus {
                    border-color: #147df5;

                    box-shadow:
                        0 0 0 3px
                        rgba(
                            20,
                            125,
                            245,
                            .1
                        );
                }


                .email-note {
                    margin-top: 6px;

                    color: #16a34a;

                    font-size: 11px;

                    font-weight: 600;
                }


                /* =========================
                   REMEMBER
                ========================= */

                .remember {
                    display: flex;

                    align-items: center;

                    gap: 7px;

                    margin:
                        3px 0 18px;

                    color: #64748b;

                    font-size: 12px;

                    cursor: pointer;
                }


                .remember input {
                    width: 14px;

                    height: 14px;
                }


                /* =========================
                   LOGIN BUTTON
                ========================= */

                .login-btn {
                    width: 100%;

                    height: 42px;

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


                .login-btn:hover {
                    transform:
                        translateY(-1px);

                    box-shadow:
                        0 6px 15px
                        rgba(
                            8,
                            127,
                            245,
                            .25
                        );
                }


                .login-btn:disabled {
                    opacity: .65;

                    cursor: not-allowed;

                    transform: none;
                }


                /* =========================
                   OTP
                ========================= */

                .otp-box {
                    text-align: center;

                    margin-top: 5px;

                    margin-bottom: 15px;
                }


                .otp-info {
                    color: #64748b;

                    font-size: 12px;

                    margin-bottom: 12px;

                    line-height: 1.5;
                }


                .otp-input {
                    text-align: center;

                    letter-spacing: 8px;

                    font-size: 20px !important;

                    font-weight: 700;

                    padding-left:
                        20px !important;
                }


                .resend-btn {
                    background: none;

                    border: none;

                    color: #087ff5;

                    font-size: 12px;

                    font-weight: 700;

                    cursor: pointer;

                    margin-top: 12px;
                }


                .resend-btn:hover {
                    text-decoration:
                        underline;
                }


                .resend-btn:disabled {
                    color: #9ca3af;

                    cursor:
                        not-allowed;
                }


                .forgot-link {
                    display: block;

                    margin: 12px 0 0 auto;
                }


                /* =========================
                   REGISTER
                ========================= */

                .register {
                    text-align: center;

                    margin-top: 17px;

                    font-size: 13px;

                    color: #6b7280;
                }


                .register a {
                    color: #087ff5;

                    font-weight: 700;

                    text-decoration: none;
                }


                /* =========================
                   RIGHT IMAGE
                ========================= */

                .login-right {
                    position: relative;

                    min-height: 500px;

                    background:
                        linear-gradient(
                            rgba(
                                3,
                                15,
                                30,
                                .25
                            ),
                            rgba(
                                3,
                                15,
                                30,
                                .65
                            )
                        ),
                        url(
                            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1000"
                        )
                        center / cover
                        no-repeat;

                    display: flex;

                    align-items: flex-end;

                    padding: 35px;
                }


                .movie-overlay {
                    color: white;
                }


                .movie-overlay h2 {
                    font-size: 30px;

                    line-height: 1.1;

                    margin:
                        0 0 10px;
                }


                .movie-overlay p {
                    font-size: 14px;

                    line-height: 1.5;

                    color: #e5e7eb;

                    margin: 0;
                }


                .movie-icon {
                    font-size: 32px;

                    margin-bottom: 8px;
                }


                /* =========================
                   POPUP
                ========================= */

                .popup-overlay {
                    position: fixed;

                    inset: 0;

                    background:
                        rgba(
                            0,
                            0,
                            0,
                            .55
                        );

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    z-index: 9999;

                    padding: 20px;
                }


                .popup {
                    width: 90%;

                    max-width: 380px;

                    background: white;

                    padding: 30px;

                    border-radius: 15px;

                    text-align: center;

                    box-shadow:
                        0 15px 45px
                        rgba(
                            0,
                            0,
                            0,
                            .3
                        );
                }


                .popup-icon {
                    width: 65px;

                    height: 65px;

                    margin: auto;

                    border-radius: 50%;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    color: white;

                    font-size: 38px;

                    font-weight: bold;
                }


                .success {
                    background: #22c55e;
                }


                .error {
                    background: #ef4444;
                }


                .popup h2 {
                    color: #111827;

                    margin:
                        15px 0 8px;
                }


                .popup p {
                    color: #64748b;

                    margin: 0;

                    line-height: 1.5;
                }


                .popup button {
                    margin-top: 18px;

                    padding:
                        10px 28px;

                    border: none;

                    border-radius: 6px;

                    background: #111827;

                    color: white;

                    cursor: pointer;

                    font-weight: 600;
                }


                .popup button:hover {
                    opacity: .9;
                }


                /* =========================
                   MOBILE
                ========================= */

                @media (max-width: 700px) {

                    .login-container {
                        max-width: 450px;

                        grid-template-columns:
                            1fr;
                    }


                    .login-right {
                        display: none;
                    }


                    .login-left {
                        padding:
                            35px 25px;
                    }
                }


                @media (max-width: 450px) {

                    .login-page {
                        padding:
                            20px 12px;
                    }


                    .login-left {
                        padding:
                            30px 20px;
                    }
                }

            `}</style>


            {/* ======================================================
                LOGIN PAGE
            ====================================================== */}

            <div className="login-page">

                <div className="login-container">


                    {/* ==================================================
                        LEFT
                    ================================================== */}

                    <div className="login-left">


                        <div className="login-brand">
                            🎬 MovieBook
                        </div>


                        <h1 className="login-heading">
                            {loginMode === "forgot"
                                ? recoveryStage === "password"
                                    ? "Create New Password"
                                    : "Reset Password"
                                : "Welcome Back"}
                        </h1>


                        <p className="login-subheading">
                            {loginMode === "forgot"
                                ? recoveryStage === "email"
                                    ? "Enter the email linked to your account"
                                    : recoveryStage === "otp"
                                        ? "Verify the code sent to your email"
                                        : "Choose a new password for your account"
                                : "Login to continue"}
                        </p>


                        {/* ==================================================
                            LOGIN MODE
                        ================================================== */}

                        {loginMode !== "forgot" && (
                        <div className="mode-buttons">


                            <button
                                type="button"
                                className={
                                    `mode-btn ${
                                        loginMode === "password"
                                            ? "active"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    changeLoginMode(
                                        "password"
                                    )
                                }
                            >
                                🔑 Password
                            </button>


                            <button
                                type="button"
                                className={
                                    `mode-btn ${
                                        loginMode === "otp"
                                            ? "active"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    changeLoginMode(
                                        "otp"
                                    )
                                }
                            >
                                📧 Login with OTP
                            </button>

                        </div>
                        )}


                        {/* ==================================================
                            PASSWORD LOGIN
                        ================================================== */}

                        {loginMode === "password" && (

                            <form
                                onSubmit={
                                    handleLogin
                                }
                            >


                                {/* EMAIL */}

                                <div className="input-group">

                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(
                                                e.target.value
                                            )
                                        }
                                    />


                                    {localStorage.getItem(
                                        "signupEmail"
                                    ) && (

                                        <div className="email-note">
                                            ✓ Email added from your signup
                                        </div>

                                    )}

                                </div>


                                {/* PASSWORD */}

                                <div className="input-group">

                                    <label>
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                {/* REMEMBER */}

                                <label className="remember">

                                    <input
                                        type="checkbox"
                                        checked={
                                            rememberMe
                                        }
                                        onChange={(e) =>
                                            setRememberMe(
                                                e.target.checked
                                            )
                                        }
                                    />

                                    Remember Me

                                </label>


                                {/* LOGIN */}

                                <button
                                    type="submit"
                                    className="login-btn"
                                    disabled={
                                        loginLoading
                                    }
                                >
                                    {loginLoading
                                        ? "Logging in..."
                                        : "Login"
                                    }
                                </button>

                                <button
                                    type="button"
                                    className="resend-btn forgot-link"
                                    onClick={startPasswordReset}
                                >
                                    Forgot password?
                                </button>

                            </form>

                        )}


                        {/* ==================================================
                            OTP LOGIN
                        ================================================== */}

                        {loginMode === "otp" && (

                            <form
                                onSubmit={
                                    handleOTPFormSubmit
                                }
                            >


                                {/* EMAIL */}

                                <div className="input-group">

                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => {

                                            setEmail(
                                                e.target.value
                                            );

                                            setOtpSent(
                                                false
                                            );

                                            setOtp("");

                                        }}
                                    />

                                </div>


                                {/* SEND OTP */}

                                {!otpSent && (

                                    <button
                                        type="submit"
                                        className="login-btn"
                                        disabled={
                                            otpLoading
                                        }
                                    >
                                        {otpLoading
                                            ? "Sending OTP..."
                                            : "Send OTP"
                                        }
                                    </button>

                                )}


                                {/* OTP INPUT */}

                                {otpSent && (

                                    <>

                                        <div className="otp-box">

                                            <div className="otp-info">

                                                OTP sent to

                                                <br />

                                                <strong>
                                                    {email}
                                                </strong>

                                            </div>


                                            <div className="input-group">

                                                <label>
                                                    Enter 6 Digit OTP
                                                </label>

                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength="6"
                                                    placeholder="000000"
                                                    className="otp-input"
                                                    value={otp}
                                                    onChange={(e) => {

                                                        const value =
                                                            e.target.value
                                                                .replace(
                                                                    /\D/g,
                                                                    ""
                                                                );

                                                        setOtp(
                                                            value
                                                        );

                                                    }}
                                                />

                                            </div>

                                        </div>


                                        {/* VERIFY */}

                                        <button
                                            type="submit"
                                            className="login-btn"
                                            disabled={
                                                otpLoading
                                            }
                                        >
                                            {otpLoading
                                                ? "Verifying..."
                                                : "Verify OTP & Login"
                                            }
                                        </button>


                                        {/* RESEND */}

                                        <button
                                            type="button"
                                            className="resend-btn"
                                            onClick={
                                                handleSendOTP
                                            }
                                            disabled={
                                                otpLoading
                                            }
                                        >
                                            {otpLoading
                                                ? "Sending..."
                                                : "Didn't receive OTP? Resend OTP"
                                            }
                                        </button>

                                    </>

                                )}

                            </form>

                        )}


                        {loginMode === "forgot" && recoveryStage === "email" && (
                            <form onSubmit={handleRequestPasswordReset}>
                                <div className="input-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        autoComplete="email"
                                        placeholder="Enter your account email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <button type="submit" className="login-btn" disabled={otpLoading}>
                                    {otpLoading ? "Sending Code..." : "Send Reset Code"}
                                </button>
                            </form>
                        )}


                        {loginMode === "forgot" && recoveryStage === "otp" && (
                            <form onSubmit={handleVerifyPasswordResetOTP}>
                                <div className="otp-box">
                                    <div className="otp-info">
                                        Reset code sent to<br /><strong>{email}</strong>
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="password-reset-otp">Enter 6 Digit Code</label>
                                        <input
                                            id="password-reset-otp"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength="6"
                                            autoComplete="one-time-code"
                                            placeholder="000000"
                                            className="otp-input"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                            required
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="login-btn" disabled={otpLoading}>
                                    {otpLoading ? "Verifying..." : "Verify Code"}
                                </button>
                                <button
                                    type="button"
                                    className="resend-btn"
                                    onClick={handleRequestPasswordReset}
                                    disabled={otpLoading}
                                >
                                    Resend Code
                                </button>
                            </form>
                        )}


                        {loginMode === "forgot" && recoveryStage === "password" && (
                            <form onSubmit={handleResetPassword}>
                                <div className="input-group">
                                    <label htmlFor="new-password">New Password</label>
                                    <input
                                        id="new-password"
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="At least 6 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="confirm-new-password">Confirm New Password</label>
                                    <input
                                        id="confirm-new-password"
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="Enter the password again"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="login-btn" disabled={otpLoading}>
                                    {otpLoading ? "Updating Password..." : "Update Password"}
                                </button>
                            </form>
                        )}


                        {/* ==================================================
                            REGISTER
                        ================================================== */}

                        <div className="register">

                            {loginMode === "forgot" ? (
                                <button
                                    type="button"
                                    className="resend-btn"
                                    onClick={() => changeLoginMode("password")}
                                >
                                    Back to Login
                                </button>
                            ) : (
                                <>

                            Don't have an account?{" "}

                            <Link to="/Signup">
                                Sign Up
                            </Link>

                                </>
                            )}

                        </div>

                    </div>


                    {/* ==================================================
                        RIGHT IMAGE
                    ================================================== */}

                    <div className="login-right">

                        <div className="movie-overlay">

                            <div className="movie-icon">
                                🎬
                            </div>

                            <h2>
                                Your Next
                                <br />
                                Movie Experience
                                <br />
                                Awaits
                            </h2>

                            <p>
                                Book your favourite movies
                                and enjoy the show.
                            </p>

                        </div>

                    </div>

                </div>


                {/* ======================================================
                    POPUP
                ====================================================== */}

                {popup.show && (

                    <div className="popup-overlay">

                        <div className="popup">


                            <div
                                className={
                                    `popup-icon ${
                                        popup.type === "success"
                                            ? "success"
                                            : "error"
                                    }`
                                }
                            >

                                {popup.type === "success"
                                    ? "✓"
                                    : "!"
                                }

                            </div>


                            <h2>
                                {popup.title}
                            </h2>


                            <p>
                                {popup.message}
                            </p>


                            {/* OK BUTTON FOR BOTH SUCCESS AND ERROR */}

                            <button
                                type="button"
                                onClick={
                                    closePopup
                                }
                            >
                                OK
                            </button>

                        </div>

                    </div>

                )}

            </div>

        </>
    );
};


export default Login;
