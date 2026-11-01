import mongoose from "mongoose";

const theatreSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        location: {
            type: String,
            required: true
        },

        screens: {
            type: Number,
            default: 1
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Theatre", theatreSchema);