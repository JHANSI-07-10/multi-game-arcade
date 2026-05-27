const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const dotenv = require("dotenv");

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(express.json());

app.use(cors());

// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/user", require("./routes/userRoutes"));

app.use("/api/score", require("./routes/scoreRoutes"));

// MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => {

        console.log("MongoDB Connected");

    })
    .catch((err) => {

        console.log("MongoDB Error:");

        console.log(err);

    });

// TEST ROUTE
app.get("/", (req, res) => {

    res.send("Backend Running Successfully");

});

// SERVER
const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {

    console.log(`Server Started at port : ${PORT}`);

});