
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        // =========================
        // NAME
        // =========================
        name: {
            type: String,
            required: true,
            trim: true
        },

        // =========================
        // EMAIL
        // =========================
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        // =========================
        // MOBILE NUMBER
        // =========================
        mobile: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        // =========================
        // ADDRESS
        // =========================
        address: {
            type: String,
            required: true,
            trim: true
        },

        // =========================
        // PASSWORD
        // =========================
        password: {
            type: String,
            required: true
        },

        // =========================
        // USER IMAGE
        // =========================
        image: {
            type: String,
            required: false
        },

        // =========================
        // OTP
        // =========================
        otp: {
            type: String,
            default: null
        },

        // =========================
        // OTP EXPIRY
        // =========================
        otpExpires: {
            type: Date,
            default: null
        },

        passwordResetOTP: {
            type: String,
            default: null
        },

        passwordResetOTPExpires: {
            type: Date,
            default: null
        },

        passwordResetTokenHash: {
            type: String,
            default: null
        },

        passwordResetTokenExpires: {
            type: Date,
            default: null
        },

        // =========================
        // ROLE
        // =========================
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        }
    },

    // =========================
    // TIMESTAMPS
    // =========================
    {
        timestamps: true
    }
);

export default mongoose.model(
    "User",
    userSchema
);
