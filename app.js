// ===================================
// CONFIGURATION DES CATÉGORIES (VOTRE LISTE STRATÉGIQUE)
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
// GÉNÉRATEUR D'ÉVÉNEMENTS RÉALISTES
// ===================================
let eventsData = [];

function generateSampleData() {
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
        const titleList = titles[cat.id];
        const title = titleList[Math.floor(Math.random() * titleList.length)] + " #" + i;

        // Spread events over 30 days
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
            description: `Rejoignez-nous pour cet événement exceptionnel de la catégorie ${cat.label}.`
        });
    }
}

// ===================================
// STATE & APP LOGIC
// ===================================
let map = null;
let markers = [];
let userLocation = null;
let activeFilters = { category: null, quartier: null, search: '' };
let currentView = 'grid';
let routingControl = null;

document.addEventListener('DOMContentLoaded', () => {
    generateSampleData();
    initUI();
    renderEvents();
    setupEventListeners();
});

function initUI() {
    // Populate Category Filters
    const catContainer = document.getElementById('genreFilters');
    categories.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'pill';
        btn.innerHTML = `${c.icon} ${c.label}`;
        btn.onclick = () => toggleFilter('category', c.id, btn);
        catContainer.appendChild(btn);
    });

    // Populate Quartier Filters
    const quartContainer = document.getElementById('quartierFilters');
    quartiers.forEach(q => {
        const btn = document.createElement('button');
        btn.className = 'pill';
        btn.textContent = q.label;
        btn.onclick = () => toggleFilter('quartier', q.id, btn);
        quartContainer.appendChild(btn);
    });
}

function setupEventListeners() {
    // View Switching
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            switchView(btn.dataset.mode);
        };
    });

    // Global Search
    document.getElementById('globalSearch').oninput = (e) => {
        activeFilters.search = e.target.value.toLowerCase();
        renderEvents();
    };

    // Location
    document.getElementById('nearMeGlobal').onclick = handleLocation;
}

function toggleFilter(type, value, btn) {
    if (activeFilters[type] === value) {
        activeFilters[type] = null;
        btn.classList.remove('active');
    } else {
        activeFilters[type] = value;
        document.querySelectorAll(`#${type === 'category' ? 'genreFilters' : 'quartierFilters'} .pill`).forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
    }
    renderEvents();
}

function switchView(mode) {
    currentView = mode;
    document.getElementById('gridView').style.display = mode === 'grid' ? 'grid' : 'none';
    document.getElementById('mapView').style.display = mode === 'map' ? 'block' : 'none';

    if (mode === 'map') {
        initMap();
        setTimeout(() => map.invalidateSize(), 150);
    }
}

function renderEvents() {
    const filtered = eventsData.filter(e => {
        const matchCat = !activeFilters.category || e.category === activeFilters.category;
        const matchQuartier = !activeFilters.quartier || e.quartier === activeFilters.quartier;
        const matchSearch = !activeFilters.search || e.title.toLowerCase().includes(activeFilters.search);
        return matchCat && matchQuartier && matchSearch;
    });

    if (currentView === 'grid') {
        const grid = document.getElementById('gridView');
        grid.innerHTML = '';
        filtered.forEach(e => {
            const catInfo = categories.find(c => c.id === e.category);
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
function initMap() {
    if (map) return;
    map = L.map('mainMap', { zoomControl: false }).setView([14.71, -17.48], 12);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB'
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
}

function updateMapMarkers(data) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    data.forEach(e => {
        const cat = categories.find(c => c.id === e.category);
        const marker = L.circleMarker([e.lat, e.lng], {
            radius: 10,
            fillColor: cat.color,
            color: '#fff',
            weight: 2,
            fillOpacity: 0.9
        }).addTo(map);

        marker.bindPopup(`
            <div class="map-popup-custom" style="padding: 10px; min-width: 200px">
                <span style="background:${cat.color}; color:white; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:700; text-transform:uppercase">${cat.label}</span>
                <strong style="display:block; margin:8px 0 4px; font-size:14px">${e.title}</strong>
                <p style="font-size:12px; color:#666; margin-bottom:12px">📍 ${e.venue}</p>
                <button onclick="parent.startNavigation(${e.lat}, ${e.lng}, '${e.title.replace(/'/g, "\\'")}')" 
                        style="background:${cat.color}; color:white; border:none; padding:8px; border-radius:8px; width:100%; cursor:pointer; font-weight:700">
                    S'y rendre (Navigation)
                </button>
            </div>
        `);
        markers.push(marker);
    });
}

function handleLocation() {
    if (!navigator.geolocation) return alert("Géolocalisation non supportée");

    document.getElementById('nearMeGlobal').textContent = "Localisation...";

    navigator.geolocation.getCurrentPosition(pos => {
        userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        document.getElementById('nearMeGlobal').innerHTML = '✅ Position Trouvée';

        if (map) {
            map.setView([userLocation.lat, userLocation.lng], 14);
            L.marker([userLocation.lat, userLocation.lng], {
                icon: L.divIcon({
                    className: 'user-pos',
                    html: '<div style="background:#2ECC71; width:12px; height:12px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px #2ECC71"></div>'
                })
            }).addTo(map);
        }
    }, () => {
        alert("Impossible de vous localiser.");
    });
}

// Global function for Leaflet Popup
window.startNavigation = function (lat, lng, name) {
    if (!userLocation) {
        alert("Veuillez d'abord cliquer sur 'Autour de moi' dans la barre latérale.");
        return;
    }

    if (routingControl) map.removeControl(routingControl);

    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(userLocation.lat, userLocation.lng),
            L.latLng(lat, lng)
        ],
        lineOptions: { styles: [{ color: '#2ECC71', opacity: 0.7, weight: 6 }] },
        createMarker: () => null,
        show: false
    }).addTo(map);

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    if (confirm(`Calcul de l'itinéraire vers "${name}"... Voulez-vous ouvrir Google Maps pour le guidage vocal ?`)) {
        window.open(googleMapsUrl, '_blank');
    }
};
