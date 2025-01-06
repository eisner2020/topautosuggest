const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.static(path.join(__dirname), {
    // Add proper cache control for static assets
    maxAge: '1h',
    // Add proper error handling for static files
    fallthrough: true,
    // Enable directory listing in production
    index: 'index.html'
}));
app.use(bodyParser.json());

// Handle 404 errors for static files
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
        return res.status(404).sendFile(path.join(__dirname, 'index.html'));
    }
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        error: 'An internal server error occurred',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mail.me.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    logger: true,
    debug: process.env.NODE_ENV !== 'production' // Only debug in non-production
});

// Verify email connection
transporter.verify(function(error, success) {
    if (error) {
        console.error('Email configuration error:', error);
    } else {
        console.log('Server is ready to send emails');
    }
});

// Form submission endpoint
app.post('/submit-form', async (req, res) => {
    try {
        const { targetKeywords, city, companyName, businessType } = req.body;
        
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
            <p><strong>Business Type:</strong> ${businessType || 'Not specified'}</p>
        `;

        // Send email
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER, // Send to the same email
            subject: 'New Search Demo Submission',
            html: emailContent
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ 
            message: 'Form submitted successfully',
            details: {
                emailSent: true,
                recipient: mailOptions.to
            }
        });
    } catch (error) {
        console.error('Error processing form:', error);
        res.status(500).json({ 
            error: 'Failed to process form submission',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Contact form submission endpoint
app.post('/contact', async (req, res) => {
    try {
        console.log('Received contact form submission:', req.body);
        const { name, email, phone, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !message) {
            console.log('Missing required fields:', { name, email, message });
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: {
                    name: !name,
                    email: !email,
                    message: !message
                }
            });
        }

        const emailContent = `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `;

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER, // Send to the same email
            subject: 'New Contact Form Submission',
            html: emailContent
        };

        console.log('Attempting to send email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);

        res.status(200).json({ 
            message: 'Message sent successfully',
            details: {
                emailSent: true,
                recipient: mailOptions.to,
                messageId: info.messageId
            }
        });
    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).json({ 
            error: 'Failed to send message',
            details: error.message,
            code: error.code
        });
    }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Static files being served from: ${path.join(__dirname)}`);
});
