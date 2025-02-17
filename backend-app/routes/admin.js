const express = require("express")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const Rider= require("../models/Rider");
const Driver = require("../models/Driver");

const { adminAuthenticate } = require("../middlewares/auth");

const router = express.Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ username });
        if (!admin || await !bcrypt.compare(password, admin.password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '24h' });
        req.session.token = token;
        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ error: 'An error occurred trying to login.' });
    }
});

router.post('/register', adminAuthenticate, async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const newAdmin = new Admin({ username, password });
        await newAdmin.save();
        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        console.error('Error during register:', error.message);
        res.status(500).json({ error: 'An error occurred trying to register.' });
    }
});

router.get('/riders', adminAuthenticate, async (req, res) => {
    const users = await Rider.find();
    res.json(users);
});

router.get('/drivers', adminAuthenticate, async (req, res) => {
    try {
        const drivers = await Driver.find();
        res.json(drivers);
    } catch (error) {
        console.error('Error fetching drivers:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/drivers/:id/approval', adminAuthenticate, async (req, res) => {
    const { id } = req.params;
    const { approve } = req.body;
    try {
        const driver = await Driver.findById(id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        driver.applicationApproved = approve === true || approve === "true";
        await driver.save();
        res.json({
            message: `Driver ${driver.applicationApproved ? 'approved' : 'rejected'} successfully`,
            driver
        });
    } catch (error) {
        console.error('Error updating driver approval:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;