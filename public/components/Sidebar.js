/**
 * Sidebar.js — Unified dashboard sidebar component
 * native Custom Web Component (<dashboard-sidebar>)
 */
class DashboardSidebar extends HTMLElement {
  connectedCallback() {
    this.style.display = 'contents';
    const type = this.getAttribute('type') || 'user'; // 'artist' or 'user'
    
    // Session status
    let currentUser = {};
    try {
      currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (typeof currentUser !== 'object' || Array.isArray(currentUser)) currentUser = {};
    } catch(e) {
      currentUser = {};
    }

    const currentPath = window.location.pathname.split('/').pop() || 'dashboard';

    // Active checks
    const isOverview = currentPath === 'dashboard';
    const isArtistOverview = currentPath === 'artist-home';
    const isArtistGallery = currentPath === 'artist-gallery';
    const isArtistUpload = currentPath === 'dashboard-artists';
    const isArtistPortfolio = currentPath === 'artist-portfolio' || (currentPath === 'artist-home' && window.location.hash === '#portfolio');
    const isArtistSettings = currentPath === 'artist-settings';
    const isCommissions = currentPath === 'dashboard-commissions';
    const isWorkshops = currentPath === 'dashboard-workshops';

    let menuHtml = '';
    let profileName = 'Art Lover';
    let profileRole = 'Collector';
    let profileImg = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';
    let logoutAction = 'DashboardSidebar.logoutUser()';

    if (type === 'artist') {
      profileName = currentUser.fullName || 'Artist';
      profileRole = (currentUser.spec || 'Master') + ' Artist';
      profileImg = 'pics/user_profile.png';
      logoutAction = 'DashboardSidebar.logoutArtist()';

      // Load specific artist profile overrides if present
      if (currentUser.email) {
        const storedProfile = localStorage.getItem('artist_profile_' + currentUser.email);
        if (storedProfile) {
          try {
            const profile = JSON.parse(storedProfile);
            if (profile.displayName) profileName = profile.displayName;
            if (profile.specialization) profileRole = profile.specialization + ' Artist';
            if (profile.photoUrl) profileImg = profile.photoUrl;
          } catch(e) {}
        }
      }

      menuHtml = `
        <div class="px-8 mb-4 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">Studio Menu</div>
        <a href="artist-home" class="sidebar-item ${isArtistOverview ? 'active' : ''} flex items-center gap-4 px-8 py-4 text-stone-600 hover:text-[#B5451B] transition-all">
          <span class="material-symbols-outlined">home</span>
          <span class="text-sm font-medium">Home</span>
        </a>
        <a href="artist-gallery" class="sidebar-item ${isArtistGallery ? 'active' : ''} flex items-center gap-4 px-8 py-4 text-stone-600 hover:text-[#B5451B] transition-all">
          <span class="material-symbols-outlined">dashboard</span>
          <span class="text-sm font-medium">Gallery</span>
        </a>
        <a href="dashboard-artists" class="sidebar-item ${isArtistUpload ? 'active' : ''} flex items-center gap-4 px-8 py-4 text-stone-600 hover:text-[#B5451B] transition-all">
          <span class="material-symbols-outlined">cloud_upload</span>
          <span class="text-sm font-medium">Upload Artwork</span>
        </a>
        <a href="artist-home#portfolio" class="sidebar-item ${isArtistPortfolio ? 'active' : ''} flex items-center gap-4 px-8 py-4 text-stone-600 hover:text-[#B5451B] transition-all">
          <span class="material-symbols-outlined">account_circle</span>
          <span class="text-sm font-medium">Portfolio</span>
        </a>
        <a href="artist-settings" class="sidebar-item ${isArtistSettings ? 'active' : ''} flex items-center gap-4 px-8 py-4 text-stone-600 hover:text-[#B5451B] transition-all">
          <span class="material-symbols-outlined">settings</span>
          <span class="text-sm font-medium">Settings</span>
        </a>
      `;
    } else {
      // User / Collector
      profileName = currentUser.fullName || 'Sathwik';
      profileRole = 'Patron of the Arts';
      profileImg = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';
      logoutAction = 'DashboardSidebar.logoutUser()';

      menuHtml = `
        <div class="px-8 mb-4 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">Main Menu</div>
        <a href="dashboard" class="sidebar-item ${isOverview ? 'active' : ''} flex items-center gap-4 px-8 py-4 text-stone-600 hover:text-[#B5451B] transition-all">
          <span class="material-symbols-outlined">dashboard</span>
          <span class="text-sm font-medium">Overview</span>
        </a>
        <a href="explore" class="sidebar-item flex items-center gap-4 px-8 py-4 text-stone-600 hover:text-[#B5451B] transition-all">
          <span class="material-symbols-outlined">palette</span>
          <span class="text-sm font-medium">Arts</span>
        </a>
        <a href="dashboard-commissions" class="sidebar-item ${isCommissions ? 'active' : ''} flex items-center gap-4 px-8 py-4 text-stone-600 hover:text-[#B5451B] transition-all">
          <span class="material-symbols-outlined">history_edu</span>
          <span class="text-sm font-medium">My Commissions</span>
        </a>
        <a href="dashboard-workshops" class="sidebar-item ${isWorkshops ? 'active' : ''} flex items-center gap-4 px-8 py-4 text-stone-600 hover:text-[#B5451B] transition-all">
          <span class="material-symbols-outlined">event_available</span>
          <span class="text-sm font-medium">Workshops</span>
        </a>
        <div class="px-8 mt-12 mb-4 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">Discovery</div>
        <a href="index#living-map-section" class="sidebar-item flex items-center gap-4 px-8 py-4 text-stone-600 hover:text-[#B5451B] transition-all">
          <span class="material-symbols-outlined">map</span>
          <span class="text-sm font-medium">Interactive Map</span>
        </a>
        <a href="index#journal" class="sidebar-item flex items-center gap-4 px-8 py-4 text-stone-600 hover:text-[#B5451B] transition-all">
          <span class="material-symbols-outlined">auto_stories</span>
          <span class="text-sm font-medium">Heritage Journal</span>
        </a>
      `;
    }

    const htmlContent = `
      <!-- Desktop Sidebar -->
      <aside class="w-64 glass-panel border-r border-stone-200 hidden lg:flex flex-col z-50 shrink-0">
        <div class="p-8 border-b border-stone-100 flex items-center gap-3">
          <img src="pics/logoo.png" alt="Logo" class="h-10 w-auto object-contain" />
          <a href="index" class="font-serif italic font-bold text-sm tracking-tight text-[#1A1208]">The Painted Muse</a>
        </div>
        <nav class="flex-1 py-8 overflow-y-auto no-scrollbar">
          ${menuHtml}
        </nav>
        <div class="p-8 border-t border-stone-100">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center overflow-hidden shrink-0">
              <img src="${profileImg}" alt="User Avatar" class="w-full h-full object-cover">
            </div>
            <div class="min-w-0">
              <div class="text-xs font-bold text-[#1A1208] truncate">${profileName}</div>
              <div class="text-[9px] text-stone-500 truncate uppercase tracking-widest">${profileRole}</div>
            </div>
          </div>
          <button onclick="${logoutAction}"
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all text-sm font-medium">
            <span class="material-symbols-outlined text-[18px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Mobile Menu Sidebar Overlay -->
      <div id="mobile-sidebar-drawer" class="fixed inset-0 z-[100] bg-black/40 hidden lg:hidden">
        <div class="w-64 bg-[#FDFBF7] h-full flex flex-col relative shadow-2xl animate-slide-in">
          <div class="p-6 border-b border-stone-100 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <img src="pics/logoo.png" alt="Logo" class="h-10 w-auto object-contain" />
              <span class="font-serif italic font-bold text-xs">The Painted Muse</span>
            </div>
            <button id="close-mobile-sidebar-btn" class="text-stone-900 p-1">
              <span class="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
          <nav class="flex-1 py-6 overflow-y-auto no-scrollbar">
            ${menuHtml}
          </nav>
          <div class="p-6 border-t border-stone-100 bg-[#F5F0E8]/50">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center overflow-hidden shrink-0">
                <img src="${profileImg}" alt="User Avatar" class="w-full h-full object-cover">
              </div>
              <div class="min-w-0">
                <div class="text-xs font-bold text-[#1A1208] truncate">${profileName}</div>
                <div class="text-[9px] text-stone-500 truncate uppercase tracking-widest">${profileRole}</div>
              </div>
            </div>
            <button onclick="${logoutAction}"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all text-sm font-medium">
              <span class="material-symbols-outlined text-[18px]">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    `;

    this.innerHTML = htmlContent;

    // Attach Toggle Behavior for Mobile Sidebar Menu
    const mobileDrawer = this.querySelector('#mobile-sidebar-drawer');
    const closeDrawerBtn = this.querySelector('#close-mobile-sidebar-btn');
    const menuToggleBtns = document.querySelectorAll('.mobile-menu-btn-toggle');

    if (menuToggleBtns && mobileDrawer) {
      menuToggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          mobileDrawer.classList.remove('hidden');
          mobileDrawer.classList.add('flex');
        });
      });
    }

    if (closeDrawerBtn && mobileDrawer) {
      closeDrawerBtn.addEventListener('click', () => {
        mobileDrawer.classList.add('hidden');
        mobileDrawer.classList.remove('flex');
      });
    }

    if (mobileDrawer) {
      // Close drawer if clicking backdrop
      mobileDrawer.addEventListener('click', (e) => {
        if (e.target === mobileDrawer) {
          mobileDrawer.classList.add('hidden');
          mobileDrawer.classList.remove('flex');
        }
      });
    }
  }

  static logoutArtist() {
    if (confirm('Sign out of your artist studio?')) {
      localStorage.removeItem('artistLoggedIn');
      localStorage.removeItem('artistEmail');
      localStorage.removeItem('currentUser');
      window.location.href = 'signin';
    }
  }

  static logoutUser() {
    if (confirm('Sign out of your art collector account?')) {
      localStorage.removeItem('userLoggedIn');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('currentUser');
      window.location.href = 'user-signin';
    }
  }
}

customElements.define('dashboard-sidebar', DashboardSidebar);
