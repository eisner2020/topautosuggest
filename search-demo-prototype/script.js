class SearchDemo {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.suggestionsBox = document.getElementById('suggestions');
        this.currentDemoIndex = 0;
        this.isTyping = false;
        this.demos = [];
        this.typingSpeed = 150;
        this.pauseBeforeNext = 3000;
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
        this.searchInput.value = '';
        this.suggestionsBox.style.display = 'none';
        
        const words = keyword.split(' ');
        const totalChars = keyword.length;
        
        for (let i = 1; i <= keyword.length; i++) {
            const partial = keyword.substring(0, i);
            this.searchInput.value = partial;
            
            // Count complete words and characters
            const completeWords = partial.trim().split(' ').length;
            const charsTyped = partial.length;
            const percentComplete = (charsTyped / totalChars) * 100;
            
            // Only show suggestions after first word is complete
            if (completeWords >= 1) {
                this.showSuggestions(partial, targetSuggestion, {
                    // Only show target when we're at least 90% done typing
                    showTarget: percentComplete >= 90 && completeWords >= words.length - 1
                });
            }
            
            await this.wait(this.typingSpeed);
        }
    }

    showSuggestions(partial, target, { showTarget }) {
        const words = partial.split(' ');
        const lastWord = words[words.length - 1];
        const basePhrase = words.slice(0, -1).join(' ');
        
        let suggestions = [];
        
        // Generate more varied suggestions based on typing progress
        if (words.length === 1) {
            suggestions = [
                partial + " services",
                partial + " near me",
                partial + " companies",
                partial + " help"
            ];
        } else if (words.length === 2) {
            suggestions = [
                partial + " area",
                partial + " services",
                partial + " near me",
                partial + " local"
            ];
        } else {
            // More specific suggestions for longer phrases
            const locationTerms = ['pa', 'fl', 'co', 'sc', 'dallas'];
            const isLocation = locationTerms.some(term => partial.toLowerCase().includes(term));
            
            if (isLocation) {
                suggestions = [
                    partial + " best rated",
                    partial + " top rated",
                    partial + " reviews",
                    partial + " phone number"
                ];
            } else {
                suggestions = [
                    partial + " services",
                    partial + " professionals",
                    partial + " experts",
                    partial + " contact"
                ];
            }
        }

        // Add target suggestion only when we're almost done typing
        if (showTarget) {
            suggestions = [target, ...suggestions.slice(0, 2)];
        }

        this.showSuggestionsList(suggestions, target);
    }

    showSuggestionsList(suggestions, target) {
        const suggestionsBox = document.getElementById('suggestions');
        
        if (suggestions.length > 0) {
            // Get the preferred result and remaining suggestions
            const preferredResult = suggestions[0];
            const remainingSuggestions = suggestions.slice(1);
            
            // Shuffle remaining suggestions
            for (let i = remainingSuggestions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [remainingSuggestions[i], remainingSuggestions[j]] = 
                [remainingSuggestions[j], remainingSuggestions[i]];
            }
            
            // Insert preferred result at position 2 or 3
            const insertPosition = 1 + Math.floor(Math.random() * 2); // Will be 1 or 2
            const finalSuggestions = [...remainingSuggestions];
            finalSuggestions.splice(insertPosition, 0, preferredResult);
            
            // Show suggestions box first
            suggestionsBox.classList.add('visible');
            
            // Create and display all items
            suggestionsBox.innerHTML = finalSuggestions.map(text => `
                <div class="suggestion-item${text === target ? ' highlighted' : ''}">${text}</div>
            `).join('');
            
        } else {
            suggestionsBox.classList.remove('visible');
        }
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const demo = new SearchDemo();
    
    // Add demos from config file
    if (typeof DEMO_KEYWORDS !== 'undefined') {
        DEMO_KEYWORDS.forEach(({keyword, target}) => {
            demo.addDemo(keyword, target);
        });
    }
    
    demo.start();
});
