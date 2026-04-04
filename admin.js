// Админ панелінің логикасы
const ADMIN_PASSWORD_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"; // "admin123" SHA-256

async function hashPassword(pwd) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const passwordInput = document.getElementById('adminPassword');
    const loginSection = document.getElementById('loginSection');
    const adminContent = document.getElementById('adminContent');
    
    // Қате болмау үшін тексеру
    if (!loginBtn) return;
    
    loginBtn.addEventListener('click', async () => {
        const pwd = passwordInput.value;
        const hashedInput = await hashPassword(pwd);
        if (hashedInput === ADMIN_PASSWORD_HASH) {
            loginSection.style.display = 'none';
            adminContent.style.display = 'block';
            renderAdminLinks();
        } else {
            alert("Қате пароль! Қайтадан енгізіңіз.");
        }
    });
    
    function getLinks() {
        let links = localStorage.getItem("siteLinks");
        if (!links) {
            const defaultLinks = [
                { name: "Instagram", url: "https://instagram.com/31arna", icon: "fab fa-instagram" },
                { name: "YouTube", url: "https://youtube.com/@31arna", icon: "fab fa-youtube" },
                { name: "TikTok", url: "https://tiktok.com/@31arna", icon: "fab fa-tiktok" }
            ];
            localStorage.setItem("siteLinks", JSON.stringify(defaultLinks));
            return defaultLinks;
        }
        return JSON.parse(links);
    }
    
    function saveLinks(links) {
        localStorage.setItem("siteLinks", JSON.stringify(links));
        showMessage("Сақталды!");
        renderAdminLinks(); // тізімді жаңарту
    }
    
    function showMessage(msg, isError = false) {
        const msgDiv = document.getElementById('saveMessage');
        if (msgDiv) {
            msgDiv.innerHTML = msg;
            msgDiv.style.color = isError ? '#e31e24' : '#4caf50';
            setTimeout(() => { msgDiv.innerHTML = ''; }, 2000);
        }
    }
    
    function renderAdminLinks() {
        const container = document.getElementById('linksList');
        if (!container) return;
        const links = getLinks();
        if (links.length === 0) {
            container.innerHTML = '<p>Сілтемелер жоқ. Төменде қосыңыз.</p>';
            return;
        }
        
        let html = '';
        links.forEach((link, index) => {
            html += `
                <div class="link-item" data-index="${index}">
                    <input type="text" class="link-name" value="${escapeHtml(link.name)}" placeholder="Атауы">
                    <input type="text" class="link-url" value="${escapeHtml(link.url)}" placeholder="URL">
                    <input type="text" class="link-icon" value="${escapeHtml(link.icon || 'fas fa-link')}" placeholder="Иконка (fa-...)">
                    <button class="delete-btn" data-index="${index}"><i class="fas fa-trash"></i> Өшіру</button>
                </div>
            `;
        });
        container.innerHTML = html;
        
        // Өшіру оқиғалары
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-index'));
                let currentLinks = getLinks();
                currentLinks.splice(idx, 1);
                saveLinks(currentLinks);
            });
        });
        
        // Өзгерістерді сақтау (әр өріс өзгергенде)
        document.querySelectorAll('.link-name, .link-url, .link-icon').forEach(input => {
            input.addEventListener('change', (e) => {
                const parent = input.closest('.link-item');
                const idx = parent.getAttribute('data-index');
                let currentLinks = getLinks();
                const newName = parent.querySelector('.link-name').value;
                const newUrl = parent.querySelector('.link-url').value;
                const newIcon = parent.querySelector('.link-icon').value;
                if (currentLinks[idx]) {
                    currentLinks[idx].name = newName;
                    currentLinks[idx].url = newUrl;
                    currentLinks[idx].icon = newIcon;
                    saveLinks(currentLinks);
                }
            });
        });
    }
    
    // Жаңа сілтеме қосу
    const addBtn = document.getElementById('addLinkBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const nameInput = document.getElementById('newLinkName');
            const urlInput = document.getElementById('newLinkUrl');
            let name = nameInput.value.trim();
            let url = urlInput.value.trim();
            if (!name || !url) {
                showMessage("Атауы мен URL міндетті!", true);
                return;
            }
            if (!url.startsWith('http')) {
                url = 'https://' + url;
            }
            const currentLinks = getLinks();
            currentLinks.push({ name: name, url: url, icon: "fas fa-link" });
            saveLinks(currentLinks);
            nameInput.value = '';
            urlInput.value = '';
        });
    }
    
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
});