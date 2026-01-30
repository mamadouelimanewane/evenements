// ===================================
// CONFIGURATION & SÉCURITÉ
// ===================================
const ADMIN_CODE = "DAKAR2026";

// Initialisation des données
let categories = JSON.parse(localStorage.getItem('dakarevents_categories')) || [];
let approvedEvents = JSON.parse(localStorage.getItem('dakarevents_events')) || [];
let pendingEvents = JSON.parse(localStorage.getItem('dakarevents_pending')) || [];

// ===================================
// AUTHENTIFICATION
// ===================================
function handleAdminLogin(e) {
    e.preventDefault();
    const pass = document.getElementById('adminPass').value;
    if (pass === ADMIN_CODE) {
        document.getElementById('loginWall').style.display = 'none';
        document.getElementById('adminLayout').style.display = 'grid';
        renderAll();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

// ===================================
// AFFICHAGE
// ===================================
function renderAll() {
    renderPending();
    renderApproved();
}

function renderPending() {
    const list = document.getElementById('pendingList');
    if (!list) return;

    if (pendingEvents.length === 0) {
        list.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">Aucune soumission en attente.</td></tr>';
        return;
    }

    list.innerHTML = pendingEvents.map(e => `
        <tr>
            <td><div class="image-preview" style="background-image: url('${e.image || ''}')"></div></td>
            <td><strong>${e.title}</strong><br><small>${e.venue} | ${e.date}</small></td>
            <td>${e.submittedBy ? e.submittedBy.name : 'Anonyme'}<br><code style="color:var(--admin-accent)">${e.submittedBy ? e.submittedBy.phone : '-'}</code></td>
            <td>
                <button class="action-btn btn-approve" onclick="approveEvent(${e.id})">Approuver ✅</button>
                <button class="action-btn btn-delete" onclick="deletePending(${e.id})">Refuser ❌</button>
            </td>
        </tr>
    `).join('');
}

function renderApproved() {
    const list = document.getElementById('approvedList');
    if (!list) return;

    list.innerHTML = approvedEvents.map(e => `
        <tr>
            <td><div class="image-preview" style="background-image: url('${e.image || ''}')"></div></td>
            <td><strong>${e.title}</strong></td>
            <td>${e.category}</td>
            <td>
                <button class="action-btn btn-delete" onclick="deleteApproved(${e.id})">Supprimer 🗑️</button>
            </td>
        </tr>
    `).join('');
}

// ===================================
// ACTIONS ADMIN
// ===================================
function approveEvent(id) {
    const event = pendingEvents.find(e => e.id === id);
    if (event) {
        event.status = 'approved';
        approvedEvents.unshift(event); // Ajouter aux événements en ligne
        pendingEvents = pendingEvents.filter(e => e.id !== id); // Retirer des attentes
        saveData();
        alert("Événement approuvé et mis en ligne !");
    }
}

function deletePending(id) {
    if (confirm("Refuser et supprimer cette soumission ?")) {
        pendingEvents = pendingEvents.filter(e => e.id !== id);
        saveData();
    }
}

function deleteApproved(id) {
    if (confirm("Supprimer cet événement en ligne ?")) {
        approvedEvents = approvedEvents.filter(e => e.id !== id);
        saveData();
    }
}

function saveData() {
    localStorage.setItem('dakarevents_events', JSON.stringify(approvedEvents));
    localStorage.setItem('dakarevents_pending', JSON.stringify(pendingEvents));
    renderAll();
}

// Tab navigation
function showTab(tab) {
    const tabs = ['pendingTab', 'eventsTab', 'categoriesTab'];
    tabs.forEach(t => document.getElementById(t).style.display = t.startsWith(tab) ? 'block' : 'none');
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase().includes(tab)) btn.classList.add('active');
    });
}

function toggleForm(id) {
    const f = document.getElementById(id);
    f.style.display = f.style.display === 'none' ? 'block' : 'none';
}
