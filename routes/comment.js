const express = require("express");
const router = express.Router();
const Comment = require("../models/comment");


// CREATE COMMENT
router.post("/create", async (req, res) => {

    if (!req.user) return res.send("Login required");

    const { content, blogId } = req.body;

    await Comment.create({
        content,
        blogId,
        createdBy: req.user._id,
    });

    res.redirect("/blog/view/" + blogId);
});


// DELETE COMMENT
router.post("/delete/:id", async (req, res) => {

    const comment = await Comment.findById(req.params.id);

    if (!comment) return res.send("Not found");

    if (comment.createdBy.toString() !== req.user._id.toString())
        return res.send("Not allowed");

    const blogId = comment.blogId;

    await Comment.findByIdAndDelete(req.params.id);

    res.redirect("/blog/view/" + blogId);
});


// UPDATE COMMENT
router.post("/edit/:id", async (req, res) => {

    const comment = await Comment.findById(req.params.id);

    if (!comment) return res.send("Not found");

    if (comment.createdBy.toString() !== req.user._id.toString())
        return res.send("Not allowed");

    comment.content = req.body.content;

    await comment.save();

    res.redirect("/blog/view/" + comment.blogId);
});

module.exports = router;
