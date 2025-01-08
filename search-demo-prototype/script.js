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
            await this.typeText(demo.keyword);
            
            // Show final suggestions with highlight
            const suggestions = this.generateSuggestions(demo.keyword, this.targetSuggestion);
            this.showSuggestions(suggestions, this.targetSuggestion);
            
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

    showSuggestions(suggestions, targetSuggestion) {
        if (!this.suggestionsBox) return;
        
        this.suggestionsBox.innerHTML = '';
        this.currentSuggestions = suggestions;
        
        suggestions.forEach((suggestion) => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            
            if (suggestion === targetSuggestion) {
                div.classList.add('highlighted');
                div.style.cursor = 'pointer';
                div.onclick = function() {
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(suggestion)}`, '_blank');
                };
            }
            
            div.textContent = suggestion;
            this.suggestionsBox.appendChild(div);
        });
        
        if (suggestions.length > 0) {
            this.suggestionsBox.style.display = 'block';
        } else {
            this.suggestionsBox.style.display = 'none';
        }
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
                this.showSuggestions(suggestions, null);
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

    // Handle search data form submission
    const searchDataForm = document.getElementById('search-data-form');
    if (searchDataForm) {
        searchDataForm.addEventListener('submit', handleSearchDataForm);
    }

    // Handle contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
});

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

        // Use the current domain
        const serverUrl = window.location.origin;
        console.log('Sending to:', `${serverUrl}/api/submit-contact`);
        console.log('Form data:', formData);

        const response = await fetch(`${serverUrl}/api/submit-contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        console.log('Response status:', response.status);
        const responseData = await response.json();
        console.log('Response data:', responseData);

        if (!response.ok) {
            throw new Error(responseData.message || 'Failed to send message');
        }

        // Clear form and show success message
        form.reset();
        errorDiv.textContent = 'Message sent successfully!';
        errorDiv.style.color = '#28a745';
        errorDiv.style.display = 'block';
        
    } catch (error) {
        console.error('Detailed error:', error);
        errorDiv.textContent = error.message || 'There was an error sending your message. Please try again.';
        errorDiv.style.color = '#dc3545';
        errorDiv.style.display = 'block';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
}
