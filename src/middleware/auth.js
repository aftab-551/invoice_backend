const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // 1. Get the token from the header (format: "Bearer <token>")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    try {
        // 2. Verify the token using your JWT_SECRET
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Add user info to the request object
        next(); // Move to the next function (the controller)
    } catch (err) {
        res.status(403).json({ message: "Invalid or Expired Token" });
    }
};

module.exports = authenticateToken;