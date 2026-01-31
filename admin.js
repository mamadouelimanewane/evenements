const ADMIN_CODE = "DAKAR2026";

let categories = JSON.parse(localStorage.getItem('dakarevents_categories')) || [];
let approvedEvents = JSON.parse(localStorage.getItem('dakarevents_events')) || [];
let pendingEvents = JSON.parse(localStorage.getItem('dakarevents_pending')) || [];

let adminSearchTerm = '';

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

    catContainer.innerHTML = catStats.map(s => `
        <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 100px; font-size: 0.75rem; color: var(--text-dim); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${s.label}</div>
            <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden;">
                <div style="width: ${approvedEvents.length > 0 ? (s.count / approvedEvents.length * 100) : 0}%; height: 100%; background: ${s.color};"></div>
            </div>
            <div style="width: 25px; font-weight: 700; text-align: right; font-size: 0.8rem;">${s.count}</div>
        </div>
    `).join('');

    // Venue Top 5
    const venues = {};
    approvedEvents.forEach(e => venues[e.venue] = (venues[e.venue] || 0) + 1);
    const topVenues = Object.entries(venues).sort((a, b) => b[1] - a[1]).slice(0, 5);

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
    tabs.forEach(t => document.getElementById(t).style.display = t.startsWith(tab) ? 'block' : 'none');

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
