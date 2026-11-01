
import express from "express";

import {
    signup,
    login,
    sendOTP,
    verifyOTP,
    requestPasswordReset,
    verifyPasswordResetOTP,
    resetPassword,
    getUsers,
    getUser,
    deleteUser,
    updateProfile
} from "../controllers/userController.js";

import {
    protect,
    adminOnly
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================================
// PUBLIC ROUTES
// ======================================================

router.post("/signup", signup);

router.post("/login", login);

router.post("/send-otp", sendOTP);

router.post("/verify-otp", verifyOTP);

router.post("/password-reset/request", requestPasswordReset);

router.post("/password-reset/verify-otp", verifyPasswordResetOTP);

router.post("/password-reset/reset", resetPassword);


// ======================================================
// USER PROFILE ROUTE
// ======================================================

// Logged-in user can update their own profile
router.put("/profile", protect, updateProfile);


// ======================================================
// ADMIN ROUTES
// ======================================================

// Get all users
router.get("/", protect, adminOnly, getUsers);

// Get single user
router.get("/:id", protect, adminOnly, getUser);

// Delete user
router.delete("/:id", protect, adminOnly, deleteUser);


export default router;
