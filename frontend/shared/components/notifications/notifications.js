// ============================================================
// ITERA - Panel de Notificaciones
// Muestra las invitaciones a viajes pendientes
// ============================================================

(function () {
  'use strict';

  const API_BASE = 'http://localhost:8000';

  // ── Inyectar panel ──────────────────────────────────────────
  function injectNotificationsPanel() {
    if (document.getElementById('notifications-panel')) return;

    const html = `
      <!-- Notifications Panel Overlay -->
      <div id="notifications-overlay" class="hidden fixed inset-0 z-[190]" onclick="window.closeNotificationsModal()"></div>

      <!-- Notifications Panel -->
      <div id="notifications-panel"
           class="hidden fixed top-[72px] right-4 w-[340px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden z-[195] transform -translate-y-3 opacity-0 transition-all duration-200 origin-top-right flex-col"
           style="max-height: min(80vh, 540px);">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">notifications</span>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Notificaciones</h3>
            <span id="notif-count-badge" class="hidden px-2 py-0.5 text-[10px] font-bold bg-error text-white rounded-full"></span>
          </div>
          <button onclick="window.closeNotificationsModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <!-- Content -->
        <div id="notif-list" class="overflow-y-auto flex-1 p-2">
          <!-- Filled by JS -->
          <div class="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500 gap-2">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p class="text-xs font-medium">Cargando...</p>
          </div>
        </div>

      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
  }

  // ── Renderizar lista ────────────────────────────────────────
  function renderNotifications(invitaciones) {
    const list = document.getElementById('notif-list');
    const countBadge = document.getElementById('notif-count-badge');
    const headerBadge = document.getElementById('notif-badge');
    if (!list) return;

    if (!invitaciones || invitaciones.length === 0) {
      list.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500 gap-2">
          <span class="material-symbols-outlined text-4xl opacity-50">notifications_off</span>
          <p class="text-xs font-semibold">Sin notificaciones</p>
          <p class="text-[11px] text-center max-w-[200px]">Cuando te inviten a un viaje compartido aparecerá aquí.</p>
        </div>`;
      if (countBadge) { countBadge.textContent = ''; countBadge.classList.add('hidden'); }
      if (headerBadge) headerBadge.classList.add('hidden');
      return;
    }

    // Actualizar badge del header
    const count = invitaciones.length;
    if (countBadge) {
      countBadge.textContent = count;
      countBadge.classList.remove('hidden');
    }
    if (headerBadge) headerBadge.classList.remove('hidden');

    list.innerHTML = invitaciones.map(inv => {
      const tripName = inv.viaje_nombre || inv.viajeNombre || 'Viaje sin nombre';
      const creadorNombre = inv.creador_nombre || inv.creadorNombre || 'Un usuario';
      const creadorUsername = inv.creador_username || inv.creadorUsername || '';
      const viajeId = inv.viaje_id || inv.viajeId || '';
      const fotoViaje = inv.viaje_foto || inv.viajeFoto || '';

      const bgStyle = fotoViaje
        ? `background-image: url('${fotoViaje}'); background-size: cover; background-position: center;`
        : 'background: linear-gradient(135deg, #0058bf, #3b82f6);';

      return `
        <div class="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group mb-1">
          <!-- Trip thumbnail -->
          <div class="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center" style="${bgStyle}">
            ${!fotoViaje ? '<span class="material-symbols-outlined text-white text-2xl">flight</span>' : ''}
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-slate-800 dark:text-white leading-snug">
              Se te ha compartido un viaje
            </p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              <span class="font-bold text-primary">${creadorNombre}</span>
              ${creadorUsername ? `<span class="text-slate-400">@${creadorUsername}</span>` : ''}
              te invitó a <span class="font-semibold text-slate-700 dark:text-slate-300">${tripName}</span>
            </p>

            <!-- Action button -->
            <a href="../profile/index.html#invitaciones"
               onclick="window.closeNotificationsModal()"
               class="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-primary hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-all active:scale-95 shadow-sm shadow-blue-200 dark:shadow-none">
              <span class="material-symbols-outlined text-xs">open_in_new</span>
              Ver invitación
            </a>
          </div>
        </div>
        <div class="border-b border-slate-100 dark:border-slate-800 mx-2 last:hidden"></div>
      `;
    }).join('');
  }

  // ── Cargar invitaciones desde backend ───────────────────────
  async function fetchInvitaciones() {
    const userStr = localStorage.getItem('itera_user');
    if (!userStr) {
      renderNotifications([]);
      return;
    }
    let userId;
    try {
      userId = JSON.parse(userStr).id;
    } catch (e) {
      renderNotifications([]);
      return;
    }
    if (!userId) { renderNotifications([]); return; }

    try {
      const resp = await fetch(`${API_BASE}/api/viajes/invitaciones?usuario_id=${userId}`);
      if (!resp.ok) throw new Error('Error fetching invitaciones');
      const data = await resp.json();
      renderNotifications(data);
    } catch (err) {
      console.error('[Notifications] Error:', err);
      const list = document.getElementById('notif-list');
      if (list) {
        list.innerHTML = `
          <div class="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
            <span class="material-symbols-outlined text-3xl text-rose-400">error</span>
            <p class="text-xs font-semibold">No se pudieron cargar las notificaciones</p>
          </div>`;
      }
    }
  }

  // ── Badge inicial (carga silenciosa al arrancar) ─────────────
  async function checkNotifBadge() {
    const userStr = localStorage.getItem('itera_user');
    if (!userStr) return;
    let userId;
    try { userId = JSON.parse(userStr).id; } catch (e) { return; }
    if (!userId) return;

    try {
      const resp = await fetch(`${API_BASE}/api/viajes/invitaciones?usuario_id=${userId}`);
      if (!resp.ok) return;
      const data = await resp.json();
      if (data && data.length > 0) {
        // Mostrar punto rojo en el botón del header
        const badge = document.getElementById('notif-badge');
        if (badge) badge.classList.remove('hidden');
      }
    } catch (_) {}
  }

  // ── API pública ─────────────────────────────────────────────
  window.openNotificationsModal = function () {
    const panel = document.getElementById('notifications-panel');
    const overlay = document.getElementById('notifications-overlay');
    if (!panel || !overlay) return;

    overlay.classList.remove('hidden');
    panel.classList.remove('hidden');
    panel.classList.add('flex');

    // Animación de entrada
    requestAnimationFrame(() => {
      panel.classList.remove('-translate-y-3', 'opacity-0');
      panel.classList.add('translate-y-0', 'opacity-100');
    });

    // Resetear lista y cargar datos frescos
    const list = document.getElementById('notif-list');
    if (list) {
      list.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p class="text-xs font-medium">Cargando...</p>
        </div>`;
    }
    fetchInvitaciones();
  };

  window.closeNotificationsModal = function () {
    const panel = document.getElementById('notifications-panel');
    const overlay = document.getElementById('notifications-overlay');
    if (!panel || !overlay) return;

    panel.classList.remove('translate-y-0', 'opacity-100');
    panel.classList.add('-translate-y-3', 'opacity-0');

    setTimeout(() => {
      panel.classList.add('hidden');
      panel.classList.remove('flex');
      overlay.classList.add('hidden');
    }, 200);
  };

  // ── Init ────────────────────────────────────────────────────
  function init() {
    injectNotificationsPanel();
    // Verificar badge silenciosamente
    checkNotifBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
