import React from 'react';
import { Camera, Paintbrush, Globe, ArrowRight } from 'lucide-react';

export default function InnerCircle() {
    return (
        <section className="py-32 px-8 relative border-t border-[#362718]" style={{ backgroundImage: "url('https://images.pexels.com/photos/3194524/pexels-photo-3194524.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
            <div className="absolute inset-0 bg-[#1F160B]/90 backdrop-blur-sm"></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl md:text-6xl font-display text-gold mb-6 italic">The Inner Circle</h2>
                    <p className="text-lg text-textSoft/80 font-sans leading-relaxed">
                        Join an exclusive collective of patrons, historians, and creatives dedicated to the 
                        future of India's heritage. Gain unprecedented access to studios, archives, and minds.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Benefit 1 */}
                    <div className="bg-panel/60 backdrop-blur-md border border-[#362718] p-10 hover:border-gold/50 transition-colors group">
                        <div className="text-gold mb-8 group-hover:scale-110 transition-transform origin-left">
                            <Camera size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-display text-gold mb-4">Studio Archives</h3>
                        <p className="text-textSoft/60 text-sm leading-relaxed mb-8">
                            High-resolution digital downloads of process works, sketches, and reference materials.
                        </p>
                        <a href="#" className="flex items-center text-[#8B6914] text-xs font-bold tracking-[0.2em] uppercase group-hover:text-gold transition-colors">
                            Explore <ArrowRight size={14} className="ml-2 group-hover:translate-x-2 transition-transform" />
                        </a>
                    </div>

                    {/* Benefit 2 - Highlighted */}
                    <div className="bg-gold/10 backdrop-blur-md border border-gold/30 p-10 transform md:-translate-y-4 shadow-[0_0_30px_rgba(244,211,94,0.1)]">
                        <div className="text-gold mb-8">
                            <Paintbrush size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-display text-gold mb-4">Commission Priority</h3>
                        <p className="text-textSoft/80 text-sm leading-relaxed mb-8">
                            Skip the waitlist for bespoke commissions. Work directly with master artisans to create heirlooms.
                        </p>
                        <button className="w-full py-4 bg-gold text-[#1F160B] text-xs font-bold tracking-[0.2em] uppercase hover:bg-white transition-colors">
                            Apply for Membership
                        </button>
                    </div>

                    {/* Benefit 3 */}
                    <div className="bg-panel/60 backdrop-blur-md border border-[#362718] p-10 hover:border-gold/50 transition-colors group">
                        <div className="text-gold mb-8 group-hover:scale-110 transition-transform origin-left">
                            <Globe size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-display text-gold mb-4">Global Exhibitions</h3>
                        <p className="text-textSoft/60 text-sm leading-relaxed mb-8">
                            VIP access to gallery openings, curatorial talks, and private viewings around the world.
                        </p>
                        <a href="#" className="flex items-center text-[#8B6914] text-xs font-bold tracking-[0.2em] uppercase group-hover:text-gold transition-colors">
                            View Calendar <ArrowRight size={14} className="ml-2 group-hover:translate-x-2 transition-transform" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
