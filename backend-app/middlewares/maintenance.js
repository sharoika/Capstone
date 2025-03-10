const Configuration = require('../models/Configuration');

const maintenanceCheck = async (req, res, next) => {
    try {
        const config = await Configuration.findOne();
        if (config?.maintenanceMode) {
            if (req.path.startsWith('/api/admin')) {
                return next();
            }
            return res.status(503).json({ 
                message: 'System is currently under maintenance. Please try again later.' 
            });
        }
        next();
    } catch (error) {
        console.error('Error checking maintenance mode:', error);
        next();
    }
};

module.exports = maintenanceCheck;
