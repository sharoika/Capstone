const express = require('express');
const Location = require('../models/Location');
const Rider = require('../models/Rider');
const Driver = require('../models/Driver');
const router = express.Router();
const { authenticate } = require("../middlewares/auth");

router.post('/location/update', authenticate, async (req, res) => {
    const { userId, userType, rideID, lat, long, timestamp } = req.body;
    console.log("location");
    if (!userId || !userType || !lat || !long || !timestamp) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    let userModel;
    switch (userType.toLowerCase()) {
        case 'rider':
            userModel = Rider;
            break;
        case 'driver':
            userModel = Driver;
            break;
        default:
            return res.status(400).json({ message: 'Invalid user type' });
    }

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.currentLocation = {
            type: "Point",
            coordinates: [long, lat] 
        };

        await user.save();

        const locationLog = new Location({
            userId,
            rideId: rideID || null,
            location: { lat, long },
            timestamp: timestamp
        });
        await locationLog.save();

        res.status(200).json({ message: 'Location updated successfully', location: { lat, long } });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/getOne', authenticate, async (req, res) => {
    const { userId, userType } = req.query;

    if (!userId || !userType) {
        return res.status(400).json({ message: 'Missing required query parameters' });
    }

    let userModel;
    switch (userType.toLowerCase()) {
        case 'rider':
            userModel = Rider;
            break;
        case 'driver':
            userModel = Driver;
            break;
        default:
            return res.status(400).json({ message: 'Invalid user type' });
    }

    try {
        const user = await userModel.findById(userId);
        if (!user || !user.currentLocation) {
            return res.status(404).json({ message: 'User or location not found' });
        }

        const location = user.currentLocation.coordinates;
        res.status(200).json({ message: 'Location fetched successfully', location: { lat: location[1], long: location[0] } });
    } catch (error) {
        console.error('Error fetching location:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/getBoth', authenticate, async (req, res) => {
    const { rideID } = req.body;

    if (!rideID) {
        return res.status(400).json({ message: 'Missing rideID query parameter' });
    }

    try {
        const rider = await Rider.findOne({ "rideID": rideID });
        const driver = await Driver.findOne({ "rideID": rideID });

        if (!rider || !driver) {
            return res.status(404).json({ message: 'Both rider and driver must be associated with the rideID' });
        }

        if (!rider.currentLocation || !driver.currentLocation) {
            return res.status(404).json({ message: 'Location for rider or driver not found' });
        }

        const riderLocation = rider.currentLocation.coordinates;
        const driverLocation = driver.currentLocation.coordinates;

        res.status(200).json({
            message: 'Both rider and driver locations fetched successfully',
            locations: {
                rider: { lat: riderLocation[1], long: riderLocation[0] },
                driver: { lat: driverLocation[1], long: driverLocation[0] }
            }
        });
    } catch (error) {
        console.error('Error fetching locations for both:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
