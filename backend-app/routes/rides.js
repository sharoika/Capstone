const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Rider = require('../models/Rider');
const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const Token = require('../models/Token');
const router = express.Router();

// Middleware to authenticate using JWT
const authenticate = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

        next();
  
};

// Create a trip
router.post('/ride', authenticate, async (req, res) => {
   
    const { riderID, start, end, fare } = req.body;

    if (!riderID || !start || !end || !fare) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const ride = new Ride({
            riderID,
            start,
            end,
            fare,
            rideBooked: true,
        });

        await ride.save();
        res.status(201).json({ message: 'Ride created successfully', ride });
    } catch (error) {
        console.error('Error creating ride:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Confirm a trip (Driver accepts a ride)
router.post('/rides/:rideID/confirm', authenticate, async (req, res) => {
    const { rideID } = req.params;
    const { driverID } = req.body;

    if (!driverID) {
        return res.status(400).json({ message: 'Driver ID is required' });
    }

    try {
        const driver = await Driver.findById(driverID);
        if (!driver || !driver.applicationApproved) {
            return res.status(404).json({ message: 'Driver not found or not approved' });
        }

        const ride = await Ride.findById(rideID);
        if (!ride || ride.rideFinished || ride.rideInProgress) {
            return res.status(400).json({ message: 'Invalid ride' });
        }

        ride.driverID = driverID;
        ride.driverSelected = true;
        await ride.save();

        res.json({ message: 'Ride confirmed successfully', ride });
    } catch (error) {
        console.error('Error confirming ride:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Start a trip
router.post('/rides/:rideID/start', authenticate, async (req, res) => {
    const { rideID } = req.params;

    try {
        const ride = await Ride.findById(rideID);
        if (!ride || !ride.driverSelected || ride.rideInProgress) {
            return res.status(400).json({ message: 'Ride cannot be started' });
        }

        ride.rideInProgress = true;
        await ride.save();

        res.json({ message: 'Ride started successfully', ride });
    } catch (error) {
        console.error('Error starting ride:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Finish a trip
router.post('/rides/:rideID/finish', authenticate, async (req, res) => {
    const { rideID } = req.params;

    try {
        const ride = await Ride.findById(rideID);
        if (!ride || !ride.rideInProgress || ride.rideFinished) {
            return res.status(400).json({ message: 'Ride cannot be finished' });
        }

        ride.rideFinished = true;
        ride.rideInProgress = false;

        // Add to completed rides for driver and rider
        const driver = await Driver.findById(ride.driverID);
        const rider = await Rider.findById(ride.riderID);
        if (driver) driver.completedRides.push(ride._id);
        if (rider) rider.completedRides.push(ride._id);

        await Promise.all([ride.save(), driver?.save(), rider?.save()]);

        res.json({ message: 'Ride finished successfully', ride });
    } catch (error) {
        console.error('Error finishing ride:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel a trip
router.post('/rides/:rideID/cancel', authenticate, async (req, res) => {
    const { rideID } = req.params;
    const { cancelBy } = req.body; // 'Rider' or 'Driver'

    if (!cancelBy || !['Rider', 'Driver'].includes(cancelBy)) {
        return res.status(400).json({ message: 'Invalid cancellation actor' });
    }

    try {
        const ride = await Ride.findById(rideID);
        if (!ride || ride.rideFinished) {
            return res.status(400).json({ message: 'Ride cannot be cancelled' });
        }

        ride.cancellationStatus = cancelBy;
        ride.rideBooked = false;
        ride.rideInProgress = false;

        await ride.save();

        res.json({ message: 'Ride cancelled successfully', ride });
    } catch (error) {
        console.error('Error cancelling ride:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Export the router
module.exports = router;
