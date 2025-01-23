const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Rider = require("../models/Rider");
const Driver = require("../models/Driver");
const Token = require("../models/Token");
const { authenticate } = require("../middlewares/auth");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });


router.get('/users', authenticate, async (req, res) => {
    const users = await User.find();
    res.json(users);
});

router.get('/drivers', authenticate, async (req, res) => {
    try {
        const drivers = await Driver.find(); // Fetch all drivers from the Drivers table
        res.json(drivers); // Send the drivers as a JSON response
    } catch (error) {
        console.error('Error fetching drivers:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Approve or reject a driver
router.put('/drivers/:id/approval', authenticate, async (req, res) => {
    const { id } = req.params;
    const { approve } = req.body;

    try {
        const driver = await Driver.findById(id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Convert approve to boolean explicitly
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

router.get('/drivers/list', async (req, res) => {
    try {
        const drivers = await Driver.find(); // Fetch all drivers from the Drivers table
        res.json(drivers); // Send the drivers as a JSON response
    } catch (error) {
        console.error('Error fetching drivers:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials U' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials P' });
    }

    const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log(token);
    req.session.token = token;
    res.json({ message: 'Login successful', token });
});


router.post('/register', async (req, res) => {
    const { first_name, last_name, email, password, phone, address } = req.body;
  
    try {
      // Hash the password for security
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user with the updated fields
      const newUser = new User({
        first_name,
        last_name,
        email,
        password: hashedPassword, // Store the hashed password
        phone,
        address
      });
  
      // Save the user to the database
      await newUser.save();
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error.response?.data || error.message);
        setError(error.response?.data?.message || 'An error occurred while registering.');
    }
    
  });



// Rider Registration
router.post('/rider/register', async (req, res) => {
  const { firstName, lastName, email, phone, password, homeLocation } = req.body;

  try {
      // Check if email already exists
      const existingRider = await Rider.findOne({ email });
      if (existingRider) {
          return res.status(400).json({ message: 'Email already in use' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new rider
      const newRider = new Rider({
          firstName,
          lastName,
          email,
          phone,
          password: hashedPassword,
          homeLocation,
      });

      // Save the rider to the database
      await newRider.save();

      res.status(201).json({ message: 'Rider registered successfully' });
  } catch (error) {
      console.error('Error during rider registration:', error.message);
      res.status(500).json({ message: 'Server error' });
  }
});

// Rider Login
router.post('/rider/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find the rider by email
      const rider = await Rider.findOne({ email });
      if (!rider) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
  
      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, rider.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
  
      // Generate a JWT token
      const token = jwt.sign(
        { id: rider._id, email: rider.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      // Send back the token, user info, and success message
      return res.status(200).json({
        token,
        user: {
          objectId: rider._id, // MongoDB ObjectId
          email: rider.email,
          name: rider.name, // Include any other necessary fields
        },
        message: 'Login successful',
      });
    } catch (error) {
      console.error('Error during login:', error.message);
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  });

// Driver Registration
router.post('/driver/register', upload.fields([
  { name: 'licenseDoc', maxCount: 1 },
  { name: 'abstractDoc', maxCount: 1 },
  { name: 'criminalRecordCheckDoc', maxCount: 1 },
  { name: 'vehicleRegistrationDoc', maxCount: 1 },
  { name: 'safetyInspectionDoc', maxCount: 1 },
]), async (req, res) => {
  try {
    console.log('Received registration request:', req.body);
    console.log('Received files:', req.files);

    // Check if all required files are present
    const requiredFiles = ['licenseDoc', 'abstractDoc', 'criminalRecordCheckDoc', 
                          'vehicleRegistrationDoc', 'safetyInspectionDoc'];
    const missingFiles = requiredFiles.filter(file => !req.files[file]);
    
    if (missingFiles.length > 0) {
      return res.status(400).json({ 
        message: `Missing required files: ${missingFiles.join(', ')}` 
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      vehicleMake,
      vehicleModel,
    } = req.body;

    // Check if email already exists
    const existingDriver = await Driver.findOne({ email });
    if (existingDriver) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new driver with all fields
    const newDriver = new Driver({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      vehicleMake,
      vehicleModel,
      applicationApproved: false, // Default to false for new registrations
      licenseDoc: req.files.licenseDoc[0].path,
      abstractDoc: req.files.abstractDoc[0].path,
      criminalRecordCheckDoc: req.files.criminalRecordCheckDoc[0].path,
      vehicleRegistrationDoc: req.files.vehicleRegistrationDoc[0].path,
      safetyInspectionDoc: req.files.safetyInspectionDoc[0].path,
    });
    // Save the driver to the database
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


// Driver Login
router.post('/driver/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      // Find driver by email
      const driver = await Driver.findOne({ email });
      if (!driver) {
          return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, driver.password);
      if (!isPasswordValid) {
          return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate a token
      const token = jwt.sign(
          { id: driver._id, email: driver.email },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
      );

      res.json({ message: 'Login successful', token });
  } catch (error) {
      console.error('Error during driver login:', error.message);
      res.status(500).json({ message: 'Server error' });
  }
});

// Add this route to handle file downloads
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
