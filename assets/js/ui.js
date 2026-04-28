

/**
 * Updates the big recommendation/warning box
 */
function updateAdvisoryBox(isRainy) {
    const box = document.getElementById('rec-box');
    const title = document.getElementById('rec-title');
    const heading = document.getElementById('rec-heading');
    const icon = document.getElementById('rec-alert-icon');
    const text = document.getElementById('rec-text');

    if (isRainy) {
        box.className = "glass-panel rounded-xl border border-red-200 p-8 shadow-2xl bg-red-50 text-red-800";
        title.innerText = "HEAVY RAIN WARNING";
        heading.innerText = "Delay outdoor work";
        icon.className = "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-700 fa-solid fa-cloud-showers-heavy text-xl";
        text.innerText = "High probability of rain detected. Postpone spraying.";
    } else {
        box.className = "glass-panel rounded-xl border border-emerald-200 p-8 shadow-2xl bg-emerald-50 text-emerald-800";
        title.innerText = "OPTIMAL FARMING CONDITIONS";
        heading.innerText = "Plan with confidence";
        icon.className = "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 fa-solid fa-square-check text-xl";
        text.innerText = "Stable weather patterns detected. Ideal for land preparation.";
    }
}