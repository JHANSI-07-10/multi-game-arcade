const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {

    addScore,
    getLeaderboard

} = require("../controllers/scoreController");

// Protected Route
router.post("/add", authMiddleware, addScore);

// Public Route
router.get("/leaderboard", getLeaderboard);

module.exports = router;