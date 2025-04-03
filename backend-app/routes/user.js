const express = require("express")
const Driver = require('../models/Driver');
const Rider = require('../models/Rider');
const Ride = require('../models/Ride');
const { authenticate } = require("../middlewares/auth");
const { selfAuthenticate } = require("../middlewares/auth");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer storage for profile pictures
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "uploads/profile-pictures";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    },
});

// File filter for images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

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

router.put('/driver/:id/offline', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const driver = await Driver.findById(id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        driver.isOnline = false;
        await driver.save();
        res.json({ message: 'Driver status updated to offline', driver });
    } catch (error) {
        console.error('Error updating driver status:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/drivers', async (req, res) => {
    try {
        const drivers = await Driver.find()
            .select('firstName lastName profilePicture farePrice baseFee isOnline');
        res.json(drivers);
    } catch (error) {
        console.error('Error fetching drivers:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/riders/:id', async (req, res) => {
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

// Upload rider profile picture
router.post('/riders/:id/profile-picture', selfAuthenticate, upload.single('profilePicture'), async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const rider = await Rider.findById(id);
        if (!rider) {
            return res.status(404).json({ message: 'Rider not found' });
        }

        // Delete old profile picture if it exists
        if (rider.profilePicture && fs.existsSync(rider.profilePicture)) {
            fs.unlinkSync(rider.profilePicture);
        }

        // Update rider with new profile picture path
        rider.profilePicture = req.file.path;
        await rider.save();

        res.status(200).json({
            message: 'Profile picture uploaded successfully',
            profilePicture: `${req.protocol}://${req.get('host')}/${req.file.path}`
        });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({
            message: 'Error uploading profile picture',
            error: error.message
        });
    }
});

// Upload driver profile picture
router.post('/drivers/:id/profile-picture', selfAuthenticate, upload.single('profilePicture'), async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const driver = await Driver.findById(id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Delete old profile picture if it exists
        if (driver.profilePicture && fs.existsSync(driver.profilePicture)) {
            fs.unlinkSync(driver.profilePicture);
        }

        // Update driver with new profile picture path
        driver.profilePicture = req.file.path;
        await driver.save();

        res.status(200).json({
            message: 'Profile picture uploaded successfully',
            profilePicture: `${req.protocol}://${req.get('host')}/${req.file.path}`
        });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({
            message: 'Error uploading profile picture',
            error: error.message
        });
    }
});

router.get('/riders/:id/rides', async (req, res) => {
    const { id } = req.params;

    try {
        const rides = await Ride.find({ riderID: id })
            .populate('riderID', 'firstName lastName email phone homeLocation profilePicture')
            .populate('driverID', 'firstName lastName email phone profilePicture vehicleMake vehicleModel')
            .exec();

        if (!rides || rides.length === 0) {
            return res.status(404).json({ message: 'No past rides found for this rider' });
        }

        res.json(rides);
    } catch (error) {
        console.error('Error fetching past rides for rider:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/drivers/:id/rides', async (req, res) => {
    const { id } = req.params;

    try {
        const rides = await Ride.find({ driverID: id })
            .populate('riderID', 'firstName lastName email phone homeLocation profilePicture')
            .populate('driverID', 'firstName lastName email phone profilePicture vehicleMake vehicleModel')
            .exec();

        if (!rides || rides.length === 0) {
            return res.status(404).json({ message: 'No past rides found for this driver' });
        }

        res.json(rides);
    } catch (error) {
        console.error('Error fetching past rides for driver:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;