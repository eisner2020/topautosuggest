const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Debug environment variables
console.log('\n=== Environment Variables ===');
console.log('DataForSEO Login:', process.env.DATAFORSEO_LOGIN ? '[SET]' : '[NOT SET]');
console.log('DataForSEO Password:', process.env.DATAFORSEO_PASSWORD ? '[SET]' : '[NOT SET]');
console.log('Current working directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);

// Validate environment variables
const SERP_API_KEY = process.env.SERP_API_KEY;
const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;
const PRO_TIER_KEY = process.env.PRO_TIER_KEY;
const ENTERPRISE_TIER_KEY = process.env.ENTERPRISE_TIER_KEY;
const PREMIUM_API_KEY = process.env.PREMIUM_API_KEY || '';
const DATAFORSEO_API_KEY = process.env.DATAFORSEO_API_KEY;

// API configuration
const API_CONFIG = {
    FREE_API: SERP_API_KEY || '',
    PRO_API: PRO_TIER_KEY || '',
    ENTERPRISE_API: ENTERPRISE_TIER_KEY || '',
    PREMIUM_API: PREMIUM_API_KEY || ''
};

if (!SERP_API_KEY) {
    console.error('ERROR: SERP_API_KEY is not set in .env file');
    process.exit(1);
}

// Load keyword data
let keywordData = {};
try {
    const data = fs.readFileSync(path.join(__dirname, 'data', 'keyword_data.json'), 'utf8');
    keywordData = JSON.parse(data);
    console.log('Loaded keyword planner data successfully');
} catch (error) {
    console.warn('Warning: Could not load keyword_data.json:', error.message);
}

// Configure axios for SERP API
const serpApi = axios.create({
    baseURL: 'https://serpapi.com',
    params: {
        api_key: SERP_API_KEY
    }
});

// Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// City populations (2020 census data)
const cityPopulations = {
    'macon': 157346,
    'augusta': 202081,
    'athens': 127315,
    'columbus': 206922,
    'savannah': 147780,
    'warner robins': 80308,
    'valdosta': 56457,
    'albany': 69647,
    'johns creek': 82453,
    'marietta': 60972,
    'roswell': 92833,
    'sandy springs': 108080,
    'south fulton': 107436,
    'stonecrest': 59194,
    'valdosta': 56457,
    'warner robins': 80308,
    'brookhaven': 55161,
    'dunwoody': 51683,
    'alpharetta': 65818,
    'east point': 38358,
    'peachtree corners': 42243,
    'dublin': 15389
};

// Major cities list with approximate populations
const MAJOR_CITIES = {
    'new york': { state: 'NY', pop: 8400000 },
    'los angeles': { state: 'CA', pop: 3900000 },
    'chicago': { state: 'IL', pop: 2700000 },
    'houston': { state: 'TX', pop: 2300000 },
    'phoenix': { state: 'AZ', pop: 1600000 },
    'philadelphia': { state: 'PA', pop: 1600000 },
    'san antonio': { state: 'TX', pop: 1500000 },
    'san diego': { state: 'CA', pop: 1400000 },
    'dallas': { state: 'TX', pop: 1300000 },
    'san jose': { state: 'CA', pop: 1000000 },
    'austin': { state: 'TX', pop: 960000 },
    'jacksonville': { state: 'FL', pop: 950000 },
    'fort worth': { state: 'TX', pop: 930000 },
    'columbus': { state: 'OH', pop: 900000 },
    'san francisco': { state: 'CA', pop: 870000 },
    'charlotte': { state: 'NC', pop: 870000 },
    'indianapolis': { state: 'IN', pop: 870000 },
    'seattle': { state: 'WA', pop: 740000 },
    'denver': { state: 'CO', pop: 730000 },
    'washington': { state: 'DC', pop: 690000 },
    'boston': { state: 'MA', pop: 680000 },
    'nashville': { state: 'TN', pop: 670000 },
    'baltimore': { state: 'MD', pop: 600000 },
    'atlanta': { state: 'GA', pop: 498715 },
    'miami': { state: 'FL', pop: 442241 }
};

// Function to get population-based multiplier
function getPopulationMultiplier(city) {
    if (!city) return 1.0;

    const cityParts = city.toLowerCase().split(',').map(part => part.trim());
    const cityName = cityParts[0];
    const stateCode = cityParts[1]?.trim() || '';

    console.log('\n=== City Population Debug ===');
    console.log('City input:', city);
    console.log('City name (lowercase):', cityName);
    console.log('State code:', stateCode);
    console.log('Major city match:', MAJOR_CITIES[cityName]);
    console.log('Population data:', cityPopulations[cityName]);
    
    // Check major cities list first
    const majorCity = MAJOR_CITIES[cityName];
    if (majorCity && (!stateCode || majorCity.state === stateCode)) {
        const pop = majorCity.pop;
        console.log('Found major city:', majorCity);
        console.log('Population:', pop);
        
        if (pop > 3000000) {
            console.log('Mega city multiplier: 4.5');
            return 4.5;      // NYC, LA, Chicago
        }
        if (pop > 2000000) {
            console.log('Very large city multiplier: 3.5');
            return 3.5;      // Houston
        }
        if (pop > 1000000) {
            console.log('Large city multiplier: 2.5');
            return 2.5;      // Phoenix, Philadelphia, etc.
        }
        if (pop > 500000) {
            console.log('Medium-large city multiplier: 2.0');
            return 2.0;       // Atlanta, Miami, etc.
        }
        console.log('Major city multiplier: 1.5');
        return 1.5;                         // Other major cities
    }

    // For smaller cities, use population data
    const population = cityPopulations[cityName];
    if (population) {
        console.log('Found city population:', population);
        if (population > 300000) {
            console.log('Large city multiplier: 1.2');
            return 1.2;
        }
        if (population > 200000) {
            console.log('Medium-large city multiplier: 0.8');
            return 0.8;
        }
        if (population > 100000) {
            console.log('Medium city multiplier: 0.4');
            return 0.4;
        }
        if (population > 50000) {
            console.log('Small city multiplier: 0.25');
            return 0.25;
        }
        console.log('Very small city multiplier: 0.15');
        return 0.15;  // Very small cities
    }

    // Default multipliers for unknown cities based on name matching
    if (cityName.includes('los angeles') || cityName.includes('new york') || cityName.includes('chicago')) {
        console.log('Matched mega city name: 4.5');
        return 4.5;
    } else if (cityName.includes('houston') || cityName.includes('phoenix') || cityName.includes('philadelphia')) {
        console.log('Matched large city name: 3.5');
        return 3.5;
    } else if (cityName.includes('dallas') || cityName.includes('san')) {
        console.log('Matched medium city name: 2.5');
        return 2.5;
    }
    
    // Conservative default for unknown cities
    console.log('No city match found, using default: 0.25');
    return 0.25;
}

// Function to estimate search volume
function estimateSearchVolume(city, keyword = '') {
    try {
        console.log(`\nEstimating search volume for ${keyword} in ${city}`);
        
        // Get population multiplier
        const popMultiplier = getPopulationMultiplier(city);
        
        // Get industry and keyword data
        const keywordData = getIndustryAndKeywordData(keyword);
        console.log(`Industry: ${keywordData.industry}`);
        console.log(`Base volume: ${keywordData.baseVolume}`);
        console.log(`Volume multiplier: ${keywordData.volumeMultiplier}`);
        
        // Calculate base volume
        let volume = keywordData.baseVolume * popMultiplier * keywordData.volumeMultiplier;
        console.log(`Initial volume calculation: ${volume}`);
        
        // Add some randomness (±10%)
        const randomFactor = 0.9 + Math.random() * 0.2;
        volume *= randomFactor;
        console.log(`Volume after randomness: ${volume}`);
        
        // Round to nearest 10
        const finalVolume = Math.round(volume / 10) * 10;
        console.log(`Final rounded volume: ${finalVolume}`);
        
        return finalVolume;
    } catch (error) {
        console.error('Error estimating search volume:', error);
        return 1000; // Fallback value
    }
}

// Function to estimate CPC based on city and keyword
function estimateCPC(city, keyword = '') {
    try {
        // Get population multiplier
        const popMultiplier = getPopulationMultiplier(city);
        
        // Get industry and keyword data
        const keywordData = getIndustryAndKeywordData(keyword);
        
        // Calculate CPC with population having less impact on price
        // Use square root of multiplier to reduce the city size impact
        let cpc = keywordData.baseCPC * Math.sqrt(popMultiplier) * keywordData.cpcMultiplier;
        
        // Add some randomness (±10%)
        cpc *= (0.9 + Math.random() * 0.2);
        
        // Round to 2 decimal places
        return Math.round(cpc * 100) / 100;
    } catch (error) {
        console.error('Error estimating CPC:', error);
        return 1.50; // Fallback value
    }
}

// Industry base volumes and CPCs
const industries = {
    'real estate': {
        baseVolume: 12000, // Reduced from 25000
        baseCPC: 2.50,
        keywords: {
            'homes for sale': { volMult: 1.0, cpcMult: 1.0 },
            'houses for sale': { volMult: 0.9, cpcMult: 0.9 },
            'condos for sale': { volMult: 0.5, cpcMult: 0.8 },
            'luxury homes': { volMult: 0.2, cpcMult: 1.5 },
            'apartments for rent': { volMult: 0.8, cpcMult: 0.7 },
            'rental homes': { volMult: 0.6, cpcMult: 0.6 }
        }
    },
    'legal': {
        baseVolume: 8000, // Reduced from 15000
        baseCPC: 4.50,
        keywords: {
            'lawyer': { volMult: 1.0, cpcMult: 1.0 },
            'attorney': { volMult: 0.9, cpcMult: 1.0 },
            'personal injury lawyer': { volMult: 0.7, cpcMult: 1.8 },
            'divorce lawyer': { volMult: 0.5, cpcMult: 1.4 },
            'criminal defense lawyer': { volMult: 0.4, cpcMult: 1.6 },
            'immigration lawyer': { volMult: 0.4, cpcMult: 1.2 }
        }
    },
    'dental': {
        baseVolume: 6000, // Reduced from 12000
        baseCPC: 3.50,
        keywords: {
            // Primary keywords (high volume)
            'dentist': { volMult: 1.0, cpcMult: 1.0 },
            'dental office': { volMult: 0.8, cpcMult: 0.9 },
            'family dentist': { volMult: 0.7, cpcMult: 1.0 },
            
            // Common procedures (medium volume)
            'teeth cleaning': { volMult: 0.4, cpcMult: 0.8 },
            'dental crown': { volMult: 0.3, cpcMult: 1.2 },
            'tooth extraction': { volMult: 0.3, cpcMult: 1.1 },
            'root canal': { volMult: 0.25, cpcMult: 1.3 },
            
            // Specialized (lower volume)
            'emergency dentist': { volMult: 0.15, cpcMult: 1.6 },
            'cosmetic dentist': { volMult: 0.12, cpcMult: 1.4 },
            'pediatric dentist': { volMult: 0.15, cpcMult: 1.3 },
            'orthodontist': { volMult: 0.2, cpcMult: 1.2 },
            
            // Very specialized (very low volume)
            'dental implants': { volMult: 0.08, cpcMult: 1.5 },
            'invisalign': { volMult: 0.06, cpcMult: 1.4 },
            'veneers': { volMult: 0.04, cpcMult: 1.6 },
            'teeth whitening': { volMult: 0.1, cpcMult: 1.2 }
        }
    },
    'medical': {
        baseVolume: 9000, // Reduced from 18000
        baseCPC: 4.00,
        keywords: {
            // Primary keywords (high volume)
            'doctor': { volMult: 1.0, cpcMult: 1.0 },
            'primary care': { volMult: 0.8, cpcMult: 1.2 },
            'urgent care': { volMult: 0.6, cpcMult: 1.4 },
            'pediatrician': { volMult: 0.5, cpcMult: 1.3 },
            'family doctor': { volMult: 0.7, cpcMult: 1.1 },
            'medical clinic': { volMult: 0.6, cpcMult: 1.2 },
            
            // Specialists (medium volume)
            'dermatologist': { volMult: 0.2, cpcMult: 1.5 },
            'orthopedic': { volMult: 0.15, cpcMult: 1.6 },
            'cardiologist': { volMult: 0.15, cpcMult: 1.7 },
            'obgyn': { volMult: 0.25, cpcMult: 1.4 },
            'neurologist': { volMult: 0.12, cpcMult: 1.6 },
            
            // Specialized procedures (very low volume)
            'lasik': { volMult: 0.02, cpcMult: 2.0 },
            'knee replacement': { volMult: 0.03, cpcMult: 1.8 },
            'gastric bypass': { volMult: 0.02, cpcMult: 1.9 },
            'hair transplant': { volMult: 0.02, cpcMult: 1.7 },
            'plastic surgery': { volMult: 0.04, cpcMult: 1.8 }
        }
    },
    'automotive': {
        baseVolume: 5000, // Reduced from 10000
        baseCPC: 2.00,
        keywords: {
            'car dealer': { volMult: 1.0, cpcMult: 1.0 },
            'used cars': { volMult: 0.9, cpcMult: 1.1 },
            'auto repair': { volMult: 0.7, cpcMult: 0.8 },
            'car service': { volMult: 0.6, cpcMult: 0.7 },
            'oil change': { volMult: 0.5, cpcMult: 0.6 },
            'tire shop': { volMult: 0.4, cpcMult: 0.7 }
        }
    },
    'home services': {
        baseVolume: 4000, // Reduced from 8000
        baseCPC: 2.50,
        keywords: {
            'plumber': { volMult: 1.0, cpcMult: 1.0 },
            'electrician': { volMult: 0.9, cpcMult: 1.0 },
            'hvac': { volMult: 0.8, cpcMult: 1.1 },
            'lawn care': { volMult: 0.7, cpcMult: 0.8 },
            'house cleaning': { volMult: 0.6, cpcMult: 0.7 },
            'pest control': { volMult: 0.5, cpcMult: 0.9 }
        }
    },
    'restaurants': {
        baseVolume: 10000, // Reduced from 20000
        baseCPC: 1.50,
        keywords: {
            'restaurants': { volMult: 1.0, cpcMult: 1.0 },
            'pizza delivery': { volMult: 0.7, cpcMult: 0.8 },
            'chinese food': { volMult: 0.6, cpcMult: 0.7 },
            'italian restaurant': { volMult: 0.5, cpcMult: 0.9 },
            'sushi': { volMult: 0.4, cpcMult: 0.8 },
            'mexican food': { volMult: 0.6, cpcMult: 0.7 }
        }
    }
};

// Function to identify industry and get keyword data
function getIndustryAndKeywordData(keyword = '') {
    const keywordLower = keyword.toLowerCase();
    
    // Find the industry that matches this keyword
    let matchedIndustry = null;
    let matchedKeyword = null;
    
    for (const [industryName, industryData] of Object.entries(industries)) {
        // First try exact match
        if (industryData.keywords[keywordLower]) {
            matchedIndustry = industryName;
            matchedKeyword = keywordLower;
            break;
        }
        
        // Then try to find keyword as part of phrase
        for (const knownKeyword of Object.keys(industryData.keywords)) {
            if (keywordLower.includes(knownKeyword) || knownKeyword.includes(keywordLower)) {
                matchedIndustry = industryName;
                matchedKeyword = knownKeyword;
                break;
            }
        }
        if (matchedIndustry) break;
    }
    
    // If no match found, try to guess industry from common words
    if (!matchedIndustry) {
        if (keywordLower.match(/doctor|physician|clinic|surgeon|specialist|medical|surgery|hospital/)) {
            matchedIndustry = 'medical';
            matchedKeyword = 'doctor';
        } else if (keywordLower.match(/dentist|dental|tooth|teeth|orthodontist/)) {
            matchedIndustry = 'dental';
            matchedKeyword = 'dentist';
        } else if (keywordLower.match(/lawyer|attorney|legal|law firm/)) {
            matchedIndustry = 'legal';
            matchedKeyword = 'lawyer';
        } else if (keywordLower.match(/home|house|apartment|condo|real estate|property/)) {
            matchedIndustry = 'real estate';
            matchedKeyword = 'homes for sale';
        } else if (keywordLower.match(/car|auto|vehicle|dealer|mechanic/)) {
            matchedIndustry = 'automotive';
            matchedKeyword = 'car dealer';
        } else if (keywordLower.match(/plumber|electrician|contractor|repair|service/)) {
            matchedIndustry = 'home services';
            matchedKeyword = 'plumber';
        } else if (keywordLower.match(/restaurant|food|dining|pizza|burger/)) {
            matchedIndustry = 'restaurants';
            matchedKeyword = 'restaurants';
        }
    }
    
    // Use real estate as default if no match found
    if (!matchedIndustry) {
        matchedIndustry = 'real estate';
        matchedKeyword = 'homes for sale';
    }
    
    const industry = industries[matchedIndustry];
    const keywordData = industry.keywords[matchedKeyword];
    
    console.log(`Matched industry: ${matchedIndustry}, keyword: ${matchedKeyword}`);
    console.log(`Volume multiplier: ${keywordData.volMult}, CPC multiplier: ${keywordData.cpcMult}`);
    
    return {
        industry: matchedIndustry,
        baseVolume: industry.baseVolume,
        baseCPC: industry.baseCPC,
        volumeMultiplier: keywordData.volMult,
        cpcMultiplier: keywordData.cpcMult
    };
}

// Function to get competition level
function getCompetitionLevel(searchVolume, cpc) {
    const score = (searchVolume / 1000) * cpc;
    
    if (score > 100) return 'High';
    if (score > 50) return 'Medium';
    return 'Low';
}

// Function to get total results from SERP API
async function getTotalResults(query) {
    try {
        const response = await serpApi.get('/search.json', {
            params: {
                q: query,
                engine: 'google'
            }
        });
        
        // Extract total results
        const totalResults = response.data.search_information?.total_results || 0;
        return parseInt(totalResults);
    } catch (error) {
        console.error('SERP API Error:', error);
        return 0;
    }
}

// Function to get keyword planner data
function getKeywordPlannerData(keyword, city) {
    try {
        keyword = keyword.toLowerCase();
        city = city.toLowerCase();
        
        if (keywordData[keyword] && keywordData[keyword][city]) {
            return {
                monthly: keywordData[keyword][city].monthly,
                cpc: keywordData[keyword][city].cpc,
                competition: keywordData[keyword][city].competition,
                source: 'keyword_planner'
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting keyword planner data:', error);
        return null;
    }
}

// API Tiers and Keys
const API_KEYS = {
    DATAFORSEO: 'eb89ec37e7d02b1f',
    PREMIUM_API: PREMIUM_API_KEY || ''
};

// Function to get data from premium API (placeholder for future)
async function getPremiumAPIData(keyword, location) {
    // Placeholder for future premium API integration
    return null;
}

// API endpoint for keyword data
app.post('/api/search-volume', async (req, res) => {
    try {
        const { keyword, city, useDataForSEO } = req.body;
        console.log('\n=== New Search Volume Request ===');
        console.log('Request:', { keyword, city, useDataForSEO });

        if (!keyword || !city) {
            throw new Error('Keyword and city are required');
        }

        if (useDataForSEO) {
            try {
                // DataForSEO API configuration
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${DATAFORSEO_API_KEY}`
                    }
                };

                // First, get location ID
                console.log('Looking up location ID for:', city);
                const locationResponse = await axios.post(
                    'https://api.dataforseo.com/v3/keywords_data/google_ads/locations',
                    [{ country: 'US', location_name: city }],
                    config
                );

                console.log('Location Response:', locationResponse.data);

                if (!locationResponse.data?.tasks?.[0]?.result?.[0]?.location_code) {
                    throw new Error(`Location lookup failed: ${JSON.stringify(locationResponse.data)}`);
                }

                const locationId = locationResponse.data.tasks[0].result[0].location_code;
                const locationName = locationResponse.data.tasks[0].result[0].location_name;

                // Then, get search volume data
                console.log('Getting search volume for:', { keyword, locationId, locationName });
                const searchResponse = await axios.post(
                    'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live',
                    [{
                        keywords: [keyword],
                        language_code: "en",
                        location_code: locationId,
                        location_name: locationName
                    }],
                    config
                );

                console.log('Search Response:', searchResponse.data);

                if (searchResponse.data?.tasks?.[0]?.result?.[0]?.items?.[0]) {
                    const data = searchResponse.data.tasks[0].result[0].items[0];
                    return res.json({
                        success: true,
                        data: {
                            monthly_searches: data.search_volume || 0,
                            cpc: data.cpc || 0,
                            competition: data.competition_index || 0,
                            source: 'DataForSEO'
                        }
                    });
                }
            } catch (error) {
                console.error('\n=== DataForSEO Error ===');
                console.error('Error:', error.message);
                if (error.response) {
                    console.error('Response:', error.response.data);
                }
                // Fall back to smart estimation
                console.log('\n=== Falling Back to Smart Estimation ===');
                const estimation = await getSmartEstimation(keyword, city);
                return res.json({
                    success: true,
                    data: {
                        ...estimation,
                        source: 'Smart Estimation (DataForSEO Fallback)'
                    }
                });
            }
        } else {
            // Use smart estimation
            const estimation = await getSmartEstimation(keyword, city);
            return res.json({
                success: true,
                data: {
                    ...estimation,
                    source: 'Smart Estimation'
                }
            });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Function to generate smart estimation based on city and keyword
async function getSmartEstimation(keyword, city) {
    console.log('\n=== Smart Estimation Debug ===');
    console.log('Input:', { keyword, city });
    
    // Base volumes for different keyword types
    const baseVolumes = {
        'homes for sale': 22000,
        'houses for sale': 20000,
        'real estate': 18000,
        'apartments for rent': 16000,
        'houses for rent': 15000,
        'condos for sale': 12000,
        'townhomes for sale': 10000,
        'land for sale': 8000,
        'foreclosures': 6000,
        'realtors': 5000
    };

    // Get base volume
    let baseVolume = 15000;  // Default base volume
    const keywordLower = keyword.toLowerCase();
    
    // Look for exact matches first
    if (baseVolumes[keywordLower]) {
        baseVolume = baseVolumes[keywordLower];
        console.log('Found exact keyword match:', keywordLower);
    } else {
        // Look for partial matches
        for (const [key, volume] of Object.entries(baseVolumes)) {
            if (keywordLower.includes(key)) {
                baseVolume = volume * 0.8;  // 80% of the exact match volume
                console.log('Found partial keyword match:', key);
                break;
            }
        }
    }
    console.log('Base volume:', baseVolume);

    // Get population multiplier
    const multiplier = getPopulationMultiplier(city);
    console.log('Final population multiplier:', multiplier);

    // Calculate estimated volume with some randomness
    const randomFactor = 0.9 + (Math.random() * 0.2); // Random factor between 0.9 and 1.1
    console.log('Random factor:', randomFactor);
    
    const estimatedVolume = Math.round(baseVolume * multiplier * randomFactor);
    console.log('Final estimated volume:', estimatedVolume);
    
    // Calculate CPC based on city size and keyword
    let baseCPC = 2.50;
    if (multiplier > 3) baseCPC *= 2;       // Mega cities
    else if (multiplier > 2) baseCPC *= 1.7; // Very large cities
    else if (multiplier > 1.5) baseCPC *= 1.4; // Large cities
    
    // Add some randomness to CPC
    const cpcRandomFactor = 0.9 + (Math.random() * 0.2);
    const estimatedCPC = Math.round(baseCPC * cpcRandomFactor * 100) / 100;

    return {
        monthly_searches: estimatedVolume,
        cpc: estimatedCPC
    };
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        environment: process.env.NODE_ENV || 'development',
        SERP_API_KEY: process.env.SERP_API_KEY ? 'Set' : 'Not set',
        DATAFORSEO_LOGIN: process.env.DATAFORSEO_LOGIN ? 'Set' : 'Not set',
        DATAFORSEO_PASSWORD: process.env.DATAFORSEO_PASSWORD ? 'Set' : 'Not set',
        DATAFORSEO_API_KEY: process.env.DATAFORSEO_API_KEY ? 'Set' : 'Not set',
        PRO_TIER_KEY: process.env.PRO_TIER_KEY ? 'Set' : 'Not set',
        ENTERPRISE_TIER_KEY: process.env.ENTERPRISE_TIER_KEY ? 'Set' : 'Not set',
        PREMIUM_API_KEY: process.env.PREMIUM_API_KEY ? 'Set' : 'Not set'
    });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
});

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
