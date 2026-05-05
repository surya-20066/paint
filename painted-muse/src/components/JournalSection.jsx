import React from 'react';

const journalEntries = [
    {
        title: "Digital Manuscripts",
        category: "ARCHIVE",
        desc: "How we are using high-resolution light mapping to preserve fading temple murals.",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJmf-j9GSQDGrt2wkFmgQF5vfJyxnbjMQi99nYqDH5_HAwlspkJL91E9URUs9nlpSW6nNrUfH4n3FDLEYTPCjN6oqg2pemQKnQ7v448CIatSkzKwmGq_PGtpHlAiZHoMxEjroxoV_iI0cr0iT1T_rc2ljq4T6TjiDwYbMvhXDNPA5N0baDmyvxWltRDEeN-pvPmmoW9cGNV26SSGzO707_BkhoEZ7QJRTOnigKiyvtfXpK2ddWiwwsSdjg7vVecanj1pj_r8MJvmpz"
    },
    {
        title: "The Madhubani Line",
        category: "TECHNIQUE",
        desc: "Mastering the rhythmic, continuous linework that defines Bihar's most famous export.",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDl6KoRE4304r6yaz87N6CPFxSjVl5ThVTQ_5DB05Qa4BBwZVVoDT7hB54h4PLSUkYodDRQ7AxFeANNz5KTigRfwP0MA5iv-58kfRpIII-E-ZsaXdtBYlaqF-pYkMKQ06LvGukSg5cr2KXcb0bnQukgApRkOwYwghIh52McxMf849lF8Eoqu9RI7CWCkGdxiHXPUpL0yFHgShcMU-FJquGOgKOVGC_sDdUQWHC55l5N2Y9P4CPiI4yqO4wx4nASNz5uKq4XZ2pcQcSy"
    },
    {
        title: "Scrolls of Raghurajpur",
        category: "STORYTELLING",
        desc: "Unfurling the Pattachitra narratives that have survived for centuries on treated cloth.",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvOxBoc17GD0pCjKedkupx2GGZulLfiliHG8jb7_zcMvxOuC5vqAGnoWSkTL_XqygikyeaGHBCzvO1MuL8u-x84ZsjbJwDF25uglIBbAYrcPnbXwb1mk3SBesZR5aPrZL96bC6YhB-jM9pIXZNXpWz2tqPgjR4zFHW2v1BV7WztE9Cx-ZmYqXvhDSzcp02r0IJasCHS2Po5O-z_6fl1C-x83JitCLZkbOxUgAz44xzL-rRwtRO-wN5Wampwrsj0LcAQ9_Fh1xoW9Io"
    },
    {
        title: "The Silence of the Brush",
        category: "PHILOSOPHY",
        desc: "Why Indian art values the space between strokes as much as the pigment itself.",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOSLMm-BtlP2ruZQbaOJ5RI-FaYP5Y1TTw7MoGfZLTBcbIe13KTbq9iFm3bnPEMpYEzo70mlVq5a_34abWMmNpmpGmK-e2mBfSZIiR9EOfKLdd_0YZON8W_Dq-dJmiFLMRJda2UlksIjeUt2Zyd6MEn5UPfCZuN0becBuHwQPd0GRizQlobvR7gewPRL2EX5nqy0HHwmJxd4PXci6u1fsmA-Kj-U7oq5pAPnwV4PHvRDL4vN_ONg_hUrai9bVmMfaWd6Qm-j3vKICJ"
    }
];

// Duplicate items to ensure infinite scroll doesn't leave whitespace
const extendedEntries = [...journalEntries, ...journalEntries, ...journalEntries];

export default function JournalSection() {
    return (
        <section className="py-24 px-8 max-w-7xl mx-auto relative z-10 border-t border-[#362718]">
            <div className="flex justify-between items-end mb-16">
                <div className="max-w-2xl">
                    <h2 className="text-4xl md:text-5xl font-display text-gold mb-4 italic">The Muse Journal</h2>
                    <p className="text-textSoft/80 font-sans leading-relaxed">
                        Exploring the philosophy, technique, and preservation of indigenous art forms.
                    </p>
                </div>
                <a href="#" className="hidden md:inline-block text-gold text-xs font-bold tracking-[0.2em] uppercase border-b border-gold/30 pb-1 hover:border-gold transition-colors">
                    Read All Entries
                </a>
            </div>

            {/* Auto Scrolling Carousel */}
            <div className="overflow-hidden relative w-full hide-scrollbar">
                <div className="flex animate-scroll gap-8 pb-8">
                    {extendedEntries.map((entry, idx) => (
                        <div key={idx} className="w-[300px] md:w-[400px] flex-shrink-0 group flex flex-col h-full">
                            <div className="aspect-square bg-panel overflow-hidden border border-[#362718] mb-6">
                                <img src={entry.img} alt={entry.title} className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:mix-blend-normal group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                            </div>
                            <div className="flex-grow">
                                <p className="text-[#8B6914] text-xs font-bold tracking-[0.2em] mb-2 uppercase">{entry.category}</p>
                                <h3 className="text-xl font-display text-gold mb-3 group-hover:text-white transition-colors">{entry.title}</h3>
                                <p className="text-sm text-textSoft/60 leading-relaxed mb-6">{entry.desc}</p>
                            </div>
                            <div className="mt-auto pt-4">
                                <button className="w-full py-3 bg-[#8B6914] text-white text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#D4AF37] hover:text-[#1F160B] transition-colors shadow-[0_0_15px_rgba(139,105,20,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]">
                                    Book an Artist
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
