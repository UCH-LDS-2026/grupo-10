document.addEventListener('DOMContentLoaded', () => {
  const userStr = localStorage.getItem('itera_user');
  if (!userStr) {
    window.location.href = '../auth/index.html';
    return;
  }

  // Estado JSON Principal Simulado
  let tripState = {
    viaje_id: 99,
    nombre: 'Aventura Europea',
    detalles: 'Francia, Italia • 15 Oct - 30 Oct',
    usuarios: ['SM', 'AL'],
    logistica: {
      vuelos: [],
      hospedajes: []
    },
    itinerario: [
      {
        id: 'ev1',
        tipo: 'atraccion',
        atraccion: 'Museo del Louvre',
        hora: '10:00 - 14:00',
        transporte_al_siguiente: { tipo: '🚇 Metro', duracion: 15 }
      },
      {
        id: 'ev2',
        tipo: 'atraccion',
        atraccion: 'Torre Eiffel',
        hora: '15:00 - 18:00',
        transporte_al_siguiente: { tipo: '🚶 Caminando', duracion: 20 }
      },
      {
        id: 'ev3',
        tipo: 'atraccion',
        atraccion: 'Cena en Sena',
        hora: '19:00 - 21:00',
        transporte_al_siguiente: null
      }
    ]
  };

  const transportOptions = [
    { type: '🚶 Caminando', icon: '🚶' },
    { type: '🚇 Metro', icon: '🚇' },
    { type: '🚗 Uber', icon: '🚗' },
    { type: '🚌 Bus', icon: '🚌' }
  ];

  function renderHeader() {
    document.getElementById('header-nombre').innerText = tripState.nombre;
    document.getElementById('header-detalles').innerText = tripState.detalles;
    const usersContainer = document.getElementById('header-usuarios');
    usersContainer.innerHTML = '';
    tripState.usuarios.forEach(u => {
      const div = document.createElement('div');
      div.className = "w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white z-10";
      div.innerText = u;
      usersContainer.appendChild(div);
    });
  }

  function renderDiscoverySidebar() {
    const container = document.getElementById('discovery-list');
    container.innerHTML = '';
    [1, 2, 3].forEach(i => {
      const item = document.createElement('div');
      item.className = "border border-slate-100 rounded-xl p-3 hover:shadow-md transition-shadow cursor-pointer";
      item.innerHTML = `
         <div class="h-24 bg-slate-200 rounded-lg mb-2"></div>
         <h4 class="font-bold text-sm text-slate-800">Atracción Destacada ${i}</h4>
         <div class="flex justify-between items-center mt-2">
           <span class="text-yellow-500 text-xs font-bold">★ 4.8</span>
           <button class="text-blue-500 text-xs font-bold hover:bg-blue-50 px-2 py-1 rounded">Añadir</button>
         </div>
      `;
      container.appendChild(item);
    });
  }

  window.handleUpdateTransport = function(itemId, newType) {
    const item = tripState.itinerario.find(i => i.id === itemId);
    if (item) {
      item.transporte_al_siguiente = {
        tipo: newType,
        duracion: Math.floor(Math.random() * 30) + 5
      };
      renderItinerary();
    }
  };

  function renderItinerary() {
    const container = document.getElementById('itinerary-workspace');
    container.innerHTML = '';
    
    tripState.itinerario.forEach((item, index) => {
      // Attraction block
      const evDiv = document.createElement('div');
      evDiv.className = "relative pl-8";
      evDiv.innerHTML = `
        <div class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-white"></div>
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:shadow-md transition-all">
          <div class="flex justify-between">
            <h4 class="font-bold text-slate-800">${item.atraccion}</h4>
            <span class="text-sm font-semibold text-slate-500">${item.hora}</span>
          </div>
        </div>
      `;
      container.appendChild(evDiv);

      // Transport block
      if (index < tripState.itinerario.length - 1) {
        const trDiv = document.createElement('div');
        trDiv.className = "relative pl-8 my-1 group";

        let optionsHtml = '';
        transportOptions.forEach(opt => {
          const isSelected = item.transporte_al_siguiente && item.transporte_al_siguiente.tipo === opt.type;
          const btnClass = isSelected ? 'bg-blue-100 text-blue-600 scale-110' : 'hover:bg-slate-50 text-slate-400';
          optionsHtml += `
            <button
              onclick="handleUpdateTransport('${item.id}', '${opt.type}')"
              class="p-1.5 rounded-md transition-all ${btnClass}"
              title="${opt.type}"
            >
              <span class="text-lg">${opt.icon}</span>
            </button>
          `;
        });

        trDiv.innerHTML = `
          <div class="absolute -left-[9px] top-1/2 -translate-y-1/2 bg-white w-4 h-4 flex items-center justify-center text-slate-400">↓</div>
          <div class="flex items-center space-x-3">
            <div class="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
              ${optionsHtml}
            </div>
            ${item.transporte_al_siguiente ? `
              <div class="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                ${item.transporte_al_siguiente.duracion} MIN
              </div>
            ` : ''}
          </div>
        `;
        container.appendChild(trDiv);
      }
    });
  }

  // Initial render
  renderHeader();
  renderDiscoverySidebar();
  renderItinerary();
});
