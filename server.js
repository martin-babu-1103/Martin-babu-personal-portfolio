const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const basicAuth = require('express-basic-auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Admin Authentication Setup
const adminAuth = basicAuth({
    users: { [process.env.ADMIN_USER || 'admin']: process.env.ADMIN_PASS || 'password123' },
    challenge: true,
    realm: 'Admin Dashboard'
});

// Protect the dashboard HTML page specifically before static middleware
app.get('/dashboard.html', adminAuth, (req, res, next) => {
    next();
});

// Protect the dashboard assets if needed (dashboard.js, dashboard.css)
app.get('/dashboard.js', adminAuth, (req, res, next) => next());
app.get('/dashboard.css', adminAuth, (req, res, next) => next());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
// POST: Submit a contact form
app.post('/api/contact', async (req, res) => {
    try {
        const Contact = require('./models/Contact');
        const { name, email, message } = req.body;

        const newContact = new Contact({
            name,
            email,
            message
        });

        await newContact.save();
        res.status(201).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error saving contact:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
});

// GET: Fetch all messages for the dashboard (Protected)
app.get('/api/messages', adminAuth, async (req, res) => {
    try {
        const Contact = require('./models/Contact');
        const messages = await Contact.find().sort({ date: -1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
