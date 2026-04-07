const mongoose = require("mongoose");

// ======================
// CONNECT DATABASE
// ======================
async function connectDb() {

    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
        throw new Error("MONGO_URI missing in environment variables");
    }

    try {

        await mongoose.connect(mongoURI, {
            autoIndex: true,
        });

        console.log("✅ MongoDB connected");

    } catch (error) {

        console.error("❌ MongoDB connection failed:", error.message);

        // Crash the app intentionally if DB fails
        process.exit(1);
    }
}

module.exports = connectDb;