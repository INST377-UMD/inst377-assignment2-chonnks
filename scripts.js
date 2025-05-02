// Shared functionality across all pages

// Initialize annyang for voice commands
function initVoiceCommands() {
    if (annyang) {
        const commands = {
            'hello': function() {
                alert('Hello World!');
            },
            'change the color to *color': function(color) {
                document.body.style.backgroundColor = color;
            },
            'navigate to *page': function(page) {
                const lowerPage = page.toLowerCase();
                if (lowerPage === 'home' || lowerPage === 'index') {
                    window.location.href = 'index.html';
                } else if (lowerPage === 'stocks') {
                    window.location.href = 'stocks.html';
                } else if (lowerPage === 'dogs') {
                    window.location.href = 'dogs.html';
                }
            }
        };

        // Add page-specific commands
        if (window.location.pathname.includes('stocks.html')) {
            commands['lookup *stock'] = function(stock) {
                document.getElementById('stock-ticker').value = stock.toUpperCase();
                document.getElementById('fetch-stock').click();
            };
        } else if (window.location.pathname.includes('dogs.html')) {
            commands['load dog breed *breed'] = function(breed) {
                const breedName = breed.toLowerCase().replace(/\s+/g, '');
                const buttons = document.querySelectorAll('.breed-btn');
                buttons.forEach(btn => {
                    if (btn.textContent.toLowerCase().replace(/\s+/g, '') === breedName) {
                        btn.click();
                    }
                });
            };
        }

        annyang.addCommands(commands);

        // Set up audio control buttons
        document.getElementById('audio-on')?.addEventListener('click', function() {
            annyang.start();
            alert('Voice commands activated!');
        });

        document.getElementById('audio-off')?.addEventListener('click', function() {
            annyang.abort();
            alert('Voice commands deactivated!');
        });
    }
}

// Fetch daily quote for home page
// Fetch daily quote for home page with fallback options
async function fetchDailyQuote() {
    const quoteContainer = document.getElementById('daily-quote');
    const fallbackQuotes = [
        { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" },
        { q: "Life is what happens when you're busy making other plans.", a: "John Lennon" },
        { q: "Strive not to be a success, but rather to be of value.", a: "Albert Einstein" }
    ];
    
    try {
        // First try ZenQuotes API
        const response = await fetch('https://zenquotes.io/api/random');
        
        // Check if response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if we got valid data
        if (data && data.length > 0 && data[0].q && data[0].a) {
            displayQuote(data[0]);
            return;
        }
        
        throw new Error('Invalid data format from API');
    } catch (error) {
        console.warn('Failed to fetch quote from ZenQuotes:', error);
        
        // Try a different API as first fallback
        try {
            const backupResponse = await fetch('https://api.quotable.io/random');
            if (backupResponse.ok) {
                const backupData = await backupResponse.json();
                if (backupData.content && backupData.author) {
                    displayQuote({ q: backupData.content, a: backupData.author });
                    return;
                }
            }
        } catch (backupError) {
            console.warn('Failed to fetch from backup API:', backupError);
        }
        
        // Use local fallback quotes if all APIs fail
        const randomFallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        displayQuote(randomFallback);
    }
}

function displayQuote(quote) {
    const quoteContainer = document.getElementById('daily-quote');
    quoteContainer.innerHTML = `"${quote.q}" <br><span class="quote-author">— ${quote.a}</span>`;

}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initVoiceCommands();
    
    // Only fetch quote on home page
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        fetchDailyQuote();
    }
});