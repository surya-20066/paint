import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-[#181109] border-t border-[#362718] relative">
            <div className="max-w-7xl mx-auto px-8 py-12">
                {/* Top Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <h2 className="font-display text-2xl font-bold italic text-gold mb-4">The Painted Muse</h2>
                        <p className="font-sans text-textSoft/50 text-sm leading-relaxed">Preserving India's artistic heritage through curation, education, and community.</p>
                    </div>
                    {/* Quick Links */}
                    <div>
                        <h3 className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-4">Explore</h3>
                        <ul className="space-y-2 font-sans text-sm text-textSoft/80">
                            <li><a href="#" className="hover:text-gold transition-colors">The Collection</a></li>
                            <li><a href="#artisans" className="hover:text-gold transition-colors">Artisans</a></li>
                            <li><a href="#heritage" className="hover:text-gold transition-colors">Heritage Map</a></li>
                            <li><a href="#journal" className="hover:text-gold transition-colors">Journal</a></li>
                        </ul>
                    </div>
                    {/* Company */}
                    <div>
                        <h3 className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-4">Company</h3>
                        <ul className="space-y-2 font-sans text-sm text-textSoft/80">
                            <li><a href="#" className="hover:text-gold transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-gold transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-gold transition-colors">Press</a></li>
                            <li><a href="#" className="hover:text-gold transition-colors">Contact</a></li>
                        </ul>
                    </div>
                    {/* Newsletter */}
                    <div>
                        <h3 className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-4">Stay Connected</h3>
                        <p className="font-sans text-textSoft/50 text-sm mb-4">Get updates on exhibitions & new artisans.</p>
                        <div className="flex border border-gold/30 overflow-hidden">
                            <input className="bg-transparent px-4 py-2.5 w-full font-sans text-sm text-textSoft placeholder:text-textSoft/40 outline-none" placeholder="Your email" type="email"/>
                            <button className="bg-gold text-[#181109] px-4 font-sans text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors whitespace-nowrap">Join</button>
                        </div>
                    </div>
                </div>
                {/* Bottom Bar */}
                <div className="border-t border-[#362718] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="font-sans text-xs text-textSoft/40">&copy; 2026 The Painted Muse. All rights reserved.</p>
                    <div className="flex gap-6 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-textSoft/50">
                        <a href="#" className="hover:text-gold transition-colors">Privacy</a>
                        <a href="#" className="hover:text-gold transition-colors">Terms</a>
                        <a href="#" className="hover:text-gold transition-colors">Accessibility</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
