// ===================================
// CONFIGURATION DES CATÉGORIES
// ===================================
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

// ===================================
// ÉTAT GLOBAL
// ===================================
let eventsData = [];
let map = null;
let markers = [];
let userLocation = null;
let activeFilters = {
    sidebarCategory: null,
    quartier: null,
    search: '',
    mapCategories: new Set(categories.map(c => c.id)) // Toutes cochées par défaut
};
let currentView = 'grid';

// ===================================
// GÉNÉRATION DE DONNÉES
// ===================================
function generateSampleData() {
    const titles = {
        culture: ["Exposition Art", "Théâtre Sorano", "Slam Dakar", "Ciné Nomade"],
        sports: ["Yoga Plage", "Marathon Dakar", "Lutte Traditionnelle", "Surf Ngor"],
        gastronomie: ["Grand Thiéboudienne", "Street Food", "Atelier Cuisine", "Mafé Fusion"],
        education: ["Tech Dakar", "Coding Bootcamp", "Salon Emploi", "Entrepreneuriat"],
        religieux: ["Sabar", "Veillée Traditionnelle", "Gamou", "Inter-Religieuse"],
        famille: ["Atelier Enfants", "Guignol Sénégalais", "Parc Hann", "Musée Kids"],
        environnement: ["Set Setal", "Nettoyage Yoff", "Conf Écologie", "Marché Bio"],
        business: ["Startup Weekend", "Networking", "Pitch Dakar", "Innovation"],
        mode: ["Fashion Week", "Pop-up Store", "Atelier Wax", "Défilé Design"],
        patrimoine: ["Gorée Visit", "Plateau Arch", "Lac Rose", "Théodore Monod"]
    };

    const today = new Date();
    for (let i = 1; i <= 150; i++) {
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const quartier = quartiers[Math.floor(Math.random() * quartiers.length)];
        const title = titles[cat.id][Math.floor(Math.random() * titles[cat.id].length)] + " #" + i;
        const eventDate = new Date();
        eventDate.setDate(today.getDate() + Math.floor(Math.random() * 30));

        eventsData.push({
            id: i, title, category: cat.id,
            date: eventDate.toISOString().split('T')[0],
            time: `${16 + Math.floor(Math.random() * 6)}:00`,
            venue: `Lieu ${i} à ${quartier.label}`,
            quartier: quartier.id,
            lat: quartier.lat + (Math.random() - 0.5) * 0.03,
            lng: quartier.lng + (Math.random() - 0.5) * 0.03,
            price: i % 3 === 0 ? "Gratuit" : `${(Math.floor(Math.random() * 10) + 2) * 1000} FCFA`
        });
    }
}

// ===================================
// INITIALISATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    generateSampleData();
    initUI();
    setupMapLegend(); // Initialiser la légende tout de suite
    renderEvents();
    setupEventListeners();
});

function initUI() {
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
}

function setupMapLegend() {
    const legendContainer = document.getElementById('legendFilterItems');
    if (!legendContainer) return;
    legendContainer.innerHTML = '';

    categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <input type="checkbox" id="map-cat-${cat.id}" checked>
            <label for="map-cat-${cat.id}">
                <span class="dot-indicator" style="background: ${cat.color}"></span>
                ${cat.icon} ${cat.label}
            </label>
        `;
        const checkbox = item.querySelector('input');
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) activeFilters.mapCategories.add(cat.id);
            else activeFilters.mapCategories.delete(cat.id);
            renderEvents();
        });
        legendContainer.appendChild(item);
    });
}

function setupEventListeners() {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            switchView(btn.dataset.mode);
        };
    });

    document.getElementById('globalSearch').oninput = (e) => {
        activeFilters.search = e.target.value.toLowerCase();
        renderEvents();
    };

    document.getElementById('nearMeGlobal').onclick = handleLocation;
}

// ===================================
// LOGIQUE DE FILTRE ET AFFICHAGE
// ===================================
function toggleSidebarFilter(type, value, btn) {
    const filterKey = type === 'category' ? 'sidebarCategory' : 'quartier';
    if (activeFilters[filterKey] === value) {
        activeFilters[filterKey] = null;
        btn.classList.remove('active');
    } else {
        activeFilters[filterKey] = value;
        document.querySelectorAll(`#${type === 'category' ? 'genreFilters' : 'quartierFilters'} .pill`).forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
    }
    renderEvents();
}

function renderEvents() {
    const filtered = eventsData.filter(e => {
        const matchSidebarCat = !activeFilters.sidebarCategory || e.category === activeFilters.sidebarCategory;
        const matchMapCat = activeFilters.mapCategories.has(e.category);
        const matchQuartier = !activeFilters.quartier || e.quartier === activeFilters.quartier;
        const matchSearch = !activeFilters.search || e.title.toLowerCase().includes(activeFilters.search);
        return matchSidebarCat && matchMapCat && matchQuartier && matchSearch;
    });

    // Rendu Grille
    const grid = document.getElementById('gridView');
    if (grid) {
        grid.innerHTML = '';
        filtered.forEach(e => {
            const catInfo = categories.find(c => c.id === e.category) || categories[0];
            const card = document.createElement('div');
            card.className = 'event-card';
            card.style.borderTop = `4px solid ${catInfo.color}`;
            card.innerHTML = `
                <div class="card-img" style="background: linear-gradient(135deg, ${catInfo.color}22, ${catInfo.color}44)">
                    <span class="card-badge" style="background: ${catInfo.color}">${catInfo.icon} ${catInfo.label}</span>
                </div>
                <div class="card-info">
                    <h3 class="card-title">${e.title}</h3>
                    <div class="card-meta">
                        <div class="meta-item"><span>📅 ${e.date} • ${e.time}</span></div>
                        <div class="meta-item"><span>📍 ${e.venue}</span></div>
                        <div class="meta-item" style="margin-top:8px">
                            <span style="color: ${catInfo.color}; font-weight: 800; font-size: 1rem">${e.price}</span>
                        </div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    if (map) updateMapMarkers(filtered);
}

// ===================================
// MAP & NAVIGATION
// ===================================
function switchView(mode) {
    currentView = mode;
    document.getElementById('gridView').style.display = mode === 'grid' ? 'grid' : 'none';
    document.getElementById('mapView').style.display = mode === 'map' ? 'block' : 'none';
    if (mode === 'map') {
        initMap();
        setTimeout(() => map.invalidateSize(), 150);
    }
}

function initMap() {
    if (map) return;
    map = L.map('mainMap', { zoomControl: false }).setView([14.71, -17.48], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution: 'OpenStreetMap France',
        maxZoom: 20
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    document.getElementById('maximizeMapControl').onclick = toggleMapFullscreen;
    document.getElementById('mapLocateBtn').onclick = handleLocation;
    renderEvents(); // Charger les marqueurs initiaux
}

function updateMapMarkers(data) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    data.forEach(e => {
        const cat = categories.find(c => c.id === e.category) || categories[0];
        const marker = L.circleMarker([e.lat, e.lng], {
            radius: 12, fillColor: cat.color, color: '#fff', weight: 3, fillOpacity: 1
        }).addTo(map);

        marker.bindPopup(`
            <div class="map-popup-custom" style="padding: 10px; min-width: 200px">
                <span style="background:${cat.color}; color:white; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:800; text-transform:uppercase">${cat.icon} ${cat.label}</span>
                <strong style="display:block; margin:12px 0 6px; font-size:16px; color:#1a1e26">${e.title}</strong>
                <p style="font-size:13px; color:#444; margin-bottom:12px">📍 ${e.venue}</p>
                <div style="font-weight:800; color:${cat.color}; font-size:1.1rem; margin-bottom:12px">${e.price}</div>
                <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${e.lat},${e.lng}', '_blank')" 
                        style="background:#4285F4; color:white; border:none; padding:10px; border-radius:10px; width:100%; cursor:pointer; font-weight:700; display:flex; align-items:center; justify-content:center; gap:8px">
                    Itinéraire Google Maps
                </button>
            </div>
        `);
        markers.push(marker);
    });
}

function handleLocation() {
    if (!navigator.geolocation) return alert("Géolocalisation non supportée");
    navigator.geolocation.getCurrentPosition(pos => {
        userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (map) {
            map.setView([userLocation.lat, userLocation.lng], 14);
            L.marker([userLocation.lat, userLocation.lng], {
                icon: L.divIcon({
                    className: 'user-pos-marker',
                    html: '<div class="user-pos-pulse"></div>',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            }).addTo(map);
        }
    });
}

function toggleMapFullscreen() {
    document.getElementById('mapView').classList.toggle('map-fullscreen');
    setTimeout(() => { if (map) map.invalidateSize(); }, 300);
}
