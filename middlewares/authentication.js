const jwt = require("jsonwebtoken");
const { SECRET } = require("../services/auth");

function checkForAuthenticationCookie(req, res, next) {

    const tokenCookie = req.cookies?.token;

    if (!tokenCookie) {
        return next();
    }

    try {

        const userPayload = jwt.verify(tokenCookie, SECRET);

        req.user = userPayload;

    } catch (error) {
        console.log("Invalid token");
    }

    return next();
}

module.exports = {
    checkForAuthenticationCookie,
};
