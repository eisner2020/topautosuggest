// Search demo implementation
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
        this.isContinuous = true;
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
            div.textContent = suggestion;
            
            if (suggestion === targetSuggestion) {
                div.classList.add('highlighted');
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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main search demo
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
    mainDemo.addDemo("laser hair removal denver", "laser hair removal denver adrienne stewart md");
    mainDemo.addDemo("lip injections denver", "lip injections denver adrienne stewart md");
    mainDemo.addDemo("best plastic surgeon california", "best plastic surgeon california dr simon ourian");
    mainDemo.addDemo("colorado springs home loan", "colorado springs home loan fidelity mortgage solutions");
    mainDemo.addDemo("in home care sacramento", "in home care sacramento fijian homecare angels");
    mainDemo.addDemo("small business flight school", "small business flight school flywheel business advisors");
    mainDemo.addDemo("home inspector tampa fl", "home inspector tampa fl forscher property inspections");
    mainDemo.addDemo("denver auto accident lawyer", "denver auto accident lawyer frederick ganderton Ilp");
    mainDemo.addDemo("personal injury lawyer syracuse ny", "personal injury lawyer syracuse ny harding mazzotti Ilp");
    mainDemo.addDemo("car accident lawyer boston", "car accident lawyer boston harding mazzotti lIp");
    mainDemo.addDemo("car accident lawyer nyc", "car accident lawyer nyc harding mazzotti lIp");
    
    mainDemo.start();

    // Initialize bottom search demo
    const bottomDemo = new BottomSearchDemo({
        inputId: 'bottom-search-input',
        suggestionsId: 'bottom-suggestions',
        continuous: true,
        highlightLoop: true
    });

    // Add demo keywords for bottom search
    bottomDemo.addDemo("dentistry for children scottsdale", "dentistry for children scottsdale palm valley pediatrics");
    bottomDemo.addDemo("rehab loveland co", "rehab loveland co new life recovery");
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

// Form handling functions
async function handleSearchDataForm(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('/submit-search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        console.log('Success:', result);
        
        // Clear form
        form.reset();
        
        // Show success message
        const errorDiv = document.getElementById('search-error');
        if (errorDiv) {
            errorDiv.textContent = 'Thank you for your submission!';
            errorDiv.style.color = '#4CAF50';
        }
    } catch (error) {
        console.error('Error:', error);
        const errorDiv = document.getElementById('search-error');
        if (errorDiv) {
            errorDiv.textContent = 'There was an error submitting your data. Please try again.';
            errorDiv.style.color = '#f44336';
        }
    }
}

async function handleContactForm(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('/submit-contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        console.log('Success:', result);
        
        // Clear form
        form.reset();
        
        // Show success message
        const errorDiv = document.getElementById('contact-error');
        if (errorDiv) {
            errorDiv.textContent = 'Thank you for your message! We will get back to you soon.';
            errorDiv.style.color = '#4CAF50';
        }
    } catch (error) {
        console.error('Error:', error);
        const errorDiv = document.getElementById('contact-error');
        if (errorDiv) {
            errorDiv.textContent = 'There was an error sending your message. Please try again.';
            errorDiv.style.color = '#f44336';
        }
    }
}
