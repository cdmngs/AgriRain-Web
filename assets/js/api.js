async function getReverseGeocode(lat, lng) {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    return await res.json();
}

async function getWeatherData(lat, lng, start, end) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum,precipitation_probability_max,shortwave_radiation_sum,et0_fao_evapotranspiration,relative_humidity_2m_max&hourly=vapour_pressure_deficit&timezone=auto&start_date=${start}&end_date=${end}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) throw new Error(data.reason);
    return data;
}