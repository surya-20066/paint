/**
 * content-loader.js — The Painted Muse CMS Bridge
 * 
 * This script runs on every public page. It reads CMS overrides from
 * localStorage and instantly applies them to the DOM. If no override
 * exists for a given element, the original HTML content is preserved.
 * 
 * Cross-tab sync: If admin edits content in another tab, changes
 * appear live on this page without refresh.
 */
(function () {
  'use strict';

  const CMS_PREFIX = 'cms_';

  /* ── Text & Image Overrides ─────────────────────────────────── */

  function applyOverrides() {
    // Text overrides: elements with data-cms="key" get their textContent/innerHTML replaced
    document.querySelectorAll('[data-cms]').forEach(el => {
      const key = CMS_PREFIX + el.getAttribute('data-cms');
      const val = localStorage.getItem(key);
      if (!val) return; // no override — keep original HTML

      if (el.tagName === 'IMG') {
        el.src = val;
      } else if (el.tagName === 'VIDEO' || el.tagName === 'SOURCE') {
        el.src = val;
        if (el.tagName === 'SOURCE' && el.parentElement && el.parentElement.tagName === 'VIDEO') {
          el.parentElement.load();
        }
      } else if (el.tagName === 'A' && el.hasAttribute('data-cms-href')) {
        el.href = val;
      } else {
        // For elements that may contain styled inner HTML, use innerHTML
        el.innerHTML = val;
      }
    });
  }

  /* ── Dynamic List Builders ──────────────────────────────────── */

  /**
   * Rebuild the explore art cards grid from localStorage JSON.
   * Key: cms_explore_arts  (JSON array of art objects)
   */
  function rebuildExploreArts() {
    const raw = localStorage.getItem(CMS_PREFIX + 'explore_arts');
    if (!raw) return;

    const container = document.getElementById('art-cards-grid');
    if (!container) return;

    let arts;
    try { arts = JSON.parse(raw); } catch (e) { return; }

    container.innerHTML = '';

    arts.forEach(art => {
      const card = document.createElement('div');
      card.className = 'art-card bg-white rounded-2xl shadow-lg border border-stone-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-col h-full overflow-visible';
      card.setAttribute('data-state', art.state || '');
      card.setAttribute('data-name', art.name || '');

      card.innerHTML = `
        <div class="aspect-[4/3] overflow-hidden rounded-t-2xl">
          <img src="${art.image || ''}" alt="${art.name || ''}"
               class="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
               onerror="this.src='pics/placeholder.png'">
        </div>
        <div class="p-6 flex flex-col flex-grow">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded-full">${art.state || ''}</span>
          </div>
          <h3 class="text-xl font-serif text-[#1A1208] mb-2">${art.name || ''}</h3>
          <p class="text-sm text-stone-500 font-sans leading-relaxed mb-4 flex-grow">${art.description || ''}</p>
          <div class="flex items-center justify-between mt-auto pt-4 border-t border-stone-100">
            <span class="text-2xl font-bold text-[#1A1208] font-serif">₹${(art.price || 0).toLocaleString('en-IN')}</span>
            <a href="payment?item=${encodeURIComponent(art.name || '')}&price=${art.price || 0}"
               class="bg-[#1A1208] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#B5451B] transition-colors duration-300 flex items-center gap-2 shadow-md">
              <span class="material-symbols-outlined text-base">shopping_bag</span> Buy
            </a>
          </div>
        </div>`;
      container.appendChild(card);
    });

    // Re-apply search/filter if those functions exist
    if (typeof window.filterArts === 'function') window.filterArts();
  }

  /**
   * Rebuild testimonials from localStorage JSON.
   * Key: cms_testimonials  (JSON array of testimonial objects)
   */
  function rebuildTestimonials() {
    const raw = localStorage.getItem(CMS_PREFIX + 'testimonials');
    if (!raw) return;

    const container = document.querySelector('.testimonial-container');
    if (!container) return;

    let testimonials;
    try { testimonials = JSON.parse(raw); } catch (e) { return; }

    // Distribute across 3 columns
    const cols = [[], [], []];
    testimonials.forEach((t, i) => cols[i % 3].push(t));

    const gridHTML = `<div class="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      ${cols.map(col => `<div class="testimonial-col">
        ${col.map(t => `<div class="bg-white p-6 rounded-xl shadow-lg border border-stone-100">
          <div class="flex gap-1 mb-4 text-[#D4AF37] text-xs">★★★★★</div>
          <p class="text-stone-600 font-sans text-sm italic leading-relaxed mb-6">"${t.text || ''}"</p>
          <div class="flex items-center gap-3">
            <img src="${t.avatar || 'https://i.pravatar.cc/150?u=default'}" class="w-10 h-10 rounded-full object-cover" alt="Avatar">
            <div>
              <h4 class="font-bold text-stone-900 font-sans text-[11px]">${t.name || ''}</h4>
              <p class="text-stone-400 text-[9px] uppercase tracking-widest">${t.location || ''}</p>
            </div>
          </div>
        </div>`).join('')}
      </div>`).join('')}
    </div>`;

    container.innerHTML = gridHTML;
  }

  /**
   * Rebuild dev team names on team
   * Key: cms_dev_team (JSON array of name strings)
   */
  function rebuildDevTeam() {
    const raw = localStorage.getItem(CMS_PREFIX + 'dev_team');
    if (!raw) return;

    const container = document.getElementById('dev-team-names');
    if (!container) return;

    let names;
    try { names = JSON.parse(raw); } catch (e) { return; }

    container.innerHTML = names.map(n => `<div>${n}</div>`).join('');
  }

  /* ── Footer Overrides ───────────────────────────────────────── */

  function applyFooterOverrides() {
    const socials = {
      whatsapp: localStorage.getItem(CMS_PREFIX + 'footer_whatsapp'),
      instagram: localStorage.getItem(CMS_PREFIX + 'footer_instagram'),
      youtube: localStorage.getItem(CMS_PREFIX + 'footer_youtube'),
      linkedin: localStorage.getItem(CMS_PREFIX + 'footer_linkedin'),
    };

    Object.entries(socials).forEach(([platform, url]) => {
      if (!url) return;
      const link = document.querySelector(`[data-cms-social="${platform}"]`);
      if (link) link.href = url;
    });

    const email = localStorage.getItem(CMS_PREFIX + 'footer_email');
    if (email) {
      const emailLink = document.querySelector('[data-cms-contact="email"]');
      if (emailLink) { emailLink.href = 'mailto:' + email; emailLink.lastChild.textContent = email; }
    }

    const phone = localStorage.getItem(CMS_PREFIX + 'footer_phone');
    if (phone) {
      const phoneLink = document.querySelector('[data-cms-contact="phone"]');
      if (phoneLink) { phoneLink.href = 'tel:' + phone.replace(/\s/g, ''); phoneLink.lastChild.textContent = phone; }
    }
  }

  /* ── Master Init ────────────────────────────────────────────── */

  function initCMS() {
    fetch('/api/cms')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          // Sync backend CMS config to localStorage so the rest of the script works
          Object.keys(data.data).forEach(k => {
            localStorage.setItem(k, typeof data.data[k] === 'string' ? data.data[k] : JSON.stringify(data.data[k]));
          });
          applyOverrides();
          rebuildExploreArts();
          rebuildTestimonials();
          rebuildDevTeam();
          applyFooterOverrides();
        }
      })
      .catch(err => {
        console.error('CMS load error:', err);
        // Fallback to localStorage if backend fails
        applyOverrides();
        rebuildExploreArts();
        rebuildTestimonials();
        rebuildDevTeam();
        applyFooterOverrides();
      });
  }

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCMS);
  } else {
    initCMS();
  }

  // Cross-tab live sync: when admin edits in another tab, update this page instantly
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith(CMS_PREFIX)) {
      applyOverrides();
      rebuildExploreArts();
      rebuildTestimonials();
      rebuildDevTeam();
      applyFooterOverrides();
    }
  });

})();
