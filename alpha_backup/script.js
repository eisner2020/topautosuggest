// Global variables
let cityInput = null;
let nicheInput = null;
let businessTypeInput = null;
let businessNameInput = null;
let demoSearch = null;
let demoSuggestion = null;

// Function to check if we should use DataForSEO
function shouldUseDataForSEO() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('pro') === 'true';
}

// Function to safely get element value
function getElementValue(element, defaultValue = '') {
    return element?.value?.trim() || defaultValue;
}

// Typewriter effect for search preview
async function typewriterEffect(element, text, speed = 50) {
    element.value = '';
    for (let i = 0; i < text.length; i++) {
        element.value += text[i];
        await new Promise(resolve => setTimeout(resolve, speed));
    }
}

// Format search text without 'in'
function formatSearchText(keyword, city, businessName) {
    let parts = [];
    if (keyword) parts.push(keyword);
    if (city) parts.push(city);
    if (businessName) parts.push(businessName);
    return parts.join(' ');
}

// Initialize everything when the window is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');

    // Get form and search elements
    const form = document.getElementById('search-form');
    const searchInput = document.getElementById('demo-search');
    const suggestionElement = document.getElementById('demo-suggestion');

    // Clear search box initially
    if (searchInput) searchInput.value = '';
    if (suggestionElement) suggestionElement.textContent = '';

    // Handle form submission
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            console.log('Form submitted');
            
            // Get input values
            const keyword = document.getElementById('niche-input')?.value?.trim();
            const city = document.getElementById('city-input')?.value?.trim();
            const businessName = document.getElementById('company-name')?.value?.trim();

            console.log('Form values:', { keyword, city, businessName });

            if (!keyword || !city) {
                console.error('Missing required fields');
                const errorElement = document.getElementById('error-message-2');
                if (errorElement) {
                    errorElement.textContent = 'Please enter both keyword and city';
                    errorElement.style.display = 'block';
                }
                return;
            }

            // Format search text without 'in'
            const searchText = formatSearchText(keyword, city, businessName);
            console.log('Search text:', searchText);

            // Update search display with typewriter effect
            if (searchInput && suggestionElement) {
                searchInput.value = '';
                suggestionElement.textContent = '';
                await typewriterEffect(searchInput, searchText);
                suggestionElement.textContent = searchText;
            }

            // Get search data
            await getKeywordData(keyword, city);
        });
    }
});

// Function to get keyword data
async function getKeywordData(keyword, city) {
    try {
        const useDataForSEO = shouldUseDataForSEO();
        console.log('Getting keyword data for:', { keyword, city });
        console.log('Using DataForSEO:', useDataForSEO);
        console.log('URL Parameters:', new URLSearchParams(window.location.search).toString());

        // Show loading state
        const monthlyElement = document.getElementById('monthly-searches');
        const cpcElement = document.getElementById('ppc-cost-2');
        const sourceElement = document.getElementById('data-source-2');
        const errorElement = document.getElementById('error-message-2');

        if (monthlyElement) monthlyElement.textContent = 'Loading...';
        if (cpcElement) cpcElement.textContent = 'Loading...';
        if (sourceElement) sourceElement.textContent = 'Loading...';
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }

        // Make API request
        const requestBody = { 
            keyword, 
            city,
            useDataForSEO
        };
        console.log('Request body:', requestBody);

        const response = await fetch('/api/search-volume', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('API Response:', result);

        if (result.success) {
            updateMetricsDisplay(result.data);
        } else {
            throw new Error(result.error || 'Failed to get keyword data');
        }

    } catch (error) {
        console.error('Error:', error);
        const errorElement = document.getElementById('error-message-2');
        if (errorElement) {
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
        }

        // Clear metrics on error
        const elements = {
            'monthly-searches': '-',
            'ppc-cost-2': '-',
            'data-source-2': '-'
        };

        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        }
    }
}

// Function to update metrics display
function updateMetricsDisplay(data) {
    console.log('Updating metrics display with:', data);

    // Format source message
    let sourceText = 'Source: ';
    if (data.source) {
        sourceText += data.source;
        if (data.error && data.error.includes('DataForSEO')) {
            // Clean up DataForSEO error message
            sourceText = 'Source: Smart Estimation';
        }
    } else {
        sourceText = 'No data available';
    }

    const elements = {
        'monthly-searches': data.monthly_searches ? Number(data.monthly_searches).toLocaleString() : '-',
        'ppc-cost-2': data.cpc ? `$${Number(data.cpc).toFixed(2)}` : '-',
        'data-source-2': sourceText
    };

    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            element.style.display = 'block';
        }
    }

    // Hide error message if we have data
    const errorElement = document.getElementById('error-message-2');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}
