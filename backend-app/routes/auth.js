const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Rider = require("../models/Rider");
const Driver = require("../models/Driver");
const multer = require('multer');
const upload = multer({
  dest: 'uploads/'
});

const { authenticate } = require("../middlewares/auth");

const router = express.Router();

router.get("/check-admin", async (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ isAdmin: false, message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isAdmin = await Admin.exists({ _id: decoded.id });

    if (!isAdmin) {
      return res.status(403).json({ isAdmin: false, message: "Forbidden: Admin access required" });
    }

    res.json({ isAdmin: true, message: "Token belongs to an admin" });
  } catch (error) {
    return res.status(401).json({ isAdmin: false, message: "Unauthorized: Invalid token" });
  }
});

router.post('/rider/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const rider = await Rider.findOne({ email });

    if (!rider || !(await bcrypt.compare(password, rider.password))) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const token = jwt.sign(
      {
        id: rider._id,
        email: rider.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: rider._id,
        email: rider.email,
        name: rider.name
      },
    });
  } catch (error) {
    console.error('Error during rider login:', error.message);

    return res.status(500).json({
      message: 'Server error. Please try again later.',
    });
  }
});

router.post('/rider/register', async (req, res) => {
  const { firstName, lastName, email, phone, password, homeLocation } = req.body;

  try {
    const existingRider = await Rider.findOne({ email });

    if (existingRider) {
      return res.status(400).json({
        message: 'Email already in use',
      });
    }

    const newRider = new Rider({
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      password: password,
      homeLocation: homeLocation,
    });

    await newRider.save();

    return res.status(201).json({
      message: 'Rider registered successfully',
    });
  } catch (error) {
    console.error('Error during rider registration:', error.message);

    return res.status(500).json({
      message: 'Server error. Please try again later.',
    });
  }
});

router.post('/driver/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const driver = await Driver.findOne({ email });

    if (!driver || !(await bcrypt.compare(password, driver.password))) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const token = jwt.sign(
      {
        id: driver._id,
        email: driver.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log("here");
    return res.status(200).json({
      message: 'Login successful',
      token: token,
      driver: {
        id: driver._id,
        email: driver.email,
      },
    });
  } catch (error) {
    console.error('Error during driver login:', error.message);

    return res.status(500).json({
      message: 'Server error. Please try again later.',
    });
  }
});

router.post('/driver/register', upload.fields([
  { name: 'licenseDoc' },
  { name: 'abstractDoc' },
  { name: 'criminalRecordCheckDoc' },
  { name: 'vehicleRegistrationDoc' },
  { name: 'safetyInspectionDoc' }
]), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      vehicleMake,
      vehicleModel
    } = req.body;

    const existingDriver = await Driver.findOne({ email });

    if (existingDriver) {
      return res.status(400).json({
        message: 'Email already in use',
      });
    }

    const newDriver = new Driver({
      firstName,
      lastName,
      email,
      phone,
      password,
      vehicleMake,
      vehicleModel,
      applicationApproved: false,
      licenseDoc: req.files?.licenseDoc?.[0]?.path,
      abstractDoc: req.files?.abstractDoc?.[0]?.path,
      criminalRecordCheckDoc: req.files?.criminalRecordCheckDoc?.[0]?.path,
      vehicleRegistrationDoc: req.files?.vehicleRegistrationDoc?.[0]?.path,
      safetyInspectionDoc: req.files?.safetyInspectionDoc?.[0]?.path
    });

    await newDriver.save();

    return res.status(201).json({
      message: 'Driver registered successfully. Pending approval.',
      driver: {
        id: newDriver._id,
        email: newDriver.email,
        firstName: newDriver.firstName,
        lastName: newDriver.lastName,
      },
    });
  } catch (error) {
    console.error('Error during driver registration:', error);
    return res.status(500).json({
      message: error.message || 'Server error. Please try again later.',
    });
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

module.exports = router;
