const express = require("express");
const router = express.Router();

const User = require("../models/user");
const { createToken } = require("../services/authentication");


// ======================
// Signup Route
// ======================
router.post("/signup", async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        await User.create({
            fullName,
            email,
            password,
        });

        return res.send("User Created Successfully");
    } catch (error) {
        console.log(error);
        return res.status(500).send("Error creating user");
    }
});


// ======================
// Login Route
// ======================
router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send("User not found");
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).send("Invalid password");
        }

        const token = createToken(user);

        res.cookie("token", token);
        return res.send("Login Successful");

    } catch (error) {
        console.log(error);
        return res.status(500).send("Login Error");
    }
});


module.exports = router;
