const express = require("express")

const { authenticate } = require("../middlewares/auth");

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
        const drivers = await Driver.find();
        res.json(drivers);
    } catch (error) {
        console.error('Error fetching drivers:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;