function applyCardStyle(cardId, iconId, textId, value, type) {
    const card = document.getElementById(cardId);
    const icon = document.getElementById(iconId);
    const text = document.getElementById(textId);
    let color = "slate";

    if (type === 'rh') {
        color = value > 85 ? "rose" : value < 50 ? "amber" : "sky";
    } else if (type === 'solar') {
        color = value < 10 ? "slate" : value > 22 ? "amber" : "emerald";
    } else if (type === 'et0') {
        color = value > 6 ? "rose" : value > 4 ? "amber" : "emerald";
    } else if (type === 'vpd') {
        color = value > 1.5 ? "rose" : value > 0.8 ? "amber" : "emerald";
    }

    const schemes = {
        rose: { bg: 'bg-rose-50/90', border: 'border-rose-200', text: 'text-rose-900', icon: 'bg-rose-100 text-rose-600' },
        emerald: { bg: 'bg-emerald-50/90', border: 'border-emerald-200', text: 'text-emerald-900', icon: 'bg-emerald-100 text-emerald-600' },
        amber: { bg: 'bg-amber-50/90', border: 'border-amber-200', text: 'text-amber-900', icon: 'bg-amber-100 text-amber-600' },
        sky: { bg: 'bg-sky-50/90', border: 'border-sky-200', text: 'text-sky-900', icon: 'bg-sky-100 text-sky-600' },
        slate: { bg: 'bg-slate-50/90', border: 'border-slate-200', text: 'text-slate-900', icon: 'bg-slate-100 text-slate-600' }
    };

    const s = schemes[color];
    card.className = `agro-card ${s.bg} ${s.border}`;
    text.className = `mt-3 text-3xl font-black ${s.text}`;
    icon.className = `inline-flex h-14 w-14 items-center justify-center rounded-xl mb-4 mx-auto ${s.icon}`;
}

function updateAdvisoryBox(isRainy, bestDate) {
    const box = document.getElementById('rec-box');
    const title = document.getElementById('rec-title');
    const heading = document.getElementById('rec-heading');
    const icon = document.getElementById('rec-alert-icon');
    const text = document.getElementById('rec-text');

    if (isRainy) {
        box.className = "glass-panel rounded-xl border border-red-200 p-8 shadow-2xl bg-red-50 text-red-800";
        title.innerText = "HEAVY RAIN WARNING";
        heading.innerText = `Preferred Schedule: ${bestDate}`;
        icon.className = "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-700 fa-solid fa-cloud-showers-heavy text-xl";
        text.innerText = "Heavy rain is expected today. Based on 7-day trends, the optimal conditions for field work will occur on " + bestDate + ".";
    } else {
        box.className = "glass-panel rounded-xl border border-emerald-200 p-8 shadow-2xl bg-emerald-50 text-emerald-800";
        title.innerText = "OPTIMAL FARMING CONDITIONS";
        heading.innerText = "Proceed with operations";
        icon.className = "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 fa-solid fa-square-check text-xl";
        text.innerText = `Conditions are stable. If you miss today, ${bestDate} also shows a high stability score for irrigation or fertilization.`;
    }
}

function renderTrendList(data) {
    const list = document.getElementById('trend-list');
    list.innerHTML = "";
    
    data.daily.time.forEach((date, i) => {
        const prob = data.daily.precipitation_probability_max[i];
        const rain = data.daily.precipitation_sum[i];
        const d = new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        
        let bgClass = prob > 70 ? "bg-rose-50 text-rose-900 border-rose-200" : 
                      prob > 40 ? "bg-amber-50 text-amber-900 border-amber-200" : 
                      "bg-emerald-50 text-emerald-900 border-emerald-200";

        let iconClass = "fa-solid fa-sun text-emerald-500";
        let conditionText = "Sunny";
        
        if (prob > 70) {
            if (rain > 10) {
                iconClass = "fa-solid fa-cloud-showers-heavy text-rose-600";
                conditionText = "Heavy Rain";
            } else {
                iconClass = "fa-solid fa-cloud-rain text-rose-500";
                conditionText = "Rainy";
            }
        } else if (prob > 40) {
            if (rain > 2) {
                iconClass = "fa-solid fa-cloud-sun-rain text-amber-600";
                conditionText = "Scattered Showers";
            } else {
                iconClass = "fa-solid fa-cloud text-amber-500";
                conditionText = "Mostly Cloudy";
            }
        } else if (prob > 15 && rain > 0) {
            iconClass = "fa-solid fa-cloud-sun text-emerald-600";
            conditionText = "Partly Cloudy";
        }

        list.innerHTML += `
            <div class="flex items-center justify-between px-3 py-2 rounded-xl shadow-sm trend-row ${bgClass}">
                <!-- Left Section: Icon and Date -->
                <div class="flex items-center gap-3 w-1/3 min-w-[120px]">
                    <span class="w-6 text-center flex items-center justify-center text-sm">
                        <i class="${iconClass}"></i>
                    </span>
                    <span class="text-[11px] font-bold uppercase tracking-tight">${d}</span>
                </div>
                
                <!-- Center Section: Weather Status Summary Text (BOLDED) -->
                <div class="flex-1 text-center hidden sm:block">
                    <span class="text-[11px] font-black uppercase tracking-wider">${conditionText}</span>
                </div>
                
                <!-- Right Section: Probabilities and Totals -->
                <div class="flex items-center justify-end gap-3 w-1/3 min-w-[140px]">
                    <span class="trend-prob-cell text-[11px] font-black tracking-widest">${prob}%</span>
                    <span class="trend-rain-cell text-[10px] font-bold bg-white/40 py-0.5 px-1 rounded border border-black/5">${rain}mm</span>
                </div>
            </div>`;
    });
}

function showToast(message, type = 'error') {
    const mapWrapper = document.querySelector('.glass-panel.rounded-xl.overflow-hidden');
    if (!mapWrapper) return;
    
    let container = mapWrapper.querySelector('.alert-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'alert-container';
        mapWrapper.appendChild(container);
    }

    const alert = document.createElement('div');
    alert.className = `alert-ui alert-${type}`;
    const icon = type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info';
    
    alert.innerHTML = `
        <div class="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-white/50">
            <i class="fa-solid ${icon}"></i>
        </div>
        <div class="flex-1">
            <p class="text-[10px] font-black uppercase tracking-widest opacity-70">${type === 'error' ? 'System Alert' : 'Notice'}</p>
            <p class="text-sm font-bold leading-tight">${message}</p>
        </div>
        <button onclick="this.parentElement.remove()" class="opacity-50 hover:opacity-100 transition">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    container.appendChild(alert);
    setTimeout(() => alert.classList.add('show'), 10);

    setTimeout(() => {
        if (alert.parentNode) {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 400);
        }
    }, 5000);
}