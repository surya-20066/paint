// Dynamic Admin Dashboard Logic

// Old login override removed since it is natively in admin-dashboard.ejs

function handleSignOut() {
    fetch('/api/admin/logout', { method: 'POST' }).then(() => {
        checkAuth();
    });
}

function initDashboardData() {
    const dateOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    document.getElementById('current-date').textContent = "Platform-wide overview • " + new Date().toLocaleDateString("en-IN", dateOptions);
    
    const searchInput = document.getElementById('artist-search-input');
    if (searchInput) {
        const newSearchInput = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(newSearchInput, searchInput);
        newSearchInput.addEventListener('keyup', () => {
            renderArtists(currentFilter, newSearchInput.value);
        });
    }
    refreshDashboard();
}

function refreshDashboard() {
    renderStats();
    renderArtists(currentFilter);
    renderUsers();
    renderPayments();
}

function renderStats() {
    fetch('/api/admin/stats').then(r => r.json()).then(data => {
        if (!data.success) return;
        document.getElementById('stat-total-artists').textContent = data.totalArtists;
        document.getElementById('stat-total-users').textContent = data.totalUsers;
        document.getElementById('stat-pending-approvals').textContent = data.pendingApprovals;
        document.getElementById('stat-verified-artists').textContent = data.verifiedArtists;
        
        document.getElementById('filter-count-all').textContent = data.totalArtists;
        document.getElementById('filter-count-pending').textContent = data.pendingApprovals;
        document.getElementById('filter-count-approved').textContent = data.verifiedArtists;
        
        const sidebarBadge = document.getElementById('sidebar-pending-badge');
        if (sidebarBadge) {
            if (data.pendingApprovals > 0) {
                sidebarBadge.textContent = data.pendingApprovals;
                sidebarBadge.classList.remove('hidden');
            } else {
                sidebarBadge.classList.add('hidden');
            }
        }
    });
}

const artSpecNames = {
    tanjore: "Tanjore Painting",
    mithila: "Mithila (Madhubani)",
    warli: "Warli Art",
    pattachitra: "Pattachitra"
};

function getSpecDisplayName(spec) {
    if (!spec) return "Mithila (Madhubani)";
    return artSpecNames[spec.toLowerCase()] || spec;
}

function renderArtists(filter, query = '') {
    fetch(`/api/admin/artists?status=${filter}`).then(r => r.json()).then(data => {
        if (!data.success) return;
        let artists = data.artists;
        
        if (query.trim()) {
            const q = query.toLowerCase();
            artists = artists.filter(a => {
                const nameVal = a.fullName || a.name || '';
                const specVal = a.specialization || '';
                return nameVal.toLowerCase().includes(q) || specVal.toLowerCase().includes(q) || getSpecDisplayName(specVal).toLowerCase().includes(q);
            });
        }
        
        const container = document.getElementById('artist-list-container');
        if (!container) return;
        container.innerHTML = '';
        
        if (artists.length === 0) {
            container.innerHTML = '<div class="bg-bg rounded-2xl p-8 text-center"><p class="text-ink-muted">No artists found.</p></div>';
            return;
        }
        
        artists.forEach(artist => {
            const initial = (artist.fullName || artist.name || 'A').charAt(0).toUpperCase();
            const status = artist.isApproved ? 'APPROVED' : 'PENDING';
            let cardClass = "bg-bg rounded-2xl border transition-smooth shadow-soft w-full ";
            let statusBadge = "";
            if (status === 'PENDING') {
                cardClass += "border-warning/30";
                statusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-warning/20 text-[#d97706]">PENDING</span>`;
            } else if (status === 'APPROVED') {
                cardClass += "border-ink/10 hover:border-saffron-dark/20";
                statusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success/20 text-success">APPROVED</span>`;
            }

            let actionButtons = "";
            if (status === 'PENDING') {
                actionButtons = `
                <button onclick="updateArtistStatus('${artist._id}', 'APPROVED')" class="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-success/10 text-success hover:bg-success/20 border border-success/20 transition-colors">
                <i data-lucide="check-circle" class="w-4 h-4"></i> Approve
                </button>
                <button onclick="updateArtistStatus('${artist._id}', 'REJECTED')" class="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 transition-colors">
                <i data-lucide="x-circle" class="w-4 h-4"></i> Reject
                </button>
                `;
            } else if (status === 'APPROVED') {
                actionButtons = `
                <button onclick="updateArtistStatus('${artist._id}', 'REJECTED')" class="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-warning/10 text-warning hover:bg-warning/20 border border-warning/20 transition-colors">
                <i data-lucide="x-circle" class="w-4 h-4"></i> Revoke
                </button>
                `;
            }

            const item = document.createElement('div');
            item.className = cardClass;
            item.innerHTML = `
                <div class="p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div class="w-12 h-12 rounded-xl ${status === 'PENDING' ? 'bg-warning/20 text-[#d97706]' : 'bg-success/20 text-success'} flex items-center justify-center font-bold text-lg flex-shrink-0">
                        ${initial}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <p class="text-ink font-semibold truncate text-lg">${artist.fullName || artist.name || 'Unknown'}</p>
                            ${statusBadge}
                        </div>
                        <p class="text-ink-muted text-sm">${getSpecDisplayName(artist.specialization)} • ${artist.location || artist.state || 'India'}</p>
                        <p class="text-xs text-ink-muted/60 mt-1">Email: ${artist.email} | Joined: ${new Date(artist.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0 flex-wrap w-full md:w-auto mt-4 md:mt-0">
                        ${actionButtons}
                        <button onclick="deleteArtist('${artist.email}')" class="w-9 h-9 rounded-lg flex items-center justify-center text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete Artist">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(item);
        });
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });
}

function updateArtistStatus(id, status) {
    fetch(`/api/admin/artists/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    }).then(r => r.json()).then(data => {
        if(data.success) {
            showCmsToast('Artist status updated');
            refreshDashboard();
        }
    });
}

function renderUsers() {
    fetch('/api/admin/users').then(r => r.json()).then(data => {
        if (!data.success) return;
        const tableBody = document.getElementById('user-table-body');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        
        data.users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="p-4">${user.fullName || 'User'}</td>
                <td class="p-4">${user.email}</td>
                <td class="p-4">${new Date(user.createdAt).toLocaleDateString()}</td>
                <td class="p-4 text-right"></td>
            `;
            tableBody.appendChild(tr);
        });
    });
}

// Ensure the auth check runs on load
document.addEventListener('DOMContentLoaded', checkAuth);

// Override the old checkAuth immediately
checkAuth();

// CRUD Overrides
window.saveNewArtist = function(e) {
    e.preventDefault();
    const name = document.getElementById('new-artist-name').value.trim();
    const email = document.getElementById('new-artist-email').value.trim();
    const password = document.getElementById('new-artist-password').value || 'Heritage@2025';
    const spec = document.getElementById('new-artist-spec').value;
    const location = document.getElementById('new-artist-state').value.trim() || 'Bihar';
    const status = document.getElementById('new-artist-status').value;

    fetch('/api/admin/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, email, password, specialization: spec, location: location, status: status })
    }).then(r => r.json()).then(data => {
        if(data.success) {
            document.getElementById('add-artist-form').reset();
            document.getElementById('add-artist-form-container').classList.add('hidden');
            refreshDashboard();
            showCmsToast('Artist added to Database!');
        } else {
            alert(data.message || 'Error saving artist');
        }
    });
};

window.saveNewUser = function(e) {
    e.preventDefault();
    const name = document.getElementById('new-user-name').value.trim();
    const email = document.getElementById('new-user-email').value.trim();

    fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, email, password: 'User@123' })
    }).then(r => r.json()).then(data => {
        if(data.success) {
            document.getElementById('add-user-form').reset();
            document.getElementById('add-user-form-container').classList.add('hidden');
            refreshDashboard();
            showCmsToast('User added to Database!');
        } else {
            alert(data.message || 'Error saving user');
        }
    });
};

window.deleteArtist = function(email) {
    if (confirm(`Are you sure you want to delete the artist with email: ${email}?`)) {
        fetch(`/api/admin/artists/${encodeURIComponent(email)}`, {
            method: 'DELETE'
        }).then(r => r.json()).then(data => {
            if(data.success) {
                showCmsToast('Artist deleted!');
                refreshDashboard();
            } else {
                alert(data.message || 'Error deleting artist');
            }
        });
    }
};

window.deleteUser = function(email) {
    if (confirm(`Are you sure you want to delete the user with email: ${email}?`)) {
        fetch(`/api/admin/users/${encodeURIComponent(email)}`, {
            method: 'DELETE'
        }).then(r => r.json()).then(data => {
            if(data.success) {
                showCmsToast('User deleted!');
                refreshDashboard();
            } else {
                alert(data.message || 'Error deleting user');
            }
        });
    }
};

function renderPayments() {
    fetch('/api/admin/payments')
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;
            const tbody = document.getElementById('payments-table-body');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            if (data.payments.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-ink-muted">No payments found.</td></tr>`;
                return;
            }
            
            data.payments.forEach(payment => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-cream/30 transition-colors';
                
                let statusBadge = '';
                if (payment.status === 'COMPLETED') {
                    statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success/20 text-success">Completed</span>';
                } else if (payment.status === 'PENDING') {
                    statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-warning/20 text-[#d97706]">Pending</span>';
                } else {
                    statusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-destructive/20 text-destructive">${payment.status}</span>`;
                }
                
                tr.innerHTML = `
                    <td class="p-4 text-sm font-mono text-ink-muted">${payment.transactionId}</td>
                    <td class="p-4 text-sm font-medium text-ink">₹${payment.amount.toLocaleString('en-IN')}</td>
                    <td class="p-4 text-sm text-ink">${payment.customerName}</td>
                    <td class="p-4">${statusBadge}</td>
                `;
                tbody.appendChild(tr);
            });
        });
}
