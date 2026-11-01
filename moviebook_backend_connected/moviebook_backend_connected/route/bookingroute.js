import express from "express";

import {
  createBooking,
  askAdminOrderQuestion,
  getBookings,
  getBooking,
  getUserBookings,
  updateBooking,
  deleteBooking
} from "../controllers/bookingController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/api/bookings", createBooking);

router.post(
  "/api/bookings/admin/chat",
  protect,
  adminOnly,
  askAdminOrderQuestion
);

router.get("/api/bookings", getBookings);

router.get("/api/bookings/user/:userId", getUserBookings);

router.get("/api/bookings/:id", getBooking);

router.put("/api/bookings/:id", updateBooking);

router.delete("/api/bookings/:id", deleteBooking);

export default router;