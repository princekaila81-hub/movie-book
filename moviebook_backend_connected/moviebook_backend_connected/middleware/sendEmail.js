
import "dotenv/config";
import nodemailer from "nodemailer";

// ====================================
// CHECK ENVIRONMENT VARIABLES
// ====================================

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS?.trim();

console.log("====================================");
console.log("sendEmail.js LOADED");
console.log("EMAIL USER:", emailUser);
console.log("PASSWORD EXISTS:", !!emailPass);
console.log("PASSWORD LENGTH:", emailPass ? emailPass.length : 0);
console.log("====================================");


// ====================================
// VALIDATE EMAIL CONFIG
// ====================================

if (!emailUser) {
    console.error("❌ EMAIL_USER is missing in .env");
}

if (!emailPass) {
    console.error("❌ EMAIL_PASS is missing in .env");
}


// ====================================
// GMAIL TRANSPORTER
// ====================================

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        user: emailUser,
        pass: emailPass,
    },
});


// ====================================
// SEND OTP EMAIL
// ====================================

export const sendOTPEmail = async (email, otp) => {

    try {

        console.log("====================================");
        console.log("SENDING OTP");
        console.log("TO:", email);
        console.log("EMAIL USER:", emailUser);
        console.log("PASSWORD EXISTS:", !!emailPass);
        console.log("PASSWORD LENGTH:", emailPass ? emailPass.length : 0);
        console.log("====================================");


        // Check credentials before sending
        if (!emailUser || !emailPass) {

            console.error("❌ EMAIL credentials are missing");

            return false;
        }


        // Send email
        const info = await transporter.sendMail({

            from: `"MovieBook" <${emailUser}>`,

            to: email,

            subject: "MovieBook OTP Verification",

            text: `Your MovieBook OTP is ${otp}. This OTP is valid for 5 minutes.`,

            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 500px;
                    margin: auto;
                    padding: 25px;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                ">

                    <h2>🎬 MovieBook</h2>

                    <p>Your OTP for verification is:</p>

                    <h1 style="
                        text-align: center;
                        letter-spacing: 8px;
                    ">
                        ${otp}
                    </h1>

                    <p>
                        This OTP is valid for <strong>5 minutes</strong>.
                    </p>

                    <p>
                        Please do not share this OTP with anyone.
                    </p>

                </div>
            `,
        });


        console.log("====================================");
        console.log("✅ OTP SENT SUCCESSFULLY");
        console.log("MESSAGE ID:", info.messageId);
        console.log("====================================");


        return true;


    } catch (error) {

        console.error("====================================");
        console.error("❌ SEND OTP ERROR");
        console.error("CODE:", error.code);
        console.error("COMMAND:", error.command);
        console.error("MESSAGE:", error.message);
        console.error("RESPONSE:", error.response);
        console.error("====================================");


        return false;
    }
};
