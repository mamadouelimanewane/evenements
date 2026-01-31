const ADMIN_CODE = "Astelwane";

// Categories definition (must match app.js)
const categories = [
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

const quartiers = [
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

// Shared Sample Data Logic
function generateSampleData() {
    if (approvedEvents.length > 0) return;

    const titles = {
        culture: ["Exposition Art Contemporain", "Pièce de Théâtre Sorano", "Slam & Poésie", "Festival Cinéma Nomade"],
        sports: ["Yoga sur la Plage", "Marathon de Dakar", "Tournoi Lutte Traditionnelle", "Session Surf Ngor"],
        gastronomie: ["Le Grand Thiéboudienne", "Marché Street Food", "Atelier Cuisine Locale", "Dégustation Mafé Fusion"],
        education: ["Conférence Tech Dakar", "Coding Bootcamp", "Salon de l'Emploi", "Atelier Entrepreneuriat"],
        religieux: ["Cérémonie du Sabar", "Veillée Traditionnelle", "Festivité du Gamou", "Rencontre Inter-Religieuse"],
        famille: ["Atelier Créatif Enfants", "Spectacle Guignol Sénégalais", "Journée au Parc Hann", "Musée Interactif"],
        environnement: ["Reboisement Set Setal", "Nettoyage Plage Yoff", "Conférence Écologie", "Marché Bio"],
        business: ["Startup Weekend Dakar", "Networking B2B", "Pitch Competition", "Innovation Summit"],
        mode: ["Dakar Fashion Week", "Pop-up Store Créateurs", "Atelier Couture Wax", "Défilé Design Émergent"],
        patrimoine: ["Visite Guidée Gorée", "Circuit Architecture Plateau", "Excursion Lac Rose", "Portes Ouvertes Musée Théodore Monod"]
    };

    const today = new Date();
    for (let i = 1; i <= 150; i++) {
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const quartier = quartiers[Math.floor(Math.random() * quartiers.length)];
        const title = titles[cat.id][Math.floor(Math.random() * titles[cat.id].length)] + " #" + i;
        const eventDate = new Date();
        eventDate.setDate(today.getDate() + Math.floor(Math.random() * 30));

        let demoImage = Math.random() > 0.5 ? 'assets/concert1.png' : 'assets/festival1.png';

        approvedEvents.push({
            id: i,
            title: title,
            category: cat.id,
            date: eventDate.toISOString().split('T')[0],
            time: `${16 + Math.floor(Math.random() * 6)}:00`,
            venue: `Lieu ${i} à ${quartier.label}`,
            quartier: quartier.id,
            lat: quartier.lat + (Math.random() - 0.5) * 0.03,
            lng: quartier.lng + (Math.random() - 0.5) * 0.03,
            price: i % 3 === 0 ? "Gratuit" : `${(Math.floor(Math.random() * 10) + 2) * 1000} FCFA`,
            image: demoImage,
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
    generateSampleData(); // Ensure data exists
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
    renderCharts();
}

function updateStats() {
    document.getElementById('statTotal').textContent = approvedEvents.length;
    document.getElementById('statPending').textContent = pendingEvents.length;
    document.getElementById('pendingCount').textContent = pendingEvents.length;

    const uniqueVenues = new Set(approvedEvents.map(e => e.venue)).size;
    document.getElementById('statVenues').textContent = uniqueVenues;
}

function renderPending() {
    const list = document.getElementById('pendingList');
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

    // Category Chart
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

    // Venue Top 5
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

function closeEdit() {
    document.getElementById('editEventModal').style.display = 'none';
}

function handleEditSubmit(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('editId').value);
    const index = approvedEvents.findIndex(e => e.id === id);

    if (index !== -1) {
        approvedEvents[index].title = document.getElementById('editTitle').value;
        approvedEvents[index].date = document.getElementById('editDate').value;
        approvedEvents[index].venue = document.getElementById('editVenue').value;
        saveData();
        closeEdit();
    }
}

function showTab(tab) {
    const tabs = ['dashboardTab', 'pendingTab', 'eventsTab'];
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

window.handleAdminLogin = handleAdminLogin;
window.showTab = showTab;
window.approveEvent = approveEvent;
window.deletePending = deletePending;
window.deleteApproved = deleteApproved;
window.openEdit = openEdit;
window.closeEdit = closeEdit;
window.handleEditSubmit = handleEditSubmit;
