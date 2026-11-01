import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true
    },

    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true
    },

    date: {
      type: String,
      required: true
    },

    time: {
      type: String,
      required: true
    },

    seats: [{
      type: String
    }],

    regularCount: {
      type: Number,
      default: 0
    },

    premiumCount: {
      type: Number,
      default: 0
    },

    vipCount: {
      type: Number,
      default: 0
    },

    totalSeats: {
      type: Number,
      default: 0
    },

    totalAmount: {
      type: Number,
      required: true
    },

    paymentMethod: {
      type: String,
      required: true
    },

    paymentStatus: {
      type: String,
      default: "Paid"
    },

    bookingStatus: {
      type: String,
      default: "Confirmed"
    },

    paymentDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index(
  {
    movie: 1,
    theatre: 1,
    date: 1,
    time: 1,
    seats: 1
  },
  {
    unique: true,
    name: "unique_show_seat"
  }
);

export default mongoose.model("Booking", bookingSchema);