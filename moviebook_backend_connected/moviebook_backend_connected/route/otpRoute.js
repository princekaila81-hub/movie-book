import express from "express";

import {
    sendOTP,
    verifyOTP,
} from "../controllers/otpController.js";

const router = express.Router();

// Send OTP
router.post("/send-otp", sendOTP);

// Verify OTP
router.post("/verify-otp", verifyOTP);

export default router;