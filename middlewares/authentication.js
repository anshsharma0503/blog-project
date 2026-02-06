const { validateToken } = require("../services/authentication");

function checkForAuthenticationCookie(req, res, next) {
    const tokenCookie = req.cookies.token;

    if (!tokenCookie) {
        return next();
    }

    try {
        const userPayload = validateToken(tokenCookie);
        req.user = userPayload;
    } catch (error) {}

    return next();
}

module.exports = {
    checkForAuthenticationCookie
};
