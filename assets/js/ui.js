function applyCardStyle(cardId, iconId, textId, value, type) {
    const card = document.getElementById(cardId);
    const icon = document.getElementById(iconId);
    const text = document.getElementById(textId);
    let color = "slate";

    if (type === 'rh') {
        color = value > 85 ? "rose" : value < 50 ? "amber" : "sky";
    }

    const schemes = {
        rose: { bg: 'bg-rose-50/90', border: 'border-rose-200', text: 'text-rose-900', icon: 'bg-rose-100 text-rose-600' },
        emerald: { bg: 'bg-emerald-50/90', border: 'border-emerald-200', text: 'text-emerald-900', icon: 'bg-emerald-100 text-emerald-600' },
    };

    const s = schemes[color];
    card.className = `agro-card ${s.bg} ${s.border}`;
    text.className = `mt-3 text-3xl font-black ${s.text}`;
    icon.className = `inline-flex h-14 w-14 items-center justify-center rounded-xl mb-4 mx-auto ${s.icon}`;
}



function renderTrendList(data) {
    const list = document.getElementById('trend-list');
    list.innerHTML = "";
    data.daily.time.forEach((date, i) => {
        const prob = data.daily.precipitation_probability_max[i];
        const d = new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        
        list.innerHTML += `
            <div class="flex items-center justify-between px-3 py-2 rounded-xl shadow-sm trend-row">
                <span class="text-[11px] font-bold uppercase tracking-tight">${d}</span>
                <span class="trend-prob-cell text-[11px] font-black tracking-widest">${prob}%</span>
            </div>`;
    });
}