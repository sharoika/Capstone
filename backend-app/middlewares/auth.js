const jwt = require('jsonwebtoken');
const Admin = require("../models/Admin");

const authenticate = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    } else {
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    }
};

const adminAuthenticate = async (req, res, next) => {
    console.log("here");
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    } else {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decoded);
            const isAdmin = await Admin.exists({ _id: decoded.id });
            console.log()
            console.log(isAdmin)
            if (!isAdmin) {
                return res.status(403).json({ message: 'Forbidden: Admin access required' });
            }
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
    }
};

const selfAuthenticate = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id !== req.params.id) {
            return res.status(403).json({ message: 'Forbidden: You can only access your own data' });
        }
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

module.exports = { adminAuthenticate, authenticate, selfAuthenticate };
