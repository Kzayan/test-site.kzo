// Сілтемелерді сақтау және көрсету
const DEFAULT_LINKS = [
    { name: "Instagram", url: "https://instagram.com/31arna", icon: "fab fa-instagram" },
    { name: "YouTube", url: "https://youtube.com/@31arna", icon: "fab fa-youtube" },
    { name: "TikTok", url: "https://tiktok.com/@31arna", icon: "fab fa-tiktok" },
    { name: "Facebook", url: "https://facebook.com/31arna", icon: "fab fa-facebook" },
    { name: "31 LIVE", url: "https://31.kz/live", icon: "fas fa-play-circle" },
    { name: "Информбюро", url: "https://31.kz/news", icon: "fas fa-newspaper" }
];

function loadLinks() {
    let links = localStorage.getItem("siteLinks");
    if (!links) {
        // Ешқандай сақталған дерек жоқ болса, әдепкіні сақта
        localStorage.setItem("siteLinks", JSON.stringify(DEFAULT_LINKS));
        links = JSON.stringify(DEFAULT_LINKS);
    }
    return JSON.parse(links);
}

function renderLinks() {
    const container = document.getElementById("links-container");
    if (!container) return;
    
    const links = loadLinks();
    if (links.length === 0) {
        container.innerHTML = '<div class="loading">Сілтемелер жоқ</div>';
        return;
    }
    
    let html = '';
    links.forEach(link => {
        // Иконканы анықтау
        let iconHtml = `<i class="${link.icon || 'fas fa-link'}"></i>`;
        html += `
            <a href="${link.url}" target="_blank" class="link-card">
                <div class="link-icon">${iconHtml}</div>
                <span class="link-title">${escapeHtml(link.name)}</span>
                <span class="link-arrow"><i class="fas fa-arrow-right"></i></span>
            </a>
        `;
    });
    container.innerHTML = html;
}

// XSS қорғанысы
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Байланыс телефон/email (әдепкі)
document.addEventListener('DOMContentLoaded', () => {
    renderLinks();
    const phoneLink = document.getElementById('contact-phone');
    const emailLink = document.getElementById('contact-email');
    if (phoneLink) phoneLink.href = "tel:+77273513131";
    if (emailLink) emailLink.href = "mailto:info@31.kz";
});