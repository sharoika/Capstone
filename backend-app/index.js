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
    origin: function (origin, callback) {
      // Allow any origin (you can restrict this to a list of trusted origins if needed)
      callback(null, true);  // This allows all origins
    },
    credentials: true,  // Allow credentials (cookies, headers)
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

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
