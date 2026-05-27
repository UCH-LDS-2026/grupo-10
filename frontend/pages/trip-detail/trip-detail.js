document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth check
    const userStr = localStorage.getItem('itera_user');
    if (!userStr) {
        if (window.location.protocol === 'file:') {
            window.location.href = 'http://localhost:8000/pages/auth/index.html';
        } else {
            window.location.href = '../auth/index.html';
        }
        return;
    }
    
    const userObj = JSON.parse(userStr);
    const navProfileImg = document.getElementById('nav-profile-img');
    if (navProfileImg) {
        navProfileImg.src = "https://ui-avatars.com/api/?name=" + (userObj.nombre || 'U') + "&background=0D8ABC&color=fff";
    }

    const urlParams = new URLSearchParams(window.location.search);
    const tripId = urlParams.get('id') || localStorage.getItem('current_trip_id');

    if (!tripId) {
        window.location.href = '../dashboard/index.html';
        return;
    }

    async function loadTripData() {
        try {
            const [tripResp, itemsResp] = await Promise.all([
                fetch(`http://localhost:8000/api/viajes/${tripId}`),
                fetch(`http://localhost:8000/api/viajes/${tripId}/items`)
            ]);

            if (!tripResp.ok) throw new Error("Trip not found");
            const viaje = await tripResp.json();
            const items = itemsResp.ok ? await itemsResp.json() : [];

            // Fetch attraction details for each item to get names and images
            const itemsWithDetails = await Promise.all(items.map(async (item) => {
                try {
                    const attrResp = await fetch(`/api/places/${item.atraccionId}/details`);
                    const details = attrResp.ok ? await attrResp.json() : null;
                    return { ...item, details };
                } catch (e) {
                    return item;
                }
            }));

            renderTrip(viaje, itemsWithDetails);
        } catch (error) {
            console.error("Error loading trip:", error);
            // Fallback to mock if needed, but better to show error
            if (window.mockViaje) renderTrip(window.mockViaje, window.mockViaje.eventos);
        }
    }

    function renderTrip(viaje, items) {
        // Hero Section
        const bgContainer = document.getElementById('td-hero-img-container');
        if (bgContainer) {
            // Use trip photo or default
            const heroImg = viaje.foto_url || viaje.foto || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200';
            bgContainer.style.backgroundImage = `url('${heroImg}')`;
        }
        
        const tdDestino = document.getElementById('td-destino');
        if (tdDestino) tdDestino.innerText = viaje.destino_principal || viaje.nombre;
        
        const tdFechas = document.getElementById('td-fechas-dias');
        if (tdFechas) {
            const start = viaje.fecha_inicio || '';
            const end = viaje.fecha_fin || '';
            tdFechas.innerText = `${start} - ${end}`;
        }
        
        const weatherCity = document.getElementById('widget-weather-city');
        if (weatherCity) weatherCity.innerText = viaje.destino_principal || '';

        // Timeline Area
        const timelineArea = document.getElementById('timeline-area');
        if (!timelineArea) return;

        let fullHtml = '';
        
        // Group items by date
        const grouped = {};
        const pending = [];

        items.forEach(item => {
            if (!item.fechaAsignada) {
                pending.push(item);
            } else {
                if (!grouped[item.fechaAsignada]) grouped[item.fechaAsignada] = [];
                grouped[item.fechaAsignada].push(item);
            }
        });

        // 1. Render Pending Items
        if (pending.length > 0) {
            fullHtml += `
            <div class="mb-12">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-2xl font-headline font-extrabold text-amber-600 flex items-center gap-2">
                            <span class="material-symbols-outlined">pending_actions</span>
                            Atracciones Pendientes
                        </h2>
                        <p class="text-on-surface-variant font-medium text-sm">Lugares guardados sin fecha ni hora asignada</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${pending.map(item => renderItemCard(item, true)).join('')}
                </div>
            </div>`;
        }

        // 2. Render Scheduled Items by Day
        const sortedDates = Object.keys(grouped).sort();
        sortedDates.forEach(date => {
            const dayItems = grouped[date].sort((a, b) => (a.horaInicio || '00:00').localeCompare(b.horaInicio || '00:00'));
            
            fullHtml += `
            <div class="mb-12">
                <div class="flex items-center justify-between mb-10">
                    <div>
                        <h2 class="text-3xl font-headline font-extrabold tracking-tight capitalize">${formatDate(date)}</h2>
                        <p class="text-on-surface-variant font-medium">Itinerario y actividades</p>
                    </div>
                </div>
                <div class="relative space-y-10 timeline-line">
                    ${dayItems.map(item => renderItemRow(item)).join('')}
                </div>
            </div>`;
        });

        if (items.length === 0) {
            fullHtml = `
            <div class="text-center py-20 bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant/30">
                <span class="material-symbols-outlined text-6xl text-outline-variant mb-4">explore</span>
                <h3 class="text-xl font-bold">Tu itinerario está vacío</h3>
                <p class="text-on-surface-variant mt-2 mb-6">Empieza a explorar destinos y agrega atracciones a este viaje.</p>
                <a href="../destinations/index.html" class="px-8 py-3 bg-primary text-white rounded-full font-bold">Explorar Destinos</a>
            </div>`;
        }

        timelineArea.innerHTML = fullHtml;
    }

    function renderItemCard(item, isPending) {
        const name = item.details?.displayName?.text || item.details?.name || 'Atracción';
        const img = item.details?.photos?.[0]?.name ? `/api/places/${item.atraccionId}/photo?max_width=400` : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400';
        
        return `
        <div class="bg-amber-50/50 border border-amber-200 p-4 rounded-2xl flex gap-4 items-center">
            <img src="${img}" class="w-20 h-20 rounded-xl object-cover" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400';"/>
            <div class="flex-1">
                <h4 class="font-bold text-on-surface">${name}</h4>
                <div class="flex items-center gap-1 mt-1 text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full w-fit">
                    <span class="material-symbols-outlined text-[14px]">warning</span>
                    <span class="text-[10px] font-bold uppercase">Sin programar</span>
                </div>
            </div>
            <button onclick="alert('Funcionalidad de edición próximamente')" class="p-2 hover:bg-amber-100 rounded-full transition-colors text-amber-800">
                <span class="material-symbols-outlined">edit_calendar</span>
            </button>
        </div>`;
    }

    function renderItemRow(item) {
        const name = item.details?.displayName?.text || item.details?.name || 'Atracción';
        const img = item.details?.photos?.[0]?.name ? `/api/places/${item.atraccionId}/photo?max_width=400` : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400';
        const time = item.horaInicio ? item.horaInicio.substring(0, 5) : null;
        
        const warningHtml = !time ? `
            <div class="flex items-center gap-1 mt-2 text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-lg w-fit">
                <span class="material-symbols-outlined text-[16px]">error</span>
                <span class="text-[11px] font-bold">Falta fecha y hora</span>
            </div>
        ` : '';

        return `
        <div class="relative pl-12 flex flex-col md:flex-row gap-6">
            <div class="absolute left-0 top-1 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm z-10 border-4 border-surface">
                <span class="material-symbols-outlined text-primary text-xl">${time ? 'schedule' : 'priority_high'}</span>
            </div>
            <div class="md:w-32 pt-2 text-left">
                <span class="text-lg font-bold ${time ? 'text-primary' : 'text-red-500'}">${time || '--:--'}</span>
            </div>
            <div class="flex-1 bg-surface-container-lowest p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                <div class="flex flex-col sm:flex-row gap-6">
                    <img alt="${name}" class="w-full sm:w-40 h-32 rounded-xl object-cover" src="${img}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400';"/>
                    <div class="flex-1">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-xl font-headline font-bold group-hover:text-primary transition-colors">${name}</h3>
                        </div>
                        ${warningHtml}
                        <p class="text-on-surface-variant text-sm leading-relaxed mt-2">Disfruta de este lugar y vive una experiencia inolvidable en este destino.</p>
                    </div>
                </div>
            </div>
        </div>`;
    }

    function formatDate(dateStr) {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', options);
    }

    loadTripData();
});

window.handleLogout = function() {
    localStorage.removeItem('itera_user');
    window.location.href = '../auth/index.html';
};
