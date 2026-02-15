const express = require("express");
const router = express.Router();

const Blog = require("../models/blog");
const Comment = require("../models/comment");


// CREATE PAGE
router.get("/new", (req, res) => {
    if (!req.user) return res.redirect("/user/login");
    res.render("createBlog");
});


// VIEW BLOG
router.get("/view/:id", async (req, res) => {

    const blog = await Blog.findById(req.params.id)
        .populate("createdBy", "fullName");

    const comments = await Comment.find({ blogId: req.params.id })
        .populate("createdBy", "fullName")
        .sort({ createdAt: -1 });

    res.render("blog", { blog, comments });

});


// CREATE BLOG
router.post("/create", async (req, res) => {

    if (!req.user) return res.send("Login required");

    await Blog.create({
        title: req.body.title,
        body: req.body.body,
        coverImageURL: "/images/default.png",
        createdBy: req.user._id,
    });

    res.redirect("/");
});


// DELETE BLOG
router.post("/delete/:id", async (req, res) => {

    const blog = await Blog.findById(req.params.id);

    if (!blog) return res.send("Not found");

    if (blog.createdBy.toString() !== req.user._id.toString())
        return res.send("Not allowed");

    await Blog.findByIdAndDelete(req.params.id);

    res.redirect("/");
});


// EDIT BLOG PAGE
router.get("/edit/:id", async (req, res) => {

    const blog = await Blog.findById(req.params.id);

    if (!blog) return res.send("Not found");

    if (blog.createdBy.toString() !== req.user._id.toString())
        return res.send("Not allowed");

    res.render("editBlog", { blog });

});


// UPDATE BLOG
router.post("/edit/:id", async (req, res) => {

    const blog = await Blog.findById(req.params.id);

    if (!blog) return res.send("Not found");

    if (blog.createdBy.toString() !== req.user._id.toString())
        return res.send("Not allowed");

    blog.title = req.body.title;
    blog.body = req.body.body;

    await blog.save();

    res.redirect("/blog/view/" + blog._id);
});


module.exports = router;
