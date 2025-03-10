const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

const adminAuthenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        
        req.user = { id: decoded.id, isAdmin: true };
        next();
    } catch (error) {
        console.error('Admin auth middleware error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { authenticate, adminAuthenticate }; 