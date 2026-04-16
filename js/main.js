/**
 * AgriRain Main Controller
 * Sprint 1: AG-1, AG-2, AG-3
 * Focus: Map Interaction, Coordinate Capture, and State Management
 */

// 1. GLOBAL APP STATE
// This object holds all user inputs so we can pass them to the API in Sprint 2.
let appState = {
    location: {
        lat: null,
        lng: null
    },
    dates: {
        start: null,
        end: null
    }
};

// 2. INITIALIZE MAP (Leaflet.js)
// We center on the Philippines [12.8797, 121.7740] with a zoom level of 6.
const map = L.map('map-section').setView([12.8797, 121.7740], 6);

// Add the visual map tiles from OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker = null; // Variable to store our single farm pin

// 3. MAP CLICK HANDLER (AG-2 Logic)
map.on('click', function(e) {
    const { lat, lng } = e.latlng;
    
    // Save coordinates to our Global State (limited to 5 decimal places)
    appState.location.lat = lat.toFixed(5);
    appState.location.lng = lng.toFixed(5);

    // Marker Logic: If a marker exists, move it. If not, create it.
    if (marker) {
        marker.setLatLng(e.latlng);
    } else {
        marker = L.marker(e.latlng).addTo(map);
    }

    // Update the UI Display
    const latLngText = document.getElementById('lat-lng-text');
    latLngText.innerText = `${appState.location.lat}, ${appState.location.lng}`;
    latLngText.classList.remove('italic'); // Remove "placeholder" look
    
    // Reveal Step 2: Date Selection (AG-3 Logic)
    const dateSection = document.getElementById('date-selection');
    dateSection.classList.remove('hidden');
    
    // Optional: Smooth scroll to the date picker for mobile users
    dateSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// 4. DATE INPUT HANDLERS (AG-3 Logic)
// Update state whenever the user changes the dates
document.getElementById('start-date').addEventListener('change', (e) => {
    appState.dates.start = e.target.value;
});

document.getElementById('end-date').addEventListener('change', (e) => {
    appState.dates.end = e.target.value;
});

// 5. FINAL SUBMISSION (The Bridge to Sprint 2)
document.getElementById('get-forecast-btn').addEventListener('click', () => {
    // Basic Validation: Ensure dates are selected
    if (!appState.dates.start || !appState.dates.end) {
        alert("Attention: Please select both a Start and End date for your harvest analysis.");
        return;
    }

    // Log the data for verification (Check this in F12 Console)
    console.log("--- AG-3 SUBMISSION DATA ---");
    console.log("Farm Location:", appState.location);
    console.log("Analysis Period:", appState.dates);
    console.log("----------------------------");

    // Success Feedback
    alert(`Ready for Analysis!\n\nLocation: ${appState.location.lat}, ${appState.location.lng}\nDates: ${appState.dates.start} to ${appState.dates.end}\n\nIn Sprint 2, we will send this data to the weather server.`);
    
    /** * NEXT SPRINT PREVIEW (AG-4):
     * Here, we will call: weatherService.fetchData(appState);
     */
});

// 6. UI HELPER: Smooth scroll for Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});