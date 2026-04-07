const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 200,
    },

    body: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
    },

    coverImageURL: {
        type: String,
        default: "/images/default-blog.svg",
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true,
    },

},
{ timestamps: true }
);


// ======================
// INDEX FOR FAST HOMEPAGE
// ======================
blogSchema.index({ createdAt: -1 });


const Blog = mongoose.model("blog", blogSchema);

module.exports = Blog;