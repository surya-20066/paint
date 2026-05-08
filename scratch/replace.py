import os
import re

file_path = r"c:\Users\surya\OneDrive\Attachments\Desktop\paint\index.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove "book an artist button"
content = re.sub(
    r'<div class="container mx-auto px-6 mt-20 flex justify-center z-20 relative">\s*<button[^>]*>\s*Book an Artist\s*</button>\s*</div>',
    "",
    content,
    flags=re.DOTALL
)

# 2. Testimonials CSS speed
content = content.replace("animation: scroll-up 80s linear infinite;", "animation: scroll-up 40s linear infinite;")
content = content.replace("animation-duration: 100s;", "animation-duration: 50s;")
content = content.replace("animation-duration: 90s;", "animation-duration: 45s;")

# 3. Testimonials Content (Change to Art-related text)
# We will use Regex to change the quote texts
quotes = [
    '"A brilliant platform. We discovered a 7th generation Pattachitra artist for our gallery exhibition."',
    '"The craft retreats are life-changing. Learning Warli directly from the tribal masters in their village was an unforgettable experience."',
    '"Commissioning a mural was seamless. The artist understood our vision and transformed our office space with incredible Gond art."',
    '"Every piece tells a story. I purchased a Madhubani painting and the authenticity and detail are unmatched."',
    '"This is what preservation looks like. A beautiful, dignified way to connect directly with India\'s heritage artisans."',
    '"The live painting session at our event left guests mesmerized. Such a powerful way to experience Indian folk art."',
]

old_quotes_re = re.compile(r'<p class="text-stone-600 font-sans text-sm italic leading-relaxed mb-6">.*?</p>', re.DOTALL)
existing_quotes = old_quotes_re.findall(content)
for i in range(len(existing_quotes)):
    if i < len(quotes):
        content = content.replace(existing_quotes[i], f'<p class="text-stone-600 font-sans text-sm italic leading-relaxed mb-6">{quotes[i]}</p>', 1)
    else:
        # duplicate quotes to fill remaining
        content = content.replace(existing_quotes[i], f'<p class="text-stone-600 font-sans text-sm italic leading-relaxed mb-6">{quotes[i % len(quotes)]}</p>', 1)

# For titles/names, we can leave them or just let the new text stand on its own.

# 4. Replace Murals Section with "Art Forms"
murals_start = content.find('<!-- Murals Section -->')
murals_end = content.find('<!-- Artist Portfolio Section -->')

if murals_start != -1 and murals_end != -1:
    art_forms_html = """        <!-- Art Forms Section -->
        <section class="py-28 section-light" id="art-forms">
            <div class="container mx-auto px-6 md:px-12 text-center">
                <div class="flex items-center justify-center gap-4 mb-6">
                    <div class="h-[1px] w-12 bg-[#1A1208]"></div>
                    <span class="font-sans text-xs text-[#1A1208] uppercase tracking-[0.2em] font-bold">Art Forms</span>
                    <div class="h-[1px] w-12 bg-[#1A1208]"></div>
                </div>
                <h2 class="text-4xl md:text-5xl font-serif text-[#1A1208] mt-4 mb-4 leading-tight">Every Art Form Has a Home<br>Here</h2>
                <p class="font-sans text-stone-500 mb-16">From ancient temple murals to contemporary folk fusion.</p>
                
                <div class="flex gap-6 overflow-x-auto custom-scrollbar pb-8 snap-x">
                    <!-- Card 1 -->
                    <div class="min-w-[300px] h-[400px] rounded-sm overflow-hidden relative group snap-start shrink-0 cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=600" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Tanjore">
                        <div class="absolute inset-0 bg-gradient-to-t from-[#1A1208]/90 via-[#1A1208]/40 to-transparent"></div>
                        <div class="absolute bottom-6 left-6 text-left">
                            <h3 class="font-serif text-white text-2xl mb-3">Tanjore</h3>
                            <span class="bg-[#D4AF37] text-[#1A1208] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">76 Artists</span>
                        </div>
                        <span class="absolute top-6 left-6 font-serif text-white/50 text-sm italic">№ 03</span>
                    </div>
                    <!-- Card 2 -->
                    <div class="min-w-[300px] h-[400px] rounded-sm overflow-hidden relative group snap-start shrink-0 cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1582561424760-0321d6cbfa60?auto=format&fit=crop&q=80&w=600" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Pattachitra">
                        <div class="absolute inset-0 bg-gradient-to-t from-[#1A1208]/90 via-[#1A1208]/40 to-transparent"></div>
                        <div class="absolute bottom-6 left-6 text-left">
                            <h3 class="font-serif text-white text-2xl mb-3">Pattachitra</h3>
                            <span class="bg-[#D4AF37] text-[#1A1208] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">54 Artists</span>
                        </div>
                        <span class="absolute top-6 left-6 font-serif text-white/50 text-sm italic">№ 04</span>
                    </div>
                    <!-- Card 3 -->
                    <div class="min-w-[300px] h-[400px] rounded-sm overflow-hidden relative group snap-start shrink-0 cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80&w=600" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Gond Art">
                        <div class="absolute inset-0 bg-gradient-to-t from-[#1A1208]/90 via-[#1A1208]/40 to-transparent"></div>
                        <div class="absolute bottom-6 left-6 text-left">
                            <h3 class="font-serif text-white text-2xl mb-3">Gond Art</h3>
                            <span class="bg-[#D4AF37] text-[#1A1208] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">89 Artists</span>
                        </div>
                        <span class="absolute top-6 left-6 font-serif text-white/50 text-sm italic">№ 05</span>
                    </div>
                    <!-- Card 4 -->
                    <div class="min-w-[300px] h-[400px] rounded-sm overflow-hidden relative group snap-start shrink-0 cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1574538298292-6f296da466cb?auto=format&fit=crop&q=80&w=600" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Kalamkari">
                        <div class="absolute inset-0 bg-gradient-to-t from-[#1A1208]/90 via-[#1A1208]/40 to-transparent"></div>
                        <div class="absolute bottom-6 left-6 text-left">
                            <h3 class="font-serif text-white text-2xl mb-3">Kalamkari</h3>
                            <span class="bg-[#D4AF37] text-[#1A1208] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">112 Artists</span>
                        </div>
                        <span class="absolute top-6 left-6 font-serif text-white/50 text-sm italic">№ 06</span>
                    </div>
                    <!-- Card 5 -->
                    <div class="min-w-[300px] h-[400px] rounded-sm overflow-hidden relative group snap-start shrink-0 cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1598284488310-9189311bda38?auto=format&fit=crop&q=80&w=600" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Phulkari">
                        <div class="absolute inset-0 bg-gradient-to-t from-[#1A1208]/90 via-[#1A1208]/40 to-transparent"></div>
                        <div class="absolute bottom-6 left-6 text-left">
                            <h3 class="font-serif text-white text-2xl mb-3">Phulkari</h3>
                            <span class="bg-[#D4AF37] text-[#1A1208] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">67 Artists</span>
                        </div>
                        <span class="absolute top-6 left-6 font-serif text-white/50 text-sm italic">№ 07</span>
                    </div>
                </div>
            </div>
        </section>
"""
    content = content[:murals_start] + art_forms_html + content[murals_end:]


# 5. Replace "Meet Our Artisans" with "Meet the Makers"
artisans_start = content.find('<!-- Artist Portfolio Section -->')
artisans_end = content.find('<!-- Bookings & Services -->')

if artisans_start != -1 and artisans_end != -1:
    makers_html = """        <!-- Meet the Makers Section -->
        <section class="py-28 section-cream" id="artisans">
            <div class="container mx-auto px-6 md:px-12 text-center">
                <div class="flex items-center justify-center gap-4 mb-6">
                    <div class="h-[1px] w-12 bg-[#1A1208]"></div>
                    <span class="font-sans text-xs text-[#1A1208] uppercase tracking-[0.2em] font-bold">The Makers</span>
                    <div class="h-[1px] w-12 bg-[#1A1208]"></div>
                </div>
                <h2 class="text-4xl md:text-5xl font-serif text-[#1A1208] mb-4">Meet the Makers</h2>
                <p class="font-sans text-stone-500 mb-16">Real artists. Real stories. Every piece handcrafted.</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                    <!-- Card 1 -->
                    <div class="bg-white rounded-sm shadow-md overflow-hidden border border-stone-200 hover:shadow-xl transition-all duration-500 group">
                        <div class="h-40 bg-stone-900 relative">
                            <img src="https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=600" class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="Artwork">
                            <img src="https://i.pravatar.cc/150?u=meera" class="w-20 h-20 rounded-full border-4 border-white absolute -bottom-10 left-6 object-cover shadow-sm z-10" alt="Meera Devi">
                        </div>
                        <div class="pt-14 p-6 relative bg-white">
                            <h3 class="font-serif text-xl text-[#1A1208] mb-3">Meera Devi</h3>
                            <div class="flex gap-2 mb-4">
                                <span class="bg-[#B5451B] text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Bihar</span>
                                <span class="border border-stone-300 text-stone-500 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Madhubani</span>
                            </div>
                            <div class="flex items-center gap-1 mb-4 text-[#D4AF37] text-[10px]">
                                ★★★★★ <span class="text-stone-500 font-sans ml-1">4.9 · 48 bookings</span>
                            </div>
                            <p class="text-stone-600 font-sans text-sm mb-6 h-10">5th generation Madhubani artist from Mithila, Bihar.</p>
                            <div class="flex gap-3">
                                <button class="flex-1 border border-stone-300 text-[#1A1208] text-[10px] font-bold uppercase tracking-wider py-3 hover:bg-stone-50 transition-colors">View Portfolio</button>
                                <button class="flex-1 bg-[#1A1208] text-white text-[10px] font-bold uppercase tracking-wider py-3 hover:bg-[#D4AF37] hover:text-[#1A1208] transition-colors">Book Now →</button>
                            </div>
                        </div>
                    </div>
                    <!-- Card 2 -->
                    <div class="bg-white rounded-sm shadow-md overflow-hidden border border-stone-200 hover:shadow-xl transition-all duration-500 group">
                        <div class="h-40 bg-stone-900 relative">
                            <img src="https://images.unsplash.com/photo-1582561424760-0321d6cbfa60?auto=format&fit=crop&q=80&w=600" class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="Artwork">
                            <img src="https://i.pravatar.cc/150?u=bhaskar" class="w-20 h-20 rounded-full border-4 border-white absolute -bottom-10 left-6 object-cover shadow-sm z-10" alt="Bhaskar">
                        </div>
                        <div class="pt-14 p-6 relative bg-white">
                            <h3 class="font-serif text-xl text-[#1A1208] mb-3">Bhaskar Mohapatra</h3>
                            <div class="flex gap-2 mb-4">
                                <span class="bg-[#B5451B] text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Odisha</span>
                                <span class="border border-stone-300 text-stone-500 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Pattachitra</span>
                            </div>
                            <div class="flex items-center gap-1 mb-4 text-[#D4AF37] text-[10px]">
                                ★★★★★ <span class="text-stone-500 font-sans ml-1">5.0 · 67 bookings</span>
                            </div>
                            <p class="text-stone-600 font-sans text-sm mb-6 h-10">Master chitrakar of Raghurajpur, painting the gods on palm leaves.</p>
                            <div class="flex gap-3">
                                <button class="flex-1 border border-stone-300 text-[#1A1208] text-[10px] font-bold uppercase tracking-wider py-3 hover:bg-stone-50 transition-colors">View Portfolio</button>
                                <button class="flex-1 bg-[#1A1208] text-white text-[10px] font-bold uppercase tracking-wider py-3 hover:bg-[#D4AF37] hover:text-[#1A1208] transition-colors">Book Now →</button>
                            </div>
                        </div>
                    </div>
                    <!-- Card 3 -->
                    <div class="bg-white rounded-sm shadow-md overflow-hidden border border-stone-200 hover:shadow-xl transition-all duration-500 group">
                        <div class="h-40 bg-stone-900 relative">
                            <img src="https://images.unsplash.com/photo-1574538298292-6f296da466cb?auto=format&fit=crop&q=80&w=600" class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="Artwork">
                            <img src="https://i.pravatar.cc/150?u=jivya" class="w-20 h-20 rounded-full border-4 border-white absolute -bottom-10 left-6 object-cover shadow-sm z-10" alt="Jivya">
                        </div>
                        <div class="pt-14 p-6 relative bg-white">
                            <h3 class="font-serif text-xl text-[#1A1208] mb-3">Jivya Soma Mashe</h3>
                            <div class="flex gap-2 mb-4">
                                <span class="bg-[#B5451B] text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Maharashtra</span>
                                <span class="border border-stone-300 text-stone-500 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Warli</span>
                            </div>
                            <div class="flex items-center gap-1 mb-4 text-[#D4AF37] text-[10px]">
                                ★★★★★ <span class="text-stone-500 font-sans ml-1">4.8 · 52 bookings</span>
                            </div>
                            <p class="text-stone-600 font-sans text-sm mb-6 h-10">Reviving the white-on-earth language of the Warli tribe.</p>
                            <div class="flex gap-3">
                                <button class="flex-1 border border-stone-300 text-[#1A1208] text-[10px] font-bold uppercase tracking-wider py-3 hover:bg-stone-50 transition-colors">View Portfolio</button>
                                <button class="flex-1 bg-[#1A1208] text-white text-[10px] font-bold uppercase tracking-wider py-3 hover:bg-[#D4AF37] hover:text-[#1A1208] transition-colors">Book Now →</button>
                            </div>
                        </div>
                    </div>
                    <!-- Card 4 -->
                    <div class="bg-white rounded-sm shadow-md overflow-hidden border border-stone-200 hover:shadow-xl transition-all duration-500 group">
                        <div class="h-40 bg-stone-900 relative">
                            <img src="https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80&w=600" class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="Artwork">
                            <img src="https://i.pravatar.cc/150?u=anjali" class="w-20 h-20 rounded-full border-4 border-white absolute -bottom-10 left-6 object-cover shadow-sm z-10" alt="Anjali">
                        </div>
                        <div class="pt-14 p-6 relative bg-white">
                            <h3 class="font-serif text-xl text-[#1A1208] mb-3">Anjali Pichai</h3>
                            <div class="flex gap-2 mb-4">
                                <span class="bg-[#B5451B] text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Tamil Nadu</span>
                                <span class="border border-stone-300 text-stone-500 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Tanjore</span>
                            </div>
                            <div class="flex items-center gap-1 mb-4 text-[#D4AF37] text-[10px]">
                                ★★★★★ <span class="text-stone-500 font-sans ml-1">4.9 · 33 bookings</span>
                            </div>
                            <p class="text-stone-600 font-sans text-sm mb-6 h-10">Gold-leaf devotional art crafted across three months per piece.</p>
                            <div class="flex gap-3">
                                <button class="flex-1 border border-stone-300 text-[#1A1208] text-[10px] font-bold uppercase tracking-wider py-3 hover:bg-stone-50 transition-colors">View Portfolio</button>
                                <button class="flex-1 bg-[#1A1208] text-white text-[10px] font-bold uppercase tracking-wider py-3 hover:bg-[#D4AF37] hover:text-[#1A1208] transition-colors">Book Now →</button>
                            </div>
                        </div>
                    </div>
                    <!-- Card 5 -->
                    <div class="bg-white rounded-sm shadow-md overflow-hidden border border-stone-200 hover:shadow-xl transition-all duration-500 group">
                        <div class="h-40 bg-stone-900 relative">
                            <img src="https://images.unsplash.com/photo-1598284488310-9189311bda38?auto=format&fit=crop&q=80&w=600" class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="Artwork">
                            <img src="https://i.pravatar.cc/150?u=rukmini" class="w-20 h-20 rounded-full border-4 border-white absolute -bottom-10 left-6 object-cover shadow-sm z-10" alt="Rukmini">
                        </div>
                        <div class="pt-14 p-6 relative bg-white">
                            <h3 class="font-serif text-xl text-[#1A1208] mb-3">Rukmini Verma</h3>
                            <div class="flex gap-2 mb-4">
                                <span class="bg-[#B5451B] text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Rajasthan</span>
                                <span class="border border-stone-300 text-stone-500 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Miniature</span>
                            </div>
                            <div class="flex items-center gap-1 mb-4 text-[#D4AF37] text-[10px]">
                                ★★★★★ <span class="text-stone-500 font-sans ml-1">4.7 · 91 bookings</span>
                            </div>
                            <p class="text-stone-600 font-sans text-sm mb-6 h-10">Squirrel-hair brushwork in the Bundi tradition since 1989.</p>
                            <div class="flex gap-3">
                                <button class="flex-1 border border-stone-300 text-[#1A1208] text-[10px] font-bold uppercase tracking-wider py-3 hover:bg-stone-50 transition-colors">View Portfolio</button>
                                <button class="flex-1 bg-[#1A1208] text-white text-[10px] font-bold uppercase tracking-wider py-3 hover:bg-[#D4AF37] hover:text-[#1A1208] transition-colors">Book Now →</button>
                            </div>
                        </div>
                    </div>
                    <!-- Card 6 -->
                    <div class="bg-white rounded-sm shadow-md overflow-hidden border border-stone-200 hover:shadow-xl transition-all duration-500 group">
                        <div class="h-40 bg-stone-900 relative">
                            <img src="https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=600" class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="Artwork">
                            <img src="https://i.pravatar.cc/150?u=kalavati" class="w-20 h-20 rounded-full border-4 border-white absolute -bottom-10 left-6 object-cover shadow-sm z-10" alt="Kalavati">
                        </div>
                        <div class="pt-14 p-6 relative bg-white">
                            <h3 class="font-serif text-xl text-[#1A1208] mb-3">Kalavati Bai</h3>
                            <div class="flex gap-2 mb-4">
                                <span class="bg-[#B5451B] text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Madhya Pradesh</span>
                                <span class="border border-stone-300 text-stone-500 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Gond Art</span>
                            </div>
                            <div class="flex items-center gap-1 mb-4 text-[#D4AF37] text-[10px]">
                                ★★★★★ <span class="text-stone-500 font-sans ml-1">4.9 · 44 bookings</span>
                            </div>
                            <p class="text-stone-600 font-sans text-sm mb-6 h-10">Tribal dreamscapes from the heart of the Mandla forests.</p>
                            <div class="flex gap-3">
                                <button class="flex-1 border border-stone-300 text-[#1A1208] text-[10px] font-bold uppercase tracking-wider py-3 hover:bg-stone-50 transition-colors">View Portfolio</button>
                                <button class="flex-1 bg-[#1A1208] text-white text-[10px] font-bold uppercase tracking-wider py-3 hover:bg-[#D4AF37] hover:text-[#1A1208] transition-colors">Book Now →</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-16">
                    <button class="border border-[#1A1208] text-[#1A1208] px-10 py-4 font-sans text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#1A1208] hover:text-white transition-colors">View All Artists →</button>
                </div>
            </div>
        </section>
"""
    content = content[:artisans_start] + makers_html + content[artisans_end:]

# 6. Replace Footer and Support Section
footer_start = content.find('<!-- Support & Social -->')
end_of_file = content.find('</body>')

if footer_start != -1 and end_of_file != -1:
    # First keep the Fixed Send a Message button
    fixed_button_match = re.search(r'<!-- Fixed Send a Message Button -->.*?(?=<!-- Footer|$)', content[footer_start:end_of_file], re.DOTALL)
    fixed_button = fixed_button_match.group(0) if fixed_button_match else ""

    new_footer_html = f"""        <!-- Split CTA Section -->
        <section class="flex flex-col md:flex-row w-full">
            <!-- Left: Artist CTA -->
            <div class="w-full md:w-1/2 bg-[#1b263b] text-white py-24 px-12 md:px-24 relative overflow-hidden group">
                <div class="absolute inset-0 opacity-10 mix-blend-overlay">
                    <img src="https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=800" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Texture">
                </div>
                <div class="relative z-10 flex flex-col items-start max-w-md mx-auto">
                    <div class="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mb-8">
                        <span class="material-symbols-outlined text-2xl">palette</span>
                    </div>
                    <h2 class="text-4xl md:text-5xl font-serif mb-6">Are You an Artist?</h2>
                    <p class="text-white/80 font-sans mb-10 leading-relaxed">Join India's largest art platform. Showcase your work, get discovered, take bookings, and share your story with the world.</p>
                    <button class="bg-[#F5F0E8] text-[#1b263b] px-8 py-4 font-sans text-sm font-bold hover:bg-white transition-colors shadow-lg">Join as an Artist →</button>
                    <p class="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-6">FREE TO JOIN · NO COMMISSION ON FIRST 3 BOOKINGS</p>
                </div>
            </div>
            <!-- Right: Collector CTA -->
            <div class="w-full md:w-1/2 bg-[#F5F0E8] text-[#1A1208] py-24 px-12 md:px-24 relative overflow-hidden group">
                <div class="absolute inset-0 opacity-40 mix-blend-multiply">
                    <img src="https://images.unsplash.com/photo-1582561424760-0321d6cbfa60?auto=format&fit=crop&q=80&w=800" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale" alt="Texture">
                </div>
                <div class="relative z-10 flex flex-col items-start max-w-md mx-auto">
                    <div class="w-16 h-16 rounded-full border border-[#1A1208]/20 flex items-center justify-center mb-8">
                        <span class="material-symbols-outlined text-2xl text-[#1A1208]">visibility</span>
                    </div>
                    <h2 class="text-4xl md:text-5xl font-serif mb-6">Love Art?</h2>
                    <p class="text-stone-600 font-sans mb-10 leading-relaxed">Collect original pieces, commission custom work, attend retreats, and become part of India's living art community.</p>
                    <button class="bg-[#1b263b] text-white px-8 py-4 font-sans text-sm font-bold hover:bg-[#1A1208] transition-colors shadow-lg">Start Exploring →</button>
                    <p class="text-stone-500 text-[10px] font-bold uppercase tracking-widest mt-6">2,400+ ARTISTS · 15 ART FORMS · 28 STATES</p>
                </div>
            </div>
        </section>
    </main>

    {fixed_button}

    <!-- Footer Section -->
    <footer class="bg-[#1b263b] text-white relative overflow-hidden">
        <div class="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRrEuwmrE10cxB2Oae845GDrP3kU-WyjvkShm1EQbrQg1J8AWwsnfTOa_Yd43-yDsPK-k7jiLPfPtwwOdYsTOwnMBabRznvfeo8h3bqtwD5gH2q4U30MBCCjJNiRgFbchZDN5lhWytQEYI5xTmEfIbnzuDLCKKDPl8_NyfmuWMuR86PhGc-JnOKloK4F3ni1MSTH5prPAgGGKWuf8SBOUfiXyBj35iXGC3XCEi91OQTXGj39Posri3UHGrcYXiOqWISXFGxeYn7Z7y" class="w-full h-full object-cover" alt="Background Texture">
        </div>
        
        <!-- Newsletter Box -->
        <div class="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center relative z-10">
            <h2 class="text-4xl md:text-5xl font-serif mb-4">Stay Close to the <span class="italic text-white">Art</span></h2>
            <p class="text-white/70 font-sans mb-10 text-lg">Monthly dispatches — new artists, retreats, stories, and drops.</p>
            <div class="flex max-w-md mx-auto border border-white/20 hover:border-white/40 transition-colors bg-white/5 backdrop-blur-sm focus-within:border-[#D4AF37]">
                <div class="flex items-center pl-4">
                    <span class="material-symbols-outlined text-white/50 text-sm">mail</span>
                </div>
                <input class="bg-transparent px-4 py-4 w-full font-sans text-sm text-white placeholder:text-white/40 outline-none" placeholder="Your email address" type="email" />
                <button class="bg-[#D4AF37] text-[#1b263b] px-6 font-sans text-sm font-bold hover:bg-white transition-colors whitespace-nowrap uppercase tracking-widest">Subscribe →</button>
            </div>
            <p class="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-6">Join 18,000+ art lovers · No spam · Unsubscribe anytime</p>
        </div>
        
        <div class="h-[1px] w-full bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent relative z-10"></div>
        
        <!-- Footer Links -->
        <div class="max-w-7xl mx-auto px-8 py-16 relative z-10">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-10">
                <div class="md:col-span-2">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-8 h-8 rounded-full border border-[#D4AF37] flex items-center justify-center">
                            <span class="material-symbols-outlined text-[#D4AF37] text-sm">star</span>
                        </div>
                        <h2 class="font-serif text-2xl font-bold text-white">The Painted Muse</h2>
                    </div>
                    <p class="font-sans text-white/60 text-sm leading-relaxed mb-8 max-w-sm">India's premier multi-art platform — celebrating the living traditions of every state.</p>
                    <div class="flex gap-4">
                        <a href="#" class="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-[#D4AF37] transition-all"><span class="material-symbols-outlined text-sm">public</span></a>
                        <a href="#" class="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-[#D4AF37] transition-all"><span class="material-symbols-outlined text-sm">photo_camera</span></a>
                        <a href="#" class="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-[#D4AF37] transition-all"><span class="material-symbols-outlined text-sm">play_arrow</span></a>
                    </div>
                </div>
                <div>
                    <h3 class="font-serif italic text-[#D4AF37] text-lg mb-6">Explore</h3>
                    <ul class="space-y-4 font-sans text-sm text-white/60">
                        <li><a href="#" class="hover:text-white transition-colors">Art Forms</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Artists</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">States</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Collections</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-serif italic text-[#D4AF37] text-lg mb-6">Company</h3>
                    <ul class="space-y-4 font-sans text-sm text-white/60">
                        <li><a href="#" class="hover:text-white transition-colors">About Us</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Our Story</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Press</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Careers</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-serif italic text-[#D4AF37] text-lg mb-6">For Artists</h3>
                    <ul class="space-y-4 font-sans text-sm text-white/60 mb-8">
                        <li><a href="#" class="hover:text-white transition-colors">Join</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">How It Works</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Pricing</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Resources</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-serif italic text-[#D4AF37] text-lg mb-6">Support</h3>
                    <ul class="space-y-4 font-sans text-sm text-white/60">
                        <li><a href="#" class="hover:text-white transition-colors">FAQ</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Contact</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Privacy</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Terms</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="border-t border-white/10 mt-16 pt-8 pb-8 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto px-8">
                <p class="font-sans text-xs text-white/40">&copy; 2025 The Painted Muse - Made with <span class="text-[#B5451B]">♥</span> for Indian Art</p>
                <p class="font-sans text-[10px] text-white/40 uppercase tracking-widest">Crafted in India IN</p>
            </div>
        </div>
    </footer>
"""
    
    # We replace from footer_start up to end_of_file (so it removes the old footer entirely)
    # Note: we need to remove the old <main> closing tag if it was included in the replacement. 
    # The old footer had `</main>` before it!
    # Wait, in the old file: 
    # </section>
    # </main>
    # <!-- Fixed Send a Message Button -->
    # <a ...
    # Let's adjust so we replace from `<!-- Support & Social -->` to the end of the file except `</body>` and scripts.
    
    # Let's find </main> instead to be safe.
    main_end = content.find('</main>', footer_start)
    if main_end != -1:
        # We'll just slice from footer_start to the <script> block at the end
        script_start = content.find('<script>', main_end)
        if script_start != -1:
            content = content[:footer_start] + new_footer_html + content[script_start:]


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done replacing.")
