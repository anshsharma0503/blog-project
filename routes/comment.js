/* 
THIS ROUTE WILL: (/create)

Receive comment text
Receive blog ID
Check user is logged in
Create comment document
Return created comment

 */

const express = require("express");
const router = express.Router();

const Comment = require("../models/comment");

router.post("/create", async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).send("Login required");
        }

        const { content, blogId } = req.body;

        const comment = await Comment.create({
            content,
            blogId,
            createdBy: req.user._id,
        });

        return res.json(comment);

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error creating comment");
    }
});
router.get("/blog/:blogId", async (req, res) => {
    try {
        const comments = await Comment.find({
            blogId: req.params.blogId
        })
        .populate("createdBy", "fullName profileImageURL")
        .sort({ createdAt: -1 });

        return res.redirect("/blog/view/" + blogId);

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error fetching comments");
    }
});
router.delete("/:id", async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).send("Login required");
        }

        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).send("Comment not found");
        }

        if (comment.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).send("Not allowed to delete this comment");
        }

        await Comment.findByIdAndDelete(req.params.id);

        return res.send("Comment deleted successfully");

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error deleting comment");
    }
});
router.put("/:id", async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).send("Login required");
        }

        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).send("Comment not found");
        }

        if (comment.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).send("Not allowed to edit this comment");
        }

        const { content } = req.body;

        comment.content = content || comment.content;

        await comment.save();

        return res.json(comment);

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error updating comment");
    }
});



module.exports = router;