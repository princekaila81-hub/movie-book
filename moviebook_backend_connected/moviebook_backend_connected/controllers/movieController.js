import Movie from "../models/movie.js";
import cloudinary from "../config/cloudinary.js";

// =========================
// GET ALL MOVIES
// =========================
export const getMovies = async (req, res) => {
    try {
        const movies = await Movie.find()
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            movies
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================
// GET SINGLE MOVIE
// =========================
export const getMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found"
            });
        }

        res.json({
            success: true,
            movie
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================
// ADD MOVIE
// =========================
export const addMovie = async (req, res) => {
    try {
        const {
            title,
            genre,
            rating,
            description,
            duration
        } = req.body;

        // Image required
        if (!title || !genre) {
            return res.status(400).json({
                success: false,
                message: "Title and genre are required"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Movie image is required"
            });
        }

        // =========================
        // UPLOAD IMAGE TO CLOUDINARY
        // =========================
        const uploadResult = await new Promise((resolve, reject) => {

            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "moviebook/movies",
                    resource_type: "image"
                },

                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            stream.end(req.file.buffer);
        });

        // =========================
        // SAVE MOVIE IN MONGODB
        // =========================
        const movie = await Movie.create({
            title,
            genre,
            rating,
            image: uploadResult.secure_url,
            description,
            duration
        });

        res.status(201).json({
            success: true,
            message: "Movie added successfully",
            movie
        });

    } catch (error) {
        console.error("ADD MOVIE ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================
// UPDATE MOVIE
// =========================
export const updateMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found"
            });
        }

        const {
            title,
            genre,
            rating,
            description,
            duration
        } = req.body;

        // =========================
        // UPDATE TEXT DATA
        // =========================
        if (title !== undefined) {
            movie.title = title;
        }

        if (genre !== undefined) {
            movie.genre = genre;
        }

        if (rating !== undefined) {
            movie.rating = rating;
        }

        if (description !== undefined) {
            movie.description = description;
        }

        if (duration !== undefined) {
            movie.duration = duration;
        }


        // =========================
        // NEW IMAGE UPLOAD
        // =========================
        if (req.file) {

            const uploadResult = await new Promise(
                (resolve, reject) => {

                    const stream =
                        cloudinary.uploader.upload_stream(
                            {
                                folder: "moviebook/movies",
                                resource_type: "image"
                            },

                            (error, result) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result);
                                }
                            }
                        );

                    stream.end(req.file.buffer);
                }
            );

            // Replace old image URL
            movie.image = uploadResult.secure_url;
        }

        await movie.save();

        res.json({
            success: true,
            message: "Movie updated successfully",
            movie
        });

    } catch (error) {
        console.error("UPDATE MOVIE ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================
// DELETE MOVIE
// =========================
export const deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(
            req.params.id
        );

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found"
            });
        }

        res.json({
            success: true,
            message: "Movie deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};