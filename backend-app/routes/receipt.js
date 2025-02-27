const express = require('express');
const router = express.Router();
const Receipt = require('../models/Receipt');
const Ride = require('../models/Ride');
const mongoose = require('mongoose');
const { authenticate } = require("../middlewares/auth");

// Helper function to ensure valid ObjectId
const ensureValidObjectId = (id) => {
    try {
        return mongoose.Types.ObjectId.isValid(id) ? id : mongoose.Types.ObjectId();
    } catch (error) {
        return mongoose.Types.ObjectId();
    }
};

// Generate a receipt for a completed ride
router.post('/receipts/generate', authenticate, async (req, res) => {
    const { rideID, riderID, driverID, timestamp, baseFare, distanceFare, tipAmount, totalAmount, paymentMethod, distance, duration, pickupLocation, dropoffLocation } = req.body;

    if (!rideID) {
        return res.status(400).json({ message: 'Ride ID is required' });
    }

    try {
        // Check if receipt already exists for this ride
        let existingReceipt;
        try {
            existingReceipt = await Receipt.findOne({ rideID: ensureValidObjectId(rideID) });
        } catch (error) {
            console.log('Error checking for existing receipt:', error);
        }
        
        if (existingReceipt) {
            return res.status(200).json({ 
                message: 'Receipt already exists', 
                receipt: existingReceipt 
            });
        }

        // For test receipts, we'll allow creating without checking the ride
        let ride = null;
        try {
            // Try to get ride details
            ride = await Ride.findById(ensureValidObjectId(rideID))
                .populate('riderID')
                .populate('driverID');
        } catch (error) {
            console.log('Ride not found, but continuing for test receipt');
        }

        // Create a new receipt with provided data or data from ride
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
        const receiptNumber = `FLEET-${year}${month}${day}-${random}`;

        const newReceipt = new Receipt({
            rideID: ensureValidObjectId(rideID),
            riderID: ensureValidObjectId(ride?.riderID?._id || riderID),
            driverID: ensureValidObjectId(ride?.driverID?._id || driverID),
            timestamp: timestamp || new Date(),
            baseFare: baseFare || ride?.baseFare || 0,
            distanceFare: distanceFare || ride?.distanceFare || 0,
            tipAmount: tipAmount || ride?.tipAmount || 0,
            totalAmount: totalAmount || ride?.totalAmount || 0,
            paymentMethod: paymentMethod || ride?.paymentMethod || 'Credit Card',
            distance: distance || ride?.distance || 0,
            duration: duration || ride?.duration || 0,
            pickupLocation: pickupLocation || ride?.pickupLocation || 'Unknown',
            dropoffLocation: dropoffLocation || ride?.dropoffLocation || 'Unknown',
            receiptNumber: receiptNumber
        });

        await newReceipt.save();

        return res.status(201).json({
            message: 'Receipt generated successfully',
            receipt: newReceipt
        });
    } catch (error) {
        console.error('Error generating receipt:', error);
        return res.status(500).json({ message: 'Failed to generate receipt', error: error.message });
    }
});

// Get all receipts for a rider
router.get('/receipts/rider/:riderId', authenticate, async (req, res) => {
    const { riderId } = req.params;

    try {
        console.log(`Fetching receipts for rider: ${riderId}`);
        
        // Ensure valid ObjectId
        const validRiderId = ensureValidObjectId(riderId);
        console.log(`Valid rider ID: ${validRiderId}`);
        
        const receipts = await Receipt.find({ riderID: validRiderId })
            .populate('driverID', 'firstName lastName vehicleMake vehicleModel')
            .sort({ timestamp: -1 });
            
        console.log(`Found ${receipts.length} receipts for rider ${riderId}`);
        
        // Log the first receipt to check population
        if (receipts.length > 0) {
            console.log('First receipt driverID:', receipts[0].driverID);
        }

        res.json(receipts);
    } catch (error) {
        console.error('Error fetching rider receipts:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all receipts for a driver
router.get('/receipts/driver/:driverId', authenticate, async (req, res) => {
    const { driverId } = req.params;

    try {
        const receipts = await Receipt.find({ driverID: ensureValidObjectId(driverId) })
            .populate('riderID', 'firstName lastName')
            .sort({ timestamp: -1 });

        res.json(receipts);
    } catch (error) {
        console.error('Error fetching driver receipts:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get receipt for a specific ride
router.get('/receipts/ride/:rideId', authenticate, async (req, res) => {
    const { rideId } = req.params;

    try {
        const receipt = await Receipt.findOne({ rideID: ensureValidObjectId(rideId) })
            .populate('riderID', 'firstName lastName email')
            .populate('driverID', 'firstName lastName email vehicleMake vehicleModel');

        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }

        res.json(receipt);
    } catch (error) {
        console.error('Error fetching receipt for ride:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get a receipt by ID - This must be last to avoid route conflicts
router.get('/receipts/:receiptId', authenticate, async (req, res) => {
    const { receiptId } = req.params;

    try {
        console.log(`Fetching receipt by ID: ${receiptId}`);
        
        let receipt;
        try {
            receipt = await Receipt.findById(receiptId)
                .populate('rideID')
                .populate('riderID', 'firstName lastName email')
                .populate('driverID', 'firstName lastName email vehicleMake vehicleModel');
                
            console.log('Receipt found:', !!receipt);
            if (receipt) {
                console.log('Driver populated:', !!receipt.driverID);
                console.log('Rider populated:', !!receipt.riderID);
            }
        } catch (findError) {
            console.error('Error finding receipt by ID:', findError);
            return res.status(500).json({ message: 'Error finding receipt', error: findError.message });
        }

        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }

        // If driverID or riderID is not populated correctly, try to populate them manually
        if (!receipt.driverID || !receipt.riderID) {
            console.log('Attempting to manually populate missing fields');
            try {
                if (!receipt.driverID) {
                    const Driver = require('../models/Driver');
                    const driver = await Driver.findById(receipt.driverID);
                    if (driver) {
                        receipt.driverID = driver;
                    }
                }
                
                if (!receipt.riderID) {
                    const Rider = require('../models/Rider');
                    const rider = await Rider.findById(receipt.riderID);
                    if (rider) {
                        receipt.riderID = rider;
                    }
                }
            } catch (populateError) {
                console.error('Error manually populating fields:', populateError);
            }
        }

        res.json(receipt);
    } catch (error) {
        console.error('Error fetching receipt:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
