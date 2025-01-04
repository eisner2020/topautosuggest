// Global variables
let cityInput = null;
let nicheInput = null;
let businessTypeInput = null;
let businessNameInput = null;
let demoSearch = null;
let demoSuggestion = null;

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

    // Handle contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                message: document.getElementById('message').value
            };

            try {
                // Show loading state
                const submitButton = contactForm.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                submitButton.textContent = 'Sending...';
                submitButton.disabled = true;

                console.log('Sending form data:', formData);

                // Send form data
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                console.log('Response received:', response.status);
                const result = await response.json();
                console.log('Response data:', result);

                // Show success message
                if (result.success) {
                    alert('Thank you! Your message has been sent. We will contact you soon.');
                    contactForm.reset();
                } else {
                    alert('Failed to send message: ' + (result.message || 'Please try again.'));
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('Failed to send message. Please try again or contact us directly at eisner2020@mac.com');
            } finally {
                // Reset button state
                const submitButton = contactForm.querySelector('button[type="submit"]');
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }
});

// Function to get keyword data
async function getKeywordData(keyword, city) {
    try {
        console.log('Getting keyword data for:', { keyword, city });

        // Show loading state
        const monthlyElement = document.getElementById('monthly-searches');
        const cpcElement = document.getElementById('ppc-cost-2');
        const errorElement = document.getElementById('error-message-2');

        if (monthlyElement) monthlyElement.textContent = 'Loading...';
        if (cpcElement) cpcElement.textContent = 'Loading...';
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }

        // Make API request
        const response = await fetch('/api/search-volume', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ keyword, city })
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
            'ppc-cost-2': '-'
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

    const elements = {
        'monthly-searches': data.monthly_searches ? Number(data.monthly_searches).toLocaleString() : '-',
        'ppc-cost-2': data.cpc ? `$${Number(data.cpc).toFixed(2)}` : '-'
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

function showSuggestions(suggestions) {
    const suggestionsBox = document.getElementById('suggestions');
    
    if (suggestions.length > 0) {
        // Keep the suggestions box visible
        suggestionsBox.classList.add('visible');
        
        // Create all suggestion items
        const suggestionElements = suggestions.map(text => {
            const div = document.createElement('div');
            div.textContent = text;
            div.className = 'suggestion-item';
            return div;
        });

        // Clear and append all items
        suggestionsBox.innerHTML = '';
        suggestionElements.forEach(div => suggestionsBox.appendChild(div));

        // After a delay, randomly highlight one suggestion
        setTimeout(() => {
            // Get a random suggestion to highlight
            const randomIndex = Math.floor(Math.random() * suggestions.length);
            
            // Create new elements with the highlighted one in its original position
            suggestionsBox.innerHTML = '';
            suggestionElements.forEach((div, index) => {
                if (index === randomIndex) {
                    div.classList.add('highlighted');
                }
                suggestionsBox.appendChild(div);
            });
        }, 1000); // 1 second delay to make the transition more noticeable
    } else {
        suggestionsBox.classList.remove('visible');
    }
}
