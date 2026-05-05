import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MapSection from './components/MapSection';
import JournalSection from './components/JournalSection';
import InnerCircle from './components/InnerCircle';
import Footer from './components/Footer';

function App() {
  return (
    <div className="bg-[#1F160B] min-h-screen text-[#F6E5C0] font-sans selection:bg-[#F4D35E] selection:text-[#1F160B]">
      <Navbar />
      
      {/* Fixed Rotating Image */}
      <img src="/OIP.jpg" alt="Rotating Art" className="fixed top-[90px] left-6 w-24 h-24 rounded-full object-cover z-40 animate-[spin_10s_linear_infinite] shadow-[0_0_15px_rgba(212,175,55,0.4)] border-2 border-[#D4AF37]/50" />

      <Hero />
      <MapSection />
      <JournalSection />
      <InnerCircle />
      <Footer />
      
      {/* Fixed Send a Message Button */}
      <a href="mailto:hello@thepaintedmuse.com" className="fixed bottom-6 right-6 z-50 bg-[#F4D35E] text-[#1F160B] px-6 py-3 font-sans text-xs font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(244,211,94,0.3)] hover:bg-white transition-all duration-300 flex items-center gap-2 rounded-sm hover:-translate-y-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          Send a Message
      </a>
    </div>
  );
}

export default App;
