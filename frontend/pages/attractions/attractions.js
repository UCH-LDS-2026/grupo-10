document.addEventListener('DOMContentLoaded', () => {
  const langCode = localStorage.getItem('itera_lang') || 'ES';
  const t = window.translations ? window.translations[langCode] : {};

  if (t.attraction_explore) document.getElementById('txt-title').innerText = t.attraction_explore;
  if (t.attraction_subtitle) document.getElementById('txt-subtitle').innerText = t.attraction_subtitle;
  if (t.attraction_placeholder) document.getElementById('search-input').placeholder = t.attraction_placeholder;

  const atracciones = window.mockAtracciones || [];
  const strFrom = t.attraction_from || 'Desde';
  const strBtn = t.attraction_btn_detail || 'Ver Detalle';
  
  const searchInput = document.getElementById('search-input');
  const gridResults = document.getElementById('grid-results');

  function renderGrid(searchTerm = '') {
    gridResults.innerHTML = '';
    const term = searchTerm.toLowerCase();
    
    const filtered = atracciones.filter(a => 
      a.nombre.toLowerCase().includes(term) || 
      a.ubicacion.toLowerCase().includes(term)
    );

    filtered.forEach(atraccion => {
      const card = document.createElement('div');
      card.className = "group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col";
      card.innerHTML = `
        <div class="relative h-64 overflow-hidden">
          <img src="${atraccion.imagen}" alt="${atraccion.nombre}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <button class="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur hover:bg-white rounded-full text-slate-600 hover:text-red-500 transition-colors shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          </button>
        </div>
        <div class="p-6 flex-1 flex flex-col">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-xl font-bold text-slate-800 leading-tight">${atraccion.nombre}</h3>
            <div class="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg text-yellow-700">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              <span class="text-sm font-bold">${atraccion.puntuacion}</span>
            </div>
          </div>
          <p class="text-slate-500 mb-4 flex items-center">
            <svg class="w-4 h-4 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            ${atraccion.ubicacion}
          </p>
          <div class="mt-auto flex items-end justify-between pt-4 border-t border-slate-100">
            <div>
              <span class="text-xs text-slate-500 uppercase font-bold tracking-wider">${strFrom}</span>
              <div class="text-xl font-bold text-slate-800">${atraccion.precio}</div>
            </div>
            <button class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm" onclick="window.location.href='../explore-catalog/index.html'">
              ${strBtn}
            </button>
          </div>
        </div>
      `;
      gridResults.appendChild(card);
    });
  }

  searchInput.addEventListener('input', (e) => {
    renderGrid(e.target.value);
  });

  renderGrid('');
});
