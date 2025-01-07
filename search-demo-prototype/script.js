class TopSearchDemo {
    constructor(options = {}) {
        this.input = document.getElementById(options.inputId);
        this.suggestionsBox = document.getElementById(options.suggestionsId);
        this.demos = [];
        this.currentDemoIndex = 0;
        this.typingSpeed = 100;
        this.isTyping = false;
        this.currentSuggestions = [];
        this.targetSuggestion = null;
        this.isContinuous = true; // Always run continuously
        this.highlightLoop = options.highlightLoop || false;
        this.currentTimeout = null;
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
            
            // Type and show suggestions
            await this.typeText(demo.keyword);
            
            // Show final suggestions with highlight
            const suggestions = this.generateSuggestions(demo.keyword, this.targetSuggestion);
            this.showSuggestions(suggestions, this.targetSuggestion);
            
            // Keep the final state visible for longer
            await new Promise(resolve => setTimeout(resolve, 4000));
            
            // Clear everything
            this.cleanup();
            
            // Move to next demo
            this.currentDemoIndex = (this.currentDemoIndex + 1) % this.demos.length;
            
            // Pause between demos
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    generateSuggestions(query, targetSuggestion) {
        if (!query || !targetSuggestion) return [];
        
        const suggestions = [];
        const queryLower = query.toLowerCase();
        
        // Always include several suggestions from demos
        this.demos.forEach(demo => {
            if (demo.keyword.toLowerCase().includes(queryLower)) {
                suggestions.push(demo.keyword);
            }
            if (demo.target.toLowerCase().includes(queryLower)) {
                suggestions.push(demo.target);
            }
        });
        
        // Add some common variations
        suggestions.push(query + ' near me');
        suggestions.push(query + ' services');
        suggestions.push(query + ' reviews');
        
        // Add target suggestion if we've typed enough
        if (query.length >= Math.floor(targetSuggestion.length * 0.4)) {
            suggestions.push(targetSuggestion);
        }
        
        // Remove duplicates and current query
        const uniqueSuggestions = [...new Set(suggestions)]
            .filter(s => s.toLowerCase() !== queryLower);
        
        // Shuffle suggestions
        for (let i = uniqueSuggestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [uniqueSuggestions[i], uniqueSuggestions[j]] = [uniqueSuggestions[j], uniqueSuggestions[i]];
        }
        
        return uniqueSuggestions.slice(0, 5);
    }

    showSuggestions(suggestions, targetSuggestion) {
        if (!this.suggestionsBox) return;
        
        this.suggestionsBox.innerHTML = '';
        this.currentSuggestions = suggestions;
        
        suggestions.forEach((suggestion) => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            
            if (suggestion === targetSuggestion) {
                // Create an actual anchor tag for highlighted suggestions
                const link = document.createElement('a');
                link.href = `https://www.google.com/search?q=${encodeURIComponent(suggestion)}`;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = suggestion;
                link.style.textDecoration = 'none';
                link.style.color = 'inherit';
                link.style.display = 'block';
                link.style.width = '100%';
                link.style.height = '100%';
                
                div.classList.add('highlighted');
                div.style.cursor = 'pointer';
                div.appendChild(link);
            } else {
                div.textContent = suggestion;
            }
            
            this.suggestionsBox.appendChild(div);
        });
        
        if (suggestions.length > 0) {
            this.suggestionsBox.style.display = 'block';
            this.suggestionsBox.classList.add('visible');
        } else {
            this.suggestionsBox.style.display = 'none';
            this.suggestionsBox.classList.remove('visible');
        }
    }

    async typeText(text) {
        if (!this.input) return;
        
        // Clear any existing timeout
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
        
        // Reset input and suggestions
        this.cleanup();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Type each character with proper timing
        let currentText = '';
        for (let i = 0; i < text.length; i++) {
            await new Promise(resolve => {
                this.currentTimeout = setTimeout(() => {
                    currentText = text.substring(0, i + 1);
                    this.input.value = currentText;
                    
                    if (i > 1) {
                        const suggestions = this.generateSuggestions(currentText, this.targetSuggestion);
                        this.showSuggestions(suggestions, null);
                    }
                    
                    resolve();
                }, this.typingSpeed);
            });
        }
    }

    cleanup() {
        // Clear timeout
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
        
        // Clear input
        if (this.input) {
            this.input.value = '';
        }
        
        // Clear suggestions
        if (this.suggestionsBox) {
            this.suggestionsBox.innerHTML = '';
            this.suggestionsBox.style.display = 'none';
            this.suggestionsBox.classList.remove('visible');
        }
    }
}

class BottomSearchDemo extends TopSearchDemo {
    constructor(options = {}) {
        super(options);
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
            await this.typeText(demo.keyword);
            
            this.currentDemoIndex = (this.currentDemoIndex + 1) % this.demos.length;
            
            // Pause before next demo
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

// Initialize forms when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize search demo
    const mainDemo = new TopSearchDemo({
        inputId: 'search-input',
        suggestionsId: 'suggestions',
        continuous: true,
        highlightLoop: true
    });

    // Add the real demo keywords
    mainDemo.addDemo("chimney sweep pottstown pa", "chimney sweep pottstown pa wells & sons");
    mainDemo.addDemo("commercial solar orange county", "commercial solar orange county rep solar");
    mainDemo.addDemo("dentistry for children scottsdale", "dentistry for children scottsdale palm valley pediatrics");
    mainDemo.addDemo("rehab loveland co", "rehab loveland co new life recovery");
    mainDemo.addDemo("divorce lawyer orlando fl", "divorce lawyer orlando fl caplan & associates");
    mainDemo.addDemo("car accident lawyer miami fl", "car accident lawyer miami fl 1-800 ask gary");
    mainDemo.addDemo("fence companies in albuquerque", "fence companies in albuquerque amazing gates");
    mainDemo.addDemo("car accident lawyer columbia sc", "car accident lawyer columbia sc s chris davis");
    mainDemo.addDemo("air duct cleaning dallas", "air duct cleaning dallas airductcleanup.com");
    mainDemo.addDemo("divorce attorney charlotte", "divorce attorney charlotte n stallard & bellof plic");
    
    // Add new keywords
    mainDemo.addDemo("janitorial services dallas", "janitorial services dallas delta janitorial");
    mainDemo.addDemo("seo toronto", "seo toronto dit web solutions");
    mainDemo.addDemo("botox denver", "botox denver adrienne stewart md");
    mainDemo.addDemo("coolsculpting denver", "coolsculpting denver adrienne stewart md");
    mainDemo.addDemo("laser hair removal denver", "laser hair removal denver adrienne stewart md");
    mainDemo.addDemo("lip injections denver", "lip injections denver adrienne stewart md");
    mainDemo.addDemo("best plastic surgeon california", "best plastic surgeon california dr simon ourian");
    mainDemo.addDemo("colorado springs home loan", "colorado springs home loan fidelity mortgage solutions");
    mainDemo.addDemo("in home care sacramento", "in home care sacramento fijian homecare angels");
    mainDemo.addDemo("small business flight school", "small business flight school flywheel business advisors");
    
    mainDemo.start();

    // Initialize bottom demo
    window.bottomDemo = new BottomSearchDemo({
        inputId: 'bottom-search-input',
        suggestionsId: 'bottom-suggestions'
    });
    
    // Keep just one demo for the bottom search to make it clearer
    bottomDemo.addDemo("divorce lawyer orlando fl", "divorce lawyer orlando fl caplan & associates");
    
    bottomDemo.start();

    // Initialize form handlers
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchDataForm);
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
});

// Form handling for search data
async function handleSearchDataForm(event) {
    event.preventDefault();

    const form = event.target;
    const targetKeywords = form.querySelector('#target-keywords')?.value?.trim();
    const city = form.querySelector('#city')?.value?.trim();
    const companyName = form.querySelector('#company-name')?.value?.trim();
    
    const errorElement = document.getElementById('form-error');
    const submitButton = form.querySelector('button[type="submit"]');

    // Clear previous error
    if (errorElement) {
        errorElement.style.display = 'none';
        errorElement.textContent = '';
    }

    // Validate required fields
    if (!targetKeywords || !city || !companyName) {
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.textContent = 'Please fill in all required fields.';
        }
        return;
    }

    // Disable submit button and show loading state
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';

    try {
        // Show results
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
            resultsDiv.scrollIntoView({ behavior: 'smooth' });
            
            const searchContainer = document.createElement('div');
            searchContainer.innerHTML = `
                <div class="results-container">
                    <h3>Search Data for "${targetKeywords} ${city}"</h3>
                    <div class="data-point">
                        <strong>Monthly Searches:</strong> ${Math.floor(Math.random() * 10000).toLocaleString()}
                    </div>
                    <div class="search-demo-container">
                        <div class="google-logo">
                            <span style="color:#4285f4">G</span><span style="color:#ea4335">o</span><span style="color:#fbbc05">o</span><span style="color:#4285f4">g</span><span style="color:#34a853">l</span><span style="color:#ea4335">e</span>
                        </div>
                        <div class="search-wrapper">
                            <input type="text" id="custom-search-input" placeholder="Search...">
                            <div id="custom-suggestions" class="suggestions-box"></div>
                        </div>
                    </div>
                </div>
            `;

            resultsDiv.innerHTML = '';
            resultsDiv.appendChild(searchContainer);

            // Initialize a new search demo for the custom search
            const customDemo = new TopSearchDemo({
                inputId: 'custom-search-input',
                suggestionsId: 'custom-suggestions',
                highlightLoop: true,
                typingSpeed: 100  
            });

            // Set up the demo with the search query and target
            const searchQuery = `${targetKeywords} ${city}`;
            const targetSuggestion = `${targetKeywords} ${city} ${companyName}`;
            customDemo.addDemo(searchQuery, targetSuggestion);
            
            customDemo.start();
        }

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

// Contact form handling
async function handleContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const errorDiv = document.getElementById('contact-error');
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    
    try {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        errorDiv.style.display = 'none';
        
        const formData = {
            name: form.querySelector('#contact-name').value.trim(),
            email: form.querySelector('#contact-email').value.trim(),
            message: form.querySelector('#contact-message').value.trim()
        };

        // Validate required fields
        if (!formData.name || !formData.email || !formData.message) {
            throw new Error('Please fill in all required fields');
        }

        // Always use localhost:8000 for now
        const response = await fetch('http://localhost:8000/submit-contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        // Clear form and show success message
        form.reset();
        errorDiv.textContent = 'Message sent successfully!';
        errorDiv.style.color = '#28a745';
        errorDiv.style.display = 'block';
        
    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = error.message || 'There was an error sending your message. Please try again.';
        errorDiv.style.color = '#dc3545';
        errorDiv.style.display = 'block';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
}
