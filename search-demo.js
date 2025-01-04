class SearchDemo {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.suggestionsBox = document.getElementById('suggestions');
        this.currentDemoIndex = 0;
        this.isTyping = false;
        this.demos = [];
        this.typingSpeed = 150;
        this.pauseBeforeNext = 1500;
        this.pauseAfterSuggestion = 3000;
        this.highlightDelay = 500;
        this.currentTargetPosition = null;
    }

    addDemo(keyword, targetSuggestion) {
        this.demos.push({ keyword, targetSuggestion });
    }

    async start() {
        if (this.demos.length === 0) return;
        while (true) {
            for (let i = 0; i < this.demos.length; i++) {
                await this.runDemo(this.demos[i]);
                await this.wait(this.pauseAfterSuggestion);
                this.searchInput.value = '';
                this.suggestionsBox.style.display = 'none';
                this.suggestionsBox.innerHTML = '';
                await this.wait(this.pauseBeforeNext);
            }
        }
    }

    async runDemo({ keyword, targetSuggestion }) {
        this.searchInput.value = '';
        this.suggestionsBox.style.display = 'none';
        this.currentTargetPosition = Math.floor(Math.random() * 3);
        
        const words = keyword.split(' ');
        const totalChars = keyword.length;
        let suggestionShown = false;
        
        for (let i = 1; i <= keyword.length; i++) {
            const partial = keyword.substring(0, i);
            this.searchInput.value = partial;
            
            const currentWords = partial.trim().split(' ');
            const lastWord = currentWords[currentWords.length - 1];
            const charsTyped = partial.length;
            const percentComplete = (charsTyped / totalChars) * 100;
            
            // Only show suggestions if:
            // 1. For first word: at least 3 characters
            // 2. For subsequent words: only after typing at least 2 chars of current word
            // 3. OR we're near the end of typing
            const shouldShowSuggestions = 
                (currentWords.length === 1 && lastWord.length >= 3) ||
                (currentWords.length > 1 && lastWord.length >= 2 && !lastWord.includes(' ')) ||
                percentComplete >= 90;

            if (shouldShowSuggestions) {
                const shouldShowTarget = percentComplete >= 90 && currentWords.length >= words.length;
                this.showSuggestions(partial, targetSuggestion, {
                    showTarget: shouldShowTarget
                });
                
                if (shouldShowTarget && !suggestionShown) {
                    suggestionShown = true;
                    await this.wait(this.highlightDelay);
                    const targetElement = Array.from(this.suggestionsBox.children).find(el => el.textContent === targetSuggestion);
                    if (targetElement) {
                        targetElement.classList.add('highlighted');
                        targetElement.classList.remove('faded');
                    }
                }
            } else {
                this.suggestionsBox.style.display = 'none';
            }
            
            await this.wait(this.typingSpeed);
        }
    }

    showSuggestions(partial, target, { showTarget }) {
        const words = partial.trim().split(' ');
        const currentWord = words[words.length - 1];
        const previousWords = words.slice(0, -1).join(' ');
        let suggestions = [];
        
        // Only generate suggestions based on what's currently typed
        if (words.length === 1) {
            // First word suggestions
            suggestions = [
                partial + " services",
                partial + " near",
                partial + " company",
                partial + " help"
            ];
        } else {
            // For subsequent words, only suggest completions for the current word
            const locationTerms = ['pa', 'fl', 'co', 'sc', 'tx'];
            const isLocation = locationTerms.some(term => currentWord.toLowerCase() === term);
            
            if (isLocation) {
                suggestions = [
                    previousWords + " " + currentWord + " best",
                    previousWords + " " + currentWord + " top",
                    previousWords + " " + currentWord + " near",
                    previousWords + " " + currentWord + " local"
                ];
            } else {
                // Base suggestions on the current word being typed
                suggestions = [
                    previousWords + " " + currentWord + "s",
                    previousWords + " " + currentWord + " area",
                    previousWords + " " + currentWord + " near",
                    previousWords + " " + currentWord + " local"
                ];
            }
        }

        if (showTarget) {
            const targetSuggestions = suggestions.slice(0, 3);
            targetSuggestions.splice(this.currentTargetPosition, 0, target);
            suggestions = targetSuggestions;
        }

        this.suggestionsBox.innerHTML = '';
        this.suggestionsBox.style.display = 'block';

        suggestions.forEach(suggestion => {
            const div = document.createElement('div');
            div.className = 'suggestion-item' + (suggestion === target && showTarget ? ' highlighted' : ' faded');
            div.textContent = suggestion;
            this.suggestionsBox.appendChild(div);
        });
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const demo = new SearchDemo();
    
    if (typeof DEMO_KEYWORDS !== 'undefined') {
        DEMO_KEYWORDS.forEach(({keyword, target}) => {
            demo.addDemo(keyword, target);
        });
    }
    
    demo.start();
});
