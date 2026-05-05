// Hero parallax (subtle)
const heroArt=document.querySelector('.hero-art');
addEventListener('scroll',()=>{if(heroArt&&scrollY<800)heroArt.style.transform=`translateY(${scrollY*0.15}px) scale(${1+scrollY*0.0002})`});


// Nav scroll
const nav=document.getElementById('nav');
addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>20));
// mobile nav
document.getElementById('hamburger').onclick=()=>document.getElementById('mobileNav').classList.add('open');
document.getElementById('closeMobile').onclick=()=>document.getElementById('mobileNav').classList.remove('open');
document.querySelectorAll('#mobileNav a').forEach(a=>a.onclick=()=>document.getElementById('mobileNav').classList.remove('open'));

// State data
const STATES={
  rajasthan:{name:'Rajasthan',form:'Miniature Painting',desc:'Intricate, jewel-toned scenes painted with squirrel-hair brushes — the courtly art of Rajasthan, perfected over six centuries.'},
  bihar:{name:'Bihar',form:'Madhubani Painting',desc:'Born on the mud walls of Mithila, Madhubani fills every inch with deities, fish, and flowering vines in bold natural pigments.'},
  maharashtra:{name:'Maharashtra',form:'Warli Art',desc:'White rice-paste figures dancing across earth-red walls — the 2,500-year-old visual language of the Warli tribe.'},
  tn:{name:'Tamil Nadu',form:'Tanjore Painting',desc:'Gold leaf, semi-precious stones, and serene divinities — the regal devotional art of Thanjavur.'},
  odisha:{name:'Odisha',form:'Pattachitra',desc:'Mythological epics painted on cloth-and-tamarind canvases by the chitrakars of Raghurajpur.'},
  punjab:{name:'Punjab',form:'Phulkari',desc:'"Flower work" — the silken floss embroidery that turns shawls into fields of blossom.'},
  ap:{name:'Andhra Pradesh',form:'Kalamkari',desc:'Hand-painted and block-printed cloth dyed with myrobalan and indigo, telling stories of the Ramayana.'},
  mp:{name:'Madhya Pradesh',form:'Gond Art',desc:'Tribal dreamscapes built from dots and dashes — every line carries a song of the Gond people.'},
  sikkim:{name:'Sikkim',form:'Thangka Painting',desc:'Buddhist scroll paintings of mandalas and deities, made for meditation in the high Himalayas.'},
  bengal:{name:'West Bengal',form:'Dokra Metal Craft',desc:'Lost-wax bronze casting practiced for 4,000 years — tribal figurines with a primitive elegance.'},
  jammu:{name:'Jammu & Kashmir',form:'Pashmina &amp; Papier-mâché',desc:'Hand-spun pashmina and lacquered papier-mâché — the lyrical crafts of the Vale.'},
  haryana:{name:'Haryana',form:'Sanjhi Paper Cutting',desc:'Devotional paper-cut stencils used in temple rituals — a vanishing folk craft.'},
  up:{name:'Uttar Pradesh',form:'Chikankari',desc:'The shadow-fine white-on-white embroidery of Lucknow, said to descend from Mughal courts.'},
  gujarat:{name:'Gujarat',form:'Pithora Painting',desc:'Vibrant ritual murals offered to the deity Pithora Dev by the Rathwa tribes.'},
  karnataka:{name:'Karnataka',form:'Mysore Painting',desc:'Soft, devotional miniatures with subtle gesso work and muted gold — the gentle cousin of Tanjore.'},
  kerala:{name:'Kerala',form:'Kerala Mural',desc:'Temple wall paintings in five sacred colours, depicting Hindu epics with serene grandeur.'}
};
const link=document.getElementById('pvLink'),pvState=document.getElementById('pvState'),pvPill=document.getElementById('pvPill'),pvForm=document.getElementById('pvForm'),pvDesc=document.getElementById('pvDesc'),card=document.getElementById('previewCard');
function setState(k){const s=STATES[k];if(!s)return;card.classList.add('fading');setTimeout(()=>{pvState.textContent=s.name;pvPill.textContent=s.name;pvForm.innerHTML=s.form;pvDesc.innerHTML=s.desc;link.textContent=`Explore ${s.name} Artists →`;card.classList.remove('fading');document.querySelectorAll('#indiaMap path').forEach(p=>p.classList.toggle('active',p.dataset.state===k));document.querySelectorAll('.sp').forEach(p=>p.classList.toggle('active',p.dataset.state===k));},180);}
document.querySelectorAll('#indiaMap path').forEach(p=>{p.addEventListener('click',()=>setState(p.dataset.state));p.addEventListener('mouseenter',()=>{p.style.filter='drop-shadow(0 4px 10px rgba(196,98,45,.4))'});});
// state pills
const pills=document.getElementById('statePills');
Object.keys(STATES).forEach(k=>{const b=document.createElement('button');b.className='sp';b.dataset.state=k;b.textContent=STATES[k].name;b.onclick=()=>setState(k);pills.appendChild(b)});
setState('rajasthan');

// Categories
const CATS=['Madhubani','Warli','Tanjore','Pattachitra','Gond Art','Kalamkari','Phulkari','Miniature','Thangka','Dokra','Kerala Mural','Pichwai','Batik','Dhokra','Tribal Art'];
const COUNTS=[142,98,76,54,89,112,67,134,42,38,71,29,55,33,82];
const cs=document.getElementById('catScroll');
CATS.forEach((c,i)=>{const n=String(i+1).padStart(2,'0');cs.insertAdjacentHTML('beforeend',`<div class="cat-card"><div class="bg"></div><div class="ov"></div><span class="num">№ ${n}</span><div class="info"><h4>${c}</h4><span class="pill pill-saffron">${COUNTS[i]} Artists</span></div></div>`)});

// Artists
const ARTISTS=[
  ['Meera Devi','Bihar','Madhubani','5th generation Madhubani artist from Mithila, Bihar.',4.9,48],
  ['Bhaskar Mohapatra','Odisha','Pattachitra','Master chitrakar of Raghurajpur, painting the gods on palm leaves.',5.0,67],
  ['Jivya Soma Mashe','Maharashtra','Warli','Reviving the white-on-earth language of the Warli tribe.',4.8,52],
  ['Anjali Pichai','Tamil Nadu','Tanjore','Gold-leaf devotional art crafted across three months per piece.',4.9,33],
  ['Rukmini Verma','Rajasthan','Miniature','Squirrel-hair brushwork in the Bundi tradition since 1989.',4.7,91],
  ['Kalavati Bai','Madhya Pradesh','Gond Art','Tribal dreamscapes from the heart of the Mandla forests.',4.9,44]
];
const ag=document.getElementById('artistGrid');
ARTISTS.forEach(a=>{ag.insertAdjacentHTML('beforeend',`<article class="artist-card"><div class="artist-banner"><div class="artist-portrait"></div></div><div class="artist-body"><h4>${a[0]}</h4><div class="artist-tags"><span class="pill pill-terracotta">${a[1]}</span><span class="pill pill-outline">${a[2]}</span></div><div class="artist-meta"><span class="stars">★★★★★</span> ${a[4]} · ${a[5]} bookings</div><p class="artist-bio">${a[3]}</p><div class="artist-actions"><button class="v">View Portfolio</button><button class="b">Book Now →</button></div></div></article>`)});

// Retreats
const RT=[
  ['Udaipur, Rajasthan','Miniature Painting','5 Days','Mar 12–17','₹18,500'],
  ['Madhubani, Bihar','Madhubani Workshop','Weekend','Apr 5–7','₹9,800'],
  ['Raghurajpur, Odisha','Pattachitra Immersion','7 Days','May 1–8','₹22,000'],
  ['Kochi, Kerala','Kerala Mural','5 Days','Jun 10–15','₹19,500'],
  ['Bhuj, Gujarat','Block Printing & Bandhani','Weekend','Jul 2–4','₹12,500']
];
const rs=document.getElementById('retreatScroll');
RT.forEach(r=>{rs.insertAdjacentHTML('beforeend',`<div class="retreat-card"><div class="retreat-img"><span class="badge">${r[2]}</span></div><div class="retreat-body"><h4>${r[0]}</h4><div class="form">${r[1]}</div><span class="pill pill-saffron">${r[3]}</span><div class="row"><div><small style="color:var(--muted)">From</small><div class="price">${r[4]}</div></div><button class="btn btn-ghost" style="padding:8px 16px;font-size:13px">Know More</button></div></div></div>`)});

// Testimonials
const TS=[
  ['"My Madhubani commission arrived wrapped in a hand-written story from the artist herself. I cried."','Ananya K.','Bangalore','Art Collector'],
  ['"The Pattachitra retreat in Odisha was the most grounding week of my life. I came home with a piece of myself."','Rohan S.','Mumbai','Workshop Attendee'],
  ['"As an artist, this platform finally lets me reach collectors without losing the soul of my work."','Bhaskar M.','Bhubaneswar','Commissioned Artist'],
  ['"Six paintings later, I have an entire wall of India in my Brooklyn apartment. Heaven."','Priya R.','New York','Art Collector'],
  ['"Direct conversations with the artist before commissioning made all the difference."','Vikram J.','Delhi','Art Collector'],
  ['"I learned Warli from a master in his own village. No middlemen. Just the art."','Sara L.','London','Workshop Attendee']
];
const m=document.getElementById('marquee');
const make=t=>`<div class="t-card"><p class="quote">${t[0]}</p><div class="who"><div class="av"></div><div><div class="name">${t[1]}</div><div class="city">${t[2]}</div><div class="stars">★★★★★</div></div></div><span class="role">${t[3]}</span></div>`;
m.innerHTML=[...TS,...TS].map(make).join('');

// Reveal on scroll
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('in')),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// Lucide icons
addEventListener('load',()=>window.lucide&&window.lucide.createIcons());
