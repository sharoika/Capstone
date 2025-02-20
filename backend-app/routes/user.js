const express = require("express")
const Driver = require('../models/Driver');
const Rider = require('../models/Rider');
const { authenticate } = require("../middlewares/auth");
const { selfAuthenticate } = require("../middlewares/auth");
const router = express.Router();

router.get('/rider/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    
    try {
        const rider = await Rider.findById(id);
        if (!rider) {
            return res.status(404).json({ message: 'Rider not found' });
        }
        res.json(rider);
    } catch (error) {
        console.error('Error fetching rider info:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/driver/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const driver = await Driver.findById(id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.json(driver);
    } catch (error) {
        console.error('Error fetching driver info:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/driver/:id/online', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const driver = await Driver.findById(id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        driver.isOnline = true;
        await driver.save();
        res.json({ message: 'Driver status updated to online', driver });
    } catch (error) {
        console.error('Error updating driver status:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
})

router.get('/drivers', async (req, res) => {
    try {
        const drivers = await Driver.find()
            .select('firstName lastName profilePicture farePrice isOnline');
        res.json(drivers);
    } catch (error) {
        console.error('Error fetching drivers:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/riders/:id',  async (req, res) => {
    const { id } = req.params;

    try {
        const rider = await Rider.findById(id);
        if (!rider) {
            return res.status(404).json({ message: 'Rider not found' });
        }

        res.json(rider); 
    } catch (error) {
        console.error('Error fetching rider:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/drivers/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const driver = await Driver.findById(id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        res.json(driver);
    } catch (error) {
        console.error('Error fetching driver:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/riders/:id', selfAuthenticate, async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, phone, homeLocation } = req.body;

    try {
        const rider = await Rider.findById(id);
        if (!rider) {
            return res.status(404).json({ message: 'Rider not found' });
        }

        if (firstName) rider.firstName = firstName;
        if (lastName) rider.lastName = lastName;
        if (email) rider.email = email;
        if (phone) rider.phone = phone;
        if (homeLocation) rider.homeLocation = homeLocation;

        await rider.save();
        res.json({ message: 'Rider updated successfully', rider });
    } catch (error) {
        console.error('Error updating rider:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/drivers/:id', selfAuthenticate, async (req, res) => {
    const { id } = req.params;
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

    try {
        const driver = await Driver.findById(id);
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
        res.json({ message: 'Driver updated successfully', driver });
    } catch (error) {
        console.error('Error updating driver:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;