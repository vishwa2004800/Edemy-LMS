import express from "express";
import Enrollment from "../models/EnrollmentModel.js";
// import authMiddleware from "../middleware/authMiddleware.js"; // Ensures the user is logged in
// import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Enroll user in a course (No Payment Required)
router.post("/enroll", async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id; // Extract user ID from token

        // Check if the user is already enrolled
        const existingEnrollment = await Enrollment.findOne({ userId, courseId });
        if (existingEnrollment) {
            return res.status(400).json({ success: false, message: "You are already enrolled in this course." });
        }

        // Create new enrollment entry
        const enrollment = new Enrollment({ userId, courseId });
        await enrollment.save();

        return res.status(200).json({ success: true, message: "Enrolled successfully!" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Check if a user is enrolled in a course
router.get("/check-enrollment/:courseId", async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        const enrollment = await Enrollment.findOne({ userId, courseId });
        return res.json({ isEnrolled: !!enrollment });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
