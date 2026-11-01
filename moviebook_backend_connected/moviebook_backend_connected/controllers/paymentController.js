import Razorpay from "razorpay";
import crypto from "crypto";


// ======================================================
// RAZORPAY INSTANCE
// ======================================================

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


// ======================================================
// CREATE RAZORPAY ORDER
// ======================================================

export const createOrder = async (req, res) => {
    try {

        const { amount } = req.body;

        // Check amount
        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment amount"
            });
        }


        // Razorpay amount is in paise
        const amountInPaise = Math.round(
            Number(amount) * 100
        );


        const options = {
            amount: amountInPaise,
            currency: "INR",

            receipt:
                `moviebook_${Date.now()}`,

            notes: {
                project: "MovieBook"
            }
        };


        const order =
            await razorpay.orders.create(options);


        return res.status(200).json({

            success: true,

            message:
                "Razorpay order created successfully",

            order: {

                id: order.id,

                amount: order.amount,

                currency: order.currency,

                receipt: order.receipt

            },

            key:
                process.env.RAZORPAY_KEY_ID
        });


    } catch (error) {

        console.error(
            "CREATE RAZORPAY ORDER ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to create Razorpay order"

        });
    }
};



// ======================================================
// VERIFY RAZORPAY PAYMENT
// ======================================================

export const verifyPayment = async (req, res) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;


        // Check required values
        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment verification data is missing"

            });
        }


        // Create signature
        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    razorpay_order_id +
                    "|" +
                    razorpay_payment_id
                )
                .digest("hex");


        // Compare signatures
        const isValid =
            generatedSignature ===
            razorpay_signature;


        if (!isValid) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payment signature"

            });
        }


        // Payment verified
        return res.status(200).json({

            success: true,

            message:
                "Payment verified successfully",

            payment: {

                orderId:
                    razorpay_order_id,

                paymentId:
                    razorpay_payment_id,

                signature:
                    razorpay_signature,

                status:
                    "Paid"

            }

        });


    } catch (error) {

        console.error(
            "VERIFY PAYMENT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Payment verification failed"

        });
    }
};