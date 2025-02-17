const jwt = require('jsonwebtoken');

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

module.exports = { authenticate };
