document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const placeId = urlParams.get('pid') || null;
  const initialCategory = urlParams.get('cat') || 'all';

  let allResults = [];
  let googleResultsCount = 0;
  let localResultsCount = 0;

  const filters = {
    search: '',
    category: initialCategory,
    validation: [],
    price: 'all',
    minRating: 0,
  };
  let sortBy = 'relevance';

  const catLabels = {
    all: 'Todo',
    tourist_attraction: 'Atracciones',
    restaurant: 'Gastronomía',
    lodging: 'Alojamiento',
    transit_station: 'Transporte',
  };

  const catIcons = {
    all: 'map',
    tourist_attraction: 'museum',
    restaurant: 'restaurant',
    lodging: 'hotel',
    transit_station: 'train',
  };

  const categoriesData = [
    { key: 'all',               label: 'Todos',       icon: 'map'          },
    { key: 'tourist_attraction', label: 'Atracciones', icon: 'museum'       },
    { key: 'restaurant',         label: 'Gastronomía', icon: 'restaurant'   },
    { key: 'lodging',            label: 'Alojamiento', icon: 'hotel'        },
    { key: 'transit_station',    label: 'Transporte',  icon: 'train'        },
  ];

  const pricesData = [
    { key: 'all',  label: 'Todos'  },
    { key: 'free', label: 'Gratis' },
    { key: '$',    label: '$'      },
    { key: '$$',   label: '$$'     },
    { key: '$$$',  label: '$$$'    },
  ];

  const ratingData = [
    { key: 0,   label: 'Todas'     },
    { key: 3,   label: '3★ o más'  },
    { key: 4,   label: '4★ o más'  },
    { key: 4.5, label: '4.5★ o más'},
  ];

  // DOM refs
  const dTitle     = document.getElementById('txt-page-title');
  const dMainTitle = document.getElementById('txt-main-title');
  const dSubTitle  = document.getElementById('txt-sub-title');
  const dSubDesc   = document.getElementById('txt-subtitle-desc');
  const dDataSrc   = document.getElementById('txt-data-sources');

  const filterCategoryEl  = document.getElementById('filter-categories');
  const filterValidationEl = document.getElementById('filter-validation');
  const filterPriceEl     = document.getElementById('filter-price');
  const filterRatingEl    = document.getElementById('filter-rating');

  const grid        = document.getElementById('catalog-grid');
  const searchInput = document.getElementById('filter-search');
  const sortSelect  = document.getElementById('sort-select');

  // ── Header ──────────────────────────────────────────────────────────────────
  function updateHeader(pId, hasData) {
    dTitle.innerText     = catLabels[filters.category] || 'Lugares';
    dMainTitle.innerText = catLabels[filters.category] || 'Explorando';

    if (pId && hasData) {
      dSubTitle.innerText = 'en Destino Seleccionado';
      dSubDesc.innerText  = 'Datos en tiempo real · Google Places + BD propia';
    } else {
      dSubTitle.innerText = '';
      dSubDesc.innerText  = 'Mostrando destinos destacados a nivel mundial · Google Places';
    }
    dDataSrc.innerText = `${googleResultsCount} Google · ${localResultsCount} Local`;
  }

  // ── Fetch ────────────────────────────────────────────────────────────────────
  async function fetchData() {
    // Show skeletons
    grid.innerHTML = `
      <div class="animate-pulse bg-white rounded-xl overflow-hidden shadow-sm">
        <div class="aspect-[4/3] bg-surface-container-high"></div>
        <div class="p-6 space-y-4">
          <div class="flex justify-between"><div class="h-3 w-1/3 bg-surface-container-high rounded"></div><div class="h-3 w-12 bg-surface-container-high rounded"></div></div>
          <div class="h-6 w-2/3 bg-surface-container-highest rounded"></div>
          <div class="pt-4 border-t border-surface-container flex justify-between"><div class="h-4 w-20 bg-surface-container-high rounded"></div><div class="h-4 w-16 bg-surface-container-high rounded"></div></div>
        </div>
      </div>
      <div class="animate-pulse bg-white rounded-xl overflow-hidden shadow-sm">
        <div class="aspect-[4/3] bg-surface-container-high"></div>
        <div class="p-6 space-y-4">
          <div class="flex justify-between"><div class="h-3 w-1/3 bg-surface-container-high rounded"></div><div class="h-3 w-12 bg-surface-container-high rounded"></div></div>
          <div class="h-6 w-2/3 bg-surface-container-highest rounded"></div>
          <div class="pt-4 border-t border-surface-container flex justify-between"><div class="h-4 w-20 bg-surface-container-high rounded"></div><div class="h-4 w-16 bg-surface-container-high rounded"></div></div>
        </div>
      </div>
      <div class="animate-pulse bg-white rounded-xl overflow-hidden shadow-sm">
        <div class="aspect-[4/3] bg-surface-container-high"></div>
        <div class="p-6 space-y-4">
          <div class="flex justify-between"><div class="h-3 w-1/3 bg-surface-container-high rounded"></div><div class="h-3 w-12 bg-surface-container-high rounded"></div></div>
          <div class="h-6 w-2/3 bg-surface-container-highest rounded"></div>
          <div class="pt-4 border-t border-surface-container flex justify-between"><div class="h-4 w-20 bg-surface-container-high rounded"></div><div class="h-4 w-16 bg-surface-container-high rounded"></div></div>
        </div>
      </div>`;

    const gUrl = placeId
      ? `/api/places/${placeId}/catalog?category=${encodeURIComponent(filters.category)}&q=${encodeURIComponent(filters.search)}`
      : `/api/places/discover/featured?category=${encodeURIComponent(filters.category)}&q=${encodeURIComponent(filters.search)}`;
    const lUrl = `/api/atracciones/search?q=${encodeURIComponent(filters.search)}`;

    try {
      const [gRes, lRes] = await Promise.allSettled([
        fetch(gUrl).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(lUrl).then(r => r.ok ? r.json() : []).catch(() => []),
      ]);

      const gP = (gRes.status === 'fulfilled' ? gRes.value : []) || [];
      const lP = (lRes.status === 'fulfilled' ? lRes.value : []) || [];

      googleResultsCount = gP.length;
      localResultsCount  = lP.length;

      let seen   = new Set();
      let merged = [];

      gP.forEach(p => {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          let parsedPrice = 'indeterminado'; 
          let level = p.priceLevel ?? p.price_level;
          if (level !== undefined && level !== null) {
            if (level === 0 || level === 'PRICE_LEVEL_FREE') parsedPrice = 'free';
            else if (level === 1 || level === 'PRICE_LEVEL_INEXPENSIVE') parsedPrice = '$';
            else if (level === 2 || level === 'PRICE_LEVEL_MODERATE') parsedPrice = '$$';
            else if (level === 3 || level === 'PRICE_LEVEL_EXPENSIVE') parsedPrice = '$$$';
            else if (level === 4 || level === 'PRICE_LEVEL_VERY_EXPENSIVE') parsedPrice = '$$$$';
            else parsedPrice = 'indeterminado'; 
          }

          merged.push({
            id:            p.id,
            name:          p.displayName?.text || p.displayName || 'Google Place',
            category:      filters.category,
            categoryLabel: catLabels[filters.category] || 'Lugar',
            icon:          catIcons[filters.category]  || 'place',
            isVerified:    (p.userRatingCount || 0) > 50,
            price:         parsedPrice,
            rating:        p.rating || 4.0,
            reviews:       p.userRatingCount || Math.floor(Math.random() * 100),
            image:         p.photos && p.photos.length > 0
                             ? `/api/places/${p.id}/photo?max_width=600`
                             : null,
            description:   p.formattedAddress || '',
            source:        'google',
          });
        }
      });

      // Fallback to mock data if APIs offline
      if (merged.length === 0 && window.mockAtracciones) {
        window.mockAtracciones.forEach(m => {
          merged.push({
            id:            m.id,
            name:          m.nombre,
            category:      'tourist_attraction',
            categoryLabel: 'Atracción Local',
            icon:          'museum',
            isVerified:    true,
            price:         m.precio === 'Gratis' ? 'free' : (m.precio || '$$'),
            rating:        parseFloat(m.puntuacion),
            reviews:       120,
            image:         m.imagen,
            description:   m.ubicacion,
            source:        'local',
          });
        });
        localResultsCount = merged.length;
      }

      allResults = merged;
      renderUI();
    } catch (e) {
      console.error(e);
      allResults = [];
      renderUI();
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  function renderUI() {
    updateHeader(placeId, allResults.length > 0);
    renderSidebar();
    renderGridItems();
  }

  function getFilteredAndSorted() {
    let res = allResults.filter(p => {
      // validation
      if (filters.validation.length > 0) {
        const passV = filters.validation.includes('verified')  &&  p.isVerified;
        const passC = filters.validation.includes('community') && !p.isVerified;
        if (!passV && !passC) return false;
      }
      // price
      if (filters.price !== 'all') {
        if (filters.price === 'free' && p.price !== 'free') return false;
        if (filters.price !== 'free') {
          if (p.price === 'free') return false; // Must not be free
          // Optional: Exact symbol matching
          // if (p.price !== filters.price) return false; 
          // For a better UX, maybe we should let it exact match
          if (p.price !== filters.price) return false;
        }
      }
      // rating
      if (filters.minRating > 0 && p.rating < filters.minRating) return false;
      return true;
    });

    if (sortBy === 'rating')     res.sort((a, b) => b.rating  - a.rating);
    if (sortBy === 'reviews')    res.sort((a, b) => b.reviews - a.reviews);
    if (sortBy === 'free_first') res.sort((a, b) => (a.price === 'free' ? 0 : 1) - (b.price === 'free' ? 0 : 1));

    return res;
  }

  function renderGridItems() {
    const items = getFilteredAndSorted();

    const noResults = document.getElementById('no-results-state');
    const hasFilter = filters.price !== 'all' || filters.minRating > 0 || filters.search;
    document.getElementById('badge-filtered').classList.toggle('hidden', !hasFilter);
    document.getElementById('btn-reset-filters').classList.toggle('hidden', !hasFilter);

    if (items.length === 0) {
      grid.innerHTML = '';
      noResults.classList.remove('hidden');
      return;
    }

    noResults.classList.add('hidden');
    grid.innerHTML = '';

    items.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className   = 'fade-in';
      card.style.animationDelay = `${Math.min(idx, 8) * 0.06}s`;

      const imgSrc = p.image || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600&auto=format&fit=crop';
      const badge  = p.isVerified
        ? `<span class="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm">Verificado</span>`
        : `<span class="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-tertiary shadow-sm">Comunidad</span>`;

      const priceDisplay = p.price === 'free' ? 'Gratis' : (p.price === 'indeterminado' ? 'Indeterminado' : p.price);
      const ratingNum    = typeof p.rating === 'number' ? p.rating.toFixed(1) : p.rating;
      
      const priceTextHtml = p.price === 'indeterminado'
        ? `Costo <span class="text-sm font-bold text-on-surface ml-1 capitalize">${priceDisplay}</span>`
        : `Desde <span class="text-lg font-extrabold text-on-surface ml-1">${priceDisplay}</span>`;

      card.innerHTML = `
        <div class="group relative bg-white rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer h-full flex flex-col">
          <div class="relative aspect-[4/3] overflow-hidden flex-shrink-0">
            <img
              alt="${p.name}"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              src="${imgSrc}"
              onerror="this.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600&auto=format&fit=crop'"
            />
            <div class="absolute top-4 left-4">${badge}</div>
            <button
              class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-primary transition-all shadow-sm"
              onclick="event.stopPropagation(); window.openAddToTripModal('${p.id}')"
              title="Agregar al viaje"
              aria-label="Agregar al viaje"
            >
              <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24">bookmark_add</span>
            </button>
          </div>
          <div class="p-6 flex flex-col flex-1">
            <div class="flex justify-between items-start mb-2">
              <span class="text-xs font-bold text-primary uppercase tracking-wide">${p.categoryLabel}</span>
              <div class="flex items-center gap-1 bg-tertiary-fixed px-2 py-0.5 rounded text-on-tertiary-fixed text-[10px] font-bold">
                <span class="material-symbols-outlined text-[12px]" style="font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24">star</span>
                ${ratingNum}
              </div>
            </div>
            <h3 class="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">${p.name}</h3>
            <p class="text-sm text-on-surface-variant flex-1 mb-4 line-clamp-2">${p.description}</p>
            <div class="flex justify-between items-center pt-4 border-t border-surface-container mt-auto">
              <p class="text-xs text-on-surface-variant font-medium">
                ${priceTextHtml}
              </p>
              <button class="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                Ver más <span class="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>`;

      grid.appendChild(card);
    });
  }

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  function renderSidebar() {
    // ── Categories (grid of icon buttons)
    filterCategoryEl.innerHTML = '';
    categoriesData.forEach(cat => {
      const btn = document.createElement('button');
      const isActive = filters.category === cat.key;
      btn.className = `flex flex-col items-center justify-center p-4 rounded-xl transition-all border border-transparent shadow-sm text-[11px] font-semibold gap-1
        ${isActive
          ? 'bg-primary text-on-primary shadow-md'
          : 'bg-surface-container-lowest hover:bg-primary hover:text-on-primary'}`;
      btn.innerHTML = `
        <span class="material-symbols-outlined mb-1" style="font-variation-settings:'FILL' ${isActive?'1':'0'},'wght' 400,'GRAD' 0,'opsz' 24">${cat.icon}</span>
        ${cat.label}`;
      btn.addEventListener('click', () => {
        filters.category = cat.key;
        fetchData(); // refetch with new category
      });
      filterCategoryEl.appendChild(btn);
    });

    // ── Validation checkboxes
    filterValidationEl.innerHTML = '';
    const validationOptions = [
      { key: 'verified',  label: 'Verificados'  },
      { key: 'community', label: 'Joyas Ocultas' },
    ];
    validationOptions.forEach(opt => {
      const isChecked = filters.validation.includes(opt.key);
      const label = document.createElement('label');
      label.className = 'flex items-center gap-3 cursor-pointer group';
      label.innerHTML = `
        <div class="relative flex items-center">
          <input
            type="checkbox"
            class="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-outline-variant bg-white transition-all checked:bg-primary checked:border-primary"
            ${isChecked ? 'checked' : ''}
          />
          <span class="material-symbols-outlined absolute text-white opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm pointer-events-none" style="font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24">check</span>
        </div>
        <span class="text-sm font-medium text-on-surface-variant group-hover:text-on-surface">${opt.label}</span>`;
      label.querySelector('input').addEventListener('change', e => {
        if (e.target.checked) {
          if (!filters.validation.includes(opt.key)) filters.validation.push(opt.key);
        } else {
          filters.validation = filters.validation.filter(v => v !== opt.key);
        }
        renderUI();
      });
      filterValidationEl.appendChild(label);
    });

    // ── Price buttons
    filterPriceEl.innerHTML = '';
    pricesData.forEach(p => {
      const btn = document.createElement('button');
      const isActive = filters.price === p.key;
      btn.className = `px-3 py-1.5 rounded-full text-xs font-bold border transition-all
        ${isActive
          ? 'bg-primary text-on-primary border-primary shadow-sm'
          : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'}`;
      btn.innerText = p.label;
      btn.addEventListener('click', () => {
        filters.price = p.key;
        document.getElementById('price-label').innerText = p.label;
        renderUI();
      });
      filterPriceEl.appendChild(btn);
    });

    // ── Rating radio
    filterRatingEl.innerHTML = '';
    ratingData.forEach(r => {
      const label = document.createElement('label');
      const isActive = filters.minRating === r.key;
      label.className = `flex items-center gap-3 cursor-pointer group px-2 py-1.5 rounded-lg transition-colors ${isActive ? 'bg-primary/10' : 'hover:bg-surface-container'}`;
      label.innerHTML = `
        <div class="relative flex items-center">
          <input
            type="radio"
            name="rating-filter"
            class="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-outline-variant bg-white transition-all checked:bg-primary checked:border-primary"
            ${isActive ? 'checked' : ''}
          />
          <span class="absolute w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></span>
        </div>
        <span class="text-sm font-medium ${isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}">${r.label}</span>`;
      label.querySelector('input').addEventListener('change', () => {
        filters.minRating = r.key;
        renderUI();
      });
      filterRatingEl.appendChild(label);
    });
  }

  const searchDropdown = document.getElementById('search-dropdown');
  
  let tOut;
  searchInput.addEventListener('input', e => {
    clearTimeout(tOut);
    const query = e.target.value.trim();
    if (!query) {
       searchDropdown.classList.add('hidden');
       return;
    }
    
    tOut = setTimeout(async () => {
        try {
            const resp = await fetch(`/api/places/search?q=${encodeURIComponent(query)}`);
            if (resp.ok) {
                let results = await resp.json();
                
                // Prioritize countries and cities
                results.sort((a, b) => {
                    const getPriority = (place) => {
                        const types = place.types || [];
                        if (types.includes('country')) return 4;
                        if (types.includes('locality') || types.includes('administrative_area_level_1')) return 3;
                        if (types.includes('neighborhood')) return 2;
                        return 1;
                    };
                    return getPriority(b) - getPriority(a);
                });
                
                searchDropdown.innerHTML = '';
                if (results.length === 0) {
                    searchDropdown.classList.add('hidden');
                    return;
                }
                
                searchDropdown.classList.remove('hidden');
                results.forEach(place => {
                    const li = document.createElement('li');
                    li.className = "px-4 py-3 hover:bg-surface-container cursor-pointer transition-colors border-b border-outline-variant/10 last:border-0";
                    const name = place.displayName?.text || place.displayName;
                    const addr = place.formattedAddress || '';
                    li.innerHTML = `
                        <div class="text-sm font-semibold text-on-surface truncate">${name}</div>
                        <div class="text-xs text-on-surface-variant truncate">${addr}</div>
                    `;
                    li.addEventListener('click', () => {
                        window.location.href = '?pid=' + place.id + '&cat=' + filters.category;
                    });
                    searchDropdown.appendChild(li);
                });
            }
        } catch(err) {
            console.error(err);
        }
    }, 500);
  });

  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && searchDropdown && !searchDropdown.contains(e.target)) {
          searchDropdown.classList.add('hidden');
      }
  });

  sortSelect.addEventListener('change', e => {
    sortBy = e.target.value;
    renderGridItems();
  });

  const doReset = () => {
    filters.price     = 'all';
    filters.minRating = 0;
    filters.category  = 'all';
    filters.validation = [];
    filters.search    = '';
    searchInput.value = '';
    document.getElementById('price-label').innerText = 'Todos';
    fetchData();
  };

  document.getElementById('btn-reset-filters').addEventListener('click', doReset);
  document.getElementById('btn-reset-filters-large').addEventListener('click', doReset);

  // ── Modal Logic ───────────────────────────────────────────────────────────────
  const modal = document.getElementById('add-to-trip-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const btnSaveModal = document.getElementById('btn-save-modal');
  const modalTripsContainer = document.getElementById('modal-trips-container');
  const modalAttractionName = document.getElementById('modal-attraction-name');
  let selectedAttraction = null;

  window.openAddToTripModal = async function(attractionId) {
    const userStr = localStorage.getItem('itera_user');
    if (!userStr) {
      alert("Debes iniciar sesión para agregar lugares a un viaje.");
      window.location.href = '../auth/index.html';
      return;
    }
    const user = JSON.parse(userStr);

    selectedAttraction = allResults.find(p => p.id === attractionId);
    if (!selectedAttraction) return;

    modalAttractionName.innerText = selectedAttraction.name;
    modalTripsContainer.innerHTML = `
      <div class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    `;

    // Show modal
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);

    try {
      const resp = await fetch(`http://localhost:8000/api/viajes?creador_id=${encodeURIComponent(user.id)}`);
      if (!resp.ok) throw new Error("Error fetching trips");
      const trips = await resp.json();

      if (trips.length === 0) {
        modalTripsContainer.innerHTML = `
          <div class="text-center py-6">
            <span class="material-symbols-outlined text-4xl text-outline mb-2 block">travel_explore</span>
            <p class="text-on-surface-variant text-sm">No tienes viajes creados.</p>
            <button onclick="window.location.href='../create-trip/index.html'" class="mt-4 px-4 py-2 bg-primary text-on-primary rounded-full text-sm font-bold">Crear Nuevo Viaje</button>
          </div>
        `;
        btnSaveModal.disabled = true;
        btnSaveModal.classList.add('opacity-50', 'cursor-not-allowed');
        return;
      }

      btnSaveModal.disabled = false;
      btnSaveModal.classList.remove('opacity-50', 'cursor-not-allowed');

      modalTripsContainer.innerHTML = '';
      trips.forEach(trip => {
        const label = document.createElement('label');
        label.className = "flex items-center justify-between p-3 rounded-xl border border-outline-variant/30 hover:bg-surface-container cursor-pointer transition-colors group";
        label.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="relative flex items-center">
              <input type="checkbox" value="${trip.id}" class="trip-checkbox peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-outline-variant bg-white transition-all checked:bg-primary checked:border-primary">
              <span class="material-symbols-outlined absolute text-white opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm pointer-events-none" style="font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24">check</span>
            </div>
            <div>
              <p class="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">${trip.nombre}</p>
              <p class="text-xs text-on-surface-variant">${trip.destino_principal || 'Varios Destinos'} · ${trip.estado}</p>
            </div>
          </div>
        `;
        modalTripsContainer.appendChild(label);
      });
    } catch (e) {
      console.error(e);
      modalTripsContainer.innerHTML = `<p class="text-error text-sm text-center py-4">Ocurrió un error al cargar tus viajes.</p>`;
    }
  };

  const closeModal = () => {
    modal.classList.add('opacity-0');
    setTimeout(() => {
      modal.classList.add('hidden');
      selectedAttraction = null;
    }, 300);
  };

  btnCloseModal.addEventListener('click', closeModal);
  btnCancelModal.addEventListener('click', closeModal);

  btnSaveModal.addEventListener('click', async () => {
    if (!selectedAttraction) return;
    const checkboxes = modalTripsContainer.querySelectorAll('.trip-checkbox:checked');
    if (checkboxes.length === 0) {
      alert("Por favor selecciona al menos un viaje.");
      return;
    }

    const selectedTripIds = Array.from(checkboxes).map(cb => cb.value);

    btnSaveModal.disabled = true;
    btnSaveModal.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">refresh</span> Guardando...';

    try {
      // 1. Ensure attraction exists in DB
      const attrPayload = {
          id: selectedAttraction.id,
          nombre: selectedAttraction.name,
          descripcion: selectedAttraction.categoryLabel,
          costo: 0.0,
          necesita_turno: false,
          es_oficial: false
      };
      
      try {
          await fetch('http://localhost:8000/api/atracciones', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(attrPayload)
          });
      } catch (e) {
          console.warn("Atraccion ya existe o error:", e);
      }

      // 2. Add to selected trips
      for (const tripId of selectedTripIds) {
        // We'll use today's date as default since this is a quick save
        const today = new Date().toISOString().split('T')[0];
        
        const itemPayload = {
            atraccion_id: selectedAttraction.id,
            fecha_asignada: today,
            hora_inicio: "10:00:00",
            hora_fin: "12:00:00"
        };

        await fetch(`http://localhost:8000/api/viajes/${tripId}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemPayload)
        });
      }

      btnSaveModal.innerHTML = '<span class="material-symbols-outlined text-sm">check</span> Guardado';
      btnSaveModal.classList.replace('bg-primary', 'bg-emerald-500');
      btnSaveModal.classList.replace('hover:bg-primary-container', 'hover:bg-emerald-600');
      
      setTimeout(() => {
        closeModal();
        // Reset button state
        setTimeout(() => {
          btnSaveModal.innerHTML = 'Guardar';
          btnSaveModal.classList.replace('bg-emerald-500', 'bg-primary');
          btnSaveModal.classList.replace('hover:bg-emerald-600', 'hover:bg-primary-container');
          btnSaveModal.disabled = false;
        }, 300);
      }, 1000);

    } catch (e) {
      console.error(e);
      alert("Error al guardar en el viaje.");
      btnSaveModal.disabled = false;
      btnSaveModal.innerHTML = 'Guardar';
    }
  });

  // ── Start ────────────────────────────────────────────────────────────────────
  renderSidebar(); // render sidebar first (so filters are visible while loading)
  fetchData();
});
