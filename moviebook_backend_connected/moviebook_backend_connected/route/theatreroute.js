import express from "express";

import {
    getTheatres,
    getTheatre,
    addTheatre,
    updateTheatre,
    deleteTheatre
} from "../controllers/theatreController.js";

const router = express.Router();

router.get("/api/theatres", getTheatres);

router.get("/api/theatres/:id", getTheatre);

router.post("/api/theatres", addTheatre);

router.put("/api/theatres/:id", updateTheatre);

router.delete("/api/theatres/:id", deleteTheatre);

export default router