const ADMIN_CODE = "Astelwane";

// State Management
let categories = JSON.parse(localStorage.getItem('dakarevents_categories')) || [
    { id: 'culture', label: 'Arts & Culture', color: '#FF8C00', icon: '🎭' },
    { id: 'sports', label: 'Sports & Bien-être', color: '#2ECC71', icon: '🏃' },
    { id: 'gastronomie', label: 'Gastronomie', color: '#E74C3C', icon: '🍽️' },
    { id: 'education', label: 'Éducation & Conf.', color: '#3498DB', icon: '🎓' },
    { id: 'religieux', label: 'Traditionnel & Religieux', color: '#F1C40F', icon: '🙏' },
    { id: 'famille', label: 'Famille & Enfants', color: '#9B59B6', icon: '👨‍👩‍👧' },
    { id: 'environnement', label: 'Écologie & Durable', color: '#1ABC9C', icon: '🌱' },
    { id: 'business', label: 'Business & Tech', color: '#34495E', icon: '💼' },
    { id: 'mode', label: 'Mode & Design', color: '#F39C12', icon: '🎨' },
    { id: 'patrimoine', label: 'Patrimoine & Tourisme', color: '#7F8C8D', icon: '🏛️' }
];

let quartiers = JSON.parse(localStorage.getItem('dakarevents_quartiers')) || [
    { id: 'plateau', label: 'Plateau', lat: 14.67, lng: -17.44 },
    { id: 'almadies', label: 'Almadies', lat: 14.75, lng: -17.52 },
    { id: 'ngor', label: 'Ngor', lat: 14.75, lng: -17.51 },
    { id: 'ouakam', label: 'Ouakam', lat: 14.72, lng: -17.51 },
    { id: 'yoff', label: 'Yoff', lat: 14.76, lng: -17.47 },
    { id: 'medina', label: 'Médina', lat: 14.68, lng: -17.45 },
    { id: 'point-e', label: 'Point E', lat: 14.69, lng: -17.46 },
    { id: 'goree', label: 'Île de Gorée', lat: 14.67, lng: -17.40 },
    { id: 'lac-rose', label: 'Lac Rose', lat: 14.83, lng: -17.23 }
];

let approvedEvents = JSON.parse(localStorage.getItem('dakarevents_events')) || [];
let pendingEvents = JSON.parse(localStorage.getItem('dakarevents_pending')) || [];
let adminSearchTerm = '';

// Assets Assets
const demoImages = [
    'assets/concert1.png',
    'assets/festival1.png',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80'
];

// Shared Sample Data Logic
function generateSampleData() {
    if (approvedEvents.length > 0) return;

    const titles = {
        culture: ["Exposition Art", "Théâtre Sénégalais", "Slam Dakar", "Ciné Plein Air"],
        sports: ["Yoga Dakar", "Marathon", "Lutte Sénégalaise", "Surf Session"],
        gastronomie: ["Thiéboudienne Day", "Marché Bio", "Cuisine Locale", "Buffet Teranga"],
        education: ["Conférence Tech", "Workshop Code", "Salon Pro", "Masterclass"],
        religieux: ["Cérémonie Religieuse", "Veillée Spirituelle", "Fête Traditionnelle", "Rencontre de paix"],
        famille: ["Kids Atelier", "Marionnettes", "Hann Zoo Visit", "Playground Fun"],
        environnement: ["Eco Green Walk", "Beach Clean Day", "Green Talk", "Organic Market"],
        business: ["Startup Networking", "B2B Meetup", "Pitch Night", "Innovation Lab"],
        mode: ["Fashion Week Side", "Designer Pop-up", "Wax Workshop", "Couture Show"],
        patrimoine: ["Gorée Tour", "Heritage Walk", "Village Artisanal Visit", "Museum Discovery"]
    };

    const today = new Date();
    for (let i = 1; i <= 150; i++) {
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const quartier = quartiers[Math.floor(Math.random() * quartiers.length)];
        const catTitles = titles[cat.id] || ["Événement Spécial"];
        const title = catTitles[Math.floor(Math.random() * catTitles.length)] + " #" + i;
        const eventDate = new Date();
        eventDate.setDate(today.getDate() + Math.floor(Math.random() * 30));

        const demoImg = demoImages[Math.floor(Math.random() * demoImages.length)];

        approvedEvents.push({
            id: i,
            title: title,
            category: cat.id,
            date: eventDate.toISOString().split('T')[0],
            time: `${16 + Math.floor(Math.random() * 6)}:00`,
            venue: `${quartier.label} Venue`,
            quartier: quartier.id,
            lat: quartier.lat + (Math.random() - 0.5) * 0.03,
            lng: quartier.lng + (Math.random() - 0.5) * 0.03,
            price: i % 3 === 0 ? "Gratuit" : `${(Math.floor(Math.random() * 10) + 2) * 1000} FCFA`,
            image: demoImg,
            status: 'approved'
        });
    }
    saveData();
}

function handleAdminLogin(e) {
    e.preventDefault();
    const pass = document.getElementById('adminPass').value;
    if (pass === ADMIN_CODE) {
        document.getElementById('loginWall').style.display = 'none';
        document.getElementById('adminLayout').style.display = 'grid';
        initAdmin();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function initAdmin() {
    generateSampleData(); // Ensure initial data exists
    renderAll();
    setupAdminListeners();
}

function setupAdminListeners() {
    document.getElementById('adminSearch').oninput = (e) => {
        adminSearchTerm = e.target.value.toLowerCase();
        renderApproved();
    };
}

function renderAll() {
    updateStats();
    renderPending();
    renderApproved();
    renderCategories();
    renderQuartiers();
    renderImagesGallery();
    renderCharts();
}

function updateStats() {
    document.getElementById('statTotal').textContent = approvedEvents.length;
    document.getElementById('statPending').textContent = pendingEvents.length;
    document.getElementById('pendingCount').textContent = pendingEvents.length;

    const uniqueVenues = new Set(approvedEvents.map(e => e.venue)).size;
    document.getElementById('statVenues').textContent = uniqueVenues;
}

// --- CRUD CATEGORIES ---
function renderCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;
    list.innerHTML = categories.map(c => `
        <tr>
            <td style="font-size: 1.5rem;">${c.icon}</td>
            <td><strong>${c.label}</strong><br><small style="color:var(--text-dim)">ID: ${c.id}</small></td>
            <td><div style="display:flex; align-items:center; gap:8px;">
                <span style="width:16px; height:16px; background:${c.color}; border-radius:50%;"></span>
                <code>${c.color}</code>
            </div></td>
            <td>
                <div style="display:flex; gap:5px;">
                    <button class="action-btn" onclick="openEditCategory('${c.id}')"><small>✏️</small></button>
                    <button class="action-btn btn-delete" onclick="deleteCategory('${c.id}')"><small>🗑️</small></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openAddCategory() {
    document.getElementById('catModalTitle').textContent = "Nouvelle Catégorie";
    document.getElementById('catOldId').value = "";
    document.getElementById('catId').value = "";
    document.getElementById('catLabel').value = "";
    document.getElementById('catIcon').value = "🎯";
    document.getElementById('catColor').value = "#FF8C00";
    document.getElementById('categoryModal').style.display = 'flex';
}

function openEditCategory(id) {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    document.getElementById('catModalTitle').textContent = "Modifier Catégorie";
    document.getElementById('catOldId').value = cat.id;
    document.getElementById('catId').value = cat.id;
    document.getElementById('catLabel').value = cat.label;
    document.getElementById('catIcon').value = cat.icon;
    document.getElementById('catColor').value = cat.color;
    document.getElementById('categoryModal').style.display = 'flex';
}

function handleCategorySubmit(e) {
    e.preventDefault();
    const oldId = document.getElementById('catOldId').value;
    const newId = document.getElementById('catId').value;
    const catData = {
        id: newId,
        label: document.getElementById('catLabel').value,
        icon: document.getElementById('catIcon').value,
        color: document.getElementById('catColor').value
    };

    if (oldId) {
        const idx = categories.findIndex(c => c.id === oldId);
        categories[idx] = catData;
        // Update linked events
        approvedEvents.forEach(ev => { if (ev.category === oldId) ev.category = newId; });
    } else {
        categories.push(catData);
    }

    saveCategories();
    closeModal('categoryModal');
}

function deleteCategory(id) {
    if (confirm("Supprimer cette catégorie ? Les événements liés resteront mais perdront leur style.")) {
        categories = categories.filter(c => c.id !== id);
        saveCategories();
    }
}

// --- CRUD QUARTIERS (ESTABLISHMENTS) ---
function renderQuartiers() {
    const list = document.getElementById('quartiersList');
    if (!list) return;
    list.innerHTML = quartiers.map(q => `
        <tr>
            <td><strong>${q.label}</strong><br><small style="color:var(--text-dim)">ID: ${q.id}</small></td>
            <td><code>${q.lat}, ${q.lng}</code></td>
            <td>
                <div style="display:flex; gap:5px;">
                    <button class="action-btn" onclick="openEditQuartier('${q.id}')"><small>✏️</small></button>
                    <button class="action-btn btn-delete" onclick="deleteQuartier('${q.id}')"><small>🗑️</small></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openAddQuartier() {
    document.getElementById('quartierModalTitle').textContent = "Nouveau Lieu";
    document.getElementById('quartierOldId').value = "";
    document.getElementById('quartierId').value = "";
    document.getElementById('quartierLabel').value = "";
    document.getElementById('quartierLat').value = 14.71;
    document.getElementById('quartierLng').value = -17.44;
    document.getElementById('quartierModal').style.display = 'flex';
}

function openEditQuartier(id) {
    const q = quartiers.find(item => item.id === id);
    if (!q) return;
    document.getElementById('quartierModalTitle').textContent = "Modifier Lieu";
    document.getElementById('quartierOldId').value = q.id;
    document.getElementById('quartierId').value = q.id;
    document.getElementById('quartierLabel').value = q.label;
    document.getElementById('quartierLat').value = q.lat;
    document.getElementById('quartierLng').value = q.lng;
    document.getElementById('quartierModal').style.display = 'flex';
}

function handleQuartierSubmit(e) {
    e.preventDefault();
    const oldId = document.getElementById('quartierOldId').value;
    const newId = document.getElementById('quartierId').value;
    const qData = {
        id: newId,
        label: document.getElementById('quartierLabel').value,
        lat: parseFloat(document.getElementById('quartierLat').value),
        lng: parseFloat(document.getElementById('quartierLng').value)
    };

    if (oldId) {
        const idx = quartiers.findIndex(q => q.id === oldId);
        quartiers[idx] = qData;
        approvedEvents.forEach(ev => { if (ev.quartier === oldId) ev.quartier = newId; });
    } else {
        quartiers.push(qData);
    }

    saveQuartiers();
    closeModal('quartierModal');
}

function deleteQuartier(id) {
    if (confirm("Supprimer ce lieu ?")) {
        quartiers = quartiers.filter(q => q.id !== id);
        saveQuartiers();
    }
}

// --- IMAGES GALLERY ---
function renderImagesGallery() {
    const container = document.getElementById('imagesGallery');
    if (!container) return;
    container.innerHTML = demoImages.map(url => `
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden;">
            <div style="height:120px; background-image:url('${url}'); background-size:cover; background-position:center;"></div>
            <div style="padding:10px; font-size:0.7rem; color:var(--text-dim); overflow:hidden; text-overflow:ellipsis;">${url}</div>
        </div>
    `).join('');
}

// --- STANDARD EVENTS LOGIC ---
function renderPending() {
    const list = document.getElementById('pendingList');
    if (!list) return;
    if (pendingEvents.length === 0) {
        list.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 3rem; color: var(--text-dim);">Rien en attente.</td></tr>';
        return;
    }

    list.innerHTML = pendingEvents.map(e => `
        <tr>
            <td><div class="image-preview" style="background-image: url('${e.image || ''}')"></div></td>
            <td><strong>${e.title}</strong><br><small>${e.venue} | ${e.date}</small></td>
            <td>${e.submittedBy ? e.submittedBy.name : 'Anonyme'}<br><small style="color:var(--admin-accent)">${e.submittedBy ? e.submittedBy.phone : '-'}</small></td>
            <td>
                <div style="display:flex; gap:5px;">
                    <button class="action-btn btn-approve" onclick="approveEvent(${e.id})">Approuver</button>
                    <button class="action-btn btn-delete" onclick="deletePending(${e.id})">Refuser</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderApproved() {
    const list = document.getElementById('approvedList');
    if (!list) return;
    const filtered = approvedEvents.filter(e =>
        e.title.toLowerCase().includes(adminSearchTerm) ||
        e.venue.toLowerCase().includes(adminSearchTerm)
    );

    list.innerHTML = filtered.map(e => `
        <tr>
            <td><div class="image-preview" style="background-image: url('${e.image || ''}')"></div></td>
            <td><strong>${e.title}</strong><br><span style="font-size:0.75rem; background:rgba(255,140,0,0.1); color:var(--admin-accent); padding:2px 6px; border-radius:4px;">${e.category}</span></td>
            <td><small>${e.venue}</small><br><small style="color:var(--text-dim)">${e.date}</small></td>
            <td>
                <div style="display:flex; gap:5px;">
                    <button class="action-btn" onclick="openEdit(${e.id})" style="border-color:var(--admin-accent); color:var(--admin-accent);">Modifier</button>
                    <button class="action-btn btn-delete" onclick="deleteApproved(${e.id})">Supprimer</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderCharts() {
    const catContainer = document.getElementById('categoryChart');
    const venueContainer = document.getElementById('venueChart');

    const catStats = categories.map(c => ({
        label: c.label,
        color: c.color,
        count: approvedEvents.filter(e => e.category === c.id).length
    })).sort((a, b) => b.count - a.count);

    if (catContainer) {
        catContainer.innerHTML = catStats.map(s => `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 100px; font-size: 0.75rem; color: var(--text-dim); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${s.label}</div>
                <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden;">
                    <div style="width: ${approvedEvents.length > 0 ? (s.count / approvedEvents.length * 100) : 0}%; height: 100%; background: ${s.color};"></div>
                </div>
                <div style="width: 25px; font-weight: 700; text-align: right; font-size: 0.8rem;">${s.count}</div>
            </div>
        `).join('');
    }

    const venues = {};
    approvedEvents.forEach(e => venues[e.venue] = (venues[e.venue] || 0) + 1);
    const topVenues = Object.entries(venues).sort((a, b) => b[1] - a[1]).slice(0, 5);

    if (venueContainer) {
        venueContainer.innerHTML = topVenues.map(([name, count]) => `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 100px; font-size: 0.75rem; color: var(--text-dim); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${name}</div>
                <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden;">
                    <div style="width: ${approvedEvents.length > 0 ? (count / approvedEvents.length * 100) : 0}%; height: 100%; background: #3498DB;"></div>
                </div>
                <div style="width: 25px; font-weight: 700; text-align: right; font-size: 0.8rem;">${count}</div>
            </div>
        `).join('');
    }
}

// --- SYSTEM ---
function approveEvent(id) {
    const event = pendingEvents.find(e => e.id === id);
    if (event) {
        event.status = 'approved';
        approvedEvents.unshift(event);
        pendingEvents = pendingEvents.filter(e => e.id !== id);
        saveData();
    }
}

function deletePending(id) {
    if (confirm("Refuser cette soumission ?")) {
        pendingEvents = pendingEvents.filter(e => e.id !== id);
        saveData();
    }
}

function deleteApproved(id) {
    if (confirm("Supprimer cet événement ?")) {
        approvedEvents = approvedEvents.filter(e => e.id !== id);
        saveData();
    }
}

function openEdit(id) {
    const event = approvedEvents.find(e => e.id === id);
    if (!event) return;
    document.getElementById('editId').value = event.id;
    document.getElementById('editTitle').value = event.title;
    document.getElementById('editDate').value = event.date;
    document.getElementById('editVenue').value = event.venue;
    document.getElementById('editEventModal').style.display = 'flex';
}

function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function handleEditSubmit(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('editId').value);
    const index = approvedEvents.findIndex(e => e.id === id);
    if (index !== -1) {
        approvedEvents[index].title = document.getElementById('editTitle').value;
        approvedEvents[index].date = document.getElementById('editDate').value;
        approvedEvents[index].venue = document.getElementById('editVenue').value;
        saveData();
        closeModal('editEventModal');
    }
}

function showTab(tab) {
    const tabs = ['dashboardTab', 'pendingTab', 'eventsTab', 'categoriesTab', 'quartiersTab', 'imagesTab'];
    tabs.forEach(t => {
        const el = document.getElementById(t);
        if (el) el.style.display = t.startsWith(tab) ? 'block' : 'none';
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.id === `tab-${tab}`) btn.classList.add('active');
    });
}

function saveData() {
    localStorage.setItem('dakarevents_events', JSON.stringify(approvedEvents));
    localStorage.setItem('dakarevents_pending', JSON.stringify(pendingEvents));
    renderAll();
}

function saveCategories() {
    localStorage.setItem('dakarevents_categories', JSON.stringify(categories));
    renderAll();
}

function saveQuartiers() {
    localStorage.setItem('dakarevents_quartiers', JSON.stringify(quartiers));
    renderAll();
}

// Global Exports
window.handleAdminLogin = handleAdminLogin;
window.showTab = showTab;
window.approveEvent = approveEvent;
window.deletePending = deletePending;
window.deleteApproved = deleteApproved;
window.openEdit = openEdit;
window.handleEditSubmit = handleEditSubmit;
window.closeModal = closeModal;
window.openAddCategory = openAddCategory;
window.openEditCategory = openEditCategory;
window.handleCategorySubmit = handleCategorySubmit;
window.deleteCategory = deleteCategory;
window.openAddQuartier = openAddQuartier;
window.openEditQuartier = openEditQuartier;
window.handleQuartierSubmit = handleQuartierSubmit;
window.deleteQuartier = deleteQuartier;
