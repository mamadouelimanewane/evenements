// ===================================
// GESTION DES DONNÉES (LocalStorage)
// ===================================

// Charger les catégories initiales ou depuis LocalStorage
let appCategories = JSON.parse(localStorage.getItem('dakarevents_categories')) || [
    { id: 'culture', label: 'Arts & Culture', color: '#FF8C00', icon: '🎭' },
    { id: 'sports', label: 'Sports & Bien-être', color: '#2ECC71', icon: '🏃' },
    { id: 'gastronomie', label: 'Gastronomie', color: '#E74C3C', icon: '🍽️' },
    { id: 'education', label: 'Éducation & Conf.', color: '#3498DB', icon: '🎓' }
];

let appEvents = JSON.parse(localStorage.getItem('dakarevents_events')) || [];

let currentImageBase64 = null;

// ===================================
// INITIALISATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    updateSelects();
    renderAll();
});

function renderAll() {
    renderEvents();
    renderCategories();
}

function updateSelects() {
    const catSelect = document.getElementById('eventCategory');
    const quartSelect = document.getElementById('eventQuartier');

    // De app.js (ou hardcoded ici pour admin)
    const quartiers = [
        { id: 'plateau', label: 'Plateau' }, { id: 'almadies', label: 'Almadies' },
        { id: 'ngor', label: 'Ngor' }, { id: 'ouakam', label: 'Ouakam' },
        { id: 'yoff', label: 'Yoff' }, { id: 'medina', label: 'Médina' },
        { id: 'lac-rose', label: 'Lac Rose' }
    ];

    catSelect.innerHTML = appCategories.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');
    quartSelect.innerHTML = quartiers.map(q => `<option value="${q.id}">${q.label}</option>`).join('');
}

// ===================================
// GESTION DES ÉVÉNEMENTS
// ===================================
function handleEventSubmit(e) {
    e.preventDefault();

    const newEvent = {
        id: Date.now(),
        title: document.getElementById('eventTitle').value,
        category: document.getElementById('eventCategory').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        price: document.getElementById('eventPrice').value,
        venue: document.getElementById('eventVenue').value,
        quartier: document.getElementById('eventQuartier').value,
        description: document.getElementById('eventDescription').value,
        image: currentImageBase64, // L'image en base64
        lat: 14.7, lng: -17.4 // Coordonnées par défaut (Dakar)
    };

    appEvents.unshift(newEvent); // Ajouter au début
    saveAndRefresh();
    e.target.reset();
    document.getElementById('imagePreview').style.display = 'none';
    currentImageBase64 = null;
    toggleForm('eventForm');
}

function deleteEvent(id) {
    if (confirm('Supprimer cet événement ?')) {
        appEvents = appEvents.filter(e => e.id !== id);
        saveAndRefresh();
    }
}

function renderEvents() {
    const list = document.getElementById('eventsList');
    list.innerHTML = appEvents.map(e => {
        const cat = appCategories.find(c => c.id === e.category) || { label: 'Inconnu', icon: '❓' };
        return `
            <tr>
                <td><div class="image-preview" style="background-image: url('${e.image || 'https://via.placeholder.com/100'}')"></div></td>
                <td><strong>${e.title}</strong><br><small>${e.venue}</small></td>
                <td>${cat.icon} ${cat.label}</td>
                <td>${e.date}<br>${e.time}</td>
                <td>${e.price}</td>
                <td>
                    <button class="action-btn btn-delete" onclick="deleteEvent(${e.id})">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

// ===================================
// GESTION DES CATÉGORIES
// ===================================
function handleCategorySubmit(e) {
    e.preventDefault();
    const newCat = {
        id: document.getElementById('catId').value,
        label: document.getElementById('catLabel').value,
        icon: document.getElementById('catIcon').value,
        color: document.getElementById('catColor').value
    };
    appCategories.push(newCat);
    saveAndRefresh();
    e.target.reset();
    toggleForm('categoryForm');
    updateSelects();
}

function deleteCategory(id) {
    if (confirm('Supprimer cette catégorie ?')) {
        appCategories = appCategories.filter(c => c.id !== id);
        saveAndRefresh();
        updateSelects();
    }
}

function renderCategories() {
    const list = document.getElementById('categoriesList');
    list.innerHTML = appCategories.map(c => `
        <tr>
            <td style="font-size: 1.5rem">${c.icon}</td>
            <td><strong>${c.label}</strong></td>
            <td><code>${c.id}</code></td>
            <td><span class="dot-indicator" style="background: ${c.color}"></span> ${c.color}</td>
            <td>
                <button class="action-btn btn-delete" onclick="deleteCategory('${c.id}')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// ===================================
// UTILITAIRES
// ===================================
function saveAndRefresh() {
    localStorage.setItem('dakarevents_categories', JSON.stringify(appCategories));
    localStorage.setItem('dakarevents_events', JSON.stringify(appEvents));
    renderAll();
}

function toggleForm(id) {
    const f = document.getElementById(id);
    f.style.display = f.style.display === 'none' ? 'block' : 'none';
}

function showTab(tab) {
    document.getElementById('eventsTab').style.display = tab === 'events' ? 'block' : 'none';
    document.getElementById('categoriesTab').style.display = tab === 'categories' ? 'block' : 'none';
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        currentImageBase64 = e.target.result;
        const preview = document.getElementById('imagePreview');
        preview.src = currentImageBase64;
        preview.style.display = 'block';
        document.getElementById('uploadText').style.display = 'none';
    };
    reader.readAsDataURL(file);
}
