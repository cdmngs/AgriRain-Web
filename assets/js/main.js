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

    try {
        const data = await getWeatherData(selectedData.lat, selectedData.lng, start, endDateStr);
        document.getElementById('results-area').classList.remove('hidden');

        const avgMaxRH = data.daily.relative_humidity_2m_max.reduce((a, b) => a + b, 0) / 7;
        const solar = data.daily.shortwave_radiation_sum[0];
        const et0 = data.daily.et0_fao_evapotranspiration[0];
        const vpd = data.hourly.vapour_pressure_deficit[0];

        document.getElementById('val-rh').innerText = Math.round(avgMaxRH) + "%";
        document.getElementById('val-solar').innerText = solar.toFixed(1) + " MJ";
        document.getElementById('val-et0').innerText = et0.toFixed(1) + " mm";
        document.getElementById('val-vpd').innerText = vpd.toFixed(2) + " kPa";

        applyCardStyle('card-rh', 'icon-rh', 'val-rh', avgMaxRH, 'rh');
        applyCardStyle('card-solar', 'icon-solar', 'val-solar', solar, 'solar');
        applyCardStyle('card-et0', 'icon-et0', 'val-et0', et0, 'et0');
        applyCardStyle('card-vpd', 'icon-vpd', 'val-vpd', vpd, 'vpd');

        renderTrendList(data);
        updateAdvisoryBox(data.daily.precipitation_probability_max[0] > 70);

        document.getElementById('results-area').scrollIntoView({ behavior: 'smooth' });
    } catch (err) { alert("Data fetch failed."); }
    finally { 
        analyzeBtn.disabled = false; 
        analyzeBtn.innerHTML = '<i class="fa-solid fa-microchip mr-2"></i> Generate Analysis'; 
    }
});
