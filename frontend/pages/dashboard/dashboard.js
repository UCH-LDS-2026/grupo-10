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

      const isShared = (viaje.rol === 'LECTOR' || viaje.rol === 'EDITOR') && viaje.creador_id !== user.id;
      const sharedByName = viaje.creador_nombre ? viaje.creador_nombre.trim() : (viaje.creador_username ? '@' + viaje.creador_username : null);

      const card = document.createElement('div');
      card.className = "bg-surface-container-lowest rounded-2xl p-6 shadow-[0_32px_48px_-12px_rgba(25,28,29,0.04)] flex flex-col md:flex-row gap-8 items-center border border-outline-variant/5 group hover:shadow-xl transition-all duration-300 cursor-pointer relative";
      card.onclick = () => { localStorage.setItem('current_trip_id', viaje.id); window.location.href = `../trip-detail/index.html?id=${viaje.id}`; };

      const finalImg = viaje.finalImg;

      card.innerHTML = `
        <div class="absolute top-4 right-4 flex gap-2 z-10">
          ${(() => {
            const isOwner = viaje.creador_id === user.id;
            const isEditor = viaje.rol === 'EDITOR';
            const isLector = viaje.rol === 'LECTOR';
            const isShared = !isOwner || viaje.compartido_con_otros;
            
            let badgeHtml = '';
            if (isShared) {
                badgeHtml = `<span class="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-violet-200 flex items-center gap-1 backdrop-blur-md">
                    <span class="material-symbols-outlined text-[14px]">folder_shared</span> Compartido
                </span>`;
            }
            
            if (isLector && !isOwner) {
                return `${badgeHtml}
                <button class="p-2 bg-white/80 backdrop-blur-md border border-outline-variant/20 hover:bg-primary/10 hover:text-primary text-on-surface-variant rounded-full transition-all shadow-sm flex items-center justify-center" onclick="event.stopPropagation(); window.exportTripToPDF('${viaje.id}', '${(viaje.nombre || 'Itinerario').replace(/'/g, "\\'")}', this);" title="Exportar PDF">
                  <span class="material-symbols-outlined text-xl">picture_as_pdf</span>
                </button>`;
            }
            
            if (isEditor && !isOwner) {
                return `${badgeHtml}
                <button class="p-2 bg-white/80 backdrop-blur-md border border-outline-variant/20 hover:bg-primary/10 hover:text-primary text-on-surface-variant rounded-full transition-all shadow-sm flex items-center justify-center" onclick="event.stopPropagation(); window.exportTripToPDF('${viaje.id}', '${(viaje.nombre || 'Itinerario').replace(/'/g, "\\'")}', this);" title="Exportar PDF">
                  <span class="material-symbols-outlined text-xl">picture_as_pdf</span>
                </button>
                <button class="p-2 bg-white/80 backdrop-blur-md border border-outline-variant/20 hover:bg-primary/10 hover:text-primary text-on-surface-variant rounded-full transition-all shadow-sm flex items-center justify-center" onclick="event.stopPropagation(); window.editTrip('${viaje.id}');" title="Editar viaje">
                  <span class="material-symbols-outlined text-xl">edit</span>
                </button>`;
            }
            
            return `
              ${badgeHtml}
              <button class="p-2 bg-white/80 backdrop-blur-md border border-outline-variant/20 hover:bg-primary/10 hover:text-primary text-on-surface-variant rounded-full transition-all shadow-sm flex items-center justify-center" onclick="event.stopPropagation(); window.exportTripToPDF('${viaje.id}', '${(viaje.nombre || 'Itinerario').replace(/'/g, "\\'")}', this);" title="Exportar PDF">
                <span class="material-symbols-outlined text-xl">picture_as_pdf</span>
              </button>
              <button class="p-2 bg-white/80 backdrop-blur-md border border-outline-variant/20 hover:bg-primary/10 hover:text-primary text-on-surface-variant rounded-full transition-all shadow-sm flex items-center justify-center" onclick="event.stopPropagation(); window.editTrip('${viaje.id}');" title="Editar viaje">
                <span class="material-symbols-outlined text-xl">edit</span>
              </button>
              <button class="p-2 bg-white/80 backdrop-blur-md border border-outline-variant/20 hover:bg-error/10 hover:text-error text-on-surface-variant rounded-full transition-all shadow-sm flex items-center justify-center" onclick="event.stopPropagation(); window.deleteTrip('${viaje.id}');" title="Eliminar viaje">
                <span class="material-symbols-outlined text-xl">delete</span>
              </button>
            `;
          })()}
        </div>
        <div class="w-full md:w-64 h-44 rounded-xl overflow-hidden shrink-0">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${finalImg}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';"/>
        </div>
        <div class="flex-1 w-full">
          <div class="flex flex-wrap items-center gap-3 mb-2">
            <h2 class="text-2xl font-bold text-on-surface">${viaje.nombre}</h2>
            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeCls}">${viaje.estado || 'Borrador'}</span>
            ${(() => {
              const rol = viaje.rol;
              if (rol === 'CREADOR') {
                return `<span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[13px]">star</span> Creador
                </span>`;
              } else if (rol === 'EDITOR') {
                return `<span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[13px]">edit</span> Editor
                </span>`;
              } else if (rol === 'LECTOR') {
                return `<span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[13px]">visibility</span> Lector
                </span>`;
              }
              return '';
            })()}
          </div>
          <div class="flex flex-wrap items-center gap-4 text-on-surface-variant text-sm mb-6">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-lg" data-icon="calendar_today">calendar_today</span>
              ${viaje.fecha_inicio || '-'} al ${viaje.fecha_fin || '-'}
            </div>
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-lg" data-icon="schedule">schedule</span>
              ${viaje.duracion_dias ? viaje.duracion_dias + ' Días' : 'Varios Días'}
            </div>
            ${isShared && sharedByName ? `
            <div class="flex items-center gap-1.5 px-3 py-1 bg-violet-50 border border-violet-200 rounded-full">
              <span class="material-symbols-outlined text-[15px] text-violet-500">person_add</span>
              <span class="text-[11px] font-semibold text-violet-600">Compartido por <span class="font-bold">${sharedByName}</span></span>
            </div>
            ` : ''}
          </div>
          <div class="max-w-md">
            <p class="text-xs font-semibold text-outline mb-3">Pasos del Itinerario</p>
            <div class="flex items-center gap-0">
              ${(() => {
                // Determine completed steps based on status
                // Step 1 (Concepto): always done if the trip exists
                // Step 2 (Ruta): done if trip has dates or is not in 'pendiente' state
                // Step 3 (Itinerario): done if confirmed/closed
                const est = (viaje.estado || '').toLowerCase();
                const step1 = true; // Trip exists = concept done
                const step2 = est !== 'pendiente'; // Has gone past planning
                const step3 = est === 'confirmado' || est === 'cerrado';

                const steps = [
                  { label: 'Concepto', icon: 'edit_note', done: step1 },
                  { label: 'Ruta', icon: 'map', done: step2 },
                  { label: 'Itinerario', icon: 'calendar_today', done: step3 },
                ];

                return steps.map((s, i) => `
                  <div class="flex items-center ${i < steps.length - 1 ? 'flex-1' : ''}">
                    <div class="flex flex-col items-center gap-1 shrink-0">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                        ${s.done ? 'bg-primary border-primary text-white' : 'bg-surface border-outline-variant text-outline-variant'}">
                        <span class="material-symbols-outlined text-[14px]" style="font-variation-settings:'FILL' ${s.done ? 1 : 0}">${s.icon}</span>
                      </div>
                      <span class="text-[9px] font-bold uppercase tracking-wide ${s.done ? 'text-primary' : 'text-outline-variant'}">${s.label}</span>
                    </div>
                    ${i < steps.length - 1 ? `
                      <div class="flex-1 h-0.5 mb-4 mx-1 rounded-full ${step2 && i === 0 ? 'bg-primary' : step3 && i === 1 ? 'bg-primary' : 'bg-outline-variant/30'}"></div>
                    ` : ''}
                  </div>
                `).join('');
              })()}
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

  loadTrips();
});

// ============================================================
// PDF Export: descarga el itinerario directamente desde el backend
// ============================================================
window.exportTripToPDF = async function(tripId, tripName, btn) {
  const iconEl = btn ? btn.querySelector('.material-symbols-outlined') : null;
  const originalIcon = iconEl ? iconEl.textContent : '';

  try {
    // Mostrar estado de carga
    if (iconEl) {
      iconEl.textContent = 'hourglass_empty';
      iconEl.classList.add('animate-spin');
    }
    if (btn) btn.disabled = true;

    // Recopilar itinerario del localStorage para este viaje (fallback para viajes manuales)
    const ITIN_KEY = 'itera_trip_itineraries_' + tripId;
    const DEST_KEY = 'itera_trip_destinations_' + tripId;
    let frontendItems = [];

    try {
      const rawItin = localStorage.getItem(ITIN_KEY);
      const rawDests = localStorage.getItem(DEST_KEY);
      if (rawItin) {
        const itineraries = JSON.parse(rawItin);
        const destinations = rawDests ? JSON.parse(rawDests) : [];

        // Calcular fecha de inicio del viaje
        let tripStartDate = null;
        const tripRaw = localStorage.getItem('itera_trip_meta_' + tripId);
        if (tripRaw) {
          try {
            const meta = JSON.parse(tripRaw);
            if (meta.fecha_inicio) tripStartDate = new Date(meta.fecha_inicio);
          } catch(e) {}
        }

        // Si no hay meta guardada, obtener del backend
        if (!tripStartDate) {
          try {
            const tr = await fetch(`http://localhost:8000/api/viajes/${tripId}`);
            if (tr.ok) {
              const tv = await tr.json();
              if (tv.fecha_inicio) tripStartDate = new Date(tv.fecha_inicio);
            }
          } catch(e) {}
        }

        // Calcular noches acumuladas por destino
        let accNights = 0;
        for (const dest of destinations) {
          const destId = dest.id || dest.city;
          const nights = parseInt(dest.nights) || 1;
          const destItin = itineraries[destId] || itineraries[dest.id] || {};

          for (const [dayStr, attrs] of Object.entries(destItin)) {
            if (!Array.isArray(attrs)) continue;
            const dayNum = parseInt(dayStr) - 1;
            let fecha = '';
            if (tripStartDate) {
              const d = new Date(tripStartDate);
              d.setDate(d.getDate() + accNights + dayNum);
              fecha = d.toISOString().split('T')[0];
            } else {
              fecha = `Destino ${dest.city || dest.id} - Día ${dayStr}`;
            }

            for (const attr of attrs) {
              frontendItems.push({
                fecha: fecha,
                hora_inicio: attr.time || '',
                hora_fin: attr.timeEnd || '',
                nombre: attr.title || attr.nombre || 'Actividad',
                descripcion: attr.desc || attr.descripcion || '',
                categoria: attr.category || attr.categoria || '',
                direccion: (attr.placeInfo && attr.placeInfo.address) ? attr.placeInfo.address : (attr.direccion || '')
              });
            }
          }
          accNights += nights;
        }

        // También buscar por destino_id directamente si no hay destinations
        if (frontendItems.length === 0) {
          for (const [destId, days] of Object.entries(itineraries)) {
            for (const [dayStr, attrs] of Object.entries(days)) {
              if (!Array.isArray(attrs)) continue;
              for (const attr of attrs) {
                frontendItems.push({
                  fecha: `Día ${dayStr}`,
                  hora_inicio: attr.time || '',
                  hora_fin: attr.timeEnd || '',
                  nombre: attr.title || attr.nombre || 'Actividad',
                  descripcion: attr.desc || attr.descripcion || '',
                  categoria: attr.category || attr.categoria || '',
                  direccion: (attr.placeInfo && attr.placeInfo.address) ? attr.placeInfo.address : (attr.direccion || '')
                });
              }
            }
          }
        }
      }
    } catch(e) {
      console.warn('No se pudo leer el itinerario local:', e);
    }

    // Usar POST para enviar el itinerario local como fallback
    const response = await fetch(`http://localhost:8000/api/viajes/${tripId}/export/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(frontendItems)
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    // Obtener nombre de archivo del header si está disponible
    const disposition = response.headers.get('Content-Disposition');
    let fileName = `Itinerario_${(tripName || 'Viaje').replace(/[^a-zA-Z0-9_\-\u00C0-\u017E ]/g, '')}.pdf`;
    if (disposition) {
      const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"'\n]+)["']?/i);
      if (match && match[1]) {
        try { fileName = decodeURIComponent(match[1].replace(/\+/g, ' ')); } catch(e) {}
      }
    }

    // Crear blob y disparar descarga
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (err) {
    console.error('Error al exportar PDF:', err);
    alert('No se pudo generar el PDF. Asegurate de que el backend esté activo e intentá de nuevo.');
  } finally {
    // Restaurar botón
    if (iconEl) {
      iconEl.textContent = originalIcon;
      iconEl.classList.remove('animate-spin');
    }
    if (btn) btn.disabled = false;
  }
};
