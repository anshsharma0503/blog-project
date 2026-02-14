const express = require("express");
const router = express.Router();

const Blog = require("../models/blog");
const Comment = require("../models/comment");


// ======================
// Create Blog
// ======================
router.post("/create", async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).send("Login required");
        }

        const { title, body } = req.body;

        const blog = await Blog.create({
            title,
            body,
            coverImageURL: "/images/default.png",
            createdBy: req.user._id,
        });

        return res.json(blog);

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error creating blog");
    }
});


// ======================
// Get All Blogs
// ======================
router.get("/", async (req, res) => {
    try {
        const blogs = await Blog.find({})
            .populate("createdBy", "fullName profileImageURL")
            .sort({ createdAt: -1 });

        return res.json(blogs);

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error fetching blogs");
    }
});


// ======================
// Get Blog + Comments
// ======================
router.get("/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate("createdBy", "fullName profileImageURL")

        if (!blog) {
            return res.status(404).send("Blog not found");
        }

        const comments = await Comment.find({
            blogId: req.params.id
        })
        .populate("createdBy", "fullName profileImageURL")
        .sort({ createdAt: -1 });

        return res.json({
            blog,
            comments
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error fetching blog details");
    }
});


// ======================
// Update Blog
// ======================
router.put("/:id", async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).send("Login required");
        }

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).send("Blog not found");
        }

        if (blog.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).send("Not allowed to edit this blog");
        }

        const { title, body } = req.body;

        blog.title = title || blog.title;
        blog.body = body || blog.body;

        await blog.save();

        return res.json(blog);

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error updating blog");
    }
});


// ======================
// Delete Blog
// ======================
router.delete("/:id", async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).send("Login required");
        }

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).send("Blog not found");
        }

        if (blog.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).send("Not allowed to delete this blog");
        }

        await Blog.findByIdAndDelete(req.params.id);

        return res.send("Blog deleted successfully");

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error deleting blog");
    }
});


module.exports = router;
