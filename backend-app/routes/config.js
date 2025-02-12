const express = require('express');
const mongoose = require('mongoose');
const { authenticate } = require("../middlewares/auth");
const Configuration = require('../models/Configuration');

const router = express.Router();

router.post('/', authenticate, async (req, res) => {
    try {
        const { maintenanceMode, locationFrequency } = req.body;

        let config = await Configuration.findOne();

        if (config) {
            config.maintenanceMode = maintenanceMode ?? config.maintenanceMode;
            config.locationFrequency = locationFrequency ?? config.locationFrequency;
        } else {
            config = new Configuration({ maintenanceMode, locationFrequency });
        }

        await config.save();
        res.status(200).json({ message: 'Configuration updated successfully', config });
    } catch (error) {
        console.error('Error updating configuration:', error.message);
        res.status(500).json({ message: 'Failed to update configuration' });
    }
});

router.get('/', authenticate, async (req, res) => {
    try {
        let config = await Configuration.findOne();

        if (!config) {
            config = new Configuration();
            await config.save();
        }

        res.status(200).json(config);
    } catch (error) {
        console.error('Error fetching configuration:', error.message);
        res.status(500).json({ message: 'Failed to fetch configuration' });
    }
});

module.exports = router;
