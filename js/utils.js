// Consolidated utility functions
// Combines: search.js, filter.js, ui.js

// ========== STORAGE UTILITIES ==========
const Storage = {
    get: (key) => {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : null;
    },
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
    remove: (key) => localStorage.removeItem(key)
};

// ========== MODAL UTILITIES ==========
const Modal = {
    show: (id) => {
        const el = document.getElementById(id);
        if (el) el.classList.add('show');
    },
    hide: (id) => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('show');
    },
    toggle: (id) => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('show');
    },
    initClose: () => {
        window.onclick = (e) => document.querySelectorAll('.modal').forEach(m => e.target === m && m.classList.remove('show'));
    }
};

// ========== TOAST NOTIFICATION ==========
function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// ========== SEARCH FUNCTIONALITY ==========
function initSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.addEventListener('keyup', (e) => {
        const f = e.target.value.toUpperCase();
        document.querySelectorAll('.product-card').forEach(c => {
            const title = c.querySelector('h3');
            c.style.display = !title || title.textContent.toUpperCase().includes(f) ? 'block' : 'none';
        });
    });
}

// ========== FILTER FUNCTIONALITY ==========
function filterSelection(cat) {
    const cards = document.querySelectorAll('.product-card');
    document.querySelectorAll('.f-btn').forEach(b => b.classList.toggle('active', 
        b.textContent.toLowerCase() === cat || (cat === 'all' && b.textContent === 'All')));
    cards.forEach(c => c.style.display = cat === 'all' || c.classList.contains(cat) ? 'block' : 'none');
}

// ========== FORM HANDLERS ==========
function handleContact(e) { e.preventDefault(); showToast('Message sent!'); e.target.reset(); }
function handleNewsletter(e) { e.preventDefault(); showToast('Subscribed!'); e.target.reset(); }
