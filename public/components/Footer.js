/**
 * Footer.js — Unified footer component
 * native Custom Web Component (<app-footer>)
 */
class AppFooter extends HTMLElement {
  connectedCallback() {
    // Read CMS overrides from localStorage (content-loader.js handles live sync)
    const CMS_PREFIX = 'cms_';
    const desc = localStorage.getItem(CMS_PREFIX + 'footer_desc') || 
      "India's premier multi-art platform — celebrating the living traditions of every state through artisanal AI and human craft.";
    const whatsapp = localStorage.getItem(CMS_PREFIX + 'footer_whatsapp') || "https://wa.me/911234567890";
    const instagram = localStorage.getItem(CMS_PREFIX + 'footer_instagram') || "https://instagram.com/thepaintedmuse";
    const youtube = localStorage.getItem(CMS_PREFIX + 'footer_youtube') || "https://youtube.com/thepaintedmuse";
    const linkedin = localStorage.getItem(CMS_PREFIX + 'footer_linkedin') || "https://linkedin.com/company/thepaintedmuse";
    const email = localStorage.getItem(CMS_PREFIX + 'footer_email') || "painterdmuse_2k26@gmail.com";
    const phone = localStorage.getItem(CMS_PREFIX + 'footer_phone') || "+91 7798345690";
    const cleanPhone = phone.replace(/\s/g, '');

    this.innerHTML = `
      <footer id="footer">
        <div class="container mx-auto px-6">
          <div class="foot-top">
            <div class="foot-brand">
              <div class="flex items-center gap-3 mb-6">
                <img src="pics/logoo.png" alt="The Painted Muse Logo" class="h-20 w-62 object-contain" />
              </div>
              <p data-cms="footer_desc">${desc}</p>
              <div class="socials">
                <a href="${whatsapp}" target="_blank" aria-label="WhatsApp" class="hover:text-[#25D366] flex items-center justify-center">
                  <!-- WhatsApp SVG -->
                  <svg class="size-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.63 1.97 14.155.945 11.533.945c-5.441 0-9.865 4.372-9.87 9.802 0 1.698.452 3.355 1.309 4.866L1.93 21.905l6.417-1.681z"/>
                  </svg>
                </a>
                <a href="${instagram}" target="_blank" aria-label="Instagram" class="hover:text-[#E1306C] flex items-center justify-center">
                  <!-- Instagram SVG -->
                  <svg class="size-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                <a href="${youtube}" target="_blank" aria-label="Youtube" class="hover:text-[#FF0000] flex items-center justify-center">
                  <!-- Youtube SVG -->
                  <svg class="size-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.107C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.511a3.003 3.003 0 00-2.11 2.107C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.107c1.87.511 9.388.511 9.388.511s7.518 0 9.388-.511a3.003 3.003 0 002.11-2.107c.502-1.87.502-5.837.502-5.837s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="${linkedin}" target="_blank" aria-label="LinkedIn" class="hover:text-[#0077B5] flex items-center justify-center">
                  <!-- LinkedIn SVG -->
                  <svg class="size-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div class="foot-col">
              <h5>Related</h5>
              <ul>
                <li>
                  <a href="/heritage" class="flex items-center gap-2 hover:text-[#B5451B] transition-colors duration-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#B5451B] inline-block"></span>
                    Heritage Guide
                  </a>
                </li>
                <li>
                  <a href="/masterpieces" class="flex items-center gap-2 hover:text-[#B5451B] transition-colors duration-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#B5451B] inline-block"></span>
                    Masterpieces
                  </a>
                </li>
                <li>
                  <a href="/team" class="flex items-center gap-2 hover:text-[#B5451B] transition-colors duration-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#B5451B] inline-block"></span>
                    Our Team
                  </a>
                </li>
                <li>
                  <a href="/signin" class="flex items-center gap-2 hover:text-[#B5451B] transition-colors duration-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#B5451B] inline-block"></span>
                    Artist Login
                  </a>
                </li>
              </ul>
            </div>
            <div class="foot-col">
              <h5>Platform</h5>
              <ul>
                <li>
                  <a href="/#journal" class="flex items-center gap-2 hover:text-[#B5451B] transition-colors duration-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#B5451B] inline-block"></span>
                    Art Forms
                  </a>
                </li>
                <li>
                  <a href="/#living-map-section" class="flex items-center gap-2 hover:text-[#B5451B] transition-colors duration-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#B5451B] inline-block"></span>
                    Interactive Map
                  </a>
                </li>
                <li>
                  <a href="/artists" class="flex items-center gap-2 hover:text-[#B5451B] transition-colors duration-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#B5451B] inline-block"></span>
                    Meet the Makers
                  </a>
                </li>
                <li>
                  <a href="/#journal" class="flex items-center gap-2 hover:text-[#B5451B] transition-colors duration-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#B5451B] inline-block"></span>
                    The Muse Journal
                  </a>
                </li>
              </ul>
            </div>
            <div class="foot-col">
              <h5>Navigations</h5>
              <ul>
                <li>
                  <a href="/#living-map-section" class="flex items-center gap-2 hover:text-[#B5451B] transition-colors duration-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#B5451B] inline-block"></span>
                    Live Map
                  </a>
                </li>
                <li>
                  <a href="/#yreel-hub" class="flex items-center gap-2 hover:text-[#B5451B] transition-colors duration-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#B5451B] inline-block"></span>
                    Reels
                  </a>
                </li>
                <li>
                  <a href="/artists" class="flex items-center gap-2 hover:text-[#B5451B] transition-colors duration-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#B5451B] inline-block"></span>
                    Explore Artists
                  </a>
                </li>
                <li>
                  <a href="/art-retreats" class="flex items-center gap-2 hover:text-[#B5451B] transition-colors duration-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#B5451B] inline-block"></span>
                    Art Retreats
                  </a>
                </li>
              </ul>
            </div>
            <div class="foot-col">
              <h5>Contact Us</h5>
              <ul>
                <li>
                  <a href="mailto:${email}" data-cms-contact="email" class="flex items-center gap-2 hover:text-[#B5451B] transition-colors duration-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#B5451B] inline-block"></span>
                    ${email}
                  </a>
                </li>
                <li>
                  <a href="tel:${cleanPhone}" data-cms-contact="phone" class="flex items-center gap-2 hover:text-[#B5451B] transition-colors duration-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#B5451B] inline-block"></span>
                    ${phone}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div class="foot-bot justify-center text-center">
            <div>© 2026 The Painted Muse · Made with ❤️ for Indian Art</div>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define('app-footer', AppFooter);
