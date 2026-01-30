// ===================================
// CONFIGURATION DES DONNÉES
// ===================================
const savedCategories = JSON.parse(localStorage.getItem('dakarevents_categories'));
const categories = savedCategories || [
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

// ===================================
// ÉTAT GLOBAL
// ===================================
let eventsData = JSON.parse(localStorage.getItem('dakarevents_events')) || [];
let map = null;
let markers = [];
let userLocation = null;
let currentUser = JSON.parse(localStorage.getItem('dakarevents_user')) || null;

let activeFilters = {
    sidebarCategory: null,
    quartier: null,
    search: '',
    mapCategories: new Set(categories.map(c => c.id))
};
let currentView = 'map';

// ===================================
// INITIALISATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    generateSampleData();
    initUI();
    setupMapLegend();
    renderEvents();
    setupEventListeners();
    const mapBtn = document.getElementById('btnMap');
    if (mapBtn) mapBtn.click(); // Force l'état initial coloré
});

function generateSampleData() {
    if (eventsData.length > 0) return;

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

        eventsData.push({
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
            status: 'approved' // Pour qu'ils soient visibles immédiatement
        });
    }
}

function initUI() {
    // Populate Filters
    const catContainer = document.getElementById('genreFilters');
    categories.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'pill';
        btn.innerHTML = `${c.icon} ${c.label}`;
        btn.onclick = () => toggleSidebarFilter('category', c.id, btn);
        catContainer.appendChild(btn);
    });

    const quartContainer = document.getElementById('quartierFilters');
    quartiers.forEach(q => {
        const btn = document.createElement('button');
        btn.className = 'pill';
        btn.textContent = q.label;
        btn.onclick = () => toggleSidebarFilter('quartier', q.id, btn);
        quartContainer.appendChild(btn);
    });

    // Populate Category Select in Submission Modal
    const pubCatSelect = document.getElementById('pubCategory');
    if (pubCatSelect) {
        pubCatSelect.innerHTML = categories.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');
    }
}

function setupEventListeners() {
    // Proposer événement
    const openSubmit = () => {
        if (!currentUser) {
            document.getElementById('authModal').style.display = 'flex';
        } else {
            document.getElementById('submitEventModal').style.display = 'flex';
        }
    };

    document.getElementById('proposeEventBtn').onclick = openSubmit;
    const topBtn = document.getElementById('proposeEventBtnTop');
    if (topBtn) topBtn.onclick = openSubmit;

    // User Auth Form
    document.getElementById('userAuthForm').onsubmit = (e) => {
        e.preventDefault();
        currentUser = {
            name: document.getElementById('userName').value,
            phone: document.getElementById('userPhone').value
        };
        localStorage.setItem('dakarevents_user', JSON.stringify(currentUser));
        closeModal('authModal');
        document.getElementById('submitEventModal').style.display = 'flex';
    };

    // Public Submit Form
    document.getElementById('publicSubmitForm').onsubmit = (e) => {
        e.preventDefault();
        submitPendingEvent(e);
    };

    // View Switching
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = () => {
            const isMap = btn.dataset.mode === 'map';
            document.querySelectorAll('.view-btn').forEach(b => {
                b.classList.remove('active');
                b.style.opacity = "0.6";
                b.style.boxShadow = "none";
            });

            btn.classList.add('active');
            btn.style.opacity = "1";

            if (isMap) {
                btn.style.background = "var(--primary)"; // Orange
                btn.style.boxShadow = "0 8px 20px rgba(255, 140, 0, 0.5)";
                document.getElementById('btnGrid').style.background = "#00D1FF"; // Keep grid blue but dimmed
            } else {
                btn.style.background = "#00D1FF"; // Electric Blue
                btn.style.boxShadow = "0 8px 20px rgba(0, 209, 255, 0.6)";
                document.getElementById('btnMap').style.background = "var(--primary)"; // Keep map orange but dimmed
            }

            switchView(btn.dataset.mode);
        };
    });

    // Search
    document.getElementById('globalSearch').oninput = (e) => {
        activeFilters.search = e.target.value.toLowerCase();
        renderEvents();
    };

    document.getElementById('nearMeGlobal').onclick = handleLocation;

    // Sidebar Toggle for Mobile
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    if (toggleBtn) {
        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        };
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove('active');
        }
    });
}

// ===================================
// GESTION DES SOUMISSIONS
// ===================================
function submitPendingEvent(e) {
    const file = document.getElementById('pubImage').files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const pendingEvent = {
            id: Date.now(),
            title: document.getElementById('pubTitle').value,
            category: document.getElementById('pubCategory').value,
            date: document.getElementById('pubDate').value,
            venue: document.getElementById('pubVenue').value,
            image: event.target.result,
            status: 'pending', // IMPORTANT: N'est pas encore visible
            submittedBy: currentUser,
            lat: 14.71, lng: -17.44 // Default
        };

        const allPending = JSON.parse(localStorage.getItem('dakarevents_pending')) || [];
        allPending.push(pendingEvent);
        localStorage.setItem('dakarevents_pending', JSON.stringify(allPending));

        alert("Merci ! Votre événement a été envoyé pour validation par l'administrateur.");
        closeModal('submitEventModal');
        e.target.reset();
    };

    if (file) reader.readAsDataURL(file);
    else reader.onload({ target: { result: null } });
}

// ===================================
// FILTRAGE ET RENDU
// ===================================
function renderEvents() {
    // NE MONTRER QUE LES ÉVÉNEMENTS AVEC LE STATUT 'approved' (ou sans statut pour les anciens)
    const filtered = eventsData.filter(e => {
        const isApproved = !e.status || e.status === 'approved';
        const matchSidebarCat = !activeFilters.sidebarCategory || e.category === activeFilters.sidebarCategory;
        const matchMapCat = activeFilters.mapCategories.has(e.category);
        const matchQuartier = !activeFilters.quartier || e.quartier === activeFilters.quartier;
        const matchSearch = !activeFilters.search || e.title.toLowerCase().includes(activeFilters.search);
        return isApproved && matchSidebarCat && matchMapCat && matchQuartier && matchSearch;
    });

    const grid = document.getElementById('gridView');
    if (!grid) return;
    grid.innerHTML = '';

    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-dim);">Aucun événement approuvé pour le moment.</div>';
    }

    filtered.forEach(e => {
        const catInfo = categories.find(c => c.id === e.category) || categories[0];
        const card = document.createElement('div');
        card.className = 'event-card';
        card.style.borderTop = `4px solid ${catInfo.color}`;
        const bgStyle = e.image ? `url('${e.image}')` : `linear-gradient(135deg, ${catInfo.color}22, ${catInfo.color}44)`;

        card.innerHTML = `
            <div class="card-img" style="background-image: ${bgStyle}; background-size: cover; background-position: center;">
                <span class="card-badge" style="background: ${catInfo.color}">${catInfo.icon} ${catInfo.label}</span>
            </div>
            <div class="card-info">
                <h3 class="card-title">${e.title}</h3>
                <div class="card-meta">
                    <div class="meta-item"><span>📅 ${e.date}</span></div>
                    <div class="meta-item"><span>📍 ${e.venue}</span></div>
                </div>
                <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${e.lat},${e.lng}', '_blank')" 
                        style="margin-top: 15px; width: 100%; padding: 10px; border-radius: 10px; border: none; background: #4285F4; color: white; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    Itinéraire Google Maps
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    if (map) updateMapMarkers(filtered);
}

// ... (Gardez le reste des fonctions Map et UI)
function switchView(mode) {
    currentView = mode;
    document.getElementById('gridView').style.display = mode === 'grid' ? 'grid' : 'none';
    document.getElementById('mapView').style.display = mode === 'map' ? 'block' : 'none';
    if (mode === 'map') { initMap(); setTimeout(() => map.invalidateSize(), 150); }
}

function initMap() {
    if (map) return;
    map = L.map('mainMap', { zoomControl: false }).setView([14.71, -17.48], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', { attribution: 'OSM France' }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    document.getElementById('maximizeMapControl').onclick = () => document.getElementById('mapView').classList.toggle('map-fullscreen');
    document.getElementById('mapLocateBtn').onclick = handleLocation;
    setupMapLegend();
    renderEvents();
}

function setupMapLegend() {
    const legendContainer = document.getElementById('legendFilterItems');
    if (!legendContainer) return;
    legendContainer.innerHTML = '';
    categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `<input type="checkbox" id="map-cat-${cat.id}" checked><label for="map-cat-${cat.id}"><span class="dot-indicator" style="background: ${cat.color}"></span> ${cat.icon} ${cat.label}</label>`;
        item.querySelector('input').onchange = (e) => { if (e.target.checked) activeFilters.mapCategories.add(cat.id); else activeFilters.mapCategories.delete(cat.id); renderEvents(); };
        legendContainer.appendChild(item);
    });
}

function updateMapMarkers(data) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    data.forEach(e => {
        const cat = categories.find(c => c.id === e.category) || categories[0];
        const marker = L.circleMarker([e.lat, e.lng], { radius: 12, fillColor: cat.color, color: '#fff', weight: 3, fillOpacity: 1 }).addTo(map);

        marker.bindPopup(`
            <div class="map-popup-custom" style="padding: 10px; min-width: 200px">
                <span style="background:${cat.color}; color:white; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:800; text-transform:uppercase">${cat.icon} ${cat.label}</span>
                <strong style="display:block; margin:12px 0 6px; font-size:16px; color:#1a1e26">${e.title}</strong>
                <p style="font-size:13px; color:#444; margin-bottom:8px">📍 ${e.venue}</p>
                <p style="font-size:12px; color:#666; margin-bottom:12px">📅 ${e.date}</p>
                <div style="font-weight:800; color:${cat.color}; font-size:1.1rem; margin-bottom:12px">${e.price}</div>
                <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${e.lat},${e.lng}', '_blank')" 
                        style="background:#4285F4; color:white; border:none; padding:10px; border-radius:10px; width:100%; cursor:pointer; font-weight:700; display:flex; align-items:center; justify-content:center; gap:8px">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    Itinéraire Google Maps
                </button>
            </div>
        `);
        markers.push(marker);
    });
}

function handleLocation() {
    navigator.geolocation.getCurrentPosition(pos => {
        userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (map) {
            map.setView([userLocation.lat, userLocation.lng], 14);
            L.marker([userLocation.lat, userLocation.lng], { icon: L.divIcon({ className: 'user-pos-marker', html: '<div class="user-pos-pulse"></div>', iconSize: [20, 20] }) }).addTo(map);
        }
    });
}

function toggleSidebarFilter(type, value, btn) {
    const filterKey = type === 'category' ? 'sidebarCategory' : 'quartier';
    if (activeFilters[filterKey] === value) { activeFilters[filterKey] = null; btn.classList.remove('active'); }
    else { activeFilters[filterKey] = value; document.querySelectorAll(`#${type === 'category' ? 'genreFilters' : 'quartierFilters'} .pill`).forEach(p => p.classList.remove('active')); btn.classList.add('active'); }
    renderEvents();
}

function closeModal(id) { document.getElementById(id).style.display = 'none'; }
window.closeModal = closeModal;
