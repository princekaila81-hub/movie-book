import express from "express";

import {
    getMovies,
    getMovie,
    addMovie,
    updateMovie,
    deleteMovie,
} from "../controllers/movieController.js";

import upload from "../middleware/upload.js";

const router = express.Router();


// =========================
// GET ALL MOVIES
// =========================
router.get("/", getMovies);


// =========================
// GET SINGLE MOVIE
// =========================
router.get("/:id", getMovie);


// =========================
// ADD MOVIE
// =========================
router.post(
    "/",
    upload.single("image"),
    addMovie
);


// =========================
// UPDATE MOVIE
// =========================
router.put(
    "/:id",
    upload.single("image"),
    updateMovie
);


// =========================
// DELETE MOVIE
// =========================
router.delete(
    "/:id",
    deleteMovie
);


export default router;