const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const connectMongoDB = require("./services/mongodb");

const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/blog");
const commentRoutes = require("./routes/comment");

const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const Blog = require("./models/blog");

const app = express();
const PORT = 8000;

/* ======================
   MongoDB Connection
====================== */
connectMongoDB("mongodb://127.0.0.1:27017/blog-project")
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("Mongo Error:", err));

/* ======================
   Middlewares
====================== */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* Authentication middleware */
app.use(checkForAuthenticationCookie);

/* ======================
   View Engine Setup
====================== */
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

/* ======================
   Static Files
====================== */
app.use(express.static(path.resolve("./public")));

/* ======================
   Routes
====================== */
app.use("/user", userRoutes);
app.use("/blog", blogRoutes);
app.use("/comment", commentRoutes);

/* ======================
   Homepage (Render Blogs)
====================== */
app.get("/", async (req, res) => {
    try {
        const blogs = await Blog.find({})
            .populate("createdBy", "fullName profileImageURL")
            .sort({ createdAt: -1 });

        res.render("home", {
            user: req.user,
            blogs
        });

    } catch (error) {
        console.log(error);
        res.status(500).send("Error loading homepage");
    }
});

/* ======================
   Profile Test Route
====================== */
app.get("/profile", (req, res) => {
    if (!req.user) return res.send("Not Logged In");
    res.json(req.user);
});

/* ======================
   Start Server
====================== */
app.listen(PORT, () => {
    console.log(`Server started at PORT ${PORT}`);
});
