const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// Enable CORS for specific origins
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            'http://localhost:8000',
            'http://localhost:3000',
            'https://topautosuggest.onrender.com',
            'https://www.topautosuggest.com'
        ];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Accept'],
    maxAge: 86400 // CORS preflight cache for 24 hours
}));

// Optimize static file serving
app.use(express.static(path.join(__dirname), {
    maxAge: '1h',
    etag: true,
    lastModified: true
}));

// Optimize JSON parsing
app.use(bodyParser.json({
    limit: '1mb',
    strict: true
}));

// Optimize URL-encoded parsing
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '1mb'
}));

// Create email transporter once
const transporter = nodemailer.createTransport({
    host: 'smtp.mail.me.com',
    port: 587,
    secure: false,
    pool: true, // Use connection pool
    maxConnections: 5,
    maxMessages: 100,
    auth: {
        user: 'eisner2020@mac.com',
        pass: 'jguq-juhk-dzwm-arfv'
    },
    tls: {
        rejectUnauthorized: true,
        ciphers: 'SSLv3'
    },
    debug: true,
    logger: true
});

// Test email configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email verification failed:', error);
    } else {
        console.log('Server is ready to take messages');
    }
});

// Handle 404 errors for static files
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
        return res.status(404).sendFile(path.join(__dirname, 'index.html'));
    }
    next();
});

// Form submission endpoint (handles both /submit-form and /submit-search)
app.post(['/submit-form', '/submit-search'], async (req, res) => {
    try {
        const { targetKeywords, city, companyName } = req.body;
        
        // Validate required fields
        if (!targetKeywords || !city || !companyName) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: {
                    targetKeywords: !targetKeywords,
                    city: !city,
                    companyName: !companyName
                }
            });
        }

        const emailContent = `
            <h2>New Search Demo Submission</h2>
            <p><strong>Target Keywords:</strong> ${targetKeywords}</p>
            <p><strong>City:</strong> ${city}</p>
            <p><strong>Company Name:</strong> ${companyName}</p>
        `;

        // Send email
        const mailOptions = {
            from: 'eisner2020@mac.com',
            to: 'eisner2020@mac.com',
            subject: 'New Search Demo Submission',
            html: emailContent
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ 
            message: 'Form submitted successfully',
            details: {
                demo: true,
                emailDisabled: false
            }
        });
    } catch (error) {
        console.error('Form submission error:', error);
        res.status(500).json({ 
            error: 'Failed to process form submission',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Contact form endpoint with timeout
app.post('/submit-contact', async (req, res) => {
    // Set response timeout
    res.setTimeout(10000, () => {
        res.status(408).json({
            success: false,
            message: 'Request timeout'
        });
    });

    try {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const mailOptions = {
            from: {
                name: 'TopAutosuggest Contact Form',
                address: 'eisner2020@mac.com'
            },
            to: 'eisner2020@mac.com',
            subject: `New Contact Form Submission from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
            html: `<h2>New Contact Form Submission</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message}</p>`
        };

        const info = await transporter.sendMail(mailOptions);
        res.status(200).json({
            success: true,
            message: 'Email sent successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server with proper error handling
const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.log('Port is already in use. Trying again...');
        setTimeout(() => {
            server.close();
            server.listen(port);
        }, 1000);
    }
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
