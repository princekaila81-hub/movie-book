
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { createHash, randomBytes, randomInt } from "crypto";

// ======================================================
// GENERATE JWT TOKEN
// ======================================================

const createToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// ======================================================
// EMAIL CONFIGURATION
// ======================================================

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ======================================================
// USER SIGNUP
// ======================================================

export const signup = async (req, res) => {
    try {
        const { name, email, mobile, address, password } = req.body;

        if (!name || !email || !mobile || !address || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedMobile = mobile.trim();

        if (!/^[0-9]{10}$/.test(normalizedMobile)) {
            return res.status(400).json({
                success: false,
                message: "Mobile number must contain exactly 10 digits"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { email: normalizedEmail },
                { mobile: normalizedMobile }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email or mobile number already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            mobile: normalizedMobile,
            address: address.trim(),
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: "Signup successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                address: user.address,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Signup Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// USER LOGIN
// ======================================================

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = createToken(user);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                address: user.address,
                image: user.image,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// SEND OTP
// ======================================================

export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        await user.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "MovieBook Login OTP",
            html: `
                <h2>MovieBook OTP Verification</h2>
                <p>Your OTP is:</p>
                <h1>${otp}</h1>
                <p>This OTP is valid for 5 minutes.</p>
                <p>Do not share this OTP with anyone.</p>
            `
        });

        res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.error("Send OTP Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to send OTP",
            error: error.message
        });
    }
};

// ======================================================
// VERIFY OTP
// ======================================================

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.otp || user.otp !== otp.toString()) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        if (
            !user.otpExpires ||
            user.otpExpires.getTime() < Date.now()
        ) {
            return res.status(400).json({
                success: false,
                message: "OTP expired. Please request a new OTP."
            });
        }

        user.otp = null;
        user.otpExpires = null;

        await user.save();

        const token = createToken(user);

        res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                address: user.address,
                image: user.image,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Verify OTP Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// PASSWORD RESET
// ======================================================

export const requestPasswordReset = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account was found with this email address"
            });
        }

        const otp = randomInt(100000, 1000000).toString();
        user.passwordResetOTP = otp;
        user.passwordResetOTPExpires = new Date(Date.now() + 5 * 60 * 1000);
        user.passwordResetTokenHash = null;
        user.passwordResetTokenExpires = null;
        await user.save();

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "MovieBook Password Reset OTP",
                html: `
                    <h2>MovieBook Password Reset</h2>
                    <p>Your password reset code is:</p>
                    <h1>${otp}</h1>
                    <p>This code expires in 5 minutes. Do not share it with anyone.</p>
                `
            });
        } catch (error) {
            user.passwordResetOTP = null;
            user.passwordResetOTPExpires = null;
            await user.save();
            throw error;
        }

        return res.status(200).json({
            success: true,
            message: "Password reset OTP sent to your email"
        });
    } catch (error) {
        console.error("PASSWORD RESET OTP ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to send password reset OTP"
        });
    }
};

export const verifyPasswordResetOTP = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const otp = req.body.otp?.trim();

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        if (
            !user.passwordResetOTP ||
            user.passwordResetOTP !== otp ||
            !user.passwordResetOTPExpires ||
            user.passwordResetOTPExpires.getTime() <= Date.now()
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP. Please request a new code."
            });
        }

        const resetToken = randomBytes(32).toString("hex");
        user.passwordResetOTP = null;
        user.passwordResetOTPExpires = null;
        user.passwordResetTokenHash = createHash("sha256")
            .update(resetToken)
            .digest("hex");
        user.passwordResetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            resetToken
        });
    } catch (error) {
        console.error("PASSWORD RESET OTP VERIFICATION ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to verify password reset OTP"
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { resetToken, password } = req.body;

        if (!resetToken || !password) {
            return res.status(400).json({
                success: false,
                message: "Reset token and new password are required"
            });
        }

        if (typeof password !== "string" || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const tokenHash = createHash("sha256")
            .update(resetToken)
            .digest("hex");
        const user = await User.findOne({
            passwordResetTokenHash: tokenHash,
            passwordResetTokenExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Password reset session is invalid or expired. Please start again."
            });
        }

        user.password = await bcrypt.hash(password, 10);
        user.passwordResetOTP = null;
        user.passwordResetOTPExpires = null;
        user.passwordResetTokenHash = null;
        user.passwordResetTokenExpires = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        console.error("PASSWORD RESET ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to update password"
        });
    }
};

// ======================================================
// GET ALL USERS (ADMIN)
// ======================================================

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({
            role: "user"
        }).select(
            "-password -otp -otpExpires -passwordResetOTP -passwordResetOTPExpires -passwordResetTokenHash -passwordResetTokenExpires"
        );

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        console.error("Get Users Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// GET SINGLE USER (ADMIN)
// ======================================================

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(
            req.params.id
        ).select(
            "-password -otp -otpExpires -passwordResetOTP -passwordResetOTPExpires -passwordResetTokenHash -passwordResetTokenExpires"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error("Get User Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// DELETE USER (ADMIN)
// ======================================================

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(
            req.params.id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Delete User Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// UPDATE USER PROFILE
// ======================================================

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const { name, mobile, address } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // UPDATE NAME
        if (name !== undefined) {
            if (
                typeof name !== "string" ||
                !name.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Name cannot be empty"
                });
            }

            user.name = name.trim();
        }

        // UPDATE MOBILE
        if (mobile !== undefined) {
            if (
                typeof mobile !== "string" ||
                !/^[0-9]{10}$/.test(mobile.trim())
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Mobile number must contain exactly 10 digits"
                });
            }

            const existingMobile = await User.findOne({
                mobile: mobile.trim(),
                _id: { $ne: userId }
            });

            if (existingMobile) {
                return res.status(400).json({
                    success: false,
                    message: "Mobile number already registered"
                });
            }

            user.mobile = mobile.trim();
        }

        // UPDATE ADDRESS
        if (address !== undefined) {
            if (
                typeof address !== "string" ||
                !address.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Address cannot be empty"
                });
            }

            user.address = address.trim();
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                address: user.address,
                image: user.image,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Update Profile Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
