document.addEventListener('DOMContentLoaded', () => {
  const userStr = localStorage.getItem('itera_user');
  if (!userStr) {
    window.location.href = '../auth/index.html';
    return;
  }
  const user = JSON.parse(userStr);
  const langCode = localStorage.getItem('itera_lang') || 'ES';
  const t = window.translations ? window.translations[langCode] : {};

  // Omit update to dashboard-title here for now since template uses hardcoded texts and different IDs.
  // We keep it if IDs exist.
  const titleEl = document.getElementById('dash-title');
  if (titleEl && t.dashboard_title) titleEl.innerText = t.dashboard_title;

  const subtitleEl = document.getElementById('dash-subtitle');
  if (subtitleEl && t.dashboard_subtitle) subtitleEl.innerText = t.dashboard_subtitle;

  const tabs = document.querySelectorAll('.dash-tab');

  const urlParams = new URLSearchParams(window.location.search);
  let currentTab = urlParams.get('t') || 'all';
  const searchInput = document.getElementById('trip-search-input');
  const sortButton = document.getElementById('sort-button');
  const sortDropdown = document.getElementById('sort-dropdown');
  const sortLabel = document.getElementById('current-sort-label');
  const sortOptions = document.querySelectorAll('.sort-option');

  let currentSort = 'date-asc';
  let allTrips = [];

  function renderTabs() {
    tabs.forEach(tab => {
      const tb = tab.getAttribute('data-tab');
      const indicator = tab.querySelector('.tab-indicator');

      // Limpiar texto para mantener HTML interno
      if (tb === currentTab) {
        tab.className = "dash-tab relative pb-4 font-semibold text-primary transition-colors";
        if (indicator) indicator.classList.remove('hidden');
      } else {
        tab.className = "dash-tab relative pb-4 font-medium text-on-surface-variant hover:text-on-surface transition-colors";
        if (indicator) indicator.classList.add('hidden');
      }
    });
  }

  function renderTrips() {
    const container = document.getElementById('trips-container');
    container.innerHTML = '';

    // update stats silently
    const statsElements = document.querySelectorAll('section.mt-20 h3.text-3xl');

    const searchTerm = (searchInput?.value || '').toLowerCase();

    const filtrados = allTrips.filter(viaje => {
      // First filter by tab
      const est = (viaje.estado || '').toLowerCase();
      let matchesTab = true;
      if (currentTab === 'confirmados') matchesTab = (est === 'cerrado' || est === 'confirmado');
      else if (currentTab === 'planificacion') matchesTab = (est === 'planificación' || est === 'en planificación' || est === 'borrador');

      if (!matchesTab) return false;

      // Then filter by search term if exists
      if (searchTerm) {
        const nameMatch = (viaje.nombre || '').toLowerCase().includes(searchTerm);
        const destMatch = (viaje.destino_principal || '').toLowerCase().includes(searchTerm);
        return nameMatch || destMatch;
      }

      return true;
    });

    // Sort the filtered results
    filtrados.sort((a, b) => {
      // 1. Primary sorting based on currentSort
      let comparison = 0;

      switch (currentSort) {
        case 'date-asc': {
          const dateA = a.fecha_inicio ? new Date(a.fecha_inicio) : new Date(8640000000000000);
          const dateB = b.fecha_inicio ? new Date(b.fecha_inicio) : new Date(8640000000000000);
          comparison = dateA - dateB;
          break;
        }
        case 'date-desc': {
          const dateA = a.fecha_inicio ? new Date(a.fecha_inicio) : new Date(0);
          const dateB = b.fecha_inicio ? new Date(b.fecha_inicio) : new Date(0);
          comparison = dateB - dateA;
          break;
        }
        case 'name-asc':
          comparison = (a.nombre || '').localeCompare(b.nombre || '');
          break;
        case 'name-desc':
          comparison = (b.nombre || '').localeCompare(a.nombre || '');
          break;
      }

      // 2. Secondary sorting by search relevance if searchTerm exists
      if (searchTerm) {
        const nameA = (a.nombre || '').toLowerCase();
        const nameB = (b.nombre || '').toLowerCase();
        const destA = (a.destino_principal || '').toLowerCase();
        const destB = (b.destino_principal || '').toLowerCase();

        const aStarts = nameA.startsWith(searchTerm) || destA.startsWith(searchTerm);
        const bStarts = nameB.startsWith(searchTerm) || destB.startsWith(searchTerm);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
      }

      return comparison;
    });

    if (statsElements.length === 3) {
      statsElements[0].innerText = allTrips.filter(v => (v.estado || '').toLowerCase() === 'confirmado').length || '1';
      statsElements[1].innerText = allTrips.length > 0 ? (allTrips.length * 2) : '0';
      statsElements[2].innerText = [...new Set(allTrips.map(v => v.destino_principal))].length || '0';
    }

    if (filtrados.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center gap-4">
           <span class="material-symbols-outlined text-6xl text-outline-variant" data-icon="travel_explore">travel_explore</span>
           <h3 class="text-xl font-bold text-on-surface">No tienes viajes en esta categoría</h3>
           <p class="text-on-surface-variant max-w-md">Parece que aún no tienes itinerarios armados aquí. ¡Anímate a planificar tu próxima aventura y explora destinos increíbles!</p>
           <div class="flex gap-4 mt-2">
             <button onclick="localStorage.removeItem('current_trip_id'); window.location.href='../create-trip/index.html'" class="px-6 py-3 bg-primary text-on-primary rounded-full font-bold shadow-md hover:bg-[var(--colors-primary-container)] transition-colors">Armar Nuevo Viaje</button>
             <button onclick="window.location.href='../destinations/index.html'" class="px-6 py-3 border border-primary text-primary rounded-full font-bold hover:bg-primary/10 transition-colors">Ver Planes Armados</button>
           </div>
        </div>
      `;
      return;
    }

    filtrados.forEach(viaje => {
      const isConfirmed = ['Confirmado', 'Cerrado'].includes(viaje.estado);
      const isPlanning = ['Planificación', 'En Planificación', 'Borrador'].includes(viaje.estado);

      let badgeCls = 'bg-surface-variant text-on-surface-variant';
      if (isConfirmed) badgeCls = 'bg-secondary-fixed text-on-secondary-fixed-variant';
      else if (isPlanning) badgeCls = 'bg-tertiary-fixed text-on-tertiary-fixed-variant';

      const card = document.createElement('div');
      card.className = "bg-surface-container-lowest rounded-2xl p-6 shadow-[0_32px_48px_-12px_rgba(25,28,29,0.04)] flex flex-col md:flex-row gap-8 items-center border border-outline-variant/5 group hover:shadow-xl transition-all duration-300 cursor-pointer relative";
      card.onclick = () => { localStorage.setItem('current_trip_id', viaje.id); window.location.href = `../trip-detail/index.html?id=${viaje.id}`; };

      const finalImg = viaje.finalImg;

      // Calculate a dummy progress for UX purposes if not defined in backend
      const progress = isConfirmed ? 100 : (Math.floor(Math.random() * 60) + 20);

      card.innerHTML = `
        <div class="absolute top-4 right-4 flex gap-2 z-10">
          <button class="p-2 bg-white/80 backdrop-blur-md border border-outline-variant/20 hover:bg-primary/10 hover:text-primary text-on-surface-variant rounded-full transition-all shadow-sm flex items-center justify-center" onclick="event.stopPropagation(); window.exportTrip('${viaje.id}');" title="Exportar viaje">
            <span class="material-symbols-outlined text-xl">ios_share</span>
          </button>
          <button class="p-2 bg-white/80 backdrop-blur-md border border-outline-variant/20 hover:bg-primary/10 hover:text-primary text-on-surface-variant rounded-full transition-all shadow-sm flex items-center justify-center" onclick="event.stopPropagation(); window.editTrip('${viaje.id}');" title="Editar viaje">
            <span class="material-symbols-outlined text-xl">edit</span>
          </button>
          <button class="p-2 bg-white/80 backdrop-blur-md border border-outline-variant/20 hover:bg-error/10 hover:text-error text-on-surface-variant rounded-full transition-all shadow-sm flex items-center justify-center" onclick="event.stopPropagation(); window.deleteTrip('${viaje.id}');" title="Eliminar viaje">
            <span class="material-symbols-outlined text-xl">delete</span>
          </button>
        </div>
        <div class="w-full md:w-64 h-44 rounded-xl overflow-hidden shrink-0">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${finalImg}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';"/>
        </div>
        <div class="flex-1 w-full">
          <div class="flex flex-wrap items-center gap-3 mb-2">
            <h2 class="text-2xl font-bold text-on-surface">${viaje.nombre}</h2>
            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeCls}">${viaje.estado || 'Borrador'}</span>
          </div>
          <div class="flex items-center gap-6 text-on-surface-variant text-sm mb-6">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-lg" data-icon="calendar_today">calendar_today</span>
              ${viaje.fecha_inicio || '-'} al ${viaje.fecha_fin || '-'}
            </div>
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-lg" data-icon="schedule">schedule</span>
              ${viaje.duracion_dias ? viaje.duracion_dias + ' Días' : 'Varios Días'}
            </div>
          </div>
          <div class="max-w-md">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs font-semibold text-outline">Progreso del Itinerario</span>
              <span class="text-xs font-bold text-primary">${progress}%</span>
            </div>
            <div class="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div class="h-full bg-primary rounded-full transition-all duration-1000" style="width: ${progress}%"></div>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <button class="px-6 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-on-primary transition-all">
            Ver Itinerario
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Bind tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      currentTab = tab.getAttribute('data-tab');
      renderTabs();
      renderTrips();
      // Update URL silently
      window.history.replaceState({}, '', `?t=${currentTab}`);
    });
  });

  // Bind search input
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderTrips();
    });
  }

  // Bind sort dropdown
  if (sortButton && sortDropdown) {
    sortButton.addEventListener('click', (e) => {
      e.stopPropagation();
      sortDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      sortDropdown.classList.add('hidden');
    });

    sortOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        currentSort = opt.getAttribute('data-sort');
        if (sortLabel) sortLabel.textContent = opt.textContent;
        renderTrips();
      });
    });
  }

  // Fetch logic
  async function loadTrips() {
    const container = document.getElementById('trips-container');
    container.innerHTML = `
      <div class="col-span-full py-20 text-center">
         <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
         <p class="text-on-surface-variant">Cargando tus aventuras...</p>
      </div>
    `;

    try {
      if (!user || !user.id) {
        console.warn("Usuario sin ID válido en sesión. Redirigiendo al login.");
        window.location.href = '../auth/index.html';
        return;
      }
      const response = await fetch(`http://localhost:8000/api/viajes?creador_id=${encodeURIComponent(user.id)}`);
      if (response.ok) {
        const data = await response.json();
        const rawTrips = Array.isArray(data) ? data : [];
        allTrips = await Promise.all(rawTrips.map(async (plan) => {
          let finalImg = plan.foto_url || plan.foto;
          let destName = plan.destino_principal;

          if (destName === "Varios Destinos" || !finalImg) {
            // Intentar cargar destinos de este viaje específico
            const perTripDestsStr = localStorage.getItem('itera_trip_destinations_' + plan.id);
            let dests = null;

            if (perTripDestsStr) {
              try { dests = JSON.parse(perTripDestsStr); } catch (e) { }
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
              } catch (e) { /* backend no disponible */ }
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
            finalImg = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
          }
          return { ...plan, finalImg };
        }));
      } else {
        throw new Error('Backend responded with error');
      }
    } catch (err) {
      console.warn("Backend not available or failed. Falling back to empty list.");
      allTrips = [];
    }

    renderTabs();
    renderTrips();
  }

  let tripIdToDelete = null;
  const deleteModal = document.getElementById('delete-modal');
  const btnCancelDelete = document.getElementById('cancel-delete');
  const btnConfirmDelete = document.getElementById('confirm-delete');

  window.deleteTrip = function (id) {
    tripIdToDelete = id;
    deleteModal.classList.remove('hidden');
  };

  btnCancelDelete.addEventListener('click', () => {
    deleteModal.classList.add('hidden');
    tripIdToDelete = null;
  });

  btnConfirmDelete.addEventListener('click', async () => {
    if (!tripIdToDelete) return;

    btnConfirmDelete.disabled = true;
    btnConfirmDelete.innerHTML = '<span class="material-symbols-outlined animate-spin text-sm">refresh</span> Eliminando...';

    try {
      const response = await fetch(`http://localhost:8000/api/viajes/${tripIdToDelete}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        deleteModal.classList.add('hidden');
        loadTrips();
      } else {
        alert('Error al eliminar el viaje');
      }
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el viaje');
    } finally {
      btnConfirmDelete.disabled = false;
      btnConfirmDelete.textContent = 'Eliminar ahora';
      tripIdToDelete = null;
    }
  });

  window.editTrip = function (id) {
    localStorage.setItem('current_trip_id', id);
    window.location.href = '../create-trip/index.html';
  };

  window.exportTrip = async function (id) {
    const viaje = allTrips.find(v => v.id === id);
    if (!viaje) return;

    const btn = event.currentTarget;
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-sm">refresh</span>';
    btn.disabled = true;

    try {
      // Carga masiva de datos del viaje
      const [respItin, respDest, respVuelos] = await Promise.all([
        fetch(`http://localhost:8000/api/viajes/${id}/itinerario`),
        fetch(`http://localhost:8000/api/viajes/${id}/destinos`),
        fetch(`http://localhost:8000/api/viajes/${id}/vuelos`)
      ]);

      const items = respItin.ok ? await respItin.json() : [];
      const destinations = respDest.ok ? await respDest.json() : [];
      const flights = respVuelos.ok ? await respVuelos.json() : [];

      const element = document.createElement('div');
      element.style.padding = '50px';
      element.style.fontFamily = "'Inter', sans-serif";
      element.style.color = '#1e293b';
      element.style.backgroundColor = '#fff';

      // Agrupar items por fecha
      const groupedItems = items.reduce((acc, item) => {
        const date = item.fecha_asignada;
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
      }, {});

      // Ordenar fechas
      const sortedDates = Object.keys(groupedItems).sort();

      element.innerHTML = `
            <!-- HEADER -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0058bf; padding-bottom: 25px; margin-bottom: 35px;">
                <div>
                    <h1 style="font-size: 32px; font-weight: 800; color: #0f172a; margin: 0; font-family: 'Plus Jakarta Sans', sans-serif;">${viaje.nombre}</h1>
                    <p style="color: #0058bf; font-weight: 700; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px; font-size: 12px;">Dossier Oficial de Viaje — ITERA</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 24px; font-weight: 900; color: #0058bf;">ITERA</div>
                    <div style="font-size: 10px; color: #94a3b8;">Smart Travel Assistant</div>
                </div>
            </div>

            <!-- RESUMEN EJECUTIVO -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 40px;">
                <div style="background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #f1f5f9;">
                    <strong style="display: block; font-size: 10px; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Cronograma</strong>
                    <div style="font-weight: 700; font-size: 14px;">${viaje.fecha_inicio} — ${viaje.fecha_fin}</div>
                </div>
                <div style="background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #f1f5f9;">
                    <strong style="display: block; font-size: 10px; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Estado del Plan</strong>
                    <div style="font-weight: 700; font-size: 14px; color: #059669;">${viaje.estado}</div>
                </div>
                <div style="background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #f1f5f9;">
                    <strong style="display: block; font-size: 10px; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Destinos</strong>
                    <div style="font-weight: 700; font-size: 14px;">${destinations.length} Ciudades</div>
                </div>
            </div>

            <!-- RUTA Y DESTINOS -->
            <div style="margin-bottom: 45px;">
                <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <span style="width: 8px; height: 18px; background: #0058bf; display: inline-block; border-radius: 2px;"></span>
                    Ruta del Viaje
                </h2>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${destinations.map((d, i) => `
                        <div style="display: flex; align-items: center; gap: 15px; background: #fff; border: 1px solid #f1f5f9; padding: 15px; border-radius: 12px;">
                            <div style="width: 30px; height: 30px; background: #eff6ff; color: #0058bf; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px;">${i + 1}</div>
                            <div style="flex: 1;">
                                <span style="font-weight: 700; font-size: 15px; color: #1e293b;">${d.city}</span>
                                <span style="color: #94a3b8; font-size: 13px; margin-left: 5px;">— ${d.country}</span>
                            </div>
                            <div style="font-size: 13px; font-weight: 600; color: #64748b;">${d.nights} Noches</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- VUELOS -->
            ${flights.length > 0 ? `
            <div style="margin-bottom: 45px;">
                <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <span style="width: 8px; height: 18px; background: #0058bf; display: inline-block; border-radius: 2px;"></span>
                    Logística Aérea
                </h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    ${flights.map(v => `
                        <div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span style="font-size: 11px; font-weight: 800; color: #0058bf; text-transform: uppercase;">${v.airline} — ${v.flight}</span>
                                <span style="font-size: 11px; color: #94a3b8;">${v.direction.toUpperCase()}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="text-align: left;">
                                    <div style="font-weight: 800; font-size: 16px;">${v.origin}</div>
                                    <div style="font-size: 12px; color: #64748b;">${v.dep ? v.dep.substring(0, 5) : '-'}</div>
                                </div>
                                <div style="color: #cbd5e1;">→</div>
                                <div style="text-align: right;">
                                    <div style="font-weight: 800; font-size: 16px;">${v.dest}</div>
                                    <div style="font-size: 12px; color: #64748b;">${v.arr ? v.arr.substring(0, 5) : '-'}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- ITINERARIO DÍA POR DÍA -->
            <div style="page-break-before: always;">
                <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 25px; display: flex; align-items: center; gap: 10px;">
                    <span style="width: 8px; height: 18px; background: #0058bf; display: inline-block; border-radius: 2px;"></span>
                    Itinerario Detallado
                </h2>

                ${sortedDates.map(date => `
                    <div style="margin-bottom: 35px;">
                        <div style="background: #0f172a; color: #fff; padding: 12px 20px; border-radius: 12px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 800; font-size: 15px; text-transform: capitalize;">${new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                            <span style="font-size: 11px; opacity: 0.7; font-weight: 600;">DIA ${Math.floor((new Date(date) - new Date(viaje.fecha_inicio)) / (1000 * 60 * 60 * 24)) + 1}</span>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 10px; padding-left: 10px;">
                            ${groupedItems[date].sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || '')).map(item => `
                                <div style="display: flex; gap: 20px; align-items: flex-start;">
                                    <div style="font-size: 13px; font-weight: 800; color: #0058bf; min-width: 50px; padding-top: 2px;">
                                        ${item.hora_inicio ? item.hora_inicio.substring(0, 5) : '--:--'}
                                    </div>
                                    <div style="flex: 1; background: #fcfcfc; border: 1px solid #f1f5f9; padding: 15px; border-radius: 12px; position: relative;">
                                        <div style="width: 4px; height: 70%; background: #0058bf; position: absolute; left: 0; top: 15%; border-radius: 0 4px 4px 0;"></div>
                                        <h4 style="font-size: 15px; font-weight: 700; margin: 0 0 5px 0; color: #1e293b;">${item.atraccion_nombre}</h4>
                                        ${item.hora_fin ? `<div style="font-size: 12px; color: #94a3b8;">Finaliza a las ${item.hora_fin.substring(0, 5)}</div>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                
                ${sortedDates.length === 0 ? '<div style="padding: 50px; text-align: center; color: #94a3b8; border: 2px dashed #f1f5f9; border-radius: 20px;">No has programado actividades específicas aún.</div>' : ''}
            </div>

            <!-- FOOTER -->
            <div style="margin-top: 80px; border-top: 1px solid #f1f5f9; padding-top: 30px; text-align: center;">
                <div style="font-weight: 800; color: #0058bf; font-size: 14px; margin-bottom: 5px;">ITERA</div>
                <div style="font-size: 10px; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase;">Smart Travel Assistant — Personalized Itinerary</div>
            </div>
        `;

      const opt = {
        margin: 10,
        filename: `itera_dossier_${viaje.nombre.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();

    } catch (e) {
      console.error("Error al exportar PDF completo:", e);
      alert("Hubo un problema al generar el Dossier de Viaje. Intenta de nuevo.");
    } finally {
      btn.innerHTML = originalContent;
      btn.disabled = false;
    }
  };

  loadTrips();
});
