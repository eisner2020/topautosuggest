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
            // 1. First word: at least 3 characters
            // 2. Subsequent words: only after typing at least 2 chars of current word
            // 3. OR we're at 95% completion
            const shouldShowSuggestions = 
                (currentWords.length === 1 && lastWord.length >= 3) ||
                (currentWords.length > 1 && lastWord.length >= 2 && !lastWord.includes(' ')) ||
                percentComplete >= 95;

            // Only show target suggestion when we're very close to completion
            const shouldShowTarget = percentComplete >= 95 && currentWords.length >= words.length;

            if (shouldShowSuggestions) {
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
        
        // Only show target suggestion when we're very close to completion
        if (showTarget) {
            suggestions = [target];
            // Add some variations for the target
            if (target.includes('pa')) {
                suggestions.push(previousWords + " pa services");
                suggestions.push(previousWords + " pa near me");
            } else if (target.includes('fl')) {
                suggestions.push(previousWords + " fl services");
                suggestions.push(previousWords + " fl near me");
            } else {
                suggestions.push(previousWords + " services");
                suggestions.push(previousWords + " near me");
            }
        } else {
            // Regular suggestions based on current word and position
            if (words.length === 1) {
                // First word suggestions
                if (currentWord.length >= 3) {
                    if (currentWord.toLowerCase().includes('sweep')) {
                        suggestions = [
                            currentWord + "s",
                            currentWord + " in",
                            currentWord + " near"
                        ];
                    } else if (currentWord.toLowerCase().includes('lawyer')) {
                        suggestions = [
                            currentWord + " in",
                            currentWord + " near",
                            currentWord + " free"
                        ];
                    } else {
                        suggestions = [
                            currentWord + "s",
                            currentWord + " in",
                            currentWord + " near"
                        ];
                    }
                }
            } else if (words.length === 2) {
                // Second word suggestions
                if (currentWord.length >= 2) {
                    if (currentWord.toLowerCase() === 'in') {
                        suggestions = [
                            previousWords + " in pa",
                            previousWords + " in fl",
                            previousWords + " in tx"
                        ];
                    } else if (currentWord.toLowerCase() === 'ne') {
                        suggestions = [
                            previousWords + " near me",
                            previousWords + " near by",
                            previousWords + " next day"
                        ];
                    } else {
                        suggestions = [
                            previousWords + " " + currentWord,
                            previousWords + " in",
                            previousWords + " near"
                        ];
                    }
                }
            } else if (words.length === 3) {
                // Third word suggestions - only locations or specific completions
                if (currentWord.length >= 1) {
                    if (currentWord.toLowerCase() === 'p') {
                        suggestions = [
                            previousWords + " pa",
                            previousWords + " philadelphia",
                            previousWords + " pittsburgh"
                        ];
                    } else if (currentWord.toLowerCase() === 'f') {
                        suggestions = [
                            previousWords + " fl",
                            previousWords + " florida",
                            previousWords + " fort lauderdale"
                        ];
                    } else if (currentWord.toLowerCase() === 'm') {
                        suggestions = [
                            previousWords + " miami",
                            previousWords + " melbourne",
                            previousWords + " me"
                        ];
                    }
                }
            }
            // Don't show suggestions for 4th word unless it's the target
        }

        // Ensure we have the right number of suggestions
        if (showTarget) {
            const targetSuggestions = suggestions.slice(0, 3);
            if (!targetSuggestions.includes(target)) {
                targetSuggestions.splice(this.currentTargetPosition, 0, target);
                suggestions = targetSuggestions.slice(0, 3);
            }
        }

        this.suggestionsBox.innerHTML = '';
        this.suggestionsBox.style.display = suggestions.length > 0 ? 'block' : 'none';

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
