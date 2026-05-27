/**
 * avatar-loader.js — Script compartido para cargar la foto de perfil del usuario.
 *
 * Flujo:
 * 1. Lee el usuario desde localStorage (itera_user).
 * 2. Si el usuario tiene foto_perfil guardada, intenta cargarla desde el servidor.
 * 3. Si falla o no tiene, usa el avatar almacenado en itera_avatar (base64 legacy).
 * 4. Si no hay ninguno, mantiene la imagen por defecto del HTML.
 * 5. Actualiza TODOS los elementos con el atributo [data-avatar] o class que coincida.
 *
 * Uso: incluir este script en cualquier página que tenga el header con el avatar.
 * El img del avatar en el header debe tener id="header-avatar" o data-avatar="true".
 */
(function () {
    const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

    /**
     * Aplica el src del avatar a todos los elementos con id="header-avatar" o data-avatar.
     */
    function applyAvatar(src) {
        const targets = document.querySelectorAll('#header-avatar, [data-avatar="header"]');
        targets.forEach(el => {
            el.src = src;
        });
    }

    /**
     * Carga el avatar con el siguiente orden de prioridad:
     * 1. foto_perfil del usuario en el servidor (URL /api/usuarios/{id}/avatar)
     * 2. Avatar en localStorage (itera_avatar) — legado base64
     * 3. Default
     */
    async function loadAvatar() {
        const userStr = localStorage.getItem('itera_user');
        if (!userStr) return; // No hay sesión, mantener default

        let user;
        try {
            user = JSON.parse(userStr);
        } catch (e) {
            return;
        }

        // 1. Intentar cargar desde el servidor si el usuario tiene foto_perfil
        if (user.foto_perfil && user.id) {
            const serverUrl = user.foto_perfil + '?t=' + Date.now(); // cache-busting
            try {
                // Verificar que la imagen realmente existe antes de asignarla
                const resp = await fetch(user.foto_perfil, { method: 'HEAD' });
                if (resp.ok) {
                    applyAvatar(user.foto_perfil + '?t=' + Date.now());
                    return;
                }
            } catch (e) {
                // El servidor no responde — caer al siguiente nivel
            }
        }

        // 2. Intentar recuperar foto_perfil actualizada del servidor
        if (user.id) {
            try {
                const resp = await fetch(`http://localhost:8000/api/usuarios/${user.id}`);
                if (resp.ok) {
                    const freshUser = await resp.json();
                    if (freshUser.foto_perfil) {
                        // Actualizar el usuario en localStorage con la foto fresca
                        user.foto_perfil = freshUser.foto_perfil;
                        localStorage.setItem('itera_user', JSON.stringify(user));
                        applyAvatar(freshUser.foto_perfil + '?t=' + Date.now());
                        return;
                    }
                }
            } catch (e) {
                // Backend no disponible
            }
        }

        // 3. Fallback a localStorage base64 (legado)
        const localAvatar = localStorage.getItem('itera_avatar');
        if (localAvatar) {
            applyAvatar(localAvatar);
            return;
        }

        // 4. Default (ya está en el HTML)
        applyAvatar(DEFAULT_AVATAR);
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAvatar);
    } else {
        loadAvatar();
    }

    // Exponer función global para que profile.js pueda refrescar el avatar inmediatamente
    window.refreshHeaderAvatar = loadAvatar;
})();
