const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const rideRoutes = require('./routes/rides');

dotenv.config();

const app = express();
const cors = require('cors');

app.use(express.json());

const corsOptions = {
    origin: ['https://ridefleet.ca', 'http://ridefleet.ca', 'http://localhost:3000', 'http://localhost:8081'],  // Allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allowed HTTP methods
    credentials: true,  // Allow cookies and credentials
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin'],  // Allowed headers
};


app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // Keeps the cookie safe from JavaScript access
        secure: process.env.NODE_ENV === 'production' // Ensures secure cookies only in production
    }
}));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.listen(process.env.PORT || 5000, () => {
    console.log('Server is running');
});
