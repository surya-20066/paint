/**
 * Navbar.js — Unified frosted-glass header navbar component
 * native Custom Web Component (<app-navbar>)
 */
class AppNavbar extends HTMLElement {
  connectedCallback() {
    const mode = this.getAttribute('mode') || 'sticky';
    const isFloating = mode === 'floating';

    // Session status
    const artistLoggedIn = localStorage.getItem('artistLoggedIn') === 'true';
    const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    
    // Silent Session Sync
    if (artistLoggedIn || userLoggedIn) {
      fetch('/auth/status').then(res => res.json()).then(data => {
        if (!data.loggedIn) {
          localStorage.removeItem('artistLoggedIn');
          localStorage.removeItem('userLoggedIn');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('artistEmail');
          localStorage.removeItem('currentUser');
          window.location.reload();
        }
      }).catch(() => {});
    }
    
    // Active link highlighting
    const currentPath = window.location.pathname.split('/').pop() || '';

    const isHome = currentPath === '' || currentPath === '/';
    const isAbout = window.location.hash === '#about-india';
    const isStories = window.location.hash === '#journal';
    const isRetreats = currentPath === 'art-retreats' || currentPath === 'explore';
    const isTeam = currentPath === 'team';
    
    // Check if we are on a portal/dashboard route
    const isPortal = currentPath.includes('dashboard') || currentPath.includes('artist-') || currentPath.includes('artists');

    let authButtonsHtml = '';
    let mobileAuthButtonsHtml = '';

    if (artistLoggedIn) {
      authButtonsHtml = `
        <button onclick="window.location.href='/artist-home'"
                class="hidden sm:block whitespace-nowrap font-sans text-[10px] font-bold uppercase tracking-wider bg-[#B5451B] text-white px-6 py-2.5 hover:bg-[#D4AF37] transition-all shadow-md">
          Artist Studio
        </button>
        <button onclick="AppNavbar.logoutArtist()"
                class="hidden sm:block whitespace-nowrap font-sans text-[10px] font-bold uppercase tracking-wider text-stone-900 px-6 py-2.5 border border-stone-900 hover:bg-stone-50 transition-colors">
          Sign Out
        </button>
      `;
      mobileAuthButtonsHtml = `
        <button onclick="window.location.href='/artist-home'"
                class="w-full py-3.5 bg-[#B5451B] text-white font-sans text-xs font-bold uppercase tracking-widest">
          Artist Studio
        </button>
        <button onclick="AppNavbar.logoutArtist()"
                class="w-full py-3.5 border border-stone-900 font-sans text-xs font-bold uppercase tracking-widest">
          Sign Out
        </button>
      `;
    } else if (userLoggedIn) {
      authButtonsHtml = `
        <button onclick="window.location.href='/dashboard'"
                class="hidden sm:block whitespace-nowrap font-sans text-[10px] font-bold uppercase tracking-wider bg-[#1A1208] text-white px-6 py-2.5 hover:bg-stone-800 transition-all shadow-lg">
          My Dashboard
        </button>
        <button onclick="AppNavbar.logoutUser()"
                class="hidden sm:block whitespace-nowrap font-sans text-[10px] font-bold uppercase tracking-wider text-stone-900 px-6 py-2.5 border border-stone-900 hover:bg-stone-50 transition-colors">
          Sign Out
        </button>
      `;
      mobileAuthButtonsHtml = `
        <button onclick="window.location.href='/dashboard'"
                class="w-full py-3.5 bg-[#1A1208] text-white font-sans text-xs font-bold uppercase tracking-widest">
          My Dashboard
        </button>
        <button onclick="AppNavbar.logoutUser()"
                class="w-full py-3.5 border border-stone-900 font-sans text-xs font-bold uppercase tracking-widest">
          Sign Out
        </button>
      `;
    } else {
      authButtonsHtml = `
        <button onclick="window.location.href='/signin'"
                class="hidden sm:block whitespace-nowrap font-sans text-[10px] font-bold uppercase tracking-wider text-stone-900 px-5 py-2.5 border border-stone-900 hover:bg-stone-50 transition-colors">
          Artist Login
        </button>
        <button onclick="window.location.href='/user-signin'"
                class="hidden lg:flex whitespace-nowrap font-sans text-[10px] font-bold uppercase tracking-wider bg-[#1A1208] text-white px-5 py-2.5 hover:bg-stone-800 transition-all shadow-lg items-center gap-2 group">
          Book Artist
          <span class="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      `;
      mobileAuthButtonsHtml = `
        <button onclick="window.location.href='/signin'"
                class="w-full py-3.5 border border-stone-900 font-sans text-xs font-bold uppercase tracking-widest">
          Artist Login
        </button>
        <button onclick="window.location.href='/user-signin'"
                class="w-full py-3.5 bg-[#1A1208] text-white font-sans text-xs font-bold uppercase tracking-widest">
          Book Artist
        </button>
      `;
    }
    
    let desktopNavLinks = '';
    let mobileNavLinks = '';
    
    if (isPortal) {
      desktopNavLinks = `<div class="hidden lg:flex flex-1" id="nav-links"></div>`;
      mobileNavLinks = `<div class="flex flex-col p-12 gap-5 font-sans text-sm font-bold uppercase tracking-[0.15em]"></div>`;
    } else {
      desktopNavLinks = `
        <div class="hidden lg:flex gap-8 font-sans text-[10px] font-bold uppercase tracking-[0.15em] items-center relative" id="nav-links">
          <a class="nav-item whitespace-nowrap ${isHome && !isAbout && !isStories ? 'text-[#B5451B]' : 'text-stone-900'} hover:text-[#B5451B] transition-colors duration-500" href="/">Home</a>
          <a class="nav-item whitespace-nowrap ${isAbout ? 'text-[#B5451B]' : 'text-stone-900'} hover:text-[#B5451B] transition-colors duration-500" href="/#about-india">About</a>
          <a class="nav-item whitespace-nowrap ${isStories ? 'text-[#B5451B]' : 'text-stone-900'} hover:text-[#B5451B] transition-colors duration-500" href="/#journal">Stories</a>
          <a class="nav-item whitespace-nowrap ${isRetreats ? 'text-[#B5451B]' : 'text-stone-900'} hover:text-[#B5451B] transition-colors duration-500" href="/art-retreats">Art Retreats</a>
          <a class="nav-item whitespace-nowrap ${isTeam ? 'text-[#B5451B]' : 'text-stone-900'} hover:text-[#B5451B] transition-colors duration-500" href="/team">Our Team</a>
          <a class="nav-item whitespace-nowrap text-stone-900 hover:text-[#B5451B] transition-colors duration-500" href="/signin">Be an Artist</a>
        </div>
      `;
      mobileNavLinks = `
        <div class="flex flex-col p-12 gap-5 font-sans text-sm font-bold uppercase tracking-[0.15em]">
          <a class="mobile-nav-item hover:text-[#B5451B] transition-colors" href="/">Home</a>
          <a class="mobile-nav-item hover:text-[#B5451B] transition-colors" href="/#about-india">About</a>
          <a class="mobile-nav-item hover:text-[#B5451B] transition-colors" href="/#journal">Stories</a>
          <a class="mobile-nav-item hover:text-[#B5451B] transition-colors" href="/art-retreats">Art Retreats</a>
          <a class="mobile-nav-item hover:text-[#B5451B] transition-colors" href="/team">Our Team</a>
          <a class="mobile-nav-item hover:text-[#B5451B] transition-colors" href="/signin">Be an Artist</a>
        </div>
      `;
    }

    this.innerHTML = `
      <nav class="fixed top-0 w-full z-50 bg-[#FDFBF7]/90 backdrop-blur-xl flex justify-between items-center px-4 md:px-12 py-3 md:py-4 border-b border-stone-200/30 shadow-sm transition-all duration-500 ${
        isFloating ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }" id="main-nav">
        <div class="flex items-center">
          <a href="/" class="flex items-center">
            <img src="pics/logoo.png" alt="The Painted Muse Logo" class="h-12 md:h-16 w-auto object-contain" />
          </a>
        </div>
        ${desktopNavLinks}
        <div class="flex items-center gap-2 md:gap-4">
          ${authButtonsHtml}
          <button id="mobile-menu-btn" class="lg:hidden text-stone-900 p-2">
            <span class="material-symbols-outlined text-3xl">menu</span>
          </button>
        </div>
      </nav>

      <div id="mobile-menu" class="fixed inset-0 z-[60] bg-white translate-x-full transition-transform duration-500 lg:hidden flex flex-col">
        <div class="flex justify-between items-center p-4 border-b border-stone-100">
          <img src="pics/logoo.png" alt="The Painted Muse Logo" class="h-10 w-auto object-contain" />
          <button id="close-menu-btn" class="text-stone-900 p-2">
            <span class="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>
        ${mobileNavLinks}
        <div class="absolute bottom-8 left-12 right-12 flex flex-col gap-3">
          ${mobileAuthButtonsHtml}
        </div>
      </div>
    `;

    // Attach Toggle Behavior
    const mobileMenuBtn = this.querySelector('#mobile-menu-btn');
    const closeMenuBtn = this.querySelector('#close-menu-btn');
    const mobileMenu = this.querySelector('#mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('translate-x-full');
      });
    }

    if (closeMenuBtn && mobileMenu) {
      closeMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.add('translate-x-full');
      });
    }

    // Scroll Behavior for Floating Landing Page Navbar
    if (isFloating) {
      const navEl = this.querySelector('#main-nav');
      const handleScroll = () => {
        if (window.scrollY > 5) {
          navEl.classList.remove('-translate-y-full', 'opacity-0');
          navEl.classList.add('translate-y-0', 'opacity-100');
        } else {
          navEl.classList.add('-translate-y-full', 'opacity-0');
          navEl.classList.remove('translate-y-0', 'opacity-100');
        }
      };
      window.addEventListener('scroll', handleScroll);
      handleScroll();
    }
  }

  static logoutArtist() {
    if (confirm('Sign out of your artist studio?')) {
      fetch('/auth/logout', { method: 'POST' })
        .then(() => {
          localStorage.removeItem('artistLoggedIn');
          localStorage.removeItem('artistEmail');
          localStorage.removeItem('currentUser');
          window.location.href = '/signin';
        });
    }
  }

  static logoutUser() {
    if (confirm('Sign out of your art collector account?')) {
      fetch('/auth/logout', { method: 'POST' })
        .then(() => {
          localStorage.removeItem('userLoggedIn');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('currentUser');
          window.location.href = '/user-signin';
        });
    }
  }
}

customElements.define('app-navbar', AppNavbar);
