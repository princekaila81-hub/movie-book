import Theatre from "../models/Theatre.js";

// =========================
// GET ALL THEATRES
// =========================
export const getTheatres = async (req, res) => {
    try {
        const theatres = await Theatre.find();

        res.json({
            success: true,
            theatres
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================
// GET SINGLE THEATRE
// =========================
export const getTheatre = async (req, res) => {
    try {
        const theatre = await Theatre.findById(req.params.id);

        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: "Theatre not found"
            });
        }

        res.json({
            success: true,
            theatre
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================
// ADD THEATRE
// =========================
export const addTheatre = async (req, res) => {
    try {
        const { name, location, screens } = req.body;

        if (!name || !location) {
            return res.status(400).json({
                success: false,
                message: "Name and location are required"
            });
        }

        const theatre = await Theatre.create({
            name,
            location,
            screens
        });

        res.status(201).json({
            success: true,
            message: "Theatre added successfully",
            theatre
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================
// UPDATE THEATRE
// =========================
export const updateTheatre = async (req, res) => {
    try {
        const theatre = await Theatre.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: "Theatre not found"
            });
        }

        res.json({
            success: true,
            message: "Theatre updated successfully",
            theatre
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================
// DELETE THEATRE
// =========================
export const deleteTheatre = async (req, res) => {
    try {
        const theatre = await Theatre.findByIdAndDelete(
            req.params.id
        );

        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: "Theatre not found"
            });
        }

        res.json({
            success: true,
            message: "Theatre deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}