const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Configure email transporter
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

// Verify email configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email configuration error:', error);
    } else {
        console.log('Server is ready to send emails');
    }
});

// Contact form endpoint
app.post('/submit-contact', async (req, res) => {
    console.log('Received contact form submission:', req.body);
    
    try {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            console.log('Missing required fields:', { name, email, message });
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields' 
            });
        }

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER,
            subject: `New Contact Form Submission from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
        };

        console.log('Sending email with options:', {
            ...mailOptions,
            auth: '***hidden***'
        });

        await transporter.sendMail(mailOptions);
        
        console.log('Email sent successfully');
        res.json({ 
            success: true,
            message: 'Email sent successfully' 
        });
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to send email',
            error: error.message
        });
    }
});

// Catch-all route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
