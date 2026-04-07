const jwt = require("jsonwebtoken");

const SECRET = process.env.SECRET;
const TOKEN_EXPIRY = "1d";

// ======================
// SAFETY CHECK
// ======================
if (!SECRET) {
    throw new Error("SECRET is missing in environment variables.");
}


// ======================
// BUILD SAFE TOKEN PAYLOAD
// ======================
function buildUserPayload(user) {
    return {
        _id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        profileImageURL: user.profileImageURL,
    };
}


// ======================
// CREATE JWT TOKEN
// ======================
function createTokenForUser(user) {

    const payload = buildUserPayload(user);

    return jwt.sign(payload, SECRET, {
        expiresIn: TOKEN_EXPIRY,
        algorithm: "HS256",
    });
}


// ======================
// VERIFY JWT TOKEN
// ======================
function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET, {
            algorithms: ["HS256"],
        });
    } catch (err) {
        throw new Error("Invalid or expired token");
    }
}


module.exports = {
    createTokenForUser,
    verifyToken,
};