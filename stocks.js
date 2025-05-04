document.addEventListener("DOMContentLoaded", () => {
  const apiKeyPolygon = "fSIOczbF_9undbou4fD1M_Y13Fy5cSEw";
  const chartArea = document.querySelector("#stock-chart").getContext("2d");

  // Initialize empty stock line chart
  const chartInstance = new Chart(chartArea, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Stock Price",
        data: [],
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
        fill: false
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "Date" } },
        y: { title: { display: true, text: "Price ($)" } }
      }
    }
  });

  const fetchBtn = document.querySelector("#fetch-stock");

  // Event listener to fetch stock data on button click
  fetchBtn.addEventListener("click", async () => {
    const inputSymbol = document.querySelector("#stock-ticker").value.trim().toUpperCase();
    const dayRange = document.querySelector("#time-range").value;

    if (!inputSymbol) {
      displayError("Please enter a stock ticker");
      return;
    }

    try {
      fetchBtn.disabled = true;
      fetchBtn.textContent = "Loading...";

      // Calculate date range
      const today = new Date();
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - dayRange);

      const startDate = formatDateString(pastDate);
      const endDate = formatDateString(today);

      // Build Polygon.io API URL
      const apiUrl = `https://api.polygon.io/v2/aggs/ticker/${inputSymbol}/range/1/day/${startDate}/${endDate}?apiKey=${apiKeyPolygon}`;

      const apiResult = await fetch(apiUrl);
      if (!apiResult.ok) throw new Error(`API request failed with status ${apiResult.status}`);

      const jsonData = await apiResult.json();

      if (!jsonData.results || jsonData.results.length === 0) {
        throw new Error("No data found for this ticker");
      }

      // Extract labels and values
      const dateLabels = jsonData.results.map(entry => new Date(entry.t).toLocaleDateString());
      const closingPrices = jsonData.results.map(entry => entry.c);

      // Update chart
      chartInstance.data.labels = dateLabels;
      chartInstance.data.datasets[0].data = closingPrices;
      chartInstance.data.datasets[0].label = `${inputSymbol} Stock Price`;

      chartInstance.update();
      clearError();
    } catch (fetchErr) {
      console.error("Error:", fetchErr);
      displayError(fetchErr.message);
      chartInstance.data.labels = [];
      chartInstance.data.datasets[0].data = [];
      chartInstance.update();
    } finally {
      fetchBtn.disabled = false;
      fetchBtn.textContent = "Get Stock Data";
    }
  });

  // Format a date object to YYYY-MM-DD
  function formatDateString(dateObj) {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // Show error message below stock controls
  function displayError(messageText) {
    clearError();
    const errorBox = document.createElement("div");
    errorBox.className = "error-message";
    errorBox.textContent = messageText;
    document.querySelector(".stock-controls").appendChild(errorBox);
  }

  // Remove existing error message
  function clearError() {
    const existingError = document.querySelector(".error-message");
    if (existingError) existingError.remove();
  }

  // Load and display top 5 Reddit stocks
  async function getTopRedditMentions() {
    try {
      const redditFetch = await fetch("https://tradestie.com/api/v1/apps/reddit?date=2022-04-03");
      if (!redditFetch.ok) throw new Error(`API failed with status ${redditFetch.status}`);

      const redditData = await redditFetch.json();
      const trendingStocks = redditData
        .filter(item => item.ticker && item.no_of_comments && item.sentiment)
        .sort((a, b) => b.no_of_comments - a.no_of_comments)
        .slice(0, 5);

      const table = document.querySelector("#reddit-stocks tbody");
      table.innerHTML = "";

      trendingStocks.forEach(stock => {
        const tr = document.createElement("tr");

        // Ticker column with link
        const tdTicker = document.createElement("td");
        const tickerLink = document.createElement("a");
        tickerLink.href = `https://finance.yahoo.com/quote/${stock.ticker}`;
        tickerLink.textContent = stock.ticker;
        tickerLink.target = "_blank";
        tdTicker.appendChild(tickerLink);
        tr.appendChild(tdTicker);

        // Comment count
        const tdComments = document.createElement("td");
        tdComments.textContent = stock.no_of_comments;
        tr.appendChild(tdComments);

        // Sentiment icon + label
        const tdSentiment = document.createElement("td");
        const sentimentIcon = document.createElement("span");
        sentimentIcon.className = "sentiment-icon";

        const sentimentType = stock.sentiment.toLowerCase();
        if (sentimentType.includes("bull")) {
          sentimentIcon.textContent = "🐂";
          sentimentIcon.title = "Bullish";
        } else if (sentimentType.includes("bear")) {
          sentimentIcon.textContent = "🐻";
          sentimentIcon.title = "Bearish";
        } else {
          sentimentIcon.textContent = "❓";
          sentimentIcon.title = "Unknown";
        }

        tdSentiment.appendChild(sentimentIcon);
        tdSentiment.append(` ${stock.sentiment}`);
        tr.appendChild(tdSentiment);

        table.appendChild(tr);
      });
    } catch (err) {
      console.error("Failed to load Reddit stocks:", err);
      const table = document.querySelector("#reddit-stocks tbody");
      table.innerHTML = "<tr><td colspan='3'>Failed to load data.</td></tr>";
    }
  }

  // Load Reddit data on page load
  getTopRedditMentions();
});
