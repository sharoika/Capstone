const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Rider = require('../models/Rider');
const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const RideStates = require('../models/enums/RideStates');
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const axios = require('axios');
const { chargePaymentMethod } = require('../services/payment');


router.post('/ride', authenticate, async (req, res) => {
    const { riderID, start, end, distance } = req.body;

    if (!riderID || !start || !end || !distance) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    if (
        !start.coordinates ||
        !Array.isArray(start.coordinates) ||
        start.coordinates.length !== 2 ||
        !end.coordinates ||
        !Array.isArray(end.coordinates) ||
        end.coordinates.length !== 2
    ) {
        return res.status(400).json({ message: 'Invalid location format' });
    }

    const numericDistance = parseFloat(distance.replace(/[^\d.-]/g, ''));

    if (isNaN(numericDistance)) {
        return res.status(400).json({ message: 'Invalid distance' });
    }

    try {
        const ride = new Ride({
            riderID,
            start: { type: 'Point', coordinates: start.coordinates },
            end: { type: 'Point', coordinates: end.coordinates },
            distance: numericDistance,
            status: RideStates.PROPOSED,
        });

        await ride.save();

        res.status(201).json({
            message: 'Ride created successfully',
            ride: ride,
            rideID: ride._id,
            distance: numericDistance
        });
    } catch (error) {
        console.error('Error creating ride:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Confirm a trip rider picks a driver
router.post('/rides/:rideID/confirm', authenticate, async (req, res) => {
    const { rideID } = req.params;
    const { driverID } = req.body;
    console.log(rideID);
    if (!driverID) {
        return res.status(400).json({ message: 'Driver ID is required' });
    }

    try {
        const driver = await Driver.findById(driverID);
        if (!driver) { //add this back || !driver.applicationApproved
            return res.status(404).json({ message: 'Driver not found or not approved' });
        }

        const ride = await Ride.findById(rideID);
        if (!ride) {
            return res.status(400).json({ message: 'Invalid ride' });
        }

        if (ride.status !== RideStates.PROPOSED) {
            return res.status(400).json({ message: 'Ride cannot be confirmed at this stage' });
        }
        console.log("here");
        ride.driverID = driverID;
        ride.status = RideStates.SELECTED;
        await ride.save();

        res.json({ message: 'Ride confirmed successfully', ride });
    } catch (error) {
        console.error('Error confirming ride:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/rides/:rideID/accept', authenticate, async (req, res) => {
    const { rideID } = req.params;
    const { driverID } = req.body;

    if (!driverID) {
        return res.status(400).json({ message: 'Driver ID is required' });
    }

    try {
        const ride = await Ride.findById(rideID);
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.status !== RideStates.SELECTED) {
            return res.status(400).json({ message: 'Ride cannot be accepted at this stage' });
        }

        if (ride.driverID.toString() !== driverID) {
            return res.status(403).json({ message: 'Driver not assigned to this ride' });
        }

        ride.status = RideStates.ACCEPTED;
        await ride.save();

        res.json({ message: 'Ride accepted successfully', ride });
    } catch (error) {
        console.error('Error accepting ride:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/rides/driver/:driverID', authenticate, async (req, res) => {
    const { driverID } = req.params;

    try {
        const rides = await Ride.find({
            driverID: driverID,
            status: RideStates.SELECTED,
        }).select('start end fare distance status farePrice baseFee');

        res.json({ message: 'Rides found for driver', rides });
    } catch (error) {
        console.error('Error fetching rides for driver:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Start a trip
router.post('/rides/:rideID/start', authenticate, async (req, res) => {
    const { rideID } = req.params;
    const { fare } = req.body;

    try {
        const ride = await Ride.findById(rideID);
        if (!ride) {
            return res.status(400).json({ message: 'Ride cannot be started' });
        }

        if (ride.status !== RideStates.ACCEPTED) {
            return res.status(400).json({ message: 'Ride cannot be started at this stage' });
        }

        ride.status = RideStates.INPROGRESS;
        ride.fare = fare;
        await ride.save();

        res.json({
            message: 'Ride started successfully',
            ride,
            fare: ride.fare
        });
    } catch (error) {
        console.error('Error starting ride:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/rides/:rideID/finish', authenticate, async (req, res) => {
    const { rideID } = req.params;
    const { driverID, tipAmount = 0 } = req.body;

    try {
        const ride = await Ride.findById(rideID);
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.status !== RideStates.INPROGRESS) {
            return res.status(400).json({ message: 'Ride cannot be finished at this stage' });
        }

        ride.status = RideStates.COMPLETED;
        ride.tipAmount = tipAmount;
        await ride.save();

        // Update rider's completed rides
        const rider = await Rider.findById(ride.riderID);
        if (rider) {
            rider.completedRides.push(ride._id);
            await rider.save();
        }

        // Update driver's completed rides and ledger
        const driver = await Driver.findById(ride.driverID);
        if (driver) {
            driver.completedRides.push(ride._id);

            // Calculate fare components
            const baseFare = driver.baseFee || 2;
            const distanceFare = ride.distance * (driver.farePrice || 1.5);
            const totalFare = parseInt(baseFare + distanceFare + parseFloat(tipAmount)) * 100;

            // Update ride fare
            ride.fare = totalFare;
            await ride.save();

            // Update driver ledger
            driver.ledger.availableBalance += totalFare;
            await driver.save();

            console.log(rider);
            console.log(driver);
            if (rider && driver) {
                console.log("charging payment method");
                const paymentIntent = await chargePaymentMethod(rider.id, totalFare);
                console.log(paymentIntent.id);

                ride.stripeTransactionId = paymentIntent.id;
                ride.stripeTransactionTime = new Date();
                await ride.save();
            }
        }
        res.json({
            message: 'Ride finished successfully',
            ride,
            driverBalance: driver ? driver.ledger.availableBalance : null
        });
    } catch (error) {
        console.error('Error finishing ride:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/riders/:riderID/recent-ride', authenticate, async (req, res) => {
    const { riderID } = req.params;

    try {
        const rider = await Rider.findById(riderID).populate({
            path: 'completedRides',
            options: { sort: { _id: -1 }, limit: 1 }
        });

        if (!rider || rider.completedRides.length === 0) {
            return res.status(404).json({ message: 'No completed rides found' });
        }

        res.json({ recentRide: rider.completedRides[0] });
    } catch (error) {
        console.error('Error fetching recent ride:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Check if a ride is finished
router.get('/rides/:rideID/status', authenticate, async (req, res) => {
    const { rideID } = req.params;

    try {
        const ride = await Ride.findById(rideID);
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        res.json({
            rideID: ride._id,
            status: ride.status,
            isCompleted: ride.status === RideStates.COMPLETED,
            isInProgress: ride.status === RideStates.INPROGRESS,
            start: ride.start,
            end: ride.end,
        });
    } catch (error) {
        console.error('Error checking ride status:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// Get details of a ride by its ID
router.get('/rides/:rideID', authenticate, async (req, res) => {
    const { rideID } = req.params;

    try {
        const ride = await Ride.findById(rideID)
            .populate('riderID')
            .populate('driverID', 'firstName lastName profilePicture farePrice baseFee currentLocation'); // Add currentLocation to populate

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Format the driver's location (if available)
        const driverLocation = ride.driverID && ride.driverID.currentLocation
            ? {
                type: ride.driverID.currentLocation.type,
                coordinates: ride.driverID.currentLocation.coordinates
            }
            : null;

        res.json({
            rideID: ride._id,
            start: ride.start,
            end: ride.end,
            fare: ride.fare,
            distance: ride.distance,
            status: ride.status,
            rider: ride.riderID,
            driver: ride.driverID ? {
                _id: ride.driverID._id,
                firstName: ride.driverID.firstName,
                lastName: ride.driverID.lastName,
                profilePicture: ride.driverID.profilePicture,
                farePrice: ride.driverID.farePrice || 0,
                baseFee: ride.driverID.baseFee || 2,
                currentLocation: driverLocation, // Include current location here
            } : null,
            cancellationStatus: ride.cancellationStatus,
        });
    } catch (error) {
        console.error('Error fetching ride details:', error.message);
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
        if (!ride) {
            return res.status(400).json({ message: 'Ride cannot be cancelled' });
        }

        ride.cancellationStatus = cancelBy;
        ride.status = RideStates.CANCELLED;

        await ride.save();

        res.json({ message: 'Ride cancelled successfully', ride });
    } catch (error) {
        console.error('Error cancelling ride:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
