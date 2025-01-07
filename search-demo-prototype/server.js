const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

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

// Email configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.mail.me.com',
    port: 587,
    secure: false,
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        error: 'An internal server error occurred',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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

// Contact form endpoint
app.post('/submit-contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const mailOptions = {
            from: {
                name: 'TopAutosuggest Contact Form',
                address: 'eisner2020@mac.com'
            },
            to: 'eisner2020@mac.com',
            subject: `New Contact Form Submission from ${name}`,
            text: `
Name: ${name}
Email: ${email}
Message: ${message}

This message was sent from your TopAutosuggest contact form.`,
            html: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Message:</strong></p>
<p>${message}</p>
<br>
<p><em>This message was sent from your TopAutosuggest contact form.</em></p>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            message: 'Failed to send email',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Static files being served from: ${path.join(__dirname)}`);
});
