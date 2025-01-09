class TopSearchDemo {
    constructor(options = {}) {
        this.input = document.getElementById(options.inputId);
        this.suggestionsBox = document.getElementById(options.suggestionsId);
        this.demos = [];
        this.currentDemoIndex = 0;
        this.typingSpeed = 150;
        this.isTyping = false;
        this.currentSuggestions = [];
        this.targetSuggestion = null;
    }

    addDemo(keyword, target) {
        this.demos.push({ keyword, target });
    }

    async start() {
        if (!this.demos.length) return;
        
        // Shuffle the demos array
        for (let i = this.demos.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.demos[i], this.demos[j]] = [this.demos[j], this.demos[i]];
        }
        
        while (true) {
            const demo = this.demos[this.currentDemoIndex];
            this.targetSuggestion = demo.target;
            
            // Clear previous state
            this.cleanup();
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Type and show suggestions
            await this.typeAndShowSuggestions(demo.keyword, this.targetSuggestion);
            
            // Keep the final state visible
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Move to next demo
            this.currentDemoIndex = (this.currentDemoIndex + 1) % this.demos.length;
            
            // Reshuffle when we've gone through all demos
            if (this.currentDemoIndex === 0) {
                for (let i = this.demos.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [this.demos[i], this.demos[j]] = [this.demos[j], this.demos[i]];
                }
            }
        }
    }

    async typeAndShowSuggestions(text, targetSuggestion) {
        // Clear any existing timeout
        if (this.resetTimeout) {
            clearTimeout(this.resetTimeout);
        }

        // Clear suggestions first
        this.suggestionsBox.innerHTML = '';
        this.suggestionsBox.style.display = 'none';

        // Type out the text
        await this.typeText(text);
        
        // Wait a bit before showing suggestions
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Show suggestions
        const suggestions = this.generateSuggestions(text, targetSuggestion);
        this.showSuggestions(suggestions, targetSuggestion);
        
        // Set timeout to reset (6 seconds total)
        this.resetTimeout = setTimeout(() => {
            this.reset();
            this.start();
        }, 6000);  
    }

    showSuggestions(suggestions, targetSuggestion) {
        if (!this.suggestionsBox) return;
        
        this.suggestionsBox.innerHTML = '';
        
        // Show all suggestions at once, including the target
        suggestions.forEach((suggestion) => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = suggestion;
            
            if (suggestion === targetSuggestion) {
                div.style.cursor = 'pointer';
                div.onclick = () => window.open(`https://www.google.com/search?q=${encodeURIComponent(suggestion)}`, '_blank');
            }
            
            this.suggestionsBox.appendChild(div);
        });
        
        this.suggestionsBox.style.display = 'block';

        // Add highlight class after a brief delay
        setTimeout(() => {
            const targetItems = Array.from(this.suggestionsBox.children).filter(item => 
                item.textContent === targetSuggestion
            );
            targetItems.forEach(item => item.classList.add('highlighted'));
        }, 300);
    }

    generateSuggestions(query, targetSuggestion) {
        if (!query || !targetSuggestion) return [];
        
        const suggestions = [];
        const queryLower = query.toLowerCase();
        
        // Add target suggestion if we've typed enough
        if (query.length >= Math.floor(targetSuggestion.length * 0.4)) {
            suggestions.push(targetSuggestion);
        }
        
        // Add some variations
        suggestions.push(query + ' near me');
        suggestions.push('best ' + query);
        suggestions.push(query + ' services');
        
        // Remove duplicates and current query
        return [...new Set(suggestions)]
            .filter(s => s.toLowerCase() !== queryLower)
            .slice(0, 5);
    }

    async typeText(text) {
        this.isTyping = true;
        let currentText = '';
        
        for (let i = 0; i < text.length; i++) {
            if (!this.isTyping) break;
            
            currentText = text.substring(0, i + 1);
            this.input.value = currentText;
            
            if (i > 1) {
                const suggestions = this.generateSuggestions(currentText, this.targetSuggestion);
                this.showSuggestions(suggestions, this.targetSuggestion);
            }
            
            await new Promise(resolve => setTimeout(resolve, this.typingSpeed));
        }
    }

    cleanup() {
        this.isTyping = false;
        if (this.input) {
            this.input.value = '';
        }
        if (this.suggestionsBox) {
            this.suggestionsBox.innerHTML = '';
            this.suggestionsBox.style.display = 'none';
        }
    }
}

class BottomSearchDemo extends TopSearchDemo {
    constructor(options = {}) {
        super(options);
        this.typingSpeed = 100;
        this.currentDemoIndex = 0;
        this.demos = [];
    }

    addDemo(keyword, target) {
        this.demos.push({ keyword, target });
    }

    async start() {
        if (!this.demos.length) return;
        
        while (true) {
            const demo = this.demos[this.currentDemoIndex];
            
            // Clear previous state
            this.reset();
            
            // Wait before starting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Type the text first
            await this.typeText(demo.keyword);
            
            // Show suggestions with a natural stagger
            const suggestions = [
                `${demo.keyword} reviews`,
                `${demo.keyword} near me`,
                demo.target,
                `best ${demo.keyword}`,
                `top rated ${demo.keyword}`
            ];

            if (this.suggestionsBox) {
                this.suggestionsBox.innerHTML = '';
                this.suggestionsBox.style.display = 'block';

                // Add suggestions with a slight stagger
                for (let i = 0; i < suggestions.length; i++) {
                    const suggestion = suggestions[i];
                    await new Promise(resolve => setTimeout(resolve, 50)); // Stagger each suggestion

                    const div = document.createElement('div');
                    div.className = 'suggestion-item';
                    div.textContent = suggestion;
                    
                    if (suggestion === demo.target) {
                        div.style.cursor = 'pointer';
                        div.onclick = () => window.open(`https://www.google.com/search?q=${encodeURIComponent(suggestion)}`, '_blank');
                    }
                    
                    this.suggestionsBox.appendChild(div);

                    // Add highlight class immediately for target suggestion
                    if (suggestion === demo.target) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        div.classList.add('highlighted');
                    }
                }
            }
            
            // Keep suggestions visible
            await new Promise(resolve => setTimeout(resolve, 6000));
            
            // Move to next demo
            this.currentDemoIndex = (this.currentDemoIndex + 1) % this.demos.length;
        }
    }

    reset() {
        if (this.input) {
            this.input.value = '';
        }
        if (this.suggestionsBox) {
            this.suggestionsBox.innerHTML = '';
            this.suggestionsBox.style.display = 'none';
        }
    }
}

// Initialize forms when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing forms...');
    
    // Initialize main search demo
    const mainDemo = new TopSearchDemo({
        inputId: 'search-input',
        suggestionsId: 'suggestions',
        continuous: true,
        highlightLoop: true
    });

    // Initialize bottom search demo
    const bottomDemo = new BottomSearchDemo({
        inputId: 'try-it-input',
        suggestionsId: 'try-it-suggestions',
        continuous: true,
        highlightLoop: true
    });

    // Add the real demo keywords to both demos
    const demoKeywords = [
        ["chimney sweep pottstown pa", "chimney sweep pottstown pa wells & sons"],
        ["commercial solar orange county", "commercial solar orange county rep solar"],
        ["dentistry for children scottsdale", "dentistry for children scottsdale palm valley pediatrics"],
        ["rehab loveland co", "rehab loveland co new life recovery"],
        ["divorce lawyer orlando fl", "divorce lawyer orlando fl caplan & associates"],
        ["car accident lawyer miami fl", "car accident lawyer miami fl 1-800 ask gary"],
        ["fence companies in albuquerque", "fence companies in albuquerque amazing gates"],
        ["car accident lawyer columbia sc", "car accident lawyer columbia sc s chris davis"],
        ["air duct cleaning dallas", "air duct cleaning dallas airductcleanup.com"],
        ["divorce attorney charlotte", "divorce attorney charlotte n stallard & bellof plic"],
        ["janitorial services dallas", "janitorial services dallas delta janitorial"],
        ["seo toronto", "seo toronto dit web solutions"],
        ["botox denver", "botox denver adrienne stewart md"],
        ["coolsculpting denver", "coolsculpting denver adrienne stewart md"],
        ["laser hair removal denver", "laser hair removal denver adrienne stewart md"],
        ["lip injections denver", "lip injections denver adrienne stewart md"],
        ["best plastic surgeon california", "best plastic surgeon california dr simon ourian"],
        ["colorado springs home loan", "colorado springs home loan fidelity mortgage solutions"],
        ["in home care sacramento", "in home care sacramento fijian homecare angels"],
        ["small business flight school", "small business flight school flywheel business advisors"]
    ];

    // Add keywords to both demos
    demoKeywords.forEach(([keyword, target]) => {
        mainDemo.addDemo(keyword, target);
        bottomDemo.addDemo(keyword, target);
    });

    // Start both demos
    mainDemo.start();
    bottomDemo.start();

    // Initialize search form
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const keywords = document.getElementById('target-keywords').value.trim();
            const city = document.getElementById('city').value.trim();
            const companyName = document.getElementById('company-name').value.trim();
            
            if (!keywords || !city || !companyName) {
                const errorDiv = document.getElementById('form-error');
                if (errorDiv) {
                    errorDiv.textContent = 'Please fill in all fields';
                    errorDiv.style.display = 'block';
                }
                return;
            }

            // Create the demo search box
            const resultsDiv = document.getElementById('results');
            if (!resultsDiv) return;

            resultsDiv.innerHTML = `
                <div class="search-demo-container" style="margin: 2rem auto; width: 500px;">
                    <div class="google-logo">
                        <span style="color:#4285f4">G</span><span style="color:#ea4335">o</span><span style="color:#fbbc05">o</span><span style="color:#4285f4">g</span><span style="color:#34a853">l</span><span style="color:#ea4335">e</span>
                    </div>
                    <div class="search-wrapper">
                        <input type="text" id="try-it-input" placeholder="Search..." style="width: 100%; height: 40px; padding: 0 16px; font-size: 16px; border: 1px solid #dfe1e5; border-radius: 24px; outline: none;">
                        <div id="try-it-suggestions" class="suggestions-box"></div>
                    </div>
                </div>
            `;

            // Create a new demo instance with custom suggestions
            const demo = new BottomSearchDemo({
                inputId: 'try-it-input',
                suggestionsId: 'try-it-suggestions'
            });

            const searchTerm = `${keywords} ${city}`;
            const targetPhrase = `${keywords} ${city} ${companyName}`;
            
            // Add the demo with the exact search term and target phrase
            demo.addDemo(searchTerm, targetPhrase);
            demo.start();

            // Scroll to show results
            setTimeout(() => {
                const offset = resultsDiv.offsetTop - 100; // Show a bit of the form above
                window.scrollTo({
                    top: offset,
                    behavior: 'smooth'
                });
            }, 100);
        });
    }

    // Initialize contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.onsubmit = handleContactForm;
    } else {
        console.error('Contact form not found in DOM');
    }

    // Initialize search data form
    const searchDataForm = document.getElementById('search-data-form');
    if (searchDataForm) {
        searchDataForm.onsubmit = handleSearchDataForm;
    } else {
        console.error('Search data form not found in DOM');
    }
});

// Handle contact form submission
function handleContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = {
        name: form.querySelector('#contact-name').value.trim(),
        email: form.querySelector('#contact-email').value.trim(),
        message: form.querySelector('#contact-message').value.trim()
    };
    
    console.log('Form data:', formData);
    
    const errorDiv = document.getElementById('contact-error');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Show sending state
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    errorDiv.style.display = 'none';
    
    // Send the data
    fetch('/submit-contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.success) {
            form.reset();
            errorDiv.textContent = 'Message sent successfully!';
            errorDiv.style.color = '#28a745';
        } else {
            throw new Error(data.message || 'Failed to send message');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        errorDiv.textContent = error.message || 'Failed to send message';
        errorDiv.style.color = '#dc3545';
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
        errorDiv.style.display = 'block';
    });
}

// Form handling for search data
async function handleSearchDataForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const errorElement = document.getElementById('search-data-error');
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        
        // Hide any previous error messages
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        
        // Get form data
        const formData = {
            businessName: form.querySelector('#business-name').value.trim(),
            businessType: form.querySelector('#business-type').value.trim(),
            location: form.querySelector('#location').value.trim(),
            email: form.querySelector('#email').value.trim()
        };
        
        // Validate required fields
        for (const [key, value] of Object.entries(formData)) {
            if (!value) {
                throw new Error(`Please fill in ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            }
        }
        
        // Submit form data
        const response = await fetch('/api/submit-search-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit form');
        }
        
        // Show success message
        if (errorElement) {
            errorElement.style.color = '#28a745';
            errorElement.textContent = 'Form submitted successfully!';
            errorElement.style.display = 'block';
            errorElement.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Clear form
        form.reset();
        
    } catch (error) {
        console.error('Form submission error:', error);
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.textContent = error.message || 'Failed to submit form. Please try again.';
            errorElement.scrollIntoView({ behavior: 'smooth' });
        }
    } finally {
        // Re-enable submit button and restore text
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}
