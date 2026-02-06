const jwt = require("jsonwebtoken");

const SECRET = "my-secret-key";

function createToken(user) {
    return jwt.sign(
        {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profileImageURL: user.profileImageURL
        },
        SECRET
    );
}

function validateToken(token) {
    return jwt.verify(token, SECRET);
}

module.exports = {
    createToken,
    validateToken
};
