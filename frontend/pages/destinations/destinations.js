document.addEventListener('DOMContentLoaded', () => {
  // ── Config ──
  const CATEGORIES = [
    { key: 'tourist_attraction', label: 'Atracciones', icon: 'attractions' },
    { key: 'restaurant', label: 'Gastronomía', icon: 'restaurant' },
    { key: 'lodging', label: 'Alojamiento', icon: 'hotel' }
  ];
  const SUB_CATS = [
    { key: 'all', label: 'Todos', icon: 'map' },
    { key: 'tourist_attraction', label: 'Atracciones', icon: 'camera' },
    { key: 'restaurant', label: 'Gastronomía', icon: 'restaurant' },
    { key: 'lodging', label: 'Alojamiento', icon: 'hotel' },
    { key: 'transit_station', label: 'Transporte', icon: 'train' }
  ];
  const PRICES = [
    { key: 'all', label: 'Todos' }, { key: 'free', label: 'Gratis' },
    { key: '$', label: '$' }, { key: '$$', label: '$$' }, { key: '$$$', label: '$$$' }
  ];
  const RATINGS = [
    { key: 0, label: 'Todas' }, { key: 3, label: '3★ o más' },
    { key: 4, label: '4★ o más' }, { key: 4.5, label: '4.5★ o más' }
  ];
  const CAT_LABELS = { tourist_attraction: 'Atracciones', restaurant: 'Gastronomía', transit_station: 'Movilidad', lodging: 'Alojamiento', all: 'Lugar' };

  // ── State ──
  let state = {
    activeCategory: 'tourist_attraction',
    subCategory: 'all',
    price: 'all',
    minRating: 0,
    onlyVerified: true,
    hiddenGems: false,
    sortBy: 'relevance',
    placeId: null,
    locationName: '',
    results: [],
    favorites: JSON.parse(localStorage.getItem('itera_favorites') || '[]'),
    showFavoritesOnly: false,
    currentPage: 1,
    pageSize: 20
  };

  // ── DOM ──
  const grid = document.getElementById('results-grid');
  const countEl = document.getElementById('results-count');
  const locLabel = document.getElementById('results-location-label');
  const heroInput = document.getElementById('hero-search-input');
  const heroDropdown = document.getElementById('hero-search-dropdown');
  const heroResults = document.getElementById('hero-search-results');
  const catSelector = document.getElementById('major-category-selector');
  const subCatsEl = document.getElementById('filter-subcategories');
  const priceEl = document.getElementById('filter-price-buttons');
  const ratingEl = document.getElementById('filter-rating-radios');
  const noResultsEl = document.getElementById('no-results-state');
  const sidebarLocInput = document.getElementById('sidebar-location-input');
  const sidebarLocDropdown = document.getElementById('sidebar-location-dropdown');

  // ── URL Params ──
  const params = new URLSearchParams(window.location.search);
  if (params.get('pid')) state.placeId = params.get('pid');
  if (params.get('cat')) state.activeCategory = params.get('cat');
  if (params.get('s')) { heroInput.value = params.get('s'); state.locationName = params.get('s'); }

  // ── Render Major Categories ──
  function renderMajorCategories() {
    catSelector.innerHTML = '';
    CATEGORIES.forEach((cat, i) => {
      const isActive = state.activeCategory === cat.key;
      const divider = i < CATEGORIES.length - 1 ? '<div class="w-[1px] bg-slate-100 my-4"></div>' : '';
      catSelector.insertAdjacentHTML('beforeend', `
        <button data-cat="${cat.key}" class="flex-1 flex items-center justify-center gap-3 md:gap-4 transition-all active:scale-95 ${isActive ? 'bg-primary text-white' : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-primary'}">
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-full ${isActive ? 'bg-white/20 shadow-inner' : 'bg-primary/10 text-primary'} flex items-center justify-center">
            <span class="material-symbols-outlined text-xl md:text-2xl">${cat.icon}</span>
          </div>
          <span class="font-headline font-bold text-sm md:text-lg">${cat.label}</span>
        </button>${divider}`);
    });
    catSelector.querySelectorAll('button[data-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeCategory = btn.dataset.cat;
        state.subCategory = 'all';
        exitFavoritesMode();
        renderAll();
        fetchData();
      });
    });
  }

  // ── Render Sub-Categories ──
  function renderSubCategories() {
    subCatsEl.innerHTML = '';
    SUB_CATS.forEach(sc => {
      const isActive = state.subCategory === sc.key;
      const iconHtml = sc.icon ? `<span class="material-symbols-outlined mb-1" style="font-variation-settings:'FILL' ${isActive ? '1' : '0'},'wght' 400,'GRAD' 0,'opsz' 24">${sc.icon}</span>` : '';
      subCatsEl.insertAdjacentHTML('beforeend', `
        <button data-sub="${sc.key}" class="flex flex-col items-center justify-center p-3 md:p-4 rounded-xl transition-all border border-transparent shadow-sm text-[11px] font-semibold gap-1 ${isActive ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-lowest text-on-surface hover:bg-primary hover:text-on-primary'}">${iconHtml} ${sc.label}</button>`);
    });
    subCatsEl.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        state.subCategory = btn.dataset.sub;
        renderAll();
        fetchData();
      });
    });
  }

  // ── Render Price Buttons ──
  function renderPriceButtons() {
    priceEl.innerHTML = '';
    PRICES.forEach((p, i) => {
      const isActive = state.price === p.key;
      const round = i === 0 ? 'rounded-l-lg' : i === PRICES.length - 1 ? 'rounded-r-lg' : '';
      priceEl.insertAdjacentHTML('beforeend', `
        <button data-price="${p.key}" class="h-9 flex items-center justify-center border-none text-[10px] font-bold ${round} transition-all ${isActive ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}">${p.label}</button>`);
    });
    priceEl.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => { state.price = btn.dataset.price; renderAll(); applyFilters(); });
    });
  }

  // ── Render Rating Radios ──
  function renderRatingRadios() {
    ratingEl.innerHTML = '';
    RATINGS.forEach(r => {
      const isChecked = state.minRating === r.key;
      ratingEl.insertAdjacentHTML('beforeend', `
        <label class="flex items-center gap-3 text-sm text-on-surface-variant cursor-pointer">
          <input name="rating" type="radio" value="${r.key}" ${isChecked ? 'checked' : ''} class="text-primary focus:ring-primary border-outline-variant"/>
          ${r.label}
        </label>`);
    });
    ratingEl.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('change', () => { state.minRating = parseFloat(inp.value); applyFilters(); });
    });
  }

  // ── Toggles ──
  document.getElementById('toggle-verified').addEventListener('change', e => { state.onlyVerified = e.target.checked; applyFilters(); });
  document.getElementById('toggle-hidden-gems').addEventListener('change', e => { state.hiddenGems = e.target.checked; applyFilters(); });
  // ── Sort Dropdown Logic ──
  const sortBtn = document.getElementById('sort-dropdown-btn');
  const sortMenu = document.getElementById('sort-dropdown-menu');
  const sortLabel = document.getElementById('sort-current-label');

  sortBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = sortMenu.classList.contains('hidden');
    sortMenu.classList.toggle('hidden');
    sortBtn.setAttribute('aria-expanded', isHidden);
  });

  sortMenu.querySelectorAll('[data-sort]').forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.getAttribute('data-sort');
      state.sortBy = value;
      sortLabel.textContent = btn.querySelector('span').textContent;

      sortMenu.querySelectorAll('[data-sort]').forEach(b => b.classList.remove('active', 'bg-primary/5', 'text-primary'));
      btn.classList.add('active', 'bg-primary/5', 'text-primary');

      sortMenu.classList.add('hidden');
      sortBtn.setAttribute('aria-expanded', 'false');
      applyFilters();
    });
  });

  // Set initial active
  const initialBtn = sortMenu.querySelector(`[data-sort="${state.sortBy}"]`);
  if (initialBtn) {
    initialBtn.classList.add('active', 'bg-primary/5', 'text-primary');
    sortLabel.textContent = initialBtn.querySelector('span').textContent;
  }
  document.getElementById('btn-reset-all')?.addEventListener('click', () => {
    state.price = 'all'; state.minRating = 0; state.onlyVerified = true; state.hiddenGems = false; state.subCategory = 'all';
    document.getElementById('toggle-verified').checked = true;
    document.getElementById('toggle-hidden-gems').checked = false;
    renderAll(); applyFilters();
  });

  // ── Favorites ──
  function exitFavoritesMode() {
    if (state.showFavoritesOnly) {
      state.showFavoritesOnly = false;
      const navFav = document.getElementById('nav-favorites');
      navFav.classList.remove('bg-primary/5', 'text-primary', 'font-semibold');
      navFav.classList.add('text-on-surface-variant', 'font-medium', 'hover:bg-surface-container-high');

      const navExplore = document.getElementById('nav-explore');
      if (navExplore) {
        navExplore.classList.add('bg-primary/5', 'text-primary', 'font-semibold');
        navExplore.classList.remove('text-on-surface-variant', 'font-medium', 'hover:bg-surface-container-high');
      }
    }
  }

  function saveFavorites() { localStorage.setItem('itera_favorites', JSON.stringify(state.favorites)); updateFavBadge(); }
  function toggleFavorite(id) {
    const idx = state.favorites.findIndex(f => f.id === id);
    if (idx >= 0) { state.favorites.splice(idx, 1); }
    else {
      const item = state.results.find(r => r.id === id);
      if (item) {
        state.favorites.push({ ...item });
      }
    }
    saveFavorites();
    applyFilters();
  }
  window._toggleFav = toggleFavorite;

  function updateFavBadge() {
    const badge = document.getElementById('fav-count-badge');
    if (state.favorites.length > 0) { badge.textContent = state.favorites.length; badge.classList.remove('hidden'); }
    else { badge.classList.add('hidden'); }
  }
  document.getElementById('nav-favorites').addEventListener('click', (e) => {
    e.preventDefault();
    state.showFavoritesOnly = true; // Always set to true when clicking favorites explicitly

    const navFav = document.getElementById('nav-favorites');
    navFav.classList.add('bg-primary/5', 'text-primary', 'font-semibold');
    navFav.classList.remove('text-on-surface-variant', 'font-medium', 'hover:bg-surface-container-high');

    const navExplore = document.getElementById('nav-explore');
    if (navExplore) {
      navExplore.classList.remove('bg-primary/5', 'text-primary', 'font-semibold');
      navExplore.classList.add('text-on-surface-variant', 'font-medium', 'hover:bg-surface-container-high');
    }

    applyFilters();
  });

  const navExplore = document.getElementById('nav-explore');
  if (navExplore) {
    navExplore.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.showFavoritesOnly) {
        exitFavoritesMode();
        applyFilters();
      }
    });
  }

  updateFavBadge();

  // ── Search Logic ──
  let searchTimeout;
  const heroSpinner = document.getElementById('hero-search-spinner');

  async function doSearch(query, dropdown, resultsList, onSelect, spinner) {
    if (!query) { dropdown.classList.add('hidden'); if (spinner) spinner.classList.add('hidden'); return; }
    if (spinner) spinner.classList.remove('hidden');
    try {
      // Fetch Google Places and community attractions in parallel
      const [placesResp, communityResp] = await Promise.allSettled([
        fetch(`/api/places/search?q=${encodeURIComponent(query)}`),
        fetch(`/api/atracciones/search?q=${encodeURIComponent(query)}`)
      ]);

      let places = [];
      if (placesResp.status === 'fulfilled' && placesResp.value.ok) {
        places = await placesResp.value.json();
      }

      let communityAttractions = [];
      if (communityResp.status === 'fulfilled' && communityResp.value.ok) {
        communityAttractions = await communityResp.value.json();
      }

      // Sort Google Places by administrative priority
      places.sort((a, b) => {
        const p = place => {
          const t = place.types || [];
          if (t.includes('country')) return 4;
          if (t.some(type => type.startsWith('administrative_area') || type === 'locality')) return 3;
          if (t.includes('sublocality') || t.includes('neighborhood') || t.includes('colloquial_area')) return 2;
          return 1;
        };
        return p(b) - p(a);
      });

      resultsList.innerHTML = '';

      const hasPlaces = places.length > 0;
      const hasCommunity = communityAttractions.length > 0;

      if (!hasPlaces && !hasCommunity) {
        dropdown.classList.add('hidden');
        if (spinner) spinner.classList.add('hidden');
        return;
      }

      dropdown.classList.remove('hidden');

      // ── Google Places section ──
      if (hasPlaces) {
        const placeHeader = document.createElement('li');
        placeHeader.className = 'px-3 pt-3 pb-1 text-[10px] font-bold tracking-widest uppercase text-on-surface-variant/60 select-none';
        placeHeader.textContent = 'Ubicaciones';
        resultsList.appendChild(placeHeader);

        places.forEach(place => {
          const name = place.displayName?.text || place.displayName || '';
          const addr = place.formattedAddress || '';
          const li = document.createElement('li');
          li.className = 'p-3 hover:bg-primary/5 cursor-pointer transition-colors flex items-center gap-3';
          li.innerHTML = `<span class="material-symbols-outlined text-on-surface-variant/50 text-sm">location_on</span><div class="min-w-0"><div class="text-sm font-semibold truncate">${name}</div><div class="text-xs text-on-surface-variant truncate">${addr}</div></div>`;
          li.addEventListener('click', () => { dropdown.classList.add('hidden'); onSelect(place, name); });
          resultsList.appendChild(li);
        });
      }

      // ── Community attractions section ──
      if (hasCommunity) {
        const sep = document.createElement('li');
        sep.className = 'mx-3 my-1 border-t border-outline-variant/30';
        resultsList.appendChild(sep);

        const communityHeader = document.createElement('li');
        communityHeader.className = 'px-3 pt-2 pb-1 text-[10px] font-bold tracking-widest uppercase text-violet-500 select-none flex items-center gap-1.5';
        communityHeader.innerHTML = `<span class="material-symbols-outlined text-[12px]" style="font-variation-settings:'FILL' 1;">diversity_3</span> Comunidad`;
        resultsList.appendChild(communityHeader);

        communityAttractions.slice(0, 5).forEach(attr => {
          const nombre = attr.nombre || '';
          const dir = attr.direccion || '';
          const rating = attr.rating ? `★ ${parseFloat(attr.rating).toFixed(1)}` : '';
          const li = document.createElement('li');
          li.className = 'p-3 hover:bg-violet-50 cursor-pointer transition-colors flex items-center gap-3';
          li.innerHTML = `
            <span class="material-symbols-outlined text-violet-400 text-sm" style="font-variation-settings:'FILL' 1;">attractions</span>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-semibold truncate text-on-surface">${nombre}</div>
              <div class="text-xs text-on-surface-variant truncate">${dir}</div>
            </div>
            ${rating ? `<span class="text-[10px] font-bold text-amber-500 shrink-0">${rating}</span>` : ''}
            <span class="text-[9px] font-bold bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full shrink-0">comunidad</span>`;
          li.addEventListener('click', () => {
            dropdown.classList.add('hidden');
            // Show the community attraction by injecting it into results and navigating
            const communityItem = {
              id: attr.id,
              name: nombre,
              categoryLabel: attr.categoria || 'Atracción',
              isVerified: false,
              price: attr.costo > 0 ? '$' : 'free',
              rating: attr.rating ? parseFloat(attr.rating) : 0,
              reviews: 0,
              image: attr.foto_url ? attr.foto_url.split(',')[0] : null,
              address: dir,
              types: ['tourist_attraction'],
              _isCommunity: true
            };
            state.results = [communityItem];
            state.locationName = nombre;
            state.placeId = null;
            onSelect({ id: attr.id, _isCommunity: true, _item: communityItem }, nombre);
          });
          resultsList.appendChild(li);
        });
      }
    } catch (e) { console.error(e); }
    finally {
      if (spinner) spinner.classList.add('hidden');
    }
  }

  heroInput.addEventListener('input', e => { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => doSearch(e.target.value, heroDropdown, heroResults, (place, name) => { heroInput.value = name; sidebarLocInput.placeholder = name; if (place._isCommunity) { applyFilters(); } else { state.placeId = place.id; state.locationName = name; fetchData(); } }, heroSpinner), 400); });
  document.getElementById('hero-search-btn').addEventListener('click', () => { if (heroInput.value.trim()) { clearTimeout(searchTimeout); doSearch(heroInput.value, heroDropdown, heroResults, (place, name) => { heroInput.value = name; if (place._isCommunity) { applyFilters(); } else { state.placeId = place.id; state.locationName = name; fetchData(); } }, heroSpinner); } });

  let sidebarTimeout;
  sidebarLocInput.addEventListener('input', e => {
    clearTimeout(sidebarTimeout);
    sidebarTimeout = setTimeout(() => {
      const resultsList = document.getElementById('sidebar-location-results');
      doSearch(e.target.value, sidebarLocDropdown, resultsList, (place, name) => {
        sidebarLocInput.value = '';
        sidebarLocInput.placeholder = name;
        heroInput.value = name;
        if (place._isCommunity) {
          applyFilters();
        } else {
          state.placeId = place.id;
          state.locationName = name;
          fetchData();
        }
      });
    }, 400);
  });

  document.addEventListener('click', e => {
    if (!heroInput.contains(e.target) && !heroDropdown.contains(e.target)) heroDropdown.classList.add('hidden');
    if (!sidebarLocInput.contains(e.target) && !sidebarLocDropdown.contains(e.target)) sidebarLocDropdown.classList.add('hidden');
    if (!sortBtn.contains(e.target) && !sortMenu.contains(e.target)) {
      sortMenu.classList.add('hidden');
      sortBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // ── Fetch Data ──
  async function fetchData() {
    state.currentPage = 1;
    exitFavoritesMode();
    showSkeletons();
    const category = state.subCategory !== 'all' ? state.subCategory : state.activeCategory;
    let gUrl;
    if (state.placeId) {
      gUrl = `/api/places/${state.placeId}/catalog?category=${encodeURIComponent(category)}&q=`;
    } else {
      gUrl = `/api/places/discover/featured?category=${encodeURIComponent(category)}&q=`;
    }

    // Fetch Google Places AND community attractions in parallel
    const [gResp, cResp] = await Promise.allSettled([
      fetch(gUrl),
      fetch(`/api/atracciones/search?q=`)
    ]);

    let googleResults = [];
    if (gResp.status === 'fulfilled' && gResp.value.ok) {
      const gPlaces = await gResp.value.json();
      googleResults = (gPlaces || []).map(p => {
        let price = 'indeterminado';
        const lvl = p.priceLevel ?? p.price_level;
        if (lvl !== undefined && lvl !== null) {
          if (lvl === 0 || lvl === 'PRICE_LEVEL_FREE') price = 'free';
          else if (lvl === 1 || lvl === 'PRICE_LEVEL_INEXPENSIVE') price = '$';
          else if (lvl === 2 || lvl === 'PRICE_LEVEL_MODERATE') price = '$$';
          else if (lvl >= 3) price = '$$$';
        }
        return {
          id: p.id,
          name: p.displayName?.text || p.displayName || 'Lugar',
          categoryLabel: CAT_LABELS[category] || CAT_LABELS[state.activeCategory] || 'Lugar',
          isVerified: true,          // ← Todas las de Google Places son verificadas
          _isCommunity: false,
          price,
          rating: p.rating || 0,
          reviews: p.userRatingCount || 0,
          image: p.photos?.length > 0 ? `/api/places/${p.id}/photo?max_width=600` : null,
          address: p.formattedAddress || '',
          types: p.types || []
        };
      });
    }

    let communityResults = [];
    if (cResp.status === 'fulfilled' && cResp.value.ok) {
      const cAttractions = await cResp.value.json();
      communityResults = (cAttractions || []).map(a => ({
        id: a.id,
        name: a.nombre || 'Atracción',
        categoryLabel: a.categoria || 'Joya Oculta',
        isVerified: false,           // ← Las de la comunidad son Joyas Ocultas
        _isCommunity: true,
        price: a.costo > 0 ? '$' : 'free',
        rating: a.rating ? parseFloat(a.rating) : 0,
        reviews: 0,
        image: a.foto_url ? a.foto_url.split(',')[0] : null,
        address: a.direccion || '',
        types: ['tourist_attraction']
      }));
    }

    // Combinar: primero Google Places, luego comunidad
    state.results = [...googleResults, ...communityResults];
    applyFilters();
  }

  function showSkeletons() {
    grid.innerHTML = Array(6).fill('').map(() => '<div class="animate-pulse bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm"><div class="h-64 bg-surface-container-high"></div><div class="p-6 space-y-3"><div class="h-3 w-1/3 bg-surface-container-high rounded"></div><div class="h-5 w-2/3 bg-surface-container-high rounded"></div></div></div>').join('');
    noResultsEl.classList.add('hidden');
  }

  // ── Filter & Render ──
  function applyFilters() {
    let items = state.showFavoritesOnly ? [...state.favorites] : [...state.results];

    if (state.showFavoritesOnly) {
      // When in favorites mode, we can still allow filtering by category if we want,
      // but let's stick to the user request of showing "all favorites".
      // If we want to filter favorites by current category:
      // items = items.filter(i => i.types.some(t => t.includes(state.activeCategory.replace('_attraction',''))));
    } else {
      if (state.onlyVerified && !state.hiddenGems) items = items.filter(i => i.isVerified);
      if (state.hiddenGems && !state.onlyVerified) items = items.filter(i => !i.isVerified);
      if (state.price !== 'all') {
        if (state.price === 'free') items = items.filter(i => i.price === 'free');
        else items = items.filter(i => i.price === state.price);
      }
      if (state.minRating > 0) items = items.filter(i => i.rating >= state.minRating);
    }

    if (state.sortBy === 'rating') items.sort((a, b) => b.rating - a.rating);
    else if (state.sortBy === 'price_asc') items.sort((a, b) => { const v = p => p === 'free' ? 0 : p === '$' ? 1 : p === '$$' ? 2 : 3; return v(a.price) - v(b.price); });

    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / state.pageSize);

    // Ensure currentPage is within bounds
    if (state.currentPage > totalPages && totalPages > 0) state.currentPage = totalPages;
    if (state.currentPage < 1) state.currentPage = 1;

    const start = (state.currentPage - 1) * state.pageSize;
    const paginatedItems = items.slice(start, start + state.pageSize);

    renderCards(paginatedItems);
    renderPagination(totalItems);
  }

  function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / state.pageSize);
    const container = document.getElementById('pagination-container');
    const pagesEl = document.getElementById('pagination-pages');
    const btnPrev = document.getElementById('btn-prev-page');
    const btnNext = document.getElementById('btn-next-page');

    if (totalPages <= 1) {
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');
    pagesEl.innerHTML = '';

    // Simple pagination: show current, prev, next
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = `w-10 h-10 rounded-full text-xs font-bold transition-all ${state.currentPage === i ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high'}`;
      btn.textContent = i;
      btn.onclick = () => { state.currentPage = i; window.scrollTo({ top: 0, behavior: 'smooth' }); applyFilters(); };
      pagesEl.appendChild(btn);
    }

    btnPrev.disabled = state.currentPage === 1;
    btnNext.disabled = state.currentPage === totalPages;

    btnPrev.onclick = () => { if (state.currentPage > 1) { state.currentPage--; window.scrollTo({ top: 0, behavior: 'smooth' }); applyFilters(); } };
    btnNext.onclick = () => { if (state.currentPage < totalPages) { state.currentPage++; window.scrollTo({ top: 0, behavior: 'smooth' }); applyFilters(); } };
  }

  function renderCards(items) {
    countEl.textContent = `${items.length} resultados`;
    if (state.showFavoritesOnly) {
      locLabel.textContent = 'en tus favoritos';
    } else {
      locLabel.textContent = state.locationName ? `en ${state.locationName}` : '';
    }

    if (items.length === 0) { grid.innerHTML = ''; noResultsEl.classList.remove('hidden'); return; }
    noResultsEl.classList.add('hidden');
    grid.innerHTML = '';

    items.forEach((p, idx) => {
      const isFav = state.favorites.some(f => f.id === p.id);
      const favIcon = isFav ? 'favorite' : 'favorite_border';
      const favFill = isFav ? "font-variation-settings:'FILL' 1;" : '';
      const ratingVal = p.rating || 0;
      const ratingText = ratingVal > 0 ? ratingVal.toFixed(1) : '-';
      const priceVal = p.price || 'indeterminado';
      const priceDisplay = priceVal === 'free' ? 'Gratis' : priceVal === 'indeterminado' ? 'Indeterminado' : priceVal;
      const priceLabel = priceVal === 'indeterminado' ? 'Costo' : 'Desde';
      const priceColor = priceVal === 'free' ? 'text-emerald-600' : 'text-[#0077FF]';
      const imgSrc = p.image || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600&auto=format&fit=crop';
      const catLabel = p.categoryLabel || 'Lugar';
      const btnLabel = (catLabel === 'Gastronomía' || catLabel === 'Alojamiento') ? 'Reservar' : 'Ver Detalles';

      const safeAddress = p.address ? String(p.address) : '';
      const addressDisplay = safeAddress.split(',')[0] || '';
      const safeName = p.name ? String(p.name) : 'Lugar';

      // Badge según origen: verificado (Google) o joya oculta (comunidad)
      const isCommunity = p._isCommunity === true;
      const sourceBadge = isCommunity
        ? `<div class="absolute bottom-3 left-3 bg-violet-600/90 backdrop-blur text-white text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded-full flex items-center gap-1 shadow">
             <span class="material-symbols-outlined text-[11px]" style="font-variation-settings:'FILL' 1;">diamond</span> Joya Oculta
           </div>`
        : `<div class="absolute bottom-3 left-3 bg-emerald-500/90 backdrop-blur text-white text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded-full flex items-center gap-1 shadow">
             <span class="material-symbols-outlined text-[11px]" style="font-variation-settings:'FILL' 1;">verified</span> Verificado
           </div>`;
      const cardBorderClass = isCommunity ? 'ring-2 ring-violet-300/40' : '';

      const card = document.createElement('div');
      card.className = 'fade-in';
      card.style.animationDelay = `${Math.min(idx, 8) * 0.05}s`;
      card.innerHTML = `
        <div class="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all group cursor-pointer h-full flex flex-col ${cardBorderClass}">
          <div class="relative h-64 overflow-hidden">
            <img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="${imgSrc}" alt="${safeName}" onerror="this.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600&auto=format&fit=crop'"/>
            <div class="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <span class="material-symbols-outlined text-[14px] text-amber-500" style="font-variation-settings:'FILL' 1;">star</span>
              <span class="text-xs font-bold text-on-surface">${ratingText}</span>
            </div>
            <button onclick="event.stopPropagation(); window._toggleFav('${p.id}')" class="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center ${isFav ? 'text-red-500 bg-white' : 'text-white'} hover:bg-white hover:text-red-500 transition-all" title="Favoritos">
              <span class="material-symbols-outlined" style="${favFill}">${favIcon}</span>
            </button>
            <button onclick="event.stopPropagation(); window.openAddToTripModal('${p.id}')" class="absolute top-16 right-4 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all shadow-sm" title="Guardar en un viaje">
              <span class="material-symbols-outlined">bookmark_add</span>
            </button>
            ${sourceBadge}
          </div>
          <div class="p-6 flex flex-col flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[10px] font-bold tracking-widest uppercase ${isCommunity ? 'text-violet-500' : 'text-primary/70'}">${catLabel}</span>
              <span class="w-1 h-1 rounded-full bg-on-surface-variant/30"></span>
              <span class="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant/70">${addressDisplay}</span>
            </div>
            <h3 class="text-xl font-bold font-headline text-on-surface mb-4 line-clamp-2">${safeName}</h3>
            <div class="flex items-center justify-between mt-auto">
              <div class="flex flex-col">
                <span class="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">${priceLabel}</span>
                <span class="text-lg font-extrabold ${priceColor}">${priceDisplay}</span>
              </div>
              <button onclick="event.stopPropagation(); window.openDetailsModal('${p.id}')" class="bg-surface-container-high hover:bg-primary hover:text-white text-primary px-5 py-2.5 rounded-full text-xs font-bold transition-all">${btnLabel}</button>
            </div>
          </div>
        </div>`;
      grid.appendChild(card);
    });
  }

  window._toggleFav = (id) => toggleFavorite(id);

  // ── Render All UI ──
  function renderAll() {
    renderMajorCategories();
    renderSubCategories();
    renderPriceButtons();
    renderRatingRadios();
  }

  // ── Modal Logic ──
  // 1. Details Modal
  const detailsModal = document.getElementById('details-modal');
  const dImage = document.getElementById('details-modal-image');
  const dTitle = document.getElementById('details-modal-title');
  const dAddress = document.getElementById('details-modal-address');
  const dRating = document.getElementById('details-modal-rating');
  const dDesc = document.getElementById('details-modal-desc');
  const dWebsiteCont = document.getElementById('details-modal-website-container');
  const dWebsite = document.getElementById('details-modal-website');
  const dHoursCont = document.getElementById('details-modal-hours-container');
  const dHours = document.getElementById('details-modal-hours');
  const dLoading = document.getElementById('details-loading');
  const dFavBtn = document.getElementById('details-modal-fav-btn');
  const dFavIcon = document.getElementById('details-modal-fav-icon');

  let currentDetailsId = null;

  // Helper maps for community attraction labels
  const ACC_LABELS = { todo_publico: 'Todo público', silla_ruedas: 'Silla de ruedas', cochecitos: 'Apto cochecitos', personas_mayores: 'Personas mayores' };
  const ACC_ICONS = { todo_publico: 'groups', silla_ruedas: 'accessible', cochecitos: 'child_friendly', personas_mayores: 'elderly' };
  const CAT_LABELS_COMM = { naturaleza: 'Naturaleza', cultura: 'Cultura e Historia', aventura: 'Aventura', gastronomia: 'Gastronomía', entretenimiento: 'Entretenimiento' };
  const CAT_ICONS_COMM = { naturaleza: 'forest', cultura: 'museum', aventura: 'explore', gastronomia: 'restaurant', entretenimiento: 'theater_comedy' };

  // New DOM refs for community fields
  const dPrice = document.getElementById('details-modal-price');
  const dPriceCont = document.getElementById('details-modal-price-container');
  const dCatsCont = document.getElementById('details-modal-categories-container');
  const dCats = document.getElementById('details-modal-categories');
  const dAccCont = document.getElementById('details-modal-accessibility-container');
  const dAcc = document.getElementById('details-modal-accessibility');
  const dPhotosCont = document.getElementById('details-modal-photos-container');
  const dPhotos = document.getElementById('details-modal-photos');
  const dBadge = document.getElementById('details-modal-source-badge');

  function resetDetailsModal() {
    dDesc.textContent = 'No hay descripción disponible para este lugar.';
    dWebsiteCont.classList.add('hidden');
    dHoursCont.classList.add('hidden');
    dPriceCont.classList.add('hidden');
    dCatsCont.classList.add('hidden');
    dAccCont.classList.add('hidden');
    dPhotosCont.classList.add('hidden');
    dBadge.classList.add('hidden');
    dBadge.innerHTML = '';
    dCats.innerHTML = '';
    dAcc.innerHTML = '';
    dPhotos.innerHTML = '';
  }

  window.openDetailsModal = async (id) => {
    currentDetailsId = id;
    const item = state.results.find(r => r.id === id);
    if (!item) return;

    detailsModal.classList.remove('hidden');
    setTimeout(() => detailsModal.classList.remove('opacity-0'), 10);
    dLoading.classList.remove('hidden');

    dTitle.textContent = item.name;
    dAddress.textContent = item.address;
    dRating.textContent = item.rating > 0 ? item.rating.toFixed(1) : '-';
    dImage.src = item.image || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600&auto=format&fit=crop';

    const isFav = state.favorites.some(f => f.id === id);
    dFavIcon.textContent = isFav ? 'favorite' : 'favorite_border';
    dFavIcon.style.fontVariationSettings = isFav ? "'FILL' 1" : "'FILL' 0";
    dFavBtn.className = isFav
      ? 'absolute top-4 left-4 z-20 w-10 h-10 bg-white backdrop-blur-md rounded-full flex items-center justify-center text-red-500 shadow-sm transition-all'
      : 'absolute top-4 left-4 z-20 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-red-500 shadow-sm transition-all';

    resetDetailsModal();

    if (item._isCommunity) {
      // ── Atracción de la Comunidad ──
      // Obtener datos completos del backend
      try {
        const resp = await fetch(`http://localhost:8000/api/atracciones/${id}`);
        if (resp.ok) {
          const a = await resp.json();

          // Descripción
          if (a.descripcion) dDesc.textContent = a.descripcion;

          // Badge Joya Oculta
          dBadge.innerHTML = `<div class="bg-violet-600/90 backdrop-blur text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
            <span class="material-symbols-outlined text-[13px]" style="font-variation-settings:'FILL' 1;">diamond</span> Joya Oculta · Comunidad
          </div>`;
          dBadge.classList.remove('hidden');

          // Precio
          const costoNum = parseFloat(a.costo) || 0;
          const priceText = costoNum === 0 ? 'Gratis' : costoNum === 1 ? 'Costo bajo' : costoNum === 2 ? 'Costo moderado' : costoNum === 3 ? 'Costo alto' : `$${costoNum}`;
          const priceColor = costoNum === 0 ? 'text-emerald-600' : 'text-blue-600';
          dPrice.textContent = priceText;
          dPrice.className = `font-bold text-xl ${priceColor}`;
          dPriceCont.classList.remove('hidden');

          // Categorías
          if (a.categoria) {
            const cats = a.categoria.split(',').map(c => c.trim().toLowerCase()).filter(Boolean);
            dCats.innerHTML = cats.map(cat => {
              const icon = CAT_ICONS_COMM[cat] || 'place';
              const label = CAT_LABELS_COMM[cat] || (cat.charAt(0).toUpperCase() + cat.slice(1));
              return `<span class="flex items-center gap-1.5 bg-violet-50 border border-violet-200 text-violet-700 px-3 py-1.5 rounded-full text-xs font-bold">
                <span class="material-symbols-outlined text-[14px]">${icon}</span>${label}
              </span>`;
            }).join('');
            dCatsCont.classList.remove('hidden');
          }

          // Accesibilidad
          if (a.accesibilidad) {
            const accs = a.accesibilidad.split(',').map(x => x.trim()).filter(Boolean);
            dAcc.innerHTML = accs.map(acc => {
              const icon = ACC_ICONS[acc] || 'info';
              const label = ACC_LABELS[acc] || acc;
              return `<span class="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                <span class="material-symbols-outlined text-[14px]">${icon}</span>${label}
              </span>`;
            }).join('');
            dAccCont.classList.remove('hidden');
          }

          // Fotos (todas las fotos separadas por coma)
          if (a.foto_url) {
            const fotos = a.foto_url.split(',').map(f => f.trim()).filter(Boolean);
            if (fotos.length > 0) {
              // Imagen principal = primera foto
              const firstPhoto = fotos[0].startsWith('/') ? `http://localhost:8000${fotos[0]}` : fotos[0];
              dImage.src = firstPhoto;

              if (fotos.length > 1) {
                dPhotos.innerHTML = fotos.map(f => {
                  const src = f.startsWith('/') ? `http://localhost:8000${f}` : f;
                  return `<img src="${src}" alt="Foto" class="w-full h-32 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity" 
                    onerror="this.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=300'"
                    onclick="document.getElementById('details-modal-image').src='${src}'"/>`;
                }).join('');
                dPhotosCont.classList.remove('hidden');
              }
            }
          }
        }
      } catch (e) { console.warn('[Details] Error fetching community attraction:', e); }

    } else {
      // ── Atracción de Google Places ──
      try {
        const resp = await fetch(`/api/places/${id}/details`);
        if (resp.ok) {
          const details = await resp.json();
          if (details.editorialSummary && details.editorialSummary.text) dDesc.textContent = details.editorialSummary.text;
          if (details.websiteUri) { dWebsite.href = details.websiteUri; dWebsiteCont.classList.remove('hidden'); }
          if (details.regularOpeningHours && details.regularOpeningHours.weekdayDescriptions) {
            dHours.innerHTML = details.regularOpeningHours.weekdayDescriptions.map(h => `<li>${h}</li>`).join('');
            dHoursCont.classList.remove('hidden');
          }
        }
      } catch (e) { }
    }

    // ── Reseñas ──
    try {
      const revResp = await fetch(`http://localhost:8000/api/resenas/atraccion/${id}`);
      if (revResp.ok) {
        const reviews = await revResp.json();
        renderReviewsList(reviews);
      }
    } catch (e) {
      console.error('Error fetching reviews:', e);
    }

    dLoading.classList.add('hidden');
  };

  // ── Funciones de Reseñas ──
  let selectedReviewRating = 0;
  const stars = document.querySelectorAll('#review-stars-input span');

  function renderReviewsList(reviews) {
    const list = document.getElementById('details-modal-reviews-list');
    if (!reviews || reviews.length === 0) {
      list.innerHTML = '<p class="text-sm text-on-surface-variant/60 italic">Todavía no hay reseñas. ¡Sé el primero en opinar!</p>';
      return;
    }
    list.innerHTML = reviews.map(r => {
      const starsHtml = Array(5).fill('').map((_, i) => `<span class="material-symbols-outlined text-[14px] ${i < r.rating ? 'text-amber-500' : 'text-outline-variant/30'}" style="font-variation-settings:'FILL' ${i < r.rating ? '1' : '0'};">star</span>`).join('');
      const nombreUsuario = r.usuario_nombre || r.usuarioNombre || 'Usuario';
      const fotoUrl = r.usuario_foto || r.usuarioFoto;
      const foto = fotoUrl ? (fotoUrl.startsWith('http') ? fotoUrl : `http://localhost:8000${fotoUrl}`) : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop';
      return `
        <div class="bg-white p-4 rounded-xl border border-outline-variant/10 shadow-sm flex gap-3">
          <img src="${foto}" alt="${nombreUsuario}" class="w-10 h-10 rounded-full object-cover shrink-0" onerror="this.src='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop'">
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <div>
                <h5 class="font-bold text-sm text-on-surface">${nombreUsuario}</h5>
                <div class="flex items-center mt-0.5">${starsHtml}</div>
              </div>
              <span class="text-[10px] text-on-surface-variant/60 font-medium">${new Date(r.fecha).toLocaleDateString()}</span>
            </div>
            <p class="text-sm text-on-surface-variant mt-2">${r.comentario || ''}</p>
          </div>
        </div>`;
    }).join('');
  }

  stars.forEach(star => {
    star.addEventListener('click', (e) => {
      selectedReviewRating = parseInt(e.target.dataset.value);
      stars.forEach((s, i) => {
        if (i < selectedReviewRating) {
          s.classList.add('text-amber-500');
          s.classList.remove('text-outline-variant');
          s.style.fontVariationSettings = "'FILL' 1";
        } else {
          s.classList.remove('text-amber-500');
          s.classList.add('text-outline-variant');
          s.style.fontVariationSettings = "'FILL' 0";
        }
      });
      document.getElementById('btn-submit-review').disabled = false;
    });
  });

  document.getElementById('btn-submit-review').addEventListener('click', async () => {
    const userStr = localStorage.getItem('itera_user');
    if (!userStr) { alert('Debes iniciar sesión para dejar una reseña.'); window.location.href = '../auth/index.html'; return; }
    const user = JSON.parse(userStr);
    const btn = document.getElementById('btn-submit-review');
    const commentInput = document.getElementById('review-comment-input');

    if (selectedReviewRating === 0) { alert('Por favor selecciona una calificación.'); return; }

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
      const resp = await fetch('http://localhost:8000/api/resenas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          atraccion_id: currentDetailsId,
          usuario_id: user.id,
          rating: selectedReviewRating,
          comentario: commentInput.value.trim()
        })
      });
      if (!resp.ok) throw new Error('Error al enviar reseña');

      // Reload reviews
      const revResp = await fetch(`http://localhost:8000/api/resenas/atraccion/${currentDetailsId}`);
      if (revResp.ok) {
        renderReviewsList(await revResp.json());
      }

      // Reset form
      selectedReviewRating = 0;
      commentInput.value = '';
      stars.forEach(s => { s.classList.remove('text-amber-500'); s.classList.add('text-outline-variant'); s.style.fontVariationSettings = "'FILL' 0"; });

    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Publicar Reseña';
    }
  });

  document.getElementById('btn-close-details').addEventListener('click', () => {
    detailsModal.classList.add('opacity-0');
    setTimeout(() => detailsModal.classList.add('hidden'), 300);
  });

  document.getElementById('details-modal-fav-btn').addEventListener('click', () => {
    if (currentDetailsId) {
      window._toggleFav(currentDetailsId);
      const isFav = state.favorites.some(f => f.id === currentDetailsId);
      dFavIcon.textContent = isFav ? 'favorite' : 'favorite_border';
      dFavIcon.style.fontVariationSettings = isFav ? "'FILL' 1" : "'FILL' 0";
      dFavBtn.className = isFav
        ? 'absolute top-4 left-4 z-20 w-10 h-10 bg-white backdrop-blur-md rounded-full flex items-center justify-center text-red-500 shadow-sm transition-all'
        : 'absolute top-4 left-4 z-20 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-red-500 shadow-sm transition-all';
    }
  });

  document.getElementById('details-modal-add-btn').addEventListener('click', () => {
    detailsModal.classList.add('opacity-0');
    setTimeout(() => {
      detailsModal.classList.add('hidden');
      if (currentDetailsId) window.openAddToTripModal(currentDetailsId);
    }, 300);
  });

  // 2. Add To Trip Modal
  const modal = document.getElementById('add-to-trip-modal');
  const modalName = document.getElementById('modal-attraction-name');
  const modalTrips = document.getElementById('modal-trips-container');
  const btnSave = document.getElementById('btn-save-modal');
  let selectedModalId = null;

  window.openAddToTripModal = async function (attractionId) {
    const userStr = localStorage.getItem('itera_user');
    if (!userStr) { alert("Debes iniciar sesión."); window.location.href = '../auth/index.html'; return; }
    const user = JSON.parse(userStr);
    selectedModalId = attractionId;
    const item = state.results.find(r => r.id === attractionId);
    modalName.textContent = item?.name || '';
    modalTrips.innerHTML = '<div class="flex justify-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>';
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);

    try {
      const resp = await fetch(`http://localhost:8000/api/viajes?creador_id=${encodeURIComponent(user.id)}`);
      if (!resp.ok) throw new Error();
      const trips = await resp.json();
      if (!trips.length) {
        modalTrips.innerHTML = '<div class="text-center py-6"><p class="text-on-surface-variant text-sm">No tienes viajes creados.</p><button onclick="window.location.href=\'../create-trip/index.html\'" class="mt-4 px-4 py-2 bg-primary text-on-primary rounded-full text-sm font-bold">Crear Nuevo Viaje</button></div>';
        btnSave.disabled = true; return;
      }
      btnSave.disabled = false;
      modalTrips.innerHTML = '';
      trips.forEach(trip => {
        modalTrips.insertAdjacentHTML('beforeend', `
          <label class="flex items-center justify-between p-3 rounded-xl border border-outline-variant/30 hover:bg-surface-container cursor-pointer transition-colors group">
            <div class="flex items-center gap-3">
              <div class="relative flex items-center">
                <input type="checkbox" value="${trip.id}" class="trip-checkbox peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-outline-variant bg-white checked:bg-primary checked:border-primary transition-all">
                <span class="material-symbols-outlined absolute text-white opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm pointer-events-none" style="font-variation-settings:'FILL' 1;">check</span>
              </div>
              <div><p class="text-sm font-bold">${trip.nombre}</p><p class="text-xs text-on-surface-variant">${trip.destino_principal || 'Varios'} · ${trip.estado}</p></div>
            </div>
          </label>`);
      });
    } catch (e) { modalTrips.innerHTML = '<p class="text-error text-sm text-center py-4">Error cargando viajes.</p>'; }
  };

  const closeModal = () => { modal.classList.add('opacity-0'); setTimeout(() => modal.classList.add('hidden'), 300); };
  document.getElementById('btn-close-modal').addEventListener('click', closeModal);
  document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);

  btnSave.addEventListener('click', async () => {
    if (!selectedModalId) return;
    const cbs = modalTrips.querySelectorAll('.trip-checkbox:checked');
    if (!cbs.length) { alert("Selecciona al menos un viaje."); return; }
    const tripIds = Array.from(cbs).map(c => c.value);
    const item = state.results.find(r => r.id === selectedModalId);
    btnSave.disabled = true;
    btnSave.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">refresh</span> Guardando...';

    try {
      try { await fetch('http://localhost:8000/api/atracciones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedModalId, nombre: item?.name || '', descripcion: item?.categoryLabel || '', costo: 0, necesita_turno: false, es_oficial: false }) }); } catch (e) { }

      for (const tid of tripIds) {
        // Guardar sin fecha ni hora para que aparezca como pendiente en el itinerario
        await fetch(`http://localhost:8000/api/viajes/${tid}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            atraccion_id: selectedModalId,
            fecha_asignada: null,
            hora_inicio: null,
            hora_fin: null
          })
        });
      }
      btnSave.innerHTML = '<span class="material-symbols-outlined text-sm">check</span> Guardado';
      setTimeout(() => { closeModal(); setTimeout(() => { btnSave.innerHTML = 'Guardar'; btnSave.disabled = false; }, 300); }, 1000);
    } catch (e) { alert("Error al guardar."); btnSave.disabled = false; btnSave.innerHTML = 'Guardar'; }
  });

  // ── Crear Nuevo Viaje Rápido ──
  const btnToggleNewTrip = document.getElementById('btn-toggle-new-trip');
  const newTripForm = document.getElementById('new-trip-form');
  const iconToggleNewTrip = document.getElementById('icon-toggle-new-trip');
  const btnCreateAndSaveTrip = document.getElementById('btn-create-and-save-trip');
  const newTripNameInput = document.getElementById('new-trip-name');

  btnToggleNewTrip.addEventListener('click', () => {
    newTripForm.classList.toggle('hidden');
    iconToggleNewTrip.textContent = newTripForm.classList.contains('hidden') ? 'add' : 'remove';
    if (!newTripForm.classList.contains('hidden')) newTripNameInput.focus();
  });

  btnCreateAndSaveTrip.addEventListener('click', async () => {
    if (!selectedModalId) return;
    const name = newTripNameInput.value.trim();
    if (!name) { alert("Ingresa un nombre para el viaje."); return; }

    const userStr = localStorage.getItem('itera_user');
    if (!userStr) { alert("Debes iniciar sesión."); return; }
    const user = JSON.parse(userStr);

    btnCreateAndSaveTrip.disabled = true;
    btnCreateAndSaveTrip.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">refresh</span> Procesando...';

    try {
      // 1. Obtener la localidad real de la atracción desde Google Places (addressComponents)
      const item = state.results.find(r => r.id === selectedModalId);
      let destName  = state.locationName || 'Destino Desconocido';
      let destPhoto = null;
      let destCountry = '';
      let realPlaceId = state.placeId || '';

      if (item && item.id) {
        try {
          // Consulta el nuevo endpoint que devuelve { city, country } usando addressComponents
          const localityResp = await fetch(`/api/places/${item.id}/locality`);
          if (localityResp.ok) {
            const localityData = await localityResp.json();
            if (localityData.city) destName = localityData.city;
            if (localityData.country) destCountry = localityData.country;
          }
        } catch(e) { console.warn('No se pudo obtener la localidad:', e); }
      }

      // 2. Buscar la ciudad en Google Places para obtener su placeId y foto oficial
      try {
        const searchQ = destCountry ? `${destName}, ${destCountry}` : destName;
        const searchResp = await fetch(`/api/places/textsearch?q=${encodeURIComponent(searchQ)}`);
        if (searchResp.ok) {
          const searchResults = await searchResp.json();
          if (searchResults && searchResults.length > 0) {
            const bestMatch = searchResults[0];
            realPlaceId = bestMatch.id;
            if (bestMatch.displayName && bestMatch.displayName.text) {
              destName = bestMatch.displayName.text;
            }
            // Obtener foto principal del destino desde el placeId oficial
            const placeResp = await fetch(`/api/places/${realPlaceId}/details`);
            if (placeResp.ok) {
              const pData = await placeResp.json();
              if (pData.photos && pData.photos.length > 0) {
                destPhoto = `/api/places/${realPlaceId}/photo?max_width=800`;
              }
            }
          }
        }
      } catch(e) { console.warn('No se pudo obtener foto del destino:', e); }

      // 3. Crear el nuevo viaje
      const createResp = await fetch('http://localhost:8000/api/viajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creador_id: user.id,
          nombre: name,
          destino_principal: destName,
          foto_url: destPhoto,
          estado: 'pendiente'
        })
      });
      if (!createResp.ok) throw new Error("Error creando el viaje");
      const newTrip = await createResp.json();

      // 3. Guardar el destino en la ruta del viaje
      try {
        await fetch(`http://localhost:8000/api/viajes/${newTrip.id}/destinos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city: destName,
            country: destCountry || '',
            nights: 1,
            photo_url: destPhoto || '',
            orden: 0,
            google_place_id: realPlaceId
          })
        });
      } catch (e) {
        console.warn('No se pudo añadir el destino a la ruta:', e);
      }

      // 4. Asegurar que la atracción existe en base de datos
      try { await fetch('http://localhost:8000/api/atracciones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedModalId, nombre: item?.name || '', descripcion: item?.categoryLabel || '', costo: 0, necesita_turno: false, es_oficial: false }) }); } catch (e) { }

      // 4. Vincular la atracción al viaje nuevo
      await fetch(`http://localhost:8000/api/viajes/${newTrip.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          atraccion_id: selectedModalId,
          fecha_asignada: null,
          hora_inicio: null,
          hora_fin: null
        })
      });

      btnCreateAndSaveTrip.innerHTML = '<span class="material-symbols-outlined text-sm">check</span> ¡Creado y Guardado!';
      setTimeout(() => {
        closeModal();
        setTimeout(() => {
          btnCreateAndSaveTrip.innerHTML = 'Crear viaje y guardar atracción';
          btnCreateAndSaveTrip.disabled = false;
          newTripNameInput.value = '';
          newTripForm.classList.add('hidden');
          iconToggleNewTrip.textContent = 'add';
        }, 300);
      }, 1000);

    } catch (e) {
      console.error(e);
      alert("Hubo un problema al crear el viaje: " + e.message);
      btnCreateAndSaveTrip.disabled = false;
      btnCreateAndSaveTrip.innerHTML = 'Crear viaje y guardar atracción';
    }
  });

  // ── Auto-trigger from URL param ──
  if (params.get('s') && !state.placeId) {
    fetch(`/api/places/search?q=${encodeURIComponent(params.get('s'))}`)
      .then(r => r.ok ? r.json() : [])
      .then(results => {
        if (results?.length) {
          state.placeId = results[0].id;
          state.locationName = results[0].displayName?.text || params.get('s');
          heroInput.value = state.locationName;
          fetchData();
        }
      }).catch(() => { });
  }

  // ── Init ──
  renderAll();
  fetchData();
});
