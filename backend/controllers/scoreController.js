const Score = require("../models/Score");

// ADD SCORE
exports.addScore = async (req, res) => {

    try {

        const { game, score, username } = req.body;

        const newScore = new Score({

            userId: req.user.id,

            username,

            game,

            score

        });

        await newScore.save();

        res.status(201).json({

            message: "Score Saved Successfully"

        });

    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};

// GET LEADERBOARD
exports.getLeaderboard = async (req, res) => {

    try {

        const leaderboard = await Score.find()

            .sort({ score: -1 })

            .limit(10);

        res.status(200).json(leaderboard);

    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};