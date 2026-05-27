const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

// Protected Route
router.get("/profile", authMiddleware, (req, res) => {

    res.json({

        message: "Protected Profile Accessed",

        user: req.user

    });

});

module.exports = router;