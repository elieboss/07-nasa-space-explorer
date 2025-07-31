// NASA API key for fetching space images
const NASA_API_KEY = 'VJk5e1lwuFbnkn9JGhH3nsKVWGaeABTDdv8CwzvF';

// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Find the button and gallery container
const fetchButton = document.getElementById('fetchButton');
const gallery = document.getElementById('gallery');

// Call the setupDateInputs function from dateRange.js
setupDateInputs(startInput, endInput);

// Add event listener to the fetch button
fetchButton.addEventListener('click', fetchAndDisplayImages);

// Get modal elements for full-size image view
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const closeButton = document.querySelector('.close-button');

// Add event listeners for modal functionality
closeButton.addEventListener('click', closeModal);
modal.addEventListener('click', function(event) {
    // Close modal if user clicks outside the modal content
    if (event.target === modal) {
        closeModal();
    }
});

// Function to open the modal with image details
function openModal(imageUrl, title, date, explanation) {
    // Set the modal content
    modalImage.src = imageUrl;
    modalImage.alt = title;
    modalTitle.textContent = title;
    modalDate.textContent = `Date: ${date}`;
    modalExplanation.textContent = explanation;
    
    // Show the modal
    modal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
    modal.style.display = 'none';
}

// Function to fetch and display 9 days of space images
async function fetchAndDisplayImages() {
    // Get the start date from the input
    const startDate = startInput.value;
    
    // Check if user selected a start date
    if (!startDate) {
        alert('Please select a start date first!');
        return;
    }
    
    // Show loading message while we fetch the images
    gallery.innerHTML = '<div class="placeholder">Loading amazing space images... 🚀</div>';
    
    try {
        // Create an array to store our 9 dates
        const dates = [];
        const currentDate = new Date(startDate);
        
        // Generate 9 consecutive dates starting from the selected date
        for (let i = 0; i < 9; i++) {
            // Format the date as YYYY-MM-DD (what NASA API expects)
            const dateString = currentDate.toISOString().split('T')[0];
            dates.push(dateString);
            
            // Move to the next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Fetch data for all 9 dates at the same time
        const allImageData = [];
        for (let i = 0; i < dates.length; i++) {
            const imageData = await fetchAPODData(dates[i]);
            allImageData.push(imageData);
        }
        
        // Display all the images in our gallery
        displayGallery(allImageData);
        
    } catch (error) {
        // If something goes wrong, show an error message
        console.error('Error fetching images:', error);
        gallery.innerHTML = '<div class="placeholder">Sorry, there was an error loading the images. Please try again! 😞</div>';
    }
}

// Function to fetch space image data for one specific date
async function fetchAPODData(date) {
    // Build the complete NASA API URL
    const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${date}`;
    
    // Fetch the data from NASA
    const response = await fetch(apiUrl);
    
    // Check if the request was successful
    if (!response.ok) {
        throw new Error(`Failed to fetch data for ${date}`);
    }
    
    // Convert the response to JSON and return it
    return await response.json();
}

// Function to create and display all gallery items
function displayGallery(imageDataArray) {
    // Clear the gallery first
    gallery.innerHTML = '';
    
    // Create a gallery item for each space image
    imageDataArray.forEach(imageData => {
        // Create a new div element for this gallery item
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        
        // Check if this is an image or video (NASA sometimes has videos)
        if (imageData.media_type === 'image') {
            // Create HTML for an image gallery item
            galleryItem.innerHTML = `
                <img src="${imageData.url}" alt="${imageData.title}" loading="lazy" class="gallery-image">
                <p><strong>${imageData.title}</strong></p>
                <p><small>Date: ${imageData.date}</small></p>
            `;
            
            // Add click event to the image to open modal
            const imageElement = galleryItem.querySelector('.gallery-image');
            imageElement.addEventListener('click', function() {
                openModal(imageData.url, imageData.title, imageData.date, imageData.explanation);
            });
            
            // Add cursor pointer style to show it's clickable
            imageElement.style.cursor = 'pointer';
            
        } else {
            // Create HTML for a video gallery item
            galleryItem.innerHTML = `
                <div class="placeholder-icon">🎥</div>
                <p><strong>${imageData.title}</strong></p>
                <p><small>Date: ${imageData.date}</small></p>
                <p>This is a video - <a href="${imageData.url}" target="_blank" style="color: #FC3D21;">view it on NASA's website</a></p>
            `;
        }
        
        // Add this gallery item to our gallery
        gallery.appendChild(galleryItem);
    });
}
