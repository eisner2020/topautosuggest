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
            
            const completeWords = partial.trim().split(' ').length;
            const charsTyped = partial.length;
            const percentComplete = (charsTyped / totalChars) * 100;
            
            if (completeWords >= 1) {
                const shouldShowTarget = percentComplete >= 90 && completeWords >= words.length - 1;
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
            }
            
            await this.wait(this.typingSpeed);
        }
    }

    showSuggestions(partial, target, { showTarget }) {
        const words = partial.split(' ');
        let suggestions = [];
        
        // Base suggestions that don't include our target
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

        // When it's time to show the target, ensure it's properly inserted
        if (showTarget) {
            // Get 3 non-target suggestions
            const otherSuggestions = suggestions
                .filter(s => s !== target)
                .slice(0, 3);
            
            // Create final suggestions array with target at random position
            suggestions = [...otherSuggestions];
            suggestions.splice(this.currentTargetPosition, 0, target);
        }

        this.suggestionsBox.innerHTML = '';
        this.suggestionsBox.style.display = 'block';

        suggestions.forEach(suggestion => {
            const div = document.createElement('div');
            // Exact match for highlighting
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
