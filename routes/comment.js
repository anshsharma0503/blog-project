const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Comment = require("../models/comment");


// ======================
// CREATE COMMENT
// ======================
router.post("/create", async (req, res) => {

    try {

        if (!req.user) return res.status(401).send("Login required");

        let { content, blogId } = req.body;

        if (!content || !blogId) {
            return res.send("Missing data");
        }

        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).send("Invalid blog id");
        }

        content = content.trim();

        if (content.length < 1) {
            return res.send("Comment cannot be empty");
        }

        await Comment.create({
            content,
            blogId,
            createdBy: req.user._id,
        });

        res.redirect("/blog/view/" + blogId);

    } catch (error) {

        console.log(error);
        res.status(500).send("Error creating comment");

    }

});


// ======================
// DELETE COMMENT
// ======================
router.post("/delete/:id", async (req, res) => {

    try {

        if (!req.user) return res.status(401).send("Login required");

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send("Invalid comment id");
        }

        const comment = await Comment.findById(id);

        if (!comment) return res.status(404).send("Not found");

        if (comment.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).send("Not allowed");
        }

        const blogId = comment.blogId;

        await Comment.findByIdAndDelete(id);

        res.redirect("/blog/view/" + blogId);

    } catch (error) {

        console.log(error);
        res.status(500).send("Error deleting comment");

    }

});


// ======================
// UPDATE COMMENT
// ======================
router.post("/edit/:id", async (req, res) => {

    try {

        if (!req.user) return res.status(401).send("Login required");

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send("Invalid comment id");
        }

        const comment = await Comment.findById(id);

        if (!comment) return res.status(404).send("Not found");

        if (comment.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).send("Not allowed");
        }

        let { content } = req.body;

        if (!content) return res.send("Content required");

        content = content.trim();

        if (content.length < 1) {
            return res.send("Comment cannot be empty");
        }

        comment.content = content;

        await comment.save();

        res.redirect("/blog/view/" + comment.blogId);

    } catch (error) {

        console.log(error);
        res.status(500).send("Error updating comment");

    }

});

module.exports = router;