// random dog image generator
fetch('https://dog.ceo/api/breeds/image/random/10')
  .then(res => res.json())
  .then(data => {
    const carousel = document.getElementById('dog-slider');
    const buttonContainer = document.getElementById('breed-buttons');

    carousel.classList.add('dog-carousel');
    buttonContainer.classList.add('breeds');

    const breedsFound = new Set();

    data.message.forEach((url, idx) => {
      // Create and add image to carousel
      const img = document.createElement('img');
      img.src = url;
      img.className = 'dog-slide' + (idx === 0 ? ' active' : '');
      carousel.appendChild(img);

      // Extract breed name from image URL
      const parts = url.split('/');
      const breedRaw = parts[parts.indexOf('breeds') + 1];
      const nameParts = breedRaw.split('-').reverse();
      const breedName = nameParts.join(' ');

      breedsFound.add(breedName);
    });

    // carousel functionality
    let current = 0;
    setInterval(() => {
      const slides = document.querySelectorAll('.dog-slide');
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 3000);

    // buttons for each loaded breed
    breedsFound.forEach(breed => {
      const btn = document.createElement('button');
      btn.textContent = breed;
      btn.className = 'custom-button';
      btn.setAttribute('data-breed', breed);
      btn.setAttribute('role', 'button');
      btn.onclick = () => loadBreedDetails(breed);
      buttonContainer.appendChild(btn);
    });
  });

// breed details
function loadBreedDetails(breed) {
  fetch(`https://api.thedogapi.com/v1/breeds/search?q=${breed}`)
    .then(res => res.json())
    .then(data => {
      if (!data.length) throw new Error();

      const info = data[0];
      // Parse lifespan 
      const [minLife, maxLife] = info.life_span.replace(' years', '').split(' - ').map(x => x.trim());

      // Display info 
      const infoBox = document.getElementById('breed-info');
      infoBox.className = 'breed-info';
      infoBox.innerHTML = `
        <h2>${info.name}</h2>
        <p><strong>Description:</strong> ${info.temperament || 'n/a'}</p>
        <p><strong>Min Life:</strong> ${minLife}</p>
        <p><strong>Max Life:</strong> ${maxLife}</p>
      `;
    })
    .catch(() => {
      const infoBox = document.getElementById('breed-info');
      infoBox.className = 'breed-info';
      infoBox.textContent = 'Could not load info.';
    });
}

// voice command integration
window.loadBreedDetails = loadBreedDetails;
