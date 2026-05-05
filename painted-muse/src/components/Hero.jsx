import React from 'react';

export default function Hero() {
    return (
        <header className="relative w-full h-screen overflow-hidden">
            {/* Full Background Video */}
            <div className="absolute inset-0 z-0">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                    <source src="/video.mp4" type="video/mp4" />
                </video>
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#1F160B] via-[#1F160B]/80 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F160B] via-transparent to-[#1F160B]/40"></div>
            </div>

            {/* Overlaid Text Content */}
            <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-3xl pt-[72px]">
                <div className="mb-4">
                    <span className="font-sans text-[11px] uppercase tracking-[0.3em] text-gold opacity-80">Cultural Immersion through Curation</span>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl text-white mb-6 font-display text-left leading-[1.05] tracking-tight">
                    Discover<br/>India<br/>Through<br/><span className="text-gold italic font-light">Art</span>
                </h1>
                <p className="font-sans text-textSoft/80 mb-10 max-w-md text-left leading-relaxed text-base">
                    Connecting artists, travelers, and art lovers through immersive cultural journeys that celebrate the living traditions of the subcontinent.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-start items-start">
                    <button className="bg-gold text-[#1F160B] px-8 py-4 font-sans text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-all duration-500">
                        Explore Artists
                    </button>
                    <button className="border border-textSoft/50 text-textSoft px-8 py-4 font-sans text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all duration-500">
                        Discover Art Retreats
                    </button>
                </div>
            </div>

            {/* Scroll indicator overlay */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center animate-bounce opacity-60">
                <span className="text-gold text-[10px] tracking-widest uppercase mb-2">Scroll</span>
                <div className="w-px h-16 bg-gradient-to-b from-gold to-transparent"></div>
            </div>
        </header>
    );
}
