const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Rider = require("../models/Rider");
const Driver = require("../models/Driver");

const { authenticate } = require("../middlewares/auth");

const router = express.Router();

router.post('/rider/register', async (req, res) => {
  const { firstName, lastName, email, phone, password, homeLocation } = req.body;

  try {
    const existingRider = await Rider.findOne({ email });
    if (existingRider) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newRider = new Rider({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      homeLocation,
    });

    await newRider.save();

    res.status(201).json({ message: 'Rider registered successfully' });
  } catch (error) {
    console.error('Error during rider registration:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/rider/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const rider = await Rider.findOne({ email });
    if (!rider) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, rider.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: rider._id, email: rider.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      token,
      user: {
        objectId: rider._id,
        email: rider.email,
        name: rider.name,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

router.post('/driver/register', async (req, res) => {
  try {
    console.log('Received registration request:', req.body);

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      vehicleMake,
      vehicleModel,
    } = req.body;

    const existingDriver = await Driver.findOne({ email });
    if (existingDriver) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDriver = new Driver({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      vehicleMake,
      vehicleModel,
      applicationApproved: false,
    });
    await newDriver.save();

    res.status(201).json({
      message: 'Driver registered successfully. Pending approval.',
      driver: {
        id: newDriver._id,
        email: newDriver.email,
        firstName: newDriver.firstName,
        lastName: newDriver.lastName
      }
    });
  } catch (error) {
    console.error('Error during driver registration:', error);
    res.status(500).json({
      message: 'Server error during registration',
      error: error.message
    });
  }
});

router.post('/driver/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const driver = await Driver.findOne({ email });
    if (!driver) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, driver.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: driver._id, email: driver.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      driverID: driver._id,
    });
  } catch (error) {
    console.error('Error during driver login:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/drivers/documents/:driverId/:docType', authenticate, async (req, res) => {
  try {
    const { driverId, docType } = req.params;
    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    const documentMap = {
      'license': driver.licenseDoc,
      'abstract': driver.abstractDoc,
      'criminal': driver.criminalRecordCheckDoc,
      'registration': driver.vehicleRegistrationDoc,
      'safety': driver.safetyInspectionDoc
    };

    const filePath = documentMap[docType];
    if (!filePath) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.download(filePath);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ message: 'Error downloading document' });
  }
});

router.get('/riders/:id', authenticate, async (req, res) => {
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

router.get('/drivers/:id', authenticate, async (req, res) => {
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


module.exports = router;
