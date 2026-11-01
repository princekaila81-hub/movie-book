import OTP from "../models/otp.js";
import { sendOTPEmail } from "../middleware/sendEmail.js";

export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        console.log("OTP REQUEST:", email);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        const expiresAt = new Date(
            Date.now() + 5 * 60 * 1000
        );

        await OTP.deleteMany({
            email: normalizedEmail,
        });

        await OTP.create({
            email: normalizedEmail,
            otp,
            expiresAt,
        });

        console.log("Generated OTP:", otp);

        const sent = await sendOTPEmail(
            normalizedEmail,
            otp
        );

        if (!sent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP",
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });

    } catch (error) {
        console.error("SEND OTP ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to send OTP",
            error: error.message,
        });
    }
};