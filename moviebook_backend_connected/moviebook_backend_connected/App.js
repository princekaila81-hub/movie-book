import "dotenv/config";

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";

import userRoute from "./route/userroute.js";
import movieRoute from "./route/movieroute.js";
import theatreRoute from "./route/theatreroute.js";
import bookingRoute from "./route/bookingroute.js";
import paymentRoute from "./route/paymentRoute.js";


const app = express();


// ======================================================
// MIDDLEWARE
// ======================================================

const frontendOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

if (process.env.NODE_ENV !== "production") {
    frontendOrigins.push("http://localhost:3000");
}

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || frontendOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Origin is not allowed by CORS"));
        }
    })
);

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// ======================================================
// DATABASE
// ======================================================

connectDB();


// ======================================================
// ROUTES
// ======================================================

// USER + OTP
app.use(
    "/api/users",
    userRoute
);


// MOVIES
app.use(
    "/api/movies",
    movieRoute
);


// THEATRES
app.use(
    "/",
    theatreRoute
);


// BOOKINGS
app.use(
    "/",
    bookingRoute
);


// RAZORPAY PAYMENT
app.use(
    "/api/payment",
    paymentRoute
);


// ======================================================
// TEST ROUTE
// ======================================================

app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        message: "MovieBook Backend API is running"
    });

});


// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message:
            `Route not found: ${req.method} ${req.originalUrl}`
    });

});


// ======================================================
// SERVER
// ======================================================

const PORT =
    process.env.PORT || 5000;


app.listen(PORT, () => {

    console.log("====================================");
    console.log("     MovieBook Backend Started");
    console.log("====================================");

    console.log(
        `Server: http://localhost:${PORT}`
    );

    console.log(
        `Users: http://localhost:${PORT}/api/users`
    );

    console.log(
        `Movies: http://localhost:${PORT}/api/movies`
    );

    console.log(
        `Payment: http://localhost:${PORT}/api/payment`
    );

    console.log("====================================");

});