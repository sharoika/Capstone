const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Driver = require('../models/Driver');
const Payout = require('../models/Payout');

// Add these new endpoints
router.get('/earnings', authenticate, async (req, res) => {
    try {
        const driver = await Driver.findById(req.user.id)
            .select('ledger')
            .populate('ledger.transactions.rideID');
        
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        res.json(driver.ledger);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/payout-request', authenticate, async (req, res) => {
    const { amount } = req.body;

    try {
        const driver = await Driver.findById(req.user.id);
        
        if (!driver || driver.ledger.availableBalance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Create new payout request
        const payout = new Payout({
            driverID: driver._id,
            amount: amount,
            email: driver.email,
            status: 'AWAITING_PAYOUT'
        });

        // Update driver's ledger
        driver.ledger.availableBalance -= amount;
        
        await Promise.all([payout.save(), driver.save()]);

        res.json({ 
            message: 'Payout request submitted', 
            ledger: driver.ledger,
            payout: payout
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update driver's fare price
router.put('/fare', authenticate, async (req, res) => {
    try {
        const { farePrice, initialPrice } = req.body;
        
        if (typeof farePrice !== 'number' || farePrice < 0 || typeof initialPrice !== 'number' || initialPrice < 0) {
            return res.status(400).json({ message: 'Invalid price values' });
        }

        const driver = await Driver.findById(req.user.id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        driver.farePrice = farePrice;
        driver.initialPrice = initialPrice;
        await driver.save();

        res.json({ 
            success: true,
            message: 'Prices updated successfully',
            farePrice: driver.farePrice,
            initialPrice: driver.initialPrice
        });
    } catch (error) {
        console.error('Error updating prices:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/drivers', authenticate, async (req, res) => {
    try {
        const drivers = await Driver.find({ isOnline: true })
            .select('firstName lastName profilePicture farePrice');
        res.json(drivers);
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update driver profile
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            email, 
            phone,
            vehicleMake,
            vehicleModel,
            vehicleYear,
            vehiclePlate
        } = req.body;

        const driver = await Driver.findById(req.user.id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        if (firstName) driver.firstName = firstName;
        if (lastName) driver.lastName = lastName;
        if (email) driver.email = email;
        if (phone) driver.phone = phone;
        if (vehicleMake) driver.vehicleMake = vehicleMake;
        if (vehicleModel) driver.vehicleModel = vehicleModel;
        if (vehicleYear) driver.vehicleYear = vehicleYear;
        if (vehiclePlate) driver.vehiclePlate = vehiclePlate;

        await driver.save();
        res.json({ message: 'Driver profile updated successfully', driver });
    } catch (error) {
        console.error('Error updating driver profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Modify the test earnings endpoint
router.post('/test/add-earnings', authenticate, async (req, res) => {
    try {
        const driver = await Driver.findById(req.user.id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Initialize ledger if it doesn't exist
        if (!driver.ledger) {
            driver.ledger = {
                totalEarnings: 0,
                availableBalance: 0,
                transactions: []
            };
        }

        const testEarning = {
            amount: 10.00,
            type: 'EARNING',
            status: 'COMPLETED',
            timestamp: new Date(),
            description: 'Test earning'
        };

        driver.ledger.totalEarnings += testEarning.amount;
        driver.ledger.availableBalance += testEarning.amount;
        driver.ledger.transactions.push(testEarning);

        await driver.save();

        return res.status(200).json({ 
            success: true,
            message: 'Test earnings added successfully',
            ledger: driver.ledger 
        });
    } catch (error) {
        console.error('Error adding test earnings:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
});

module.exports = router;