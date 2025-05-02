// 1) Random images carousel
fetch('https://dog.ceo/api/breeds/image/random/10')
  .then(r => r.json())
  .then(data => {
    const slider = document.getElementById('dog-slider');
    slider.classList.add('dog-carousel');
    data.message.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.className = 'dog-slide' + (i === 0 ? ' active' : '');
      slider.appendChild(img);
    });

    // Simple manual slider (as backup if Slider lib fails or you want a minimal version)
    let current = 0;
    setInterval(() => {
      const slides = document.querySelectorAll('.dog-slide');
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 3000);
  });

// 2) Load breeds list
fetch('https://dog.ceo/api/breeds/list/all')
  .then(r => r.json())
  .then(data => {
    const container = document.getElementById('breed-buttons');
    container.classList.add('breed-buttons');
    Object.keys(data.message).forEach(breed => {
      const btn = document.createElement('button');
      btn.textContent = breed;
      btn.className = 'breed-btn';
      btn.setAttribute('data-breed', breed);
      btn.onclick = () => loadBreedInfo(breed);
      container.appendChild(btn);
    });
  });

// 3) On‑demand breed info
function loadBreedInfo(breed) {
  fetch(`https://api.thedogapi.com/v1/breeds/search?q=${breed}`)
    .then(r => r.json())
    .then(arr => {
      if (!arr.length) throw new Error();
      const info = arr[0];
      const [min, max] = info.life_span.replace(' years', '').split(' - ').map(n => n.trim());
      const container = document.getElementById('breed-info');
      container.className = 'breed-info';
      container.innerHTML = `
        <h2>${info.name}</h2>
        <p><strong>Description:</strong> ${info.temperament || 'n/a'}</p>
        <p><strong>Min Life:</strong> ${min}</p>
        <p><strong>Max Life:</strong> ${max}</p>
      `;
    })
    .catch(() => {
      const container = document.getElementById('breed-info');
      container.className = 'breed-info';
      container.textContent = 'Could not load info.';
    });
}
