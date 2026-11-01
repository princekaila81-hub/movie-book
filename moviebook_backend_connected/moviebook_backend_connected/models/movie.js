import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        genre: {
            type: String,
            required: true
        },

        rating: {
            type: Number,
            default: 0
        },

        image: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Movie", movieSchema);