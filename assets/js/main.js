let selectedData = { lat: null, lng: null, isValid: false };
const todayStr = new Date().toISOString().split('T')[0];

const analyzeBtn = document.getElementById('analyze-btn');
const findMeBtn = document.getElementById('find-me-btn');
const dateInput = document.getElementById('target-date');

dateInput.value = todayStr;
dateInput.setAttribute('min', todayStr);

async function handleLocationSelection(lat, lng) {
    if (!phBounds.contains([lat, lng])) {
        showToast("Restricted: AgriRain is only available within the Philippines.");
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
        
        document.getElementById('loc-name').innerText = addrParts.join(', ') || "Selected Philippine Site";
        document.getElementById('loc-coords').innerText = `${selectedData.lat}, ${selectedData.lng}`;
    } catch (err) { 
        console.error(err); 
        showToast("Failed to retrieve address details.");
    }
}

function initMapListener() {
    if (typeof map !== 'undefined' && map) {
        map.on('click', (e) => handleLocationSelection(e.latlng.lat, e.latlng.lng));
    } else {
        setTimeout(initMapListener, 100);
    }
}
initMapListener();

findMeBtn.addEventListener('click', () => {
    findMeBtn.disabled = true;
    const orig = findMeBtn.innerHTML;
    findMeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> LOCATING...';
    
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            await handleLocationSelection(pos.coords.latitude, pos.coords.longitude);
            findMeBtn.disabled = false; 
            findMeBtn.innerHTML = orig;
        },
        () => { 
            findMeBtn.disabled = false; 
            findMeBtn.innerHTML = orig; 
            showToast("Location access denied or unavailable.");
        }
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

        const targetDateIndex = data.daily.time.findIndex(t => t === start);
        const safeIndex = targetDateIndex !== -1 ? targetDateIndex : 0;

        const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
        const avgRH = avg(data.daily.relative_humidity_2m_max);
        const avgSolar = avg(data.daily.shortwave_radiation_sum);
        const avgEt0 = avg(data.daily.et0_fao_evapotranspiration);

        const hourlyStartOffset = safeIndex * 24;
        const vpdTargetDay = data.hourly.vapour_pressure_deficit.slice(hourlyStartOffset, hourlyStartOffset + 24);
        const maxVpdTargetDay = vpdTargetDay.length ? Math.max(...vpdTargetDay) : 0;

        const bestDayIndex = findBestFarmingDay(data);
        const bestDate = new Date(data.daily.time[bestDayIndex]).toLocaleDateString('en-US', { 
            weekday: 'long', month: 'short', day: 'numeric' 
        });

        document.getElementById('val-rh').innerText = Math.round(avgRH) + "%";
        document.getElementById('val-solar').innerText = avgSolar.toFixed(1) + " MJ";
        document.getElementById('val-et0').innerText = avgEt0.toFixed(1) + " mm";
        document.getElementById('val-vpd').innerText = maxVpdTargetDay.toFixed(2) + " kPa";

        applyCardStyle('card-rh', 'icon-rh', 'val-rh', avgRH, 'rh');
        applyCardStyle('card-solar', 'icon-solar', 'val-solar', avgSolar, 'solar');
        applyCardStyle('card-et0', 'icon-et0', 'val-et0', avgEt0, 'et0');
        applyCardStyle('card-vpd', 'icon-vpd', 'val-vpd', maxVpdTargetDay, 'vpd');

        renderTrendList(data);

        updateAdvisoryBox(data.daily.precipitation_probability_max[safeIndex] > 70, bestDate);

        const riceRec = getRiceRecommendations(data);
        document.getElementById('rice-zone').innerText = riceRec.conditionType;
        document.getElementById('rice-type').innerText = riceRec.type;

        const strainsContainer = document.getElementById('rice-strains');
        strainsContainer.innerHTML = ''; 

        riceRec.varieties.split(',').forEach(strain => {
            const badge = document.createElement('span');
            badge.className = "bg-emerald-100 text-slate-900 border border-emerald-200 px-2.5 py-1 text-xs font-bold rounded-lg tracking-tight inline-block";
            badge.innerText = strain.trim();
            strainsContainer.appendChild(badge);
        });

        document.getElementById('rice-reason').innerText = riceRec.reason;
        document.getElementById('results-area').scrollIntoView({ behavior: 'smooth' });
        
    } catch (err) { 
        console.error(err);
        showToast("Data fetch failed. Check connection."); 
    } finally { 
        analyzeBtn.disabled = false; 
        analyzeBtn.innerHTML = '<i class="fa-solid fa-microchip mr-2"></i> Generate Analysis'; 
    }
});

function findBestFarmingDay(data) {
    let scores = data.daily.time.map((_, i) => {
        let score = 0;
        score -= data.daily.precipitation_probability_max[i] * 2;
        if (data.daily.shortwave_radiation_sum[i] > 15) score += 50;
        if (data.daily.et0_fao_evapotranspiration[i] > 6) score -= 30;
        return score;
    });
    return scores.indexOf(Math.max(...scores));
}