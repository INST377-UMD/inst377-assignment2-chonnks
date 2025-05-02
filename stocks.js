document.addEventListener('DOMContentLoaded', function() {
    const apiKey = 'fSIOczbF_9undbou4fD1M_Y13Fy5cSEw'; 
    let stockChart = null;
    
    // Initialize chart
    const ctx = document.getElementById('stock-chart').getContext('2d');
    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Stock Price',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price ($)'
                    }
                }
            }
        }
    });
    
    // Fetch stock data with improved error handling
    document.getElementById('fetch-stock').addEventListener('click', async function() {
        const ticker = document.getElementById('stock-ticker').value.trim().toUpperCase();
        const days = document.getElementById('time-range').value;
        const fetchButton = document.getElementById('fetch-stock');
        
        if (!ticker) {
            showError('Please enter a stock ticker');
            return;
        }
        
        try {
            // Show loading state
            fetchButton.disabled = true;
            fetchButton.textContent = 'Loading...';
            
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - days);
            const toDate = new Date();
            
            const formattedFrom = formatDate(fromDate);
            const formattedTo = formatDate(toDate);
            
            const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${formattedFrom}/${formattedTo}?apiKey=${apiKey}`);
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.results || data.resultsCount === 0) {
                throw new Error('No data found for this ticker and date range');
            }
            
            // Process data for chart
            const dates = data.results.map(item => new Date(item.t).toLocaleDateString());
            const closes = data.results.map(item => item.c);
            
            // Update chart
            stockChart.data.labels = dates;
            stockChart.data.datasets[0].data = closes;
            stockChart.data.datasets[0].label = `${ticker} Stock Price`;
            stockChart.update();
            
            // Clear any previous errors
            clearError();
            
        } catch (error) {
            console.error('Error fetching stock data:', error);
            showError(`Error: ${error.message}. Please check the ticker symbol and try again.`);
            
            // Reset chart to empty state
            stockChart.data.labels = [];
            stockChart.data.datasets[0].data = [];
            stockChart.update();
        } finally {
            // Restore button state
            fetchButton.disabled = false;
            fetchButton.textContent = 'Get Stock Data';
        }
    });
    
    // Helper function to format date as YYYY-MM-DD
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Error display functions
    function showError(message) {
        clearError();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.querySelector('.stock-controls').appendChild(errorDiv);
    }
    
    function clearError() {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }
    
    // Initial load
// Updated fetchTopRedditStocks function with fallback
async function fetchTopRedditStocks() {
    try {
        // First try the tradestie API
        const response = await fetch('https://tradestie.com/api/v1/apps/reddit');
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        let data = await response.json();
        
        // If we get an empty array or wrong format, try alternative API
        if (!Array.isArray(data) || data.length === 0) {
            data = await fetchAlternativeRedditStocks();
        }
        
        // Sort by comment count and take top 5
        const top5 = data.sort((a, b) => (b.no_of_comments || 0) - (a.no_of_comments || 0)).slice(0, 5);
        
        updateStocksTable(top5);
        
    } catch (error) {
        console.error('Error fetching Reddit stocks:', error);
        try {
            // Fallback to alternative API if first attempt fails
            const fallbackData = await fetchAlternativeRedditStocks();
            const top5 = fallbackData.slice(0, 5);
            updateStocksTable(top5);
        } catch (fallbackError) {
            console.error('Fallback API also failed:', fallbackError);
            showError('Could not load Reddit stocks data. Please try again later.');
        }
    }
}

// Alternative Reddit stocks API
// Updated fetchTopRedditStocks function with better debugging
async function fetchTopRedditStocks() {
    try {
        // Using a more reliable API endpoint
        const response = await fetch('https://apewisdom.io/api/v1.0/filter/wallstreetbets');
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data); // Debugging
        
        if (!data.results || data.results.length === 0) {
            throw new Error('No stocks data available');
        }
        
        // Process and display top 5 stocks
        processAndDisplayStocks(data.results);
        
    } catch (error) {
        console.error('Error fetching Reddit stocks:', error);
        showError('Could not load trending stocks. Showing sample data instead.');
        displaySampleData();
    }
}

function processAndDisplayStocks(stocks) {
    // Sort by mentions and get top 5
    const top5 = stocks
        .filter(stock => stock.ticker) // Ensure ticker exists
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 5);
    
    console.log('Top 5 Stocks:', top5); // Debugging
    
    const tableBody = document.querySelector('#reddit-stocks tbody');
    tableBody.innerHTML = '';
    
    top5.forEach(stock => {
        const row = document.createElement('tr');
        
        // Ticker with link
        const tickerCell = document.createElement('td');
        const tickerLink = document.createElement('a');
        tickerLink.href = `https://finance.yahoo.com/quote/${stock.ticker}`;
        tickerLink.textContent = stock.ticker;
        tickerLink.target = '_blank';
        tickerCell.appendChild(tickerLink);
        row.appendChild(tickerCell);
        
        // Number of mentions
        const mentionsCell = document.createElement('td');
        mentionsCell.textContent = stock.mentions || 'N/A';
        row.appendChild(mentionsCell);
        
        // Sentiment with icon
        const sentimentCell = document.createElement('td');
        const sentimentIcon = document.createElement('span');
        sentimentIcon.className = 'sentiment-icon';
        
        // Determine sentiment based on different possible API fields
        const sentimentValue = stock.sentiment || 
                             (stock.sentiment_score > 0 ? 'Bullish' : 'Bearish') || 
                             'Unknown';
        
        if (sentimentValue.toLowerCase().includes('bull')) {
            sentimentIcon.textContent = '🐂';
            sentimentIcon.title = 'Bullish';
        } else if (sentimentValue.toLowerCase().includes('bear')) {
            sentimentIcon.textContent = '🐻';
            sentimentIcon.title = 'Bearish';
        } else {
            sentimentIcon.textContent = '❓';
            sentimentIcon.title = 'Unknown';
        }
        
        sentimentCell.appendChild(sentimentIcon);
        sentimentCell.appendChild(document.createTextNode(` ${sentimentValue}`));
        row.appendChild(sentimentCell);
        
        tableBody.appendChild(row);
    });
}

// Call this when the page loads
fetchTopRedditStocks();
});