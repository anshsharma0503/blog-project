const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
{
    content: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 2000,
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true,
    },

    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "blog",
        required: true,
        index: true,
    },

},
{ timestamps: true }
);


// ======================
// FAST COMMENT FETCH FOR BLOG PAGE
// ======================
commentSchema.index({ blogId: 1, createdAt: -1 });


const Comment = mongoose.model("comment", commentSchema);

module.exports = Comment;