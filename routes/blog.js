const express = require("express");
const router = express.Router();

const Blog = require("../models/blog");

router.post("/create", async (req, res) => {
    try {
        const { title, body } = req.body;

        const blog = await Blog.create({
            title,
            body,
            coverImageURL: "/images/default.png",
            createdBy: req.user._id,
        });

        return res.json(blog);
    } catch (error) {
        return res.status(500).send("Error creating blog");
    }
});

module.exports = router;
