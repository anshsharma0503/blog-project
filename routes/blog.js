const express  = require("express");
const mongoose = require("mongoose");
const router   = express.Router();

const Blog    = require("../models/blog");
const Comment = require("../models/comment");
const upload  = require("../middlewares/multer");


// ======================
// CREATE BLOG PAGE
// ======================
router.get("/new", (req, res) => {
    if (!req.user) return res.redirect("/user/login");
    res.render("createBlog", { error: null });
});


// ======================
// VIEW BLOG
// ======================
router.get("/view/:id", async (req, res) => {

    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send("Invalid Blog ID");
        }

        const blog = await Blog.findById(id)
            .populate("createdBy", "fullName profileImageURL");

        if (!blog) return res.status(404).send("Blog not found");

        const comments = await Comment.find({ blogId: id })
            .populate("createdBy", "fullName")
            .sort({ createdAt: -1 });

        res.render("blog", { blog, comments, error: null });

    } catch (error) {
        console.log(error);
        res.status(500).send("Error loading blog");
    }
});


// ======================
// CREATE BLOG (POST)
// ======================
router.post("/create", upload.single("coverImage"), async (req, res) => {

    try {
        if (!req.user) return res.status(401).redirect("/user/login");

        let { title, body } = req.body;

        if (!title || !body) {
            return res.render("createBlog", { error: "Title and body are required." });
        }

        title = title.trim();
        body  = body.trim();

        if (title.length < 3) {
            return res.render("createBlog", { error: "Title must be at least 3 characters." });
        }
        if (body.length < 10) {
            return res.render("createBlog", { error: "Body must be at least 10 characters." });
        }

        const coverImageURL = req.file
            ? req.file.path
            : "/images/default-blog.svg";

        await Blog.create({
            title,
            body,
            coverImageURL,
            createdBy: req.user._id,
        });

        res.redirect("/");

    } catch (error) {
        console.log(error);
        res.render("createBlog", { error: "Error creating blog. Please try again." });
    }
});


// ======================
// DELETE BLOG
// ======================
router.post("/delete/:id", async (req, res) => {

    try {
        if (!req.user) return res.status(401).redirect("/user/login");

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send("Invalid Blog ID");
        }

        const blog = await Blog.findById(id);

        if (!blog) return res.status(404).send("Not found");

        if (blog.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).send("Not allowed");
        }

        // clean up orphan comments
        await Comment.deleteMany({ blogId: id });
        await Blog.findByIdAndDelete(id);

        res.redirect("/");

    } catch (error) {
        console.log(error);
        res.status(500).send("Error deleting blog");
    }
});


// ======================
// EDIT BLOG PAGE
// ======================
router.get("/edit/:id", async (req, res) => {

    try {
        if (!req.user) return res.redirect("/user/login");

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send("Invalid Blog ID");
        }

        const blog = await Blog.findById(id);

        if (!blog) return res.status(404).send("Not found");

        if (blog.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).send("Not allowed");
        }

        res.render("editBlog", { blog, error: null });

    } catch (error) {
        console.log(error);
        res.status(500).send("Error loading edit page");
    }
});


// ======================
// UPDATE BLOG (POST)
// ======================
router.post("/edit/:id", upload.single("coverImage"), async (req, res) => {

    try {
        if (!req.user) return res.redirect("/user/login");

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send("Invalid Blog ID");
        }

        const blog = await Blog.findById(id);

        if (!blog) return res.status(404).send("Not found");

        if (blog.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).send("Not allowed");
        }

        let { title, body } = req.body;

        if (!title || !body) {
            return res.render("editBlog", { blog, error: "Title and body are required." });
        }

        blog.title = title.trim();
        blog.body  = body.trim();

        if (req.file) {
            blog.coverImageURL = req.file.path;
        }

        await blog.save();

        res.redirect("/blog/view/" + blog._id);

    } catch (error) {
        console.log(error);
        res.status(500).send("Error updating blog");
    }
});


module.exports = router;