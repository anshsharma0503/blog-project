const express = require("express");
const router = express.Router();

const User = require("../models/user");
const { createTokenForUser } = require("../services/auth");


// ======================
// Render Login Page
// ======================
router.get("/login", (req, res) => {
    res.render("login");
});


// ======================
// Render Signup Page
// ======================
router.get("/signup", (req, res) => {
    res.render("signup");
});


// ======================
// Signup
// ======================
router.post("/signup", async (req, res) => {

    try {

        const { fullName, email, password } = req.body;

        await User.create({
            fullName,
            email,
            password,
        });

        return res.redirect("/user/login");

    } catch (error) {

        // duplicate email handling
        if (error.code === 11000) {
            return res.send("Email already registered. Try logging in.");
        }

        console.log(error);
        return res.status(500).send("Signup error");

    }

});


// ======================
// Signin
// ======================
router.post("/signin", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.send("Invalid Email or Password");
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.send("Invalid Email or Password");
        }

        const token = createTokenForUser(user);

        res.cookie("token", token);

        return res.redirect("/");

    } catch (error) {

        console.log(error);
        return res.status(500).send("Signin error");

    }

});


// ======================
// Logout
// ======================
router.get("/logout", (req, res) => {

    res.clearCookie("token");
    return res.redirect("/");

});


module.exports = router;
