document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('suggestions');
    let debounceTimer;

    // Initialize suggestions container if it doesn't exist
    if (!suggestionsContainer) {
        const container = document.createElement('div');
        container.id = 'suggestions';
        container.className = 'suggestions';
        searchInput.parentNode.appendChild(container);
    }

    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/suggest?q=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error('Failed to fetch suggestions');
                
                const suggestions = await response.json();
                displaySuggestions(suggestions);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        }, 300); // Debounce delay of 300ms
    });

    function displaySuggestions(suggestions) {
        if (!suggestions || suggestions.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        suggestionsContainer.innerHTML = suggestions
            .map(suggestion => `
                <div class="suggestion-item" onclick="selectSuggestion('${suggestion}')">
                    ${highlightMatch(suggestion, searchInput.value)}
                </div>
            `).join('');

        suggestionsContainer.style.display = 'block';
    }

    function highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            suggestionsContainer.style.display = 'none';
        }
    });
});

// Global function to handle suggestion selection
function selectSuggestion(text) {
    const searchInput = document.getElementById('search-input');
    searchInput.value = text;
    document.getElementById('suggestions').style.display = 'none';
    
    // Optional: Trigger a search with the selected suggestion
    // searchInput.form.submit();
}
