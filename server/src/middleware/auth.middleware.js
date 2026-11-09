const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authorization = req.headers.authorization

    if (
        typeof authorization !== "string" ||
        !authorization.startsWith("Bearer ")
    ) {
        return res.status(401).json({
            message: "Authentication required."
        });
    }

    const token = authorization.slice(7).trim();

    if (!token) {
        return res.status(401).json({
            message: "Authentication required.",
        });
    }

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured");
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });

        if (typeof payload.sub !== "string") {
            return res.status(401).json({
                message: "Invalid token."
            });
        }

        req.user = { id: payload.sub };
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token."
        });
    }
};