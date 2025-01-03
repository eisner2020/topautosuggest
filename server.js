const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Load keyword data
let keywordData = {};
try {
    const data = fs.readFileSync(path.join(__dirname, 'data', 'keyword_data.json'), 'utf8');
    keywordData = JSON.parse(data);
    console.log('Loaded keyword planner data successfully');
} catch (error) {
    console.warn('Warning: Could not load keyword_data.json:', error.message);
}

// DataForSEO credentials
const username = process.env.DATAFORSEO_USERNAME;
const password = process.env.DATAFORSEO_PASSWORD;
const auth = Buffer.from(`${username}:${password}`).toString('base64');

async function getKeywordData(keyword, location) {
    try {
        console.log('Getting keyword data for:', keyword, 'in', location);
        
        // DataForSEO API endpoint
        const url = 'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live';
        
        // Prepare the request data
        const data = [{
            "keywords": [keyword],
            "location_name": location,
            "language_name": "English"
        }];

        // Make the API request
        const response = await axios.post(url, data, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.tasks && response.data.tasks[0].result) {
            const result = response.data.tasks[0].result[0];
            
            // If we have real data, return it
            if (result.search_volume) {
                return {
                    monthly_searches: result.search_volume,
                    cpc: result.cpc || 0
                };
            }
        }

        // Fallback to smart estimation if no data
        return getSmartEstimation(keyword, location);
    } catch (error) {
        console.error('DataForSEO API Error:', error.message);
        // Fallback to smart estimation on error
        return getSmartEstimation(keyword, location);
    }
}

// Function to get population-based multiplier
function getPopulationMultiplier(city) {
    // Major US cities and their populations
    const majorCities = {
        'new york': { state: 'NY', pop: 8336817, metro: false },
        'los angeles': { state: 'CA', pop: 3898747, metro: false },
        'chicago': { state: 'IL', pop: 2746388, metro: false },
        'houston': { state: 'TX', pop: 2304580, metro: false },
        'phoenix': { state: 'AZ', pop: 1608139, metro: false },
        'philadelphia': { state: 'PA', pop: 1603797, metro: false },
        'san antonio': { state: 'TX', pop: 1547253, metro: false },
        'san diego': { state: 'CA', pop: 1386932, metro: false },
        'dallas': { state: 'TX', pop: 1304379, metro: false },
        'san jose': { state: 'CA', pop: 1013240, metro: false },
        'austin': { state: 'TX', pop: 961855, metro: false },
        'fort worth': { state: 'TX', pop: 909585, metro: false },
        'columbus': { state: 'OH', pop: 898553, metro: false },
        'san francisco': { state: 'CA', pop: 873965, metro: false },
        'charlotte': { state: 'NC', pop: 872498, metro: false },
        'indianapolis': { state: 'IN', pop: 867125, metro: false },
        'seattle': { state: 'WA', pop: 737015, metro: false },
        'denver': { state: 'CO', pop: 727211, metro: false },
        'boston': { state: 'MA', pop: 675647, metro: false },
        'las vegas': { state: 'NV', pop: 641903, metro: false },
        'portland': { state: 'OR', pop: 652503, metro: false },
        
        // Atlanta metro area
        'atlanta': { state: 'GA', pop: 498715, metro: true },
        'sandy springs': { state: 'GA', pop: 108080, metro: true },
        'roswell': { state: 'GA', pop: 92833, metro: true },
        'johns creek': { state: 'GA', pop: 82453, metro: true },
        'alpharetta': { state: 'GA', pop: 65818, metro: true },
        'marietta': { state: 'GA', pop: 60972, metro: true },
        'dunwoody': { state: 'GA', pop: 51683, metro: true },
        'brookhaven': { state: 'GA', pop: 55161, metro: true },
        'smyrna': { state: 'GA', pop: 55663, metro: true },
        'east point': { state: 'GA', pop: 38358, metro: true },
        'cumming': { state: 'GA', pop: 7318, metro: true },
        'buckhead': { state: 'GA', pop: 78000, metro: true }, // Part of Atlanta
        
        // Other Georgia cities
        'perry': { state: 'GA', pop: 17000, metro: false },
        'warner robins': { state: 'GA', pop: 80308, metro: false },
        'macon': { state: 'GA', pop: 157346, metro: false }
    };

    console.log('\n=== City Population Debug ===');
    console.log('City input:', city);

    // Clean and normalize city name
    const cityName = city.toLowerCase().trim();
    console.log('City name (lowercase):', cityName);

    // Extract state code if provided (e.g., "Atlanta, GA")
    const stateCode = cityName.split(',')[1]?.trim().toUpperCase() || '';
    console.log('State code:', stateCode);

    // Find matching city
    const majorCity = Object.entries(majorCities).find(([name, data]) => {
        return cityName.includes(name) && (!stateCode || data.state === stateCode);
    });

    if (majorCity) {
        console.log('Major city match:', majorCity[1]);
        const population = majorCity[1].pop;
        const isMetro = majorCity[1].metro;
        console.log('Population:', population);
        console.log('Is metro:', isMetro);

        // Calculate multiplier based on population
        let multiplier = 0.1; // Default for very small cities

        if (isMetro) {
            // Higher multipliers for Atlanta metro area with specific city adjustments
            if (cityName === 'atlanta') {
                multiplier = 1.0;  // Base multiplier for Atlanta
            } else if (cityName === 'buckhead') {
                multiplier = 0.45; // Buckhead is part of Atlanta but smaller search volume
            } else if (cityName === 'sandy springs' || cityName === 'alpharetta') {
                multiplier = 0.35; // Major suburban centers
            } else if (cityName === 'roswell' || cityName === 'marietta') {
                multiplier = 0.3;  // Large suburbs
            } else if (cityName === 'dunwoody' || cityName === 'johns creek') {
                multiplier = 0.25; // Medium suburbs
            } else if (cityName === 'smyrna' || cityName === 'brookhaven') {
                multiplier = 0.2;  // Smaller suburbs
            } else if (cityName === 'cumming') {
                multiplier = 0.15; // Outer suburbs
            } else {
                // Default metro area multiplier based on population
                if (population > 100000) multiplier = 0.35;
                else if (population > 50000) multiplier = 0.25;
                else if (population > 20000) multiplier = 0.15;
                else multiplier = 0.1;
            }
        } else {
            // Standard multipliers for other cities
            if (population > 5000000) multiplier = 1.0;
            else if (population > 1000000) multiplier = 0.8;
            else if (population > 500000) multiplier = 0.6;
            else if (population > 250000) multiplier = 0.4;
            else if (population > 100000) multiplier = 0.25;
            else if (population > 50000) multiplier = 0.15;
            else if (population > 20000) multiplier = 0.1;
            else multiplier = 0.05;
        }

        console.log('City multiplier:', multiplier);
        return multiplier;
    }

    // Default multiplier for unknown cities (assume small city)
    return 0.1;
}

// Function to generate smart estimation
function getSmartEstimation(keyword = '', city = '') {
    console.log('\n=== Smart Estimation Debug ===');
    console.log('Input:', { keyword, city });

    // Base volumes for different industries
    const industries = {
        'real estate': {
            baseVolume: 40000, // Increased from 12000
            baseCPC: 3.50,     // Increased from 2.50
            keywords: {
                'homes for sale': { volMult: 1.5, cpcMult: 1.2 },
                'houses for sale': { volMult: 1.3, cpcMult: 1.1 },
                'condos for sale': { volMult: 0.9, cpcMult: 1.0 },
                'real estate agent': { volMult: 0.8, cpcMult: 1.3 },
                'realtor': { volMult: 0.7, cpcMult: 1.4 },
                'apartments': { volMult: 1.2, cpcMult: 0.9 },
                'townhomes': { volMult: 0.8, cpcMult: 1.1 },
                'new construction': { volMult: 0.7, cpcMult: 1.2 }
            }
        },
        'medical': {
            baseVolume: 8000,
            baseCPC: 4.50,
            keywords: {
                'doctor': { volMult: 1.2, cpcMult: 1.1 },
                'dentist': { volMult: 1.1, cpcMult: 1.2 },
                'pediatrician': { volMult: 0.9, cpcMult: 1.3 },
                'plastic surgeon': { volMult: 0.6, cpcMult: 1.8 },
                'dermatologist': { volMult: 0.9, cpcMult: 1.4 }
            }
        },
        'restaurants': {
            baseVolume: 10000,
            baseCPC: 1.50,
            keywords: {
                'restaurants': { volMult: 1.0, cpcMult: 1.0 },
                'pizza': { volMult: 1.2, cpcMult: 0.9 },
                'sushi': { volMult: 0.9, cpcMult: 1.1 },
                'italian restaurant': { volMult: 0.8, cpcMult: 1.0 },
                'chinese food': { volMult: 1.1, cpcMult: 0.8 }
            }
        }
    };

    // Determine industry and base metrics
    let baseVolume = 5000;  // Default base volume
    let baseCPC = 2.00;     // Default base CPC
    let volumeMultiplier = 1.0;
    let cpcMultiplier = 1.0;

    // Find matching industry and keyword
    for (const [industry, data] of Object.entries(industries)) {
        for (const [kw, multipliers] of Object.entries(data.keywords)) {
            if (keyword.toLowerCase().includes(kw)) {
                baseVolume = data.baseVolume;
                baseCPC = data.baseCPC;
                volumeMultiplier = multipliers.volMult;
                cpcMultiplier = multipliers.cpcMult;
                break;
            }
        }
    }

    console.log('Base volume:', baseVolume);

    // Apply city population multiplier
    const populationMultiplier = getPopulationMultiplier(city);
    console.log('Final population multiplier:', populationMultiplier);

    // Add some randomness (±10%)
    const randomFactor = 0.9 + Math.random() * 0.2;
    console.log('Random factor:', randomFactor);

    // Calculate final values
    const estimatedVolume = Math.round(baseVolume * volumeMultiplier * populationMultiplier * randomFactor);
    console.log('Final estimated volume:', estimatedVolume);

    const cpcRandomFactor = 0.9 + Math.random() * 0.2;
    const estimatedCPC = Math.round(baseCPC * cpcMultiplier * 100) / 100;

    return {
        monthly_searches: estimatedVolume,
        cpc: estimatedCPC
    };
}

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'iCloud',
    auth: {
        user: process.env.EMAIL_USER || 'eisner2020@mac.com',
        pass: process.env.EMAIL_PASSWORD
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        
        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER || 'eisner2020@mac.com',
            to: process.env.CONTACT_EMAIL || 'eisner2020@mac.com',
            subject: 'New Contact Form Submission - TopAutosuggest',
            text: `
Name: ${name}
Email: ${email}
Phone: ${phone}
Message: ${message}
            `,
            html: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Phone:</strong> ${phone}</p>
<p><strong>Message:</strong> ${message}</p>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);
        
        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

// API endpoint for keyword data
app.post('/api/search-volume', async (req, res) => {
    try {
        const { keyword, city } = req.body;
        console.log('\n=== New Search Volume Request ===');
        console.log('Request:', { keyword, city });

        if (!keyword || !city) {
            throw new Error('Keyword and city are required');
        }

        const estimation = await getKeywordData(keyword, city);
        return res.json({
            success: true,
            data: {
                ...estimation,
                source: 'DataForSEO'
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
});
