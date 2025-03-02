const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin')
const userRoutes = require('./routes/user')
const paymentRoutes = require('./routes/payment')
const configRoutes = require('./routes/config');
const rideRoutes = require('./routes/ride');
const driverRoutes = require('./routes/driver');
const receiptRoutes = require('./routes/receipt');

dotenv.config();

const app = express();
const cors = require('cors');

app.use(express.json());

const corsOptions = {
    origin: ['https://ridefleet.ca', 'http://ridefleet.ca', 'http://localhost:3000', 'http://localhost:8081'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use('/api/driver', driverRoutes);
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
}));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/config', configRoutes)
app.use('/api/ride', rideRoutes);
app.use('/api/receipt', receiptRoutes);

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(process.env.PORT || 5000, () => {
    console.log('Server is running');
});
