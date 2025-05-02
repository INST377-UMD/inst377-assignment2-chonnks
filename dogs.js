document.addEventListener('DOMContentLoaded', function () {
    const slider = document.getElementById('dog-slider');
    const breedButtonsContainer = document.getElementById('breed-buttons');
    const breedInfoContainer = document.getElementById('breed-info');
    let currentSlide = 0;
    let dogImages = [];
    let breedsData = {};

    // Fetch random dog images using Dog CEO API
    async function fetchDogImages() {
        try {
            const responses = await Promise.all(
                Array.from({ length: 10 }, () => fetch('https://dog.ceo/api/breeds/image/random'))
            );
            const data = await Promise.all(responses.map(res => res.json()));
            dogImages = data.map(item => item.message);

            // Display images in slider
            slider.innerHTML = '';
            dogImages.forEach((img, index) => {
                const imgElement = document.createElement('img');
                imgElement.src = img;
                imgElement.alt = 'Random dog';
                imgElement.className = 'dog-slide';
                if (index === 0) imgElement.classList.add('active');
                slider.appendChild(imgElement);
            });

            setInterval(rotateSlides, 3000);
        } catch (error) {
            console.error('Error fetching dog images:', error);
        }
    }

    // Rotate slides
    function rotateSlides() {
        const slides = document.querySelectorAll('.dog-slide');
        if (slides.length === 0) return;
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    // Fetch dog breeds using Dog API by kinduff
    async function fetchDogBreeds() {
        try {
            const response = await fetch('https://corsproxy.io/?https://dogapi.dog/api/v2/breeds');
            const data = await response.json();
    
            console.log('Breed data:', data); // Log to see what's coming back
    
            if (!Array.isArray(data)) {
                console.error('Expected an array of breeds, got:', data);
                return;
            }
    
            breedsData = {};
            breedButtonsContainer.innerHTML = '';
    
            data.forEach(breed => {
                const breedName = breed.name;
                const breedKey = breedName.toLowerCase().replace(/\s+/g, '');
    
                breedsData[breedKey] = {
                    name: breedName,
                    description: breed.description || 'No description available',
                    minLife: breed.life_span?.split(' - ')[0] || 'Unknown',
                    maxLife: breed.life_span?.split(' - ')[1] || 'Unknown'
                };
    
                const button = document.createElement('button');
                button.className = 'breed-btn';
                button.textContent = breedName;
                button.addEventListener('click', () => displayBreedInfo(breedName));
                breedButtonsContainer.appendChild(button);
            });
    
        } catch (error) {
            console.error('Error fetching dog breeds:', error);
        }
    }
    
    

    // Display breed information
    function displayBreedInfo(breed) {
        const breedKey = breed.toLowerCase().replace(/\s+/g, '');
        const breedInfo = breedsData[breedKey];

        if (breedInfo) {
            document.getElementById('breed-name').textContent = breedInfo.name;
            document.getElementById('breed-description').textContent = breedInfo.description;
            document.getElementById('breed-life').textContent = `${breedInfo.minLife} - ${breedInfo.maxLife} years`;
            breedInfoContainer.style.display = 'block';
        } else {
            document.getElementById('breed-name').textContent = breed;
            document.getElementById('breed-description').textContent = 'Information not available for this breed.';
            document.getElementById('breed-life').textContent = 'Unknown';
            breedInfoContainer.style.display = 'block';
        }
    }

    // Initial load
    fetchDogImages();
    fetchDogBreeds();
});
