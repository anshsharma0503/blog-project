const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// ======================
// CLOUDINARY CONFIG
// ======================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ======================
// STORAGE ENGINE (CLOUDINARY)
// ======================
// It uploads files directly to a folder called "blogapp_covers" on Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "blogapp_covers",
        allowed_formats: ["jpeg", "jpg", "png", "gif", "webp"],
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

module.exports = upload;
