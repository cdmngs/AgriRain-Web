//Ticket AG-2: Map Integration
let selectedData = { lat: null, lng: null, isValid: false };
const todayStr = new Date().toISOString().split('T')[0];

const analyzeBtn = document.getElementById('analyze-btn');
const findMeBtn = document.getElementById('find-me-btn');
const dateInput = document.getElementById('target-date');

dateInput.value = todayStr;
dateInput.setAttribute('min', todayStr);

async function handleLocationSelection(lat, lng) {
    if (!phBounds.contains([lat, lng])) {
        alert("Restricted: AgriRain is only available within the Philippines.");
        return;
    }
    
    try {
        const data = await getReverseGeocode(lat, lng);
        const a = data.address || {};
        const addrParts = [
            a.road || a.street,
            a.neighbourhood || a.village || a.suburb,
            a.city || a.town || a.municipality,
            a.province,
            "Philippines"
        ].filter(p => !!p);

        selectedData = { lat: lat.toFixed(4), lng: lng.toFixed(4), isValid: true };
        updateMapMarker(lat, lng);

        analyzeBtn.disabled = false;
        analyzeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        document.getElementById('loc-name').innerText = addrParts.join(', ');
        document.getElementById('loc-coords').innerText = `${selectedData.lat}, ${selectedData.lng}`;
    } catch (err) { console.error(err); }
}

map.on('click', (e) => handleLocationSelection(e.latlng.lat, e.latlng.lng));

findMeBtn.addEventListener('click', () => {
    findMeBtn.disabled = true;
    const orig = findMeBtn.innerHTML;
    findMeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> LOCATING...';
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            await handleLocationSelection(pos.coords.latitude, pos.coords.longitude);
            findMeBtn.disabled = false; findMeBtn.innerHTML = orig;
        },
        () => { findMeBtn.disabled = false; findMeBtn.innerHTML = orig; }
    );
});

analyzeBtn.addEventListener('click', async () => {
    if (!selectedData.isValid) return;
    
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> ANALYZING...';

    const start = dateInput.value;
    const end = new Date(start); 
    end.setDate(end.getDate() + 6);
    const endDateStr = end.toISOString().split('T')[0];
