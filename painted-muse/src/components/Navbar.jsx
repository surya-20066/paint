import React from 'react';

export default function Navbar() {
    return (
        <nav className="fixed w-full z-50 mix-blend-difference px-8 py-4 flex justify-between items-center text-white">
            <div>
                <span className="text-white font-display italic font-bold tracking-tight text-xl">The Painted Muse</span>
            </div>
            
            <div className="flex items-center gap-8">
                <div className="hidden md:flex gap-8 text-xs font-bold tracking-[0.2em] uppercase">
                    <a href="#" className="hover:text-gold transition-colors">Curations</a>
                    <a href="#map-section" className="hover:text-gold transition-colors">Living Map</a>
                    <a href="#" className="hover:text-gold transition-colors">Journal</a>
                </div>
                
                <div className="flex items-center gap-6">
                    <button className="text-xs font-bold tracking-[0.2em] uppercase hover:text-gold transition-colors">
                        Login
                    </button>
                    <button className="text-xs font-bold tracking-[0.2em] uppercase bg-[#8B6914] text-white px-5 py-2.5 hover:bg-[#D4AF37] hover:text-[#1F160B] transition-colors shadow-[0_0_15px_rgba(139,105,20,0.3)]">
                        Book Artists
                    </button>
                </div>
            </div>
        </nav>
    );
}
