function getRiceRecommendations(data) {
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

    const avgSolar = avg(data.daily.shortwave_radiation_sum);
    const avgEt0 = avg(data.daily.et0_fao_evapotranspiration);
    const totalRain = data.daily.precipitation_sum.reduce((a, b) => a + b, 0);
    const maxVpd = Math.max(...data.hourly.vapour_pressure_deficit.slice(0, 24));

    let conditionType = "";
    let recommendation = {};

    if (totalRain > 50 || avgEt0 < 3.5) {
        conditionType = "Rainfed Lowland / High Rainfall Wet Season";
        recommendation = {
            type: "Inbred (Flood-Tolerant & Disease-Resistant)",
            varieties: "NSIC Rc 222 (Tubigan 18), NSIC Rc 160 (Tubigan 14), Submarino varieties (e.g., NSIC Rc 194)",
            reason: "High rainfall detected. These varieties resist lodging (falling over in rain) and tolerate flash floods or standing water while remaining resistant to Wet Season fungal blast."
        };
    } else if (maxVpd > 1.5 || avgEt0 > 5.5) {
        conditionType = "Drought-Prone / Upland Dry Conditions";
        recommendation = {
            type: "Drought-Tolerant / Early Maturing Varieties",
            varieties: "NSIC Rc 192 (Sahod Ulan 1), NSIC Rc 272 (Sahod Ulan 2), PSB Rc 14 (Arayat)",
            reason: "High Evapotranspiration ($ET_0$) and Vapor Pressure Deficit indicate high water stress. These Sahod Ulan varieties are deep-rooted and mature early, escaping prolonged dry spells."
        };
    } else if (avgSolar > 20 && totalRain < 15) {
        conditionType = "Irrigated Lowland / High Solar Dry Season";
        recommendation = {
            type: "High-Yielding Hybrids",
            varieties: "Mestiso 19, Mestiso 20, NSIC Rc 238 (Tubigan 21)",
            reason: "Abundant solar radiation detected with low rainfall. Ideal for hybrid rice which maximizes high photosynthetic activity under irrigated, sunny environments to produce maximum grain yield."
        };
    } else {
        conditionType = "Standard Irrigated Lowland (Flexible)";
        recommendation = {
            type: "General-Purpose Modern Inbreds",
            varieties: "NSIC Rc 216, NSIC Rc 436",
            reason: "Stable environmental baseline. These general-purpose varieties offer stable yields, excellent milling recoveries, and good eating quality under standard irrigation."
        };
    }

    return { conditionType, ...recommendation };
}