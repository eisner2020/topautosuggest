const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = process.env.PORT || 8000;

// Basic CORS setup
app.use(cors());

// Basic middleware
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());

// Simple email transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.mail.me.com',
    port: 587,
    secure: false,
    auth: {
        user: 'eisner2020@mac.com',
        pass: 'jguq-juhk-dzwm-arfv'
    }
});

// Simple contact endpoint
app.post('/submit-contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const mailOptions = {
            from: 'eisner2020@mac.com',
            to: 'eisner2020@mac.com',
            subject: `New Contact Form Submission from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Failed to send email' });
    }
});

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));
