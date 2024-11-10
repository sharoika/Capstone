const jwt = require('jsonwebtoken');
const Token = require('../models/Token');

const authenticate = async (req, res, next) => {
    // Check if the Authorization header contains the token
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Extract token from "Bearer <token>"
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = { authenticate };
