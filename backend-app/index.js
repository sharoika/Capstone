const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();
const cors = require('cors');

app.use(express.json());

const corsOptions = {
    origin: ['https://ridefleet.ca', 'http://localhost:3000'],  // Frontend domains
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // HTTP methods
    credentials: true,  // Allow cookies/credentials
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true }
}));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);

app.listen(process.env.PORT || 5000, () => {
    console.log('Server is running');
});
