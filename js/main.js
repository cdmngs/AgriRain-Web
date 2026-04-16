// main.js - AG-2 Controller

// 1. Initialize Map (Default: Philippines)
const map = L.map('map-section').setView([12.8797, 121.7740], 6);

// 2. Add Map Imagery (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker = null;

// 3. Click Event Listener
map.on('click', function(e) {
    const { lat, lng } = e.latlng;
    
    // Update or Create Marker
    if (marker) {
        marker.setLatLng(e.latlng);
    } else {
        marker = L.marker(e.latlng).addTo(map);
    }

    // Update the UI Text
    const textDisplay = document.getElementById('lat-lng-text');
    const confirmBtn = document.getElementById('confirm-loc');
    
    textDisplay.innerHTML = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    textDisplay.classList.remove('italic');
    confirmBtn.classList.remove('hidden');

    console.log(`AG-2 Captured: Lat ${lat}, Lng ${lng}`);
});