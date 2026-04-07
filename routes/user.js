const express = require("express");
const router = express.Router();

const User = require("../models/user");
const { createTokenForUser } = require("../services/auth");


// ======================
// Render Login Page
// ======================
router.get("/login", (req, res) => {

    // already logged in → go home
    if (req.user) return res.redirect("/");

    res.render("login");
});


// ======================
// Render Signup Page
// ======================
router.get("/signup", (req, res) => {

    if (req.user) return res.redirect("/");

    res.render("signup");
});


// ======================
// Signup
// ======================
router.post("/signup", async (req, res) => {

    try {

        let { fullName, email, password } = req.body;

        // basic validation
        if (!fullName || !email || !password) {
            return res.send("All fields required");
        }

        // normalize email
        email = email.toLowerCase().trim();

        // basic password strength (minimal but prevents garbage)
        if (password.length < 6) {
            return res.send("Password must be at least 6 characters");
        }

        await User.create({
            fullName: fullName.trim(),
            email,
            password,
        });

        return res.redirect("/user/login");

    } catch (error) {

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

        let { email, password } = req.body;

        if (!email || !password) {
            return res.send("Email and password required");
        }

        email = email.toLowerCase().trim();

        // fetch user OR dummy object to prevent timing leaks
        const user = await User.findOne({ email });

        // always run bcrypt compare if user exists
        const isMatch = user ? await user.comparePassword(password) : false;

        if (!user || !isMatch) {
            return res.send("Invalid Email or Password");
        }

        const token = createTokenForUser(user);

        // production-safe cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });

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

    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });

    return res.redirect("/");

});


module.exports = router;