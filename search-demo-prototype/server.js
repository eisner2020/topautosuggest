const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// Basic CORS setup
app.use(cors());

// Basic middleware
app.use(bodyParser.json());

// Simple email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: true,
        ciphers: 'SSLv3'
    },
    debug: true,
    logger: true
});

// Add error logging
transporter.verify(function(error, success) {
    if (error) {
        console.log('Server error:', error);
    } else {
        console.log('Server is ready to take messages');
    }
});

// Simple contact endpoint
app.post('/api/submit-contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER,
            subject: `New Contact Form Submission from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
        };

        console.log('Attempting to send email with options:', {
            ...mailOptions,
            auth: '***hidden***'  // Hide sensitive info
        });

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ message: 'Failed to send email' });
    }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Handle all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
