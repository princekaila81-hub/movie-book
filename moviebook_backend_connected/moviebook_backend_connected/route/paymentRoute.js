import express from "express";

import {
    createOrder,
    verifyPayment
} from "../controllers/paymentController.js";


const router = express.Router();


// ======================================================
// CREATE RAZORPAY ORDER
// ======================================================

router.post(
    "/create-order",
    createOrder
);


// ======================================================
// VERIFY RAZORPAY PAYMENT
// ======================================================

router.post(
    "/verify",
    verifyPayment
);


export default router;