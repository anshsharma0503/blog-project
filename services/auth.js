const jwt = require("jsonwebtoken");

const SECRET = process.env.SECRET;   
function createTokenForUser(user) {

    return jwt.sign(
        {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profileImageURL: user.profileImageURL,
        },
        SECRET
    );

}

module.exports = {
    createTokenForUser,
    SECRET
};
