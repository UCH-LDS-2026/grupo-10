/* =====================================================================
   home.js — Itera Home Page
   ===================================================================== */

// --- Inject Carousel CSS dynamically (avoids editing HTML style block) ---
(function injectCarouselCSS() {
  const style = document.createElement('style');
  style.textContent = `
    #dest-carousel-wrapper {
      position: relative; overflow: hidden;
      border-radius: 1.5rem;
      box-shadow: 0 25px 60px -15px rgba(0,0,0,0.25);
      background: #1e293b;
      height: 480px;
    }
    #dest-carousel-track {
      display: flex; height: 100%;
      transition: transform 0.65s cubic-bezier(0.77, 0, 0.175, 1);
      will-change: transform;
    }
    .dest-slide { position: relative; flex: 0 0 100%; height: 100%; overflow: hidden; }
    .dest-slide img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s ease; }
    .dest-slide.active img { transform: scale(1.06); }
    .dest-slide-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.28) 45%, transparent 100%);
      pointer-events: none;
    }
    .dest-slide-content {
      position: absolute; bottom: 0; left: 0; right: 0;
      padding: 2.5rem; color: white;
      display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem;
    }
    .dest-slide-go-btn {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.65rem 1.4rem; border-radius: 9999px;
      background: rgba(255,255,255,0.18); backdrop-filter: blur(8px);
      border: 1.5px solid rgba(255,255,255,0.3); color: white;
      font-weight: 600; font-size: 0.85rem;
      cursor: pointer; transition: all 0.2s ease;
      white-space: nowrap;
    }
    .dest-slide-go-btn:hover { background: rgba(255,255,255,0.32); transform: scale(1.05); }
    .dest-arrow {
      position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
      background: rgba(255,255,255,0.14); backdrop-filter: blur(10px);
      border: 1.5px solid rgba(255,255,255,0.28); color: white;
      width: 50px; height: 50px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s ease; outline: none;
    }
    .dest-arrow:hover { background: rgba(255,255,255,0.28); transform: translateY(-50%) scale(1.1); }
    .dest-arrow-prev { left: 1.25rem; }
    .dest-arrow-next { right: 1.25rem; }
    .dest-dots { position: absolute; bottom: 1.5rem; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 10; }
    .dest-dot { width: 8px; height: 8px; border-radius: 9999px; background: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.3s ease; border: none; outline: none; padding: 0; }
    .dest-dot.active { width: 28px; background: white; }
    .dest-thumbs { display: flex; gap: 0.75rem; margin-top: 1rem; }
    .dest-thumb { flex: 1; height: 80px; border-radius: 0.75rem; overflow: hidden; cursor: pointer; opacity: 0.5; border: 2px solid transparent; transition: all 0.3s ease; }
    .dest-thumb.active { opacity: 1; border-color: #0058bf; transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,88,191,0.38); }
    .dest-thumb img { width: 100%; height: 100%; object-fit: cover; }
    @keyframes shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
    .skeleton-shimmer { background: linear-gradient(90deg,#e2e8f0 25%,#cbd5e1 50%,#e2e8f0 75%); background-size: 600px 100%; animation: shimmer 1.5s infinite; }
  `;
  document.head.appendChild(style);
})();

/* =====================================================================
   CAROUSEL CLASS
   ===================================================================== */
class DestCarousel {
  constructor(slides) {
    this.slides = slides;   // [{ nombre, tag, imgUrl, pid }]
    this.current = 0;
    this.total = slides.length;
    this.autoplayTimer = null;
    this.AUTOPLAY_MS = 4500;

    this.track = document.getElementById('dest-carousel-track');
    this.dotsEl = document.getElementById('dest-dots');
    this.thumbsEl = document.getElementById('dest-thumbs');
    this.wrapper = document.getElementById('dest-carousel-wrapper');

    this._build();
    this._bindArrows();
    this._goTo(0);
    this._startAutoplay();
  }

  _build() {
    // Remove skeleton shimmer
    this.wrapper.classList.remove('skeleton-shimmer');

    // Build slides
    this.track.innerHTML = this.slides.map((s, i) => `
      <div class="dest-slide" id="dest-slide-${i}">
        <img
          src="${s.imgUrl}"
          alt="${s.nombre}"
          onerror="this.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop'"
          loading="lazy"
        />
        <div class="dest-slide-overlay"></div>
        <div class="dest-slide-content">
          <div>
            <p style="font-size:0.7rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;opacity:0.75;margin-bottom:0.35rem;">${s.tag}</p>
            <h3 style="font-size:2rem;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;line-height:1.1;">${s.nombre}</h3>
          </div>
          <button class="dest-slide-go-btn" onclick="window.location.href='../destinations/index.html?pid=${s.pid}'">
            Explorar
            <span class="material-symbols-outlined" style="font-size:1rem;">arrow_forward</span>
          </button>
        </div>
      </div>
    `).join('');

    // Build dots
    this.dotsEl.innerHTML = this.slides.map((_, i) =>
      `<button class="dest-dot" data-idx="${i}" aria-label="Ir al destino ${i + 1}"></button>`
    ).join('');
    this.dotsEl.querySelectorAll('.dest-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        this._goTo(parseInt(dot.dataset.idx));
        this._resetAutoplay();
      });
    });

    // Build thumbnails
    this.thumbsEl.innerHTML = this.slides.map((s, i) => `
      <div class="dest-thumb" data-idx="${i}" title="${s.nombre}">
        <img src="${s.imgUrl}" alt="${s.nombre}"
          onerror="this.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=400&auto=format&fit=crop'"
        />
      </div>
    `).join('');
    this.thumbsEl.querySelectorAll('.dest-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        this._goTo(parseInt(thumb.dataset.idx));
        this._resetAutoplay();
      });
    });
  }

  _bindArrows() {
    document.getElementById('dest-prev')?.addEventListener('click', () => {
      this._goTo((this.current - 1 + this.total) % this.total);
      this._resetAutoplay();
    });
    document.getElementById('dest-next')?.addEventListener('click', () => {
      this._goTo((this.current + 1) % this.total);
      this._resetAutoplay();
    });

    // Pause on hover
    this.wrapper.addEventListener('mouseenter', () => this._stopAutoplay());
    this.wrapper.addEventListener('mouseleave', () => this._startAutoplay());

    // Swipe support (touch)
    let touchStartX = null;
    this.wrapper.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    this.wrapper.addEventListener('touchend', e => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) {
        this._goTo(dx < 0
          ? (this.current + 1) % this.total
          : (this.current - 1 + this.total) % this.total
        );
        this._resetAutoplay();
      }
      touchStartX = null;
    }, { passive: true });
  }

  _goTo(idx) {
    // Remove active from old slide
    const oldSlide = document.getElementById(`dest-slide-${this.current}`);
    if (oldSlide) oldSlide.classList.remove('active');

    this.current = idx;
    this.track.style.transform = `translateX(-${idx * 100}%)`;

    // Activate new slide (for zoom effect)
    const newSlide = document.getElementById(`dest-slide-${this.current}`);
    if (newSlide) newSlide.classList.add('active');

    // Update dots
    this.dotsEl.querySelectorAll('.dest-dot').forEach((d, i) =>
      d.classList.toggle('active', i === idx)
    );

    // Update thumbs
    this.thumbsEl.querySelectorAll('.dest-thumb').forEach((t, i) =>
      t.classList.toggle('active', i === idx)
    );
  }

  _startAutoplay() {
    this.autoplayTimer = setInterval(() => {
      this._goTo((this.current + 1) % this.total);
    }, this.AUTOPLAY_MS);
  }

  _stopAutoplay() {
    clearInterval(this.autoplayTimer);
  }

  _resetAutoplay() {
    this._stopAutoplay();
    this._startAutoplay();
  }
}

/* =====================================================================
   DOMContentLoaded
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // --- Auth guard ---
  const userStr = localStorage.getItem('itera_user');
  if (!userStr) {
    window.location.href = '../auth/index.html';
    return;
  }

  const user = JSON.parse(userStr);
  const unameEl = document.getElementById('user-greeting-name');
  if (unameEl) unameEl.innerText = user.nombre || 'Viajero';

  // --- Search autocomplete (Native Google Places) ---
  const input = document.getElementById('google-places-search');
  if (input) {
    function initAutocomplete() {
      if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        setTimeout(initAutocomplete, 200);
        return;
      }
      // Inicializamos el Autocomplete de Google
      const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ['(cities)'], // Sugerir principalmente ciudades
      });

      // Manejar la selección de un destino
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place && place.place_id) {
          window.location.href = `../destinations/index.html?pid=${place.place_id}`;
        } else if (place && place.name) {
          // Si no hay ID, buscamos por nombre
          window.location.href = `../destinations/index.html?q=${encodeURIComponent(place.name)}`;
        }
      });

      // Evitar que el formulario se envíe al presionar Enter en el autocomplete
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && document.querySelector('.pac-item-selected')) {
          e.preventDefault();
        }
      });
    }
    initAutocomplete();
  }

  // --- Destinos Destacados (Carousel) ---
  async function loadFeaturedDestinations() {
    const wrapper = document.getElementById('dest-carousel-wrapper');
    if (!wrapper) return;

    const top15Cities = [
      'París, Francia', 'Londres, Reino Unido', 'Dubái, Emiratos Árabes Unidos',
      'Tokio, Japón', 'Roma, Italia', 'Nueva York, Estados Unidos',
      'Estambul, Turquía', 'Bangkok, Tailandia', 'Singapur',
      'Barcelona, España', 'Ámsterdam, Países Bajos', 'Seúl, Corea del Sur',
      'Madrid, España', 'Osaka, Japón', 'Milán, Italia'
    ];

    // Pick 5 random cities for a more dynamic carousel
    const shuffled = [...top15Cities].sort(() => 0.5 - Math.random());
    const selectedCities = shuffled.slice(0, 5);

    const fallbackImg = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop';

    try {
      const fetchPromises = selectedCities.map(city =>
        fetch(`/api/places/textsearch?q=${encodeURIComponent(city + ' turismo')}`)
          .then(r => r.json())
          .catch(() => [])
      );
      const results = await Promise.all(fetchPromises);

      const slides = results.map((placesList, i) => {
        const place = (placesList && placesList.length > 0) ? placesList[0] : null;
        if (!place) {
          return { nombre: selectedCities[i], tag: 'Destino Top', imgUrl: fallbackImg, pid: '' };
        }
        const nombre = place.displayName?.text || place.displayName || selectedCities[i];
        const pid = place.id || '';
        const imgUrl = (place.photos && place.photos.length > 0 && pid)
          ? `/api/places/${pid}/photo?max_width=1600`
          : fallbackImg;
        return { nombre, tag: 'Destino Destacado', imgUrl, pid };
      });

      // Init carousel
      new DestCarousel(slides);

    } catch (err) {
      console.error('[Destinos Destacados]', err);
      wrapper.classList.remove('skeleton-shimmer');
      wrapper.innerHTML = `<p style="color:#94a3b8;text-align:center;padding:2rem;">No se pudieron cargar los destinos destacados.</p>`;
    }
  }

  // --- Viajes en progreso o Planes rápidos ---
  async function loadFeaturedPlans() {
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
      setTimeout(loadFeaturedPlans, 200);
      return;
    }
    const fastPlansContainer = document.getElementById('fast-plans');
    const userTripsContainer = document.getElementById('user-trips');
    
    // 1. Cargar Planes Rápidos
    if (fastPlansContainer) {
        const fastTrips = [
          { id: 'disney', plan: 'Aventura en Disney', tipo: 'Orlando, EE.UU.', searchQuery: 'Walt Disney World Resort, Orlando' },
          { id: 'paris', plan: 'Romance en París', tipo: 'París, Francia', searchQuery: 'Eiffel Tower, Paris' },
          { id: 'miami', plan: 'Escapada a Miami', tipo: 'Miami, EE.UU.', searchQuery: 'South Beach, Miami' },
          { id: 'argentina', plan: 'Descubrí Argentina', tipo: 'Buenos Aires · Córdoba · Mendoza', searchQuery: 'Obelisco, Buenos Aires, Argentina' },
          { id: 'caribe', plan: 'Paraíso Caribeño', tipo: 'Cancún · Punta Cana · Aruba', searchQuery: 'Playa del Carmen, Cancún, México' }
        ];

        // Fetch photos from Google Places
        const dummyDiv = document.createElement('div');
        const placesService = new google.maps.places.PlacesService(dummyDiv);

        const enrichedPlans = await Promise.all(fastTrips.map(async (trip) => {
            try {
                const results = await new Promise((resolve) => {
                    placesService.textSearch({ query: trip.searchQuery }, (res, status) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK && res.length > 0) {
                            resolve(res[0]);
                        } else resolve(null);
                    });
                });

                if (results && results.place_id) {
                    trip.foto = `/api/places/${results.place_id}/photo?max_width=1200`;
                } else {
                    // Fallback
                    trip.foto = 'https://images.unsplash.com/photo-1542364560-64696f0ba859?q=80&w=1000&auto=format&fit=crop';
                }
            } catch (e) {
                trip.foto = 'https://images.unsplash.com/photo-1542364560-64696f0ba859?q=80&w=1000&auto=format&fit=crop';
            }
            return trip;
        }));

        const cardsHtml = enrichedPlans.map((plan, idx) => {
          return `
            <div class="flex-none w-[320px] h-[360px] fast-plan-card premium-pop-in" style="animation-delay: ${0.5 + (idx * 0.1)}s" data-template="${plan.id}" onclick="window.location.href='../create-trip/index.html?template=${plan.id}'">
              <div class="bg-slate-900 rounded-none overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer h-full flex flex-col relative hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30 duration-300 group">
                <div class="absolute inset-0 z-0 overflow-hidden">
                  <img alt="${plan.plan}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" src="${plan.foto}" draggable="false"/>
                </div>
                <div class="absolute bottom-0 left-0 right-0 h-[45%] z-10 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
                
                <div class="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md text-white border border-white/20 text-xs font-bold px-3 py-1.5 rounded-none shadow-md flex items-center gap-1">
                  <span class="material-symbols-outlined" style="font-size: 14px;">bolt</span> Rápido
                </div>
                
                <div class="p-6 flex flex-col justify-end flex-1 z-20 relative">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-white/90 text-xs font-medium w-3/4 truncate drop-shadow-md">${plan.tipo}</span>
                  </div>
                  <h4 class="text-2xl font-extrabold font-headline mb-4 text-white drop-shadow-lg leading-tight mt-1">${plan.plan}</h4>
                  
                  <div class="flex items-center justify-between border-t border-white/20 pt-4 mt-auto">
                    <span class="text-white font-bold text-sm tracking-wide">Usar plantilla</span>
                    <button class="material-symbols-outlined text-white group-hover:translate-x-2 transition-transform drop-shadow-md">arrow_forward</button>
                  </div>
                </div>
              </div>
            </div>`;
        }).join('');
        // We'll duplicate the cards 3 times to ensure enough track length for smooth infinite scrolling
        fastPlansContainer.innerHTML = cardsHtml + cardsHtml + cardsHtml; 
    }

    if (!userTripsContainer) return;

    // 2. Cargar Viajes del Usuario
    try {
      const sessionStr = localStorage.getItem('itera_user');
      let userId = null;
      if (sessionStr) {
        const sessionUser = JSON.parse(sessionStr);
        if (sessionUser && sessionUser.id) userId = sessionUser.id;
      }

      let userTrips = [];
      if (userId) {
        try {
          const resp = await fetch(`http://localhost:8000/api/viajes?creador_id=${encodeURIComponent(userId)}`);
          if (resp.ok) {
            const results = await resp.json();
            userTrips = results.filter(v => {
              const est = (v.estado || '').toLowerCase();
              return ['planificación', 'en planificación', 'borrador'].includes(est);
            });
          }
        } catch (err) {
          console.warn("Could not fetch user trips", err);
        }
      }

      if (userTrips.length > 0) {
        const tripsWithImages = await Promise.all(userTrips.map(async (plan) => {
           let finalImg = plan.foto_url || plan.foto;
           let destName = plan.destino_principal;

           if (destName === "Varios Destinos" || !finalImg) {
               // Intentar cargar destinos específicos de este viaje
               const perTripDestsStr = localStorage.getItem('itera_trip_destinations_' + plan.id);
               let dests = null;
               
               if (perTripDestsStr) {
                   try { dests = JSON.parse(perTripDestsStr); } catch(e) {}
               }
               
               // Fallback: cargar desde backend
               if (!dests || dests.length === 0) {
                   try {
                       const destResp = await fetch(`http://localhost:8000/api/viajes/${plan.id}/destinos`);
                       if (destResp.ok) {
                           const backendDests = await destResp.json();
                           if (backendDests && backendDests.length > 0) {
                               dests = backendDests.map(d => ({
                                   city: d.city,
                                   country: d.country,
                                   photoUrl: d.photo_url
                               }));
                           }
                       }
                   } catch(e) { /* backend no disponible */ }
               }
               
               if (dests && dests.length > 0) {
                   if (destName === "Varios Destinos") {
                       destName = dests[0].city || dests[0].country || "Desconocido";
                   }
                   if (dests[0].photoUrl || dests[0].photo_url) {
                       finalImg = dests[0].photoUrl || dests[0].photo_url;
                   }
               }
           }

           if (!finalImg && destName && destName !== "Varios Destinos") {
               try {
                  const query = encodeURIComponent(destName + ' turismo');
                  const placeResp = await fetch(`/api/places/search?q=${query}`);
                  if (placeResp.ok) {
                      const placeData = await placeResp.json();
                      const place = (placeData && placeData.length > 0) ? placeData[0] : null;
                      if (place && place.photos && place.photos.length > 0 && place.id) {
                          finalImg = `/api/places/${place.id}/photo?max_width=1000`;
                      }
                  }
               } catch (e) {
                  console.warn('Could not fetch image for', destName);
               }
           }
           if (!finalImg) {
               finalImg = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop';
           }
           return { ...plan, finalImg, displayTag: destName };
        }));

        userTripsContainer.innerHTML = tripsWithImages.map((plan, idx) => {
          const pName = plan.nombre || 'Viaje sin nombre';
          const tag = plan.displayTag || 'Destino por definir';
          const img = plan.finalImg;
          let dur = 'VARIOS DÍAS';
          if (plan.fecha_inicio && plan.fecha_fin) {
            const d1 = new Date(plan.fecha_inicio), d2 = new Date(plan.fecha_fin);
            const diff = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
            dur = diff + ' DÍAS';
          }

          return `
            <div class="flex-none w-[350px] h-[400px] snap-start premium-pop-in" style="animation-delay: ${0.5 + (idx * 0.1)}s" onclick="localStorage.setItem('current_trip_id','${plan.id}');window.location.href='../trip-detail/index.html?id=${plan.id}'">
              <div class="bg-slate-900 rounded-none overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer h-full flex flex-col relative hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30 duration-300 group">
                <div class="absolute inset-0 z-0 overflow-hidden">
                  <img alt="${pName}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" src="${img}" draggable="false"/>
                </div>
                <div class="absolute bottom-0 left-0 right-0 h-[50%] z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>
                
                <div class="absolute top-4 right-4 z-20 bg-primary/20 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold px-3 py-1.5 rounded-none shadow-md flex items-center gap-1 uppercase tracking-wider">
                  <span class="material-symbols-outlined" style="font-size: 14px;">pending_actions</span> ${plan.estado || 'En progreso'}
                </div>
                
                <div class="p-6 flex flex-col justify-end flex-1 z-20 relative">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-none border border-white/20">${dur}</span>
                    <span class="text-white/90 text-xs font-medium w-2/3 truncate drop-shadow-md">${tag}</span>
                  </div>
                  <h4 class="text-2xl font-extrabold font-headline mb-4 text-white drop-shadow-lg leading-tight mt-1">${pName}</h4>
                  
                  <div class="flex items-center justify-between border-t border-white/20 pt-4 mt-auto">
                    <span class="text-white font-bold text-sm tracking-wide">Continuar planificando</span>
                    <button class="material-symbols-outlined text-white group-hover:translate-x-2 transition-transform drop-shadow-md">arrow_forward</button>
                  </div>
                </div>
              </div>
            </div>`;
        }).join('');
      } else {
        // Empty state
        userTripsContainer.innerHTML = `
        <div class="col-span-full py-16 px-8 mx-auto text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/50 w-full flex flex-col items-center gap-4">
           <span class="material-symbols-outlined text-6xl text-outline-variant">travel_explore</span>
           <h3 class="text-xl font-bold text-on-surface">No tienes viajes en esta categoría</h3>
           <p class="text-on-surface-variant max-w-md">Parece que aún no tienes itinerarios armados aquí. ¡Anímate a planificar tu próxima aventura y explora destinos increíbles!</p>
           <div class="flex gap-4 mt-2">
                          <div onclick="localStorage.removeItem('current_trip_id'); window.location.href='../create-trip/index.html'" class="relative flex font-semibold overflow-hidden text-black cursor-pointer transition-all duration-700 rounded-3xl px-10 py-6 hover:px-11 hover:py-7 hover:rounded-[2rem] mx-auto w-fit group glass-button-container" style="box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1);">
                <!-- Glass Layers -->
                <div class="absolute inset-0 z-0 overflow-hidden rounded-3xl group-hover:rounded-[2rem] transition-all duration-700" style="backdrop-filter: blur(3px); filter: url(#glass-distortion); isolation: isolate;"></div>
                <div class="absolute inset-0 z-10" style="background: rgba(255, 255, 255, 0.25);"></div>
                <div class="absolute inset-0 z-20 rounded-3xl group-hover:rounded-[2rem] overflow-hidden transition-all duration-700" style="box-shadow: inset 2px 2px 1px 0 rgba(255, 255, 255, 0.5), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.5);"></div>
                <div class="relative z-30 transition-all duration-700 group-hover:scale-95 flex items-center gap-3 glass-button-content text-on-surface">
                    <span class="material-symbols-outlined text-2xl">add</span>
                    <span class="text-lg font-bold">Crear Viaje</span>
                </div>
             </div>
             <button onclick="window.location.href='../destinations/index.html'" class="px-6 py-3 border-2 border-primary text-primary rounded-full font-bold hover:bg-primary/10 transition-colors">Ver Destinos Populares</button>
           </div>
        </div>`;
        userTripsContainer.classList.remove('snap-x', 'overflow-x-auto');
      }
    } catch (e) {
      console.error('Error fetching plans:', e);
      userTripsContainer.innerHTML = '<p class="text-slate-500 pl-4 w-full">No se pudieron cargar los viajes.</p>';
    }
  }


  // --- Init ---
  loadFeaturedDestinations();
  loadFeaturedPlans();

  // --- Fast Plans Auto Scroll, Drag & Arrow Logic ---
  const fastSlider = document.getElementById('fast-plans');
  const btnPrev = document.getElementById('fast-plans-prev');
  const btnNext = document.getElementById('fast-plans-next');
  let isDown = false;
  let startX;
  let scrollLeft;
  let isDragging = false;
  let autoScrollActive = true;
  let scrollSpeed = 0.5; // px per frame

  function scrollLoop() {
    if (autoScrollActive && !isDown) {
      if (fastSlider) {
        fastSlider.scrollLeft += scrollSpeed;
        
        // Infinite logic: we triplicated the items.
        // We reset to middle third when reaching edges to ensure seamless loop.
        const oneThirdScroll = fastSlider.scrollWidth / 3;
        
        if (fastSlider.scrollLeft >= oneThirdScroll * 2) {
          fastSlider.scrollLeft -= oneThirdScroll;
        } else if (fastSlider.scrollLeft <= 0) {
          fastSlider.scrollLeft += oneThirdScroll;
        }
      }
    }
    requestAnimationFrame(scrollLoop);
  }

  if (fastSlider) {
    // Start auto loop
    requestAnimationFrame(scrollLoop);

    // Pause on hover
    fastSlider.addEventListener('mouseenter', () => autoScrollActive = false);
    fastSlider.addEventListener('mouseleave', () => {
      autoScrollActive = true;
      isDown = false;
      fastSlider.classList.remove('active:cursor-grabbing');
    });

    // Mouse drag logic
    fastSlider.addEventListener('mousedown', (e) => {
      isDown = true;
      isDragging = false;
      autoScrollActive = false;
      fastSlider.classList.add('active:cursor-grabbing');
      startX = e.pageX - fastSlider.offsetLeft;
      scrollLeft = fastSlider.scrollLeft;
    });

    fastSlider.addEventListener('mouseup', () => {
      isDown = false;
      fastSlider.classList.remove('active:cursor-grabbing');
      autoScrollActive = true;
    });

    fastSlider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - fastSlider.offsetLeft;
      const walk = (x - startX) * 2; 
      if (Math.abs(walk) > 5) {
         isDragging = true;
      }
      fastSlider.scrollLeft = scrollLeft - walk;
      
      const oneThirdScroll = fastSlider.scrollWidth / 3;
      if (fastSlider.scrollLeft >= oneThirdScroll * 2) {
        fastSlider.scrollLeft -= oneThirdScroll;
        scrollLeft -= oneThirdScroll;
      } else if (fastSlider.scrollLeft <= 0) {
        fastSlider.scrollLeft += oneThirdScroll;
        scrollLeft += oneThirdScroll;
      }
    });

    fastSlider.addEventListener('click', (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const card = e.target.closest('.fast-plan-card');
      if (card && card.dataset.template) {
        window.location.href = '../create-trip/index.html?template=' + card.dataset.template;
      }
    }, true);
  }

  function jumpScroll(amount) {
    autoScrollActive = false;
    fastSlider.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(() => {
      autoScrollActive = true;
      const oneThirdScroll = fastSlider.scrollWidth / 3;
      if (fastSlider.scrollLeft >= oneThirdScroll * 2) fastSlider.scrollLeft -= oneThirdScroll;
      if (fastSlider.scrollLeft <= 0) fastSlider.scrollLeft += oneThirdScroll;
    }, 600);
  }

  if (btnPrev && btnNext && fastSlider) {
    btnPrev.addEventListener('click', () => jumpScroll(-344));
    btnNext.addEventListener('click', () => jumpScroll(344));
  }

  // --- User Trips Arrow Logic ---
  const tripsSlider = document.getElementById('user-trips');
  const tripsPrev = document.getElementById('user-trips-prev');
  const tripsNext = document.getElementById('user-trips-next');

  if (tripsSlider && tripsPrev && tripsNext) {
    tripsPrev.addEventListener('click', () => {
      tripsSlider.scrollBy({ left: -382, behavior: 'smooth' });
    });
    tripsNext.addEventListener('click', () => {
      tripsSlider.scrollBy({ left: 382, behavior: 'smooth' });
    });
  }

  // --- 3D Globe Initialization ---
  async function initGlobe3D() {
    const globe = document.getElementById('home-globe-3d');
    if (!globe) return;

    try {
      // Cargar librerías
      await google.maps.importLibrary("maps3d");
      
      // Esperar a que el motor 3D esté listo
      await new Promise(r => setTimeout(r, 1200));

      // --- SVG Data URIs para máxima compatibilidad en 3D ---
      const pinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
        <path d="M20 0C8.95 0 0 8.95 0 20c0 14 20 30 20 30s20-16 20-30c0-11.05-8.95-20-20-20z" fill="#FF5500"/>
        <circle cx="20" cy="20" r="7" fill="white"/>
      </svg>`;
      const pinUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(pinSvg)}`;

      const planeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="white" stroke="#1e293b" stroke-width="2"/>
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="#0f172a" transform="translate(8, 8) rotate(45, 12, 12)"/>
      </svg>`;
      const planeUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(planeSvg)}`;

      // --- Ciudades ---
      const locations = [
        { name: "París", lat: 48.8566, lng: 2.3522 },
        { name: "Londres", lat: 51.5074, lng: -0.1278 },
        { name: "Dubái", lat: 25.2048, lng: 55.2708 },
        { name: "Tokio", lat: 35.6762, lng: 139.6503 },
        { name: "Roma", lat: 41.9028, lng: 12.4964 },
        { name: "Nueva York", lat: 40.7128, lng: -74.0060 },
        { name: "Barcelona", lat: 41.3851, lng: 2.1734 },
        { name: "Estambul", lat: 41.0082, lng: 28.9784 },
        { name: "Bangkok", lat: 13.7563, lng: 100.5018 },
        { name: "Singapur", lat: 1.3521, lng: 103.8198 },
        { name: "Ámsterdam", lat: 52.3676, lng: 4.9041 },
        { name: "Seúl", lat: 37.5665, lng: 126.9780 },
        { name: "Madrid", lat: 40.4168, lng: -3.7038 },
        { name: "Milán", lat: 45.4642, lng: 9.1900 },
        { name: "Hong Kong", lat: 22.3193, lng: 114.1694 },
        { name: "Osaka", lat: 34.6937, lng: 135.5023 },
        { name: "Viena", lat: 48.2082, lng: 16.3738 },
        { name: "Praga", lat: 50.0755, lng: 14.4378 },
        { name: "Lisboa", lat: 38.7223, lng: -9.1393 },
        { name: "Venecia", lat: 45.4408, lng: 12.3155 }
      ];

      locations.forEach((loc) => {
        const marker = document.createElement('gmp-marker-3d');
        marker.setAttribute('position', `${loc.lat},${loc.lng},0`);
        marker.setAttribute('altitude-mode', 'clamp-to-ground');
        marker.setAttribute('collision-behavior', 'required');
        marker.setAttribute('src', pinUri);
        
        marker.addEventListener('gmp-click', () => {
          window.location.href = `../destinations/index.html?q=${encodeURIComponent(loc.name)}`;
        });

        globe.appendChild(marker);
      });

      // --- Aeropuertos ---
      const airports = [
        { name: "JFK - New York", lat: 40.6413, lng: -73.7781 },
        { name: "LHR - London", lat: 51.4700, lng: -0.4543 },
        { name: "CDG - Paris", lat: 49.0097, lng: 2.5479 },
        { name: "HND - Tokyo", lat: 35.5494, lng: 139.7798 },
        { name: "DXB - Dubai", lat: 25.2532, lng: 55.3657 },
        { name: "FRA - Frankfurt", lat: 50.0379, lng: 8.5622 },
        { name: "LAX - Los Angeles", lat: 33.9416, lng: -118.4085 },
        { name: "SYD - Sydney", lat: -33.9399, lng: 151.1753 },
        { name: "GRU - Sao Paulo", lat: -23.4356, lng: -46.4731 },
        { name: "EZE - Buenos Aires", lat: -34.8150, lng: -58.5348 },
        { name: "MAD - Madrid", lat: 40.4983, lng: -3.5676 },
        { name: "SIN - Singapore", lat: 1.3644, lng: 103.9915 },
        { name: "MEX - Mexico City", lat: 19.4361, lng: -99.0719 },
        { name: "YYZ - Toronto", lat: 43.6777, lng: -79.6248 }
      ];

      airports.forEach((ap) => {
        const marker = document.createElement('gmp-marker-3d');
        marker.setAttribute('position', `${ap.lat},${ap.lng},0`);
        marker.setAttribute('altitude-mode', 'clamp-to-ground');
        marker.setAttribute('collision-behavior', 'required');
        marker.setAttribute('src', planeUri);
        globe.appendChild(marker);
      });

    } catch (err) {
      console.error("Error inicializando el globo 3D:", err);
    }
  }

  // Esperar a que el componente <gmp-map-3d> esté disponible y la API cargue
  function waitForGlobe() {
    if (typeof google !== 'undefined' && google.maps && customElements.get('gmp-map-3d')) {
      customElements.whenDefined('gmp-map-3d').then(initGlobe3D);
    } else {
      setTimeout(waitForGlobe, 400);
    }
  }
  waitForGlobe();

});
