const multer = require("multer");
const path = require("path");
const Driver = require("../models/Driver");

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images and pdfs only
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
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

// Controller methods
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { type } = req.params;
        const driverId = req.user.id; // Get driver ID from authenticated user

        // Map of document types to their corresponding field names in Driver model
        const documentTypes = {
            'license': 'licenseDoc',
            'abstract': 'abstractDoc',
            'criminal': 'criminalRecordCheckDoc',
            'registration': 'vehicleRegistrationDoc',
            'safety': 'safetyInspectionDoc'
        };

        if (!documentTypes[type]) {
            return res.status(400).json({ message: 'Invalid document type' });
        }

        // Update driver document field
        const updateField = {};
        updateField[documentTypes[type]] = req.file.path;

        await Driver.findByIdAndUpdate(driverId, updateField);

        res.status(200).json({ 
            message: 'File uploaded successfully',
            filePath: req.file.path,
            documentType: type
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ 
            message: 'Error uploading file',
            error: error.message 
        });
    }
};

const getDocument = async (req, res) => {
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
        res.status(500).json({ 
            message: 'Error downloading document',
            error: error.message 
        });
    }
};

module.exports = {
    upload,
    uploadDocument,
    getDocument
};