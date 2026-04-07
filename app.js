require("dotenv").config();

const express    = require("express");
const path       = require("path");
const fs         = require("fs");
const cookieParser = require("cookie-parser");

const connectDb  = require("./config/db");
const userRoutes    = require("./routes/user");
const blogRoutes    = require("./routes/blog");
const commentRoutes = require("./routes/comment");

const { checkForAuthenticationCookie } = require("./middlewares/authentication");
const Blog = require("./models/blog");

const app  = express();
const PORT = process.env.PORT || 8000;


/* ======================
   DIRECTORY SELF-HEAL
   Ensures public/images and public/uploads are DIRECTORIES,
   not stale placeholder files, and seeds default SVGs.
====================== */
function setupPublicDirs() {

    const dirs = [
        path.resolve("./public/images"),
        path.resolve("./public/uploads"),
    ];

    for (const dir of dirs) {
        try {
            if (fs.existsSync(dir)) {
                if (!fs.statSync(dir).isDirectory()) {
                    fs.unlinkSync(dir);          // remove stale file
                    fs.mkdirSync(dir, { recursive: true });
                }
            } else {
                fs.mkdirSync(dir, { recursive: true });
            }
        } catch (e) {
            console.warn(`⚠️  Could not setup dir ${dir}:`, e.message);
        }
    }

    // ---- default blog cover SVG ----
    const defaultBlogPath = path.resolve("./public/images/default-blog.svg");
    if (!fs.existsSync(defaultBlogPath)) {
        fs.writeFileSync(defaultBlogPath, `<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   style="stop-color:#1e1b4b"/>
      <stop offset="50%"  style="stop-color:#0c4a6e"/>
      <stop offset="100%" style="stop-color:#1e1b4b"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="40%">
      <stop offset="0%"   style="stop-color:#8b5cf6;stop-opacity:0.22"/>
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="400" fill="url(#bg)"/>
  <rect width="800" height="400" fill="url(#glow)"/>
  <text x="400" y="230" text-anchor="middle" font-family="Georgia,serif" font-size="80" fill="rgba(255,255,255,0.1)">&#9998;</text>
  <text x="400" y="280" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="rgba(255,255,255,0.15)" letter-spacing="6">BLOG POST</text>
</svg>`);
    }

    // ---- default user avatar SVG ----
    const defaultUserPath = path.resolve("./public/images/default.svg");
    if (!fs.existsSync(defaultUserPath)) {
        fs.writeFileSync(defaultUserPath, `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="av" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   style="stop-color:#8b5cf6"/>
      <stop offset="100%" style="stop-color:#06b6d4"/>
    </linearGradient>
  </defs>
  <circle cx="100" cy="100" r="100" fill="url(#av)"/>
  <circle cx="100" cy="82"  r="32"  fill="rgba(255,255,255,0.85)"/>
  <ellipse cx="100" cy="162" rx="50" ry="40" fill="rgba(255,255,255,0.85)"/>
</svg>`);
    }

    console.log("📁 Public directories ready");
}

// Run immediately (sync, before anything else)
setupPublicDirs();


/* ======================
   CORE MIDDLEWARES
====================== */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(checkForAuthenticationCookie);

app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});


/* ======================
   VIEW ENGINE
====================== */
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));


/* ======================
   STATIC FILES
====================== */
app.use(express.static(path.resolve("./public")));


/* ======================
   ROUTES
====================== */
app.use("/user",    userRoutes);
app.use("/blog",    blogRoutes);
app.use("/comment", commentRoutes);


/* ======================
   HOMEPAGE
====================== */
app.get("/", async (req, res, next) => {
    try {
        const blogs = await Blog.find({})
            .populate("createdBy", "fullName profileImageURL")
            .sort({ createdAt: -1 });

        res.render("home", { blogs });
    } catch (error) {
        next(error);
    }
});


/* ======================
   404 HANDLER
====================== */
app.use((req, res) => {
    res.status(404).render("404");
});


/* ======================
   GLOBAL ERROR HANDLER
====================== */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong. Please try again.");
});


/* ======================
   START SERVER
====================== */
async function startServer() {
    await connectDb();
    app.listen(PORT, () => {
        console.log(`🚀 Server started on http://localhost:${PORT}`);
    });
}

startServer();