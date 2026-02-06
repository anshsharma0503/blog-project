const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const connectMongoDB = require("./services/mongodb");
const userRoutes = require("./routes/user");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");

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

// Authentication Middleware
app.use(checkForAuthenticationCookie);

/* ======================
   View Engine Setup
====================== */
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

/* ======================
   Static Files Setup
====================== */
app.use(express.static(path.resolve("./public")));

/* ======================
   Routes
====================== */
app.use("/user", userRoutes);

/* ======================
   Test Protected Route
====================== */
app.get("/profile", (req, res) => {
    if (!req.user) {
        return res.send("Not Logged In");
    }

    return res.json(req.user);
});

/* ======================
   Test Route
====================== */
app.get("/", (req, res) => {
    res.send("Server Running Successfully");
});

/* ======================
   Start Server
====================== */
app.listen(PORT, () => {
    console.log(`Server started at PORT ${PORT}`);
});
