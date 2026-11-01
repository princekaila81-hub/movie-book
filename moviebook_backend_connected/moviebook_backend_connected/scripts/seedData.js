import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "../models/movie.js";
import Theatre from "../models/Theatre.js";

dotenv.config();

const movies = [
  {
    title: "Avengers",
    genre: "Action",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700",
  },
  {
    title: "The Movie",
    genre: "Drama",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=700",
  },
  {
    title: "Cinema Night",
    genre: "Adventure",
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1485095329183-d0797cdc5676?w=700",
  },
];

const theatres = [
  { name: "PVR Cinemas", location: "Ahmedabad", screens: 8 },
  { name: "INOX", location: "Surat", screens: 6 },
  { name: "Cinepolis", location: "Rajkot", screens: 5 },
  { name: "MovieMax", location: "Vadodara", screens: 4 },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    if (await Movie.countDocuments() === 0) {
      await Movie.insertMany(movies);
      console.log("Sample movies inserted");
    } else {
      console.log("Movies already exist; skipped");
    }

    if (await Theatre.countDocuments() === 0) {
      await Theatre.insertMany(theatres);
      console.log("Sample theatres inserted");
    } else {
      console.log("Theatres already exist; skipped");
    }
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedData();
