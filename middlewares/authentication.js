const { verifyToken } = require("../services/auth");

function checkForAuthenticationCookie(req, res, next) {

    const token = req.cookies?.token;

    // No token → guest user → continue
    if (!token) return next();

    try {

        // verify + decode JWT safely
        const userPayload = verifyToken(token);

        // attach user to request object
        req.user = userPayload;

    } catch (error) {

        // invalid / expired token → remove it
        res.clearCookie("token");

        // treat as guest user
    }

    next();
}

module.exports = {
    checkForAuthenticationCookie,
};