class SearchDemo {
    constructor(options = {}) {
        this.searchInput = document.getElementById(options.inputId || 'search-input');
        this.suggestionsBox = document.getElementById(options.suggestionsId || 'suggestions');
        this.currentDemoIndex = 0;
        this.isTyping = false;
        this.demos = [];
        this.typingSpeed = 150;
        this.pauseBeforeNext = 3000;
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                const value = this.searchInput.value.trim();
                if (value) {
                    this.showSuggestions(value);
                } else {
                    this.hideSuggestions();
                }
            });
        }
    }

    addDemo(keyword, targetSuggestion) {
        this.demos.push({ keyword, targetSuggestion });
    }

    async start() {
        if (this.demos.length === 0) return;
        while (true) {
            for (let i = 0; i < this.demos.length; i++) {
                await this.runDemo(this.demos[i]);
                await this.wait(this.pauseBeforeNext);
            }
        }
    }

    async runDemo({ keyword, targetSuggestion }) {
        if (!this.searchInput) return;
        
        this.searchInput.value = '';
        this.hideSuggestions();
        
        const words = keyword.split(' ');
        let lastWordTyped = '';
        
        for (let i = 1; i <= keyword.length; i++) {
            const partial = keyword.substring(0, i);
            this.searchInput.value = partial;
            
            const currentWords = partial.trim().split(' ');
            const currentWord = currentWords[currentWords.length - 1];
            
            if (currentWord !== lastWordTyped && currentWord.length === words[currentWords.length - 1].length) {
                await this.showSuggestionsWithDelay(partial, targetSuggestion, {
                    showTarget: false
                });
                lastWordTyped = currentWord;
            }
            
            await this.wait(this.typingSpeed);
        }
        
        await this.showSuggestionsWithDelay(keyword, targetSuggestion, {
            showTarget: false
        });
        
        await this.wait(1000);
        
        await this.showSuggestionsWithDelay(keyword, targetSuggestion, {
            showTarget: true
        });
        
        await this.wait(1500);
    }

    async showSuggestionsWithDelay(query, targetSuggestion, options = {}) {
        if (!this.suggestionsBox) return;
        
        let suggestions = this.generateSuggestions(query, targetSuggestion, options);
        
        this.suggestionsBox.innerHTML = '';
        
        const targetIndex = options.showTarget ? Math.floor(Math.random() * 4) : -1;
        
        if (options.showTarget && suggestions.length < 4) {
            suggestions = suggestions.concat(Array(4 - suggestions.length).fill(query));
        }
        
        suggestions.forEach((suggestion, index) => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            
            if (index === targetIndex && options.showTarget) {
                div.textContent = targetSuggestion;
                div.classList.add('highlighted');
            } else {
                div.textContent = suggestion;
            }
            
            this.suggestionsBox.appendChild(div);
        });
        
        this.suggestionsBox.style.display = 'block';
    }

    hideSuggestions() {
        if (this.suggestionsBox) {
            this.suggestionsBox.style.display = 'none';
        }
    }

    generateSuggestions(query, targetSuggestion, options = {}) {
        const suggestions = [];
        const words = query.toLowerCase().split(' ');
        
        if (words.includes('in')) {
            suggestions.push(
                query,
                query + ' reviews',
                query + ' near me',
                query + ' prices',
                query + ' cost'
            );
        } else {
            suggestions.push(
                query,
                query + ' in',
                query + ' services',
                query + ' company',
                query + ' professional'
            );
        }
        
        const locationTerms = ['pa', 'fl', 'co', 'sc', 'dallas', 'miami', 'orlando'];
        const hasLocation = locationTerms.some(term => query.toLowerCase().includes(term));
        
        if (hasLocation) {
            suggestions.push(
                query + ' best rated',
                query + ' top rated',
                query + ' phone number'
            );
        }
        
        for (let i = suggestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [suggestions[i], suggestions[j]] = [suggestions[j], suggestions[i]];
        }
        
        return suggestions.slice(0, 5 + Math.floor(Math.random() * 2));
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize demos when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const mainDemo = new SearchDemo();
    if (typeof DEMO_KEYWORDS !== 'undefined') {
        DEMO_KEYWORDS.forEach(({ keyword, target }) => {
            mainDemo.addDemo(keyword, target);
        });
        mainDemo.start();
    }
});

// Form handling for search data
async function handleSearchDataForm(event) {
    event.preventDefault();

    const targetKeywords = document.getElementById('target-keywords').value;
    const city = document.getElementById('city').value;
    const companyName = document.getElementById('company-name').value;

    // Validate required fields
    if (!targetKeywords || !city || !companyName) {
        const errorElement = document.getElementById('form-error');
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.textContent = 'Please fill in all required fields.';
        }
        return;
    }

    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';

    try {
        // Update the search results
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
            const searchContainer = document.createElement('div');
            searchContainer.innerHTML = `
                <div class="results-container">
                    <h3>Search Data for "${targetKeywords}" in ${city}</h3>
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
            const customDemo = new SearchDemo({
                inputId: 'custom-search-input',
                suggestionsId: 'custom-suggestions'
            });

            // Add the demo with the target suggestion
            customDemo.addDemo(`${targetKeywords} ${city}`, `${targetKeywords} ${city} ${companyName}`);
            customDemo.start();
        }

    } catch (error) {
        console.error('Error:', error);
        const errorElement = document.getElementById('form-error');
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.textContent = 'An error occurred. Please try again.';
        }
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

// Set up form handler
const form = document.getElementById('search-form');
if (form) {
    form.addEventListener('submit', handleSearchDataForm);
}
