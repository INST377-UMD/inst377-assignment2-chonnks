// voice command
function setupVoiceCommands() {
  if (!annyang) return;

  const voiceMap = {
    // Basic command for demo
    'hello': () => alert('Hello World!'),

    // Change background color using voice
    'change the color to *color': color => {
      document.body.style.background = color;
    },

    // page navigation
    'navigate to *page': page => {
      const dest = page.toLowerCase();
      if (dest === 'home' || dest === 'index') {
        window.location.href = 'index.html';
      } else if (dest === 'stocks') {
        window.location.href = 'stocks.html';
      } else if (dest === 'dogs') {
        window.location.href = 'dogs.html';
      }
    }
  };

  // stock voice command
  if (window.location.pathname.includes('stocks.html')) {
    voiceMap['lookup *stock'] = stock => {
      const input = document.getElementById('stock-ticker');
      if (input) {
        input.value = stock.toUpperCase();
        document.getElementById('time-range').value = '30';
        document.getElementById('fetch-stock').click();
      }
    };
  }

  // dog voice command
  if (window.location.pathname.includes('dogs.html')) {
    voiceMap['load dog breed *breed'] = breed => {
      if (typeof loadBreedInfo === 'function') {
        loadBreedInfo(breed.toLowerCase());
      } else {
        console.warn('loadBreedInfo function not found');
      }
    };
  }

  // annyang command initialization
  annyang.addCommands(voiceMap);

  // mic control buttons
  document.getElementById('audio-on')?.addEventListener('click', () => {
    annyang.start();
    alert('Voice commands activated!');
  });

  document.getElementById('audio-off')?.addEventListener('click', () => {
    annyang.abort();
    alert('Voice commands deactivated!');
  });
}

// quotes
async function getDailyQuote() {
  const quoteBox = document.getElementById('daily-quote');

  const backups = [
    { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" },
    { q: "Life is what happens when you're busy making other plans.", a: "John Lennon" },
    { q: "Strive not to be a success, but rather to be of value.", a: "Albert Einstein" }
  ];

  try {
    const res = await fetch('https://zenquotes.io/api/random');
    if (!res.ok) throw new Error(`Primary API failed: ${res.status}`);

    const quoteData = await res.json();
    if (quoteData?.[0]?.q && quoteData[0].a) {
      renderQuote(quoteData[0]);
      return;
    }

    throw new Error('Invalid primary API format');
  } catch (mainErr) {
    console.warn('ZenQuotes error:', mainErr);

    try {
      const altRes = await fetch('https://api.quotable.io/random');
      if (altRes.ok) {
        const altData = await altRes.json();
        if (altData.content && altData.author) {
          renderQuote({ q: altData.content, a: altData.author });
          return;
        }
      }
    } catch (altErr) {
      console.warn('Backup quote API error:', altErr);
    }

  }
}

// render quote
function renderQuote(quote) {
  const quoteBox = document.getElementById('daily-quote');
  quoteBox.innerHTML = `"${quote.q}" <br><span class="quote-author">— ${quote.a}</span>`;
}

// Page initialization
document.addEventListener('DOMContentLoaded', () => {
  setupVoiceCommands();

  // only fetch quote on home page
  const isHomePage =
    window.location.pathname.endsWith('index.html') ||
    window.location.pathname === '/';

  if (isHomePage) {
    getDailyQuote();
  }
});
