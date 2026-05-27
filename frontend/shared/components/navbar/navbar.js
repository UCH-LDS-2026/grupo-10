// --- Redirección automática de seguridad ---
if (window.location.protocol === 'file:') {
  // Si se abre directamente el archivo, forzamos a usar el servidor local en la página de login (puerto 8000 por el backend)
  window.location.href = 'http://localhost:8000/pages/auth/index.html';
}
// --- Fin de redirección ---

function renderNavbar(t) {
  const currentUserStr = localStorage.getItem('itera_user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const langCode = localStorage.getItem('itera_lang') || 'ES';
  
  const flagCodes = { ES: 'es', EN: 'us', PT: 'br', FR: 'fr' };
  const currentFlag = flagCodes[langCode] || 'es';

  const getInitials = (name, lastName) => {
    if (!name) return 'U';
    return (name[0] + (lastName ? lastName[0] : '')).toUpperCase();
  };

  const navHtml = `
    <header id="main-header" class="fixed top-0 w-full z-50 bg-transparent border-transparent transition-all duration-300">
      <div id="header-container" class="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto transition-all duration-500">
        <!-- Logo & Navigation - Left -->
        <div class="flex items-center gap-8">
          <span onclick="window.location.href='../home/index.html'" class="text-3xl font-medium uppercase tracking-widest text-slate-900 dark:text-white cursor-pointer select-none transition-transform hover:scale-[1.02]" style="font-family: 'Montserrat', sans-serif;">
            ITER<span style="letter-spacing: -2px;">Λ</span>
          </span>
          <nav class="hidden md:flex items-center gap-6">
            <a class="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-semibold" href="../home/index.html">Inicio</a>
            <a class="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-semibold" href="../dashboard/index.html">Mis Viajes</a>
            <a class="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-semibold" href="../destinations/index.html">Explorar Destinos</a>
          </nav>
        </div>
        
        <!-- Actions - Right -->
        <div class="flex items-center gap-4">
          
          <!-- Idioma Dropdown -->
          <div class="relative">
            <button 
              onclick="toggleNavDropdown('idioma')"
              class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors focus:outline-none backdrop-blur-sm border border-slate-200 dark:border-slate-700"
            >
              <img id="current-lang-flag" src="https://flagcdn.com/w20/${currentFlag}.png" class="w-4 h-3 object-cover rounded-sm">
              <span>${langCode}</span>
              <span class="material-symbols-outlined text-sm">language</span>
            </button>
            <div id="dropdown-idioma" class="hidden absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
              <div class="py-1">
                <button onclick="changeLanguage('ES')" class="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex flex-col gap-0.5 group">
                  <div class="flex justify-between items-center w-full">
                    <span class="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors uppercase">es</span>
                    <img src="https://flagcdn.com/w20/es.png" class="w-4 h-3 object-cover rounded-sm" alt="es">
                  </div>
                  <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Español</span>
                </button>
                <button onclick="changeLanguage('EN')" class="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex flex-col gap-0.5 group">
                  <div class="flex justify-between items-center w-full">
                    <span class="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors uppercase">en</span>
                    <img src="https://flagcdn.com/w20/us.png" class="w-4 h-3 object-cover rounded-sm" alt="en">
                  </div>
                  <span class="text-sm font-medium text-slate-700 dark:text-slate-300">English</span>
                </button>
                <button onclick="changeLanguage('PT')" class="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex flex-col gap-0.5 group">
                  <div class="flex justify-between items-center w-full">
                    <span class="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors uppercase">pt</span>
                    <img src="https://flagcdn.com/w20/br.png" class="w-4 h-3 object-cover rounded-sm" alt="pt">
                  </div>
                  <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Português</span>
                </button>
                <button onclick="changeLanguage('FR')" class="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex flex-col gap-0.5 group">
                  <div class="flex justify-between items-center w-full">
                    <span class="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors uppercase">fr</span>
                    <img src="https://flagcdn.com/w20/fr.png" class="w-4 h-3 object-cover rounded-sm" alt="fr">
                  </div>
                  <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Français</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Search Profile Button -->
          <button 
            id="btn-buscar-perfil"
            onclick="window.openSearchUserModal()"
            class="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95 duration-150 flex items-center justify-center"
            title="Buscar Perfiles"
          >
            <span class="material-symbols-outlined">search</span>
          </button>

          <!-- Notification Icon (Static) -->
          <button class="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95 duration-150">
            <span class="material-symbols-outlined">notifications</span>
          </button>

          <!-- Profile Dropdown -->
          <div class="relative">
            <button 
              onclick="toggleNavDropdown('profile')"
              class="h-10 w-10 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-sm bg-slate-100 dark:bg-slate-800 focus:outline-none transition-colors duration-300 flex items-center justify-center"
            >
              <img id="header-avatar" class="h-full w-full object-cover hidden" src="" alt="Avatar" onload="this.classList.remove('hidden'); document.getElementById('header-avatar-initials')?.classList.add('hidden')">
              <span id="header-avatar-initials" class="text-slate-700 dark:text-slate-200 font-bold">${currentUser ? getInitials(currentUser.nombre, currentUser.apellido) : 'U'}</span>
            </button>
            <div id="dropdown-profile" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
              <div class="py-1">
                <a href="../profile/index.html" class="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors">
                  <span class="material-symbols-outlined text-base">person</span> Perfil
                </a>
                <a href="#" class="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors">
                  <span class="material-symbols-outlined text-base">settings</span> Configuración
                </a>
                <div class="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                <button onclick="handleLogout()" class="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/5 flex items-center gap-2 transition-colors font-bold">
                  <span class="material-symbols-outlined text-base">logout</span> Cerrar sesión
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  `;

  return navHtml;
}

window.toggleNavDropdown = function(name) {
  const dropdowns = ['idioma', 'profile'];
  dropdowns.forEach(d => {
    const el = document.getElementById('dropdown-' + d);
    if (!el) return;
    if (d === name) {
      el.classList.toggle('hidden');
    } else {
      el.classList.add('hidden');
    }
  });
};

window.changeLanguage = function(lang) {
  localStorage.setItem('itera_lang', lang);
  window.location.reload();
};

window.handleLogout = function() {
  localStorage.removeItem('itera_user');
  localStorage.removeItem('itera_avatar');
  window.location.href = '../auth/index.html';
};

document.addEventListener('click', function(event) {
  const nav = document.getElementById('main-header');
  if (nav && !nav.contains(event.target) && !event.target.closest('button[onclick^="toggleNavDropdown"]')) {
    window.toggleNavDropdown(null);
  }
});

function injectNavbar() {
  const container = document.getElementById('navbar-container');
  if (container) {
    const langCode = localStorage.getItem('itera_lang') || 'ES';
    const t = window.translations ? window.translations[langCode] : {};
    container.innerHTML = renderNavbar(t || {});
  }
}

// --- Buscar Perfiles Modal & Logic Implementation ---

function injectSearchModal() {
  if (document.getElementById('search-user-modal')) return;

  const modalHtml = `
    <!-- Search User Modal -->
    <div id="search-user-modal" class="hidden fixed inset-0 z-[200]">
      <!-- Transparent Backdrop for outside click -->
      <div class="absolute inset-0" onclick="window.closeSearchUserModal()"></div>
      
      <!-- Small Rectangle Panel - Right Side Below Header -->
      <div id="search-user-card" class="fixed top-[72px] right-4 w-[280px] bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 shadow-xl rounded-xl overflow-hidden backdrop-blur-2xl transition-all duration-200 ease-out transform -translate-y-3 opacity-0 origin-top-right flex flex-col" style="max-height: min(40vh, 380px);">
        
        <!-- Search Input -->
        <div class="relative w-full p-3 border-b border-slate-100 dark:border-slate-800/50">
          <div class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <span class="material-symbols-outlined text-[18px]">search</span>
          </div>
          <input 
            id="search-user-input" 
            type="text" 
            oninput="window.handleSearchInput(event)"
            placeholder="Buscar viajeros..." 
            class="w-full bg-slate-100/60 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 rounded-lg py-2 pl-9 pr-7 text-xs font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
            autocomplete="off"
          />
          <button 
            id="search-user-clear"
            onclick="window.clearSearchInput()"
            class="hidden absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            <span class="material-symbols-outlined text-sm">cancel</span>
          </button>
        </div>

        <!-- Search Results -->
        <div class="flex-1 overflow-y-auto p-1.5 scrollbar-thin">
          <div id="search-user-results" class="space-y-1">
            <div class="flex flex-col items-center justify-center py-8 text-center text-slate-400 dark:text-slate-500">
              <span class="material-symbols-outlined text-3xl mb-1.5 opacity-60">travel_explore</span>
              <p class="text-[11px] font-medium">Busca viajeros en ITERΛ</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function injectSearchButtonIfMissing() {
  if (document.getElementById('btn-buscar-perfil')) return;

  // Find notification button in the document
  const notifBtn = document.getElementById('notif-btn') || 
                   Array.from(document.querySelectorAll('button')).find(btn => {
                     const iconSpan = btn.querySelector('span');
                     return iconSpan && iconSpan.textContent.trim() === 'notifications';
                   });

  if (notifBtn) {
    const searchBtn = document.createElement('button');
    searchBtn.id = 'btn-buscar-perfil';
    searchBtn.onclick = () => window.openSearchUserModal();
    
    // Auto-detect styling (transparent glass or dynamic slate)
    const isWhiteText = notifBtn.classList.contains('text-white') || notifBtn.classList.contains('text-white/95');
    
    if (isWhiteText) {
      searchBtn.className = "p-2 text-white hover:bg-white/20 rounded-lg transition-all active:scale-95 duration-150 drop-shadow-md flex items-center justify-center animate-fade-in";
    } else {
      searchBtn.className = "p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95 duration-150 flex items-center justify-center animate-fade-in";
    }
    
    searchBtn.innerHTML = `<span class="material-symbols-outlined">search</span>`;
    searchBtn.title = "Buscar Perfiles";
    
    notifBtn.parentNode.insertBefore(searchBtn, notifBtn);
  }
}

// Register global window functions for search profile
window.openSearchUserModal = function() {
  const modal = document.getElementById('search-user-modal');
  const card = document.getElementById('search-user-card');
  
  if (modal && card) {
    modal.classList.remove('hidden');
    setTimeout(() => {
      card.classList.remove('-translate-y-3', 'opacity-0');
      card.classList.add('translate-y-0', 'opacity-100');
    }, 10);
    document.getElementById('search-user-input')?.focus();
  }
};

window.closeSearchUserModal = function() {
  const modal = document.getElementById('search-user-modal');
  const card = document.getElementById('search-user-card');
  if (modal && card) {
    card.classList.remove('translate-y-0', 'opacity-100');
    card.classList.add('-translate-y-3', 'opacity-0');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 200);
  }
};

window.clearSearchInput = function() {
  const input = document.getElementById('search-user-input');
  if (input) {
    input.value = '';
    document.getElementById('search-user-clear')?.classList.add('hidden');
    window.renderSearchInitialState();
    input.focus();
  }
};

window.renderSearchInitialState = function() {
  const resultsContainer = document.getElementById('search-user-results');
  if (resultsContainer) {
    resultsContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center py-8 text-center text-slate-400 dark:text-slate-500">
        <span class="material-symbols-outlined text-3xl mb-1.5 opacity-60">travel_explore</span>
        <p class="text-[11px] font-medium">Busca viajeros en ITERΛ</p>
      </div>
    `;
  }
};

let searchDebounceTimeout = null;
window.handleSearchInput = function(e) {
  const query = e.target.value.trim();
  const clearBtn = document.getElementById('search-user-clear');
  
  if (query.length > 0) {
    clearBtn?.classList.remove('hidden');
  } else {
    clearBtn?.classList.add('hidden');
    window.renderSearchInitialState();
    return;
  }

  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    window.performUserSearch(query);
  }, 300);
};

window.performUserSearch = async function(query) {
  const resultsContainer = document.getElementById('search-user-results');
  if (!resultsContainer) return;

  resultsContainer.innerHTML = `
    <div class="space-y-1">
      ${[1, 2, 3].map(() => `
        <div class="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-800/30 rounded-xl animate-pulse">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            <div class="space-y-1">
              <div class="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div class="w-14 h-2 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          </div>
          <div class="w-14 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        </div>
      `).join('')}
    </div>
  `;

  const currentUserStr = localStorage.getItem('itera_user');
  let currentUserId = '';
  if (currentUserStr) {
    try {
      currentUserId = JSON.parse(currentUserStr).id || '';
    } catch (e) {}
  }

  try {
    const url = `http://localhost:8000/api/usuarios/buscar?query=${encodeURIComponent(query)}&current_user_id=${currentUserId}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Error al buscar usuarios');
    const users = await resp.json();
    
    window.renderSearchResults(users, currentUserId);
  } catch (err) {
    console.error('Error searching users:', err);
    resultsContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center py-6 text-center text-rose-500">
        <span class="material-symbols-outlined text-2xl mb-1">error</span>
        <p class="text-[11px] font-semibold">Error al buscar</p>
      </div>
    `;
  }
};

window.renderSearchResults = function(users, currentUserId) {
  const resultsContainer = document.getElementById('search-user-results');
  if (!resultsContainer) return;

  if (users.length === 0) {
    resultsContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center py-6 text-center text-slate-400 dark:text-slate-500">
        <span class="material-symbols-outlined text-3xl mb-1.5 opacity-60">sentiment_dissatisfied</span>
        <p class="text-[11px] font-medium">Sin resultados</p>
      </div>
    `;
    return;
  }

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  resultsContainer.innerHTML = users.map(user => {
    const isMe = user.id === currentUserId;
    const avatar = user.foto_perfil || user.fotoPerfil || defaultAvatar;
    
    let followBtnHtml = '';
    if (!isMe) {
      if (user.siguiendo) {
        followBtnHtml = `
          <button 
            onclick="window.toggleFollowFromSearch('${user.id}', this)"
            class="px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-lg transition-all active:scale-95 duration-100 flex items-center gap-0.5 border border-slate-200/60 dark:border-slate-700/50"
          >
            <span class="material-symbols-outlined text-xs text-emerald-500">done</span>
            Siguiendo
          </button>
        `;
      } else {
        followBtnHtml = `
          <button 
            onclick="window.toggleFollowFromSearch('${user.id}', this)"
            class="px-3 py-1 text-[10px] font-bold text-white bg-primary hover:bg-primary-container rounded-lg shadow-sm transition-all active:scale-95 duration-100 flex items-center gap-0.5"
          >
            <span class="material-symbols-outlined text-xs">add</span>
            Seguir
          </button>
        `;
      }
    } else {
      followBtnHtml = `
        <span class="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md">
          Tú
        </span>
      `;
    }

    const followersCount = user.seguidores_count !== undefined ? user.seguidores_count : (user.seguidoresCount || 0);

    return `
      <div class="flex items-center justify-between p-2.5 bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900/80 border border-slate-100/50 dark:border-slate-800/50 rounded-xl transition-all group">
        <div class="flex items-center gap-2 min-w-0">
          <a href="../profile/index.html?id=${user.id}" class="w-8 h-8 rounded-full overflow-hidden border border-white dark:border-slate-800 shadow-sm shrink-0 cursor-pointer block hover:scale-105 transition-transform" onclick="window.closeSearchUserModal()">
            <img class="w-full h-full object-cover" src="${avatar}" alt="${user.nombre}">
          </a>
          <div class="min-w-0">
            <a href="../profile/index.html?id=${user.id}" class="font-bold text-slate-800 dark:text-white text-[11px] hover:text-primary dark:hover:text-primary transition-colors truncate block leading-tight" onclick="window.closeSearchUserModal()">
              ${user.nombre} ${user.apellido}
            </a>
            <span class="font-medium text-primary text-[10px] truncate block">@${user.username || 'usuario'}</span>
          </div>
        </div>
        <div class="shrink-0 ml-1.5">
          ${followBtnHtml}
        </div>
      </div>
    `;
  }).join('');
};

window.toggleFollowFromSearch = async function(seguidoId, btn) {
  const currentUserStr = localStorage.getItem('itera_user');
  if (!currentUserStr) {
    alert("Inicia sesión para poder seguir usuarios");
    return;
  }
  let currentUserId = '';
  try {
    currentUserId = JSON.parse(currentUserStr).id || '';
  } catch (e) {}

  if (!currentUserId) return;

  btn.disabled = true;
  btn.classList.add('opacity-70', 'scale-95');

  try {
    const url = `http://localhost:8000/api/usuarios/${seguidoId}/seguir?current_user_id=${currentUserId}`;
    const resp = await fetch(url, { method: 'POST' });
    if (!resp.ok) throw new Error('Error toggling follow');
    const data = await resp.json();
    
    const isFollowing = data.siguiendo;
    const followersCount = data.seguidores_count;

    const countEl = document.getElementById(`search-follower-count-${seguidoId}`);
    if (countEl) countEl.textContent = followersCount;

    if (isFollowing) {
      btn.outerHTML = `
        <button 
          onclick="window.toggleFollowFromSearch('${seguidoId}', this)"
          class="px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-lg transition-all active:scale-95 duration-100 flex items-center gap-0.5 border border-slate-200/60 dark:border-slate-700/50"
        >
          <span class="material-symbols-outlined text-xs text-emerald-500">done</span>
          Siguiendo
        </button>
      `;
    } else {
      btn.outerHTML = `
        <button 
          onclick="window.toggleFollowFromSearch('${seguidoId}', this)"
          class="px-3 py-1 text-[10px] font-bold text-white bg-primary hover:bg-primary-container rounded-lg shadow-sm transition-all active:scale-95 duration-100 flex items-center gap-0.5"
        >
          <span class="material-symbols-outlined text-xs">add</span>
          Seguir
        </button>
      `;
    }

    // Trigger update on profile page if visible
    if (window.isProfilePageActive && window.refreshProfileStats) {
      window.refreshProfileStats();
    }

  } catch (err) {
    console.error('Error toggling follow:', err);
    alert('No se pudo completar la acción. Intenta de nuevo.');
    btn.disabled = false;
    btn.classList.remove('opacity-70', 'scale-95');
  }
};

function initSearchFeatures() {
  injectSearchModal();
  injectSearchButtonIfMissing();
}

// Call injectNavbar & initSearchFeatures when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    injectNavbar();
    initSearchFeatures();
  });
} else {
  injectNavbar();
  initSearchFeatures();
}
