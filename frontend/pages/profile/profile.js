document.addEventListener('DOMContentLoaded', () => {
    let currentUser = null;
    let defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    
    // Map variables for custom attraction creation
    let createAttrMap = null;
    let createAttrMarker = null;
    let selectedLat = null;
    let selectedLng = null;
    let selectedPlaceId = null;
    let selectedPhotos = [];
    let loadedAttractions = [];
    let editingAttractionId = null;
    
    // Default prefs
    let defaultPrefs = {
        estilo: ['Aventura', 'Naturaleza'],
        presupuesto: 'Moderado',
        dieta: 'Sin restricciones',
        alojamiento: ['Hoteles Boutique', 'Airbnb']
    };

    async function loadProfile() {
        const loggedInUserStr = localStorage.getItem('itera_user');
        let loggedInUser = null;
        if (loggedInUserStr) {
            try {
                loggedInUser = JSON.parse(loggedInUserStr);
            } catch(e) {}
        }

        const urlParams = new URLSearchParams(window.location.search);
        const targetUserId = urlParams.get('user_id') || urlParams.get('id');
        const isOwner = !targetUserId || (loggedInUser && loggedInUser.id === targetUserId);

        window.isProfileOwner = isOwner; // Guardar en la ventana

        if (isOwner) {
            // Modo Propietario: cargar del localStorage / inicializar
            if (loggedInUserStr) {
                try {
                    currentUser = JSON.parse(loggedInUserStr);
                    renderProfile();
                } catch (e) {
                    console.error('Error parsing user data:', e);
                    setDefaultUserData();
                }
            } else {
                setDefaultUserData();
            }
            await loadProfileAvatar();
            
            setTimeout(() => {
                const visitorActions = document.getElementById('visitor-actions');
                if (visitorActions) visitorActions.style.display = 'none';
            }, 500);
        } else {
            // Modo Visitante Público: cargar desde la API
            try {
                const resp = await fetch(`http://localhost:8000/api/usuarios/${targetUserId}`);
                if (resp.ok) {
                    currentUser = await resp.json();
                    renderProfile();
                    
                    // Si el perfil no es mío, ocultar opciones de edición / configuración de preferencias
                    setTimeout(() => {
                        const editBtns = document.querySelectorAll('#btn-edit-profile, .btn-edit-pref, #btn-open-create-attraction, #form-create-attraction, #btn-change-avatar');
                        editBtns.forEach(btn => btn.style.display = 'none');
                        
                        const visitorActions = document.getElementById('visitor-actions');
                        if (visitorActions) visitorActions.style.display = 'flex';
                    }, 500);
                } else {
                    setDefaultUserData();
                }
            } catch (err) {
                console.error('Error loading other user profile:', err);
                setDefaultUserData();
            }
        }

        loadPreferences();
        await loadConfirmedTrips();
        await loadFollowInfo();
        await loadFriends();
    }

    async function loadFollowInfo() {
        if (!currentUser?.id) return;
        
        const loggedInUserStr = localStorage.getItem('itera_user');
        let currentUserId = '';
        if (loggedInUserStr) {
            try {
                currentUserId = JSON.parse(loggedInUserStr).id || '';
            } catch(e) {}
        }
        
        try {
            const resp = await fetch(`http://localhost:8000/api/usuarios/${currentUser.id}/follow-info?current_user_id=${currentUserId}`);
            if (resp.ok) {
                const data = await resp.json();
                
                const followersCountEl = document.getElementById('profile-followers-count');
                const followingCountEl = document.getElementById('profile-following-count');
                const followersCountLargeEl = document.getElementById('profile-followers-count-large');
                const followingCountLargeEl = document.getElementById('profile-following-count-large');
                const btnFollow = document.getElementById('btn-follow');
                
                if (followersCountEl) followersCountEl.textContent = data.seguidores_count;
                if (followingCountEl) followingCountEl.textContent = data.seguidos_count;
                if (followersCountLargeEl) followersCountLargeEl.textContent = data.seguidores_count;
                if (followingCountLargeEl) followingCountLargeEl.textContent = data.seguidos_count;
                
                if (btnFollow) {
                    if (data.siguiendo) {
                        btnFollow.textContent = 'Dejar de seguir';
                        btnFollow.className = "flex-1 py-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-2xl font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all text-center cursor-pointer";
                    } else {
                        btnFollow.textContent = 'Seguir';
                        btnFollow.className = "flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all text-center cursor-pointer";
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching follow info:', err);
        }
    }

    async function loadFriends() {
        if (!currentUser?.id) return;
        const section = document.getElementById('friends-section');
        const container = document.getElementById('friends-container');
        if (!section || !container) return;

        try {
            const respSeguidores = await fetch(`http://localhost:8000/api/usuarios/${currentUser.id}/seguidores`);
            const respSeguidos = await fetch(`http://localhost:8000/api/usuarios/${currentUser.id}/seguidos`);
            
            if (respSeguidores.ok && respSeguidos.ok) {
                const seguidores = await respSeguidores.json();
                const seguidos = await respSeguidos.json();
                
                // intersect by id
                const seguidosIds = new Set(seguidos.map(u => u.id));
                const amigos = seguidores.filter(u => seguidosIds.has(u.id));
                
                // Get logged in user id
                let loggedInUserId = '';
                try {
                    const loggedInUserStr = localStorage.getItem('itera_user');
                    if (loggedInUserStr) {
                        loggedInUserId = JSON.parse(loggedInUserStr).id;
                    }
                } catch(e) {}
                
                if (amigos.length > 0) {
                    section.classList.remove('hidden');
                    container.innerHTML = amigos.map(amigo => {
                        const img = amigo.foto_perfil || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                        const nombreCompleto = `${amigo.nombre || 'Usuario'} ${amigo.apellido || ''}`.trim();
                        const edadTxt = amigo.edad ? `${amigo.edad} años` : 'Edad desconocida';
                        const username = amigo.username ? `@${amigo.username}` : '@usuario';
                        
                        let btnHtml = '';
                        
                        if (window.isProfileOwner) {
                            btnHtml = `
                            <button class="w-full py-2.5 rounded-xl font-bold transition-all text-sm bg-primary/10 text-primary cursor-default" disabled>
                                Amigos
                            </button>`;
                        } else if (amigo.id === loggedInUserId) {
                            btnHtml = `
                            <button class="w-full py-2.5 rounded-xl font-bold transition-all text-sm bg-primary/10 text-primary cursor-default" disabled>
                                Tú
                            </button>`;
                        } else {
                            // Determinar estado del botón de seguir (si el usuario actual lo está siguiendo)
                            const isFollowing = amigo.siguiendo;
                            const btnClass = isFollowing 
                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-300 dark:border-slate-700 hover:bg-slate-300' 
                                : 'bg-primary text-white shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-100';
                            const btnText = isFollowing ? 'Siguiendo' : 'Seguir';
                            
                            btnHtml = `
                            <button id="btn-follow-friend-${amigo.id}" class="w-full py-2.5 rounded-xl font-bold transition-all text-sm ${btnClass}" onclick="toggleFollowFriend('${amigo.id}', this, ${isFollowing})">
                                ${btnText}
                            </button>`;
                        }
                        
                        return `
                        <div class="glass-panel p-5 rounded-[24px] border border-white/50 flex flex-col items-center min-w-[220px] max-w-[220px] hover:bg-white/40 transition-all group relative">
                            <div class="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md mb-3 cursor-pointer z-10" onclick="window.location.href='../profile/index.html?id=${amigo.id}'">
                                <img src="${img}" alt="${nombreCompleto}" class="w-full h-full object-cover group-hover:scale-110 transition-transform">
                            </div>
                            <h4 class="font-bold text-on-surface text-center cursor-pointer hover:text-primary transition-colors w-full truncate" onclick="window.location.href='../profile/index.html?id=${amigo.id}'" title="${nombreCompleto}">${nombreCompleto}</h4>
                            <p class="text-primary font-bold text-[10px] tracking-widest uppercase mb-1 truncate w-full text-center" title="${username}">${username}</p>
                            <p class="text-[12px] text-on-surface-variant/70 mb-4 font-medium">${edadTxt}</p>
                            
                            <!-- Placeholder for shared trips -->
                            <div class="flex items-center justify-center gap-1.5 bg-primary/5 text-primary px-3 py-2 rounded-full mb-4 w-full" title="Han compartido un viaje entre los 2">
                                <span class="material-symbols-outlined text-[14px]">flight_takeoff</span>
                                <span class="text-[9px] font-bold uppercase tracking-wider leading-tight text-center">Viajes Compartidos<br><span class="opacity-70">(Próximamente)</span></span>
                            </div>
                            
                            ${btnHtml}
                        </div>
                        `;
                    }).join('');
                } else {
                    section.classList.add('hidden');
                }
            }
        } catch (err) {
            console.error('Error fetching friends:', err);
        }
    }

    // Función global para que funcione el onclick de las tarjetas
    window.toggleFollowFriend = async function(friendId, btnEl, initiallyFollowing) {
        const loggedInUserStr = localStorage.getItem('itera_user');
        if (!loggedInUserStr) {
            alert("Inicia sesión para poder seguir usuarios");
            return;
        }
        let currentUserId = '';
        try {
            currentUserId = JSON.parse(loggedInUserStr).id || '';
        } catch(e) {}
        
        if (!currentUserId) return;
        
        // Prevent clicking yourself
        if (currentUserId === friendId) {
            alert("No puedes seguirte a ti mismo");
            return;
        }
        
        btnEl.disabled = true;
        btnEl.classList.add('opacity-50');
        
        try {
            const url = `http://localhost:8000/api/usuarios/${friendId}/seguir?current_user_id=${currentUserId}`;
            const resp = await fetch(url, { method: 'POST' });
            if (resp.ok) {
                const data = await resp.json();
                const isNowFollowing = data.siguiendo;
                
                // Update button UI
                btnEl.onclick = function() { window.toggleFollowFriend(friendId, btnEl, isNowFollowing); };
                
                if (isNowFollowing) {
                    btnEl.textContent = 'Siguiendo';
                    btnEl.className = "w-full py-2.5 rounded-xl font-bold transition-all text-sm bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-300 dark:border-slate-700 hover:bg-slate-300";
                } else {
                    btnEl.textContent = 'Seguir';
                    btnEl.className = "w-full py-2.5 rounded-xl font-bold transition-all text-sm bg-primary text-white shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-100";
                }
            }
        } catch (err) {
            console.error('Error toggling friend follow:', err);
        } finally {
            btnEl.disabled = false;
            btnEl.classList.remove('opacity-50');
        }
    };

    // Setup follow button logic for visitor
    const btnFollow = document.getElementById('btn-follow');
    if (btnFollow) {
        btnFollow.addEventListener('click', async () => {
            const loggedInUserStr = localStorage.getItem('itera_user');
            if (!loggedInUserStr) {
                alert("Inicia sesión para poder seguir usuarios");
                return;
            }
            let currentUserId = '';
            try {
                currentUserId = JSON.parse(loggedInUserStr).id || '';
            } catch(e) {}
            
            if (!currentUserId || !currentUser?.id) return;
            
            btnFollow.disabled = true;
            btnFollow.classList.add('opacity-70', 'scale-95');
            
            try {
                const url = `http://localhost:8000/api/usuarios/${currentUser.id}/seguir?current_user_id=${currentUserId}`;
                const resp = await fetch(url, { method: 'POST' });
                if (resp.ok) {
                    await loadFollowInfo();
                }
            } catch (err) {
                console.error('Error toggling follow:', err);
            } finally {
                btnFollow.disabled = false;
                btnFollow.classList.remove('opacity-70', 'scale-95');
            }
        });
    }

    window.isProfilePageActive = true;
    window.refreshProfileStats = loadFollowInfo;

    async function loadConfirmedTrips() {
        const container = document.getElementById('viajes-list-container');
        if (!container || !currentUser?.id) return;

        try {
            const resp = await fetch(`http://localhost:8000/api/viajes?creador_id=${currentUser.id}`);
            if (!resp.ok) throw new Error('Error fetching trips');
            const trips = await resp.json();

            // Filtrar viajes confirmados
            let confirmedTrips = trips.filter(t => t.estado && t.estado.toLowerCase() === 'confirmado');

            // Si NO somos los dueños del perfil, ocultar viajes privados
            const isOwner = window.isProfileOwner !== false;
            if (!isOwner) {
                confirmedTrips = confirmedTrips.filter(t => t.es_privado !== true && t.esPrivado !== true);
            }

            // Calcular cantidad de destinos únicos de los viajes confirmados (incluyendo principal y sub-destinos)
            const destinosSet = new Set();
            const upcomingDestinosSet = new Set();
            const todayStr = new Date().toISOString().split('T')[0];

            confirmedTrips.forEach(trip => {
                const destRaw = trip.destino_principal || trip.destinoPrincipal;
                if (destRaw) {
                    destRaw.split(',').forEach(d => {
                        const trimmed = d.trim();
                        if (trimmed) {
                            destinosSet.add(trimmed.toLowerCase());
                            const startRaw = trip.fecha_inicio || trip.fechaInicio;
                            if (startRaw && startRaw >= todayStr) {
                                upcomingDestinosSet.add(trimmed.toLowerCase());
                            }
                        }
                    });
                }
            });

            // Fetch de los sub-destinos vinculados a cada viaje confirmado
            try {
                const fetchPromises = confirmedTrips.map(async (trip) => {
                    try {
                        const dResp = await fetch(`http://localhost:8000/api/viajes/${trip.id}/destinos`);
                        if (dResp.ok) {
                            const dests = await dResp.json();
                            const startRaw = trip.fecha_inicio || trip.fechaInicio;
                            const isUpcoming = startRaw && startRaw >= todayStr;

                            dests.forEach(d => {
                                const city = (d.city || '').trim();
                                if (city) {
                                    destinosSet.add(city.toLowerCase());
                                    if (isUpcoming) {
                                        upcomingDestinosSet.add(city.toLowerCase());
                                    }
                                }
                            });
                        }
                    } catch (err) {
                        console.error('Error fetching sub-destinations for trip:', trip.id, err);
                    }
                });
                await Promise.all(fetchPromises);
            } catch (err) {
                console.error('Error fetching sub-destinations:', err);
            }

            const statsCountriesEl = document.getElementById('stats-countries');
            if (statsCountriesEl) {
                statsCountriesEl.textContent = destinosSet.size;
            }

            const statsBadgeEl = document.getElementById('stats-destinations-badge');
            if (statsBadgeEl) {
                statsBadgeEl.textContent = `+${upcomingDestinosSet.size} Nuevos`;
            }

            if (confirmedTrips.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-10">
                        <span class="material-symbols-outlined text-[48px] text-primary/30 mb-4">flight_takeoff</span>
                        <p class="text-on-surface-variant font-medium">Aún no tienes itinerarios confirmados.</p>
                    </div>
                `;
                return;
            }

            // Reducir el espaciado vertical del contenedor para el diseño compacto
            container.classList.remove('space-y-12');
            container.classList.add('space-y-6');

            container.innerHTML = confirmedTrips.map(trip => {
                const img = (trip.foto_url || trip.fotoUrl) || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80';
                const dateOpts = {month:'short', day:'numeric', year:'numeric'};
                const startRaw = trip.fecha_inicio || trip.fechaInicio;
                const endRaw = trip.fecha_fin || trip.fechaFin;
                const destRaw = trip.destino_principal || trip.destinoPrincipal || 'Destino no especificado';
                
                const fechaFormat = startRaw ? new Date(startRaw + 'T00:00:00').toLocaleDateString('es-ES', dateOpts) : '-';
                const dateRangeFormat = (startRaw && endRaw) 
                    ? `${new Date(startRaw + 'T00:00:00').toLocaleDateString('es-ES')} - ${new Date(endRaw + 'T00:00:00').toLocaleDateString('es-ES')}`
                    : 'Fechas no especificadas';

                const isPriv = trip.es_privado === true || trip.esPrivado === true;
                const privacyBadge = isPriv 
                    ? `<span class="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">lock</span> Privado</span>` 
                    : `<span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">public</span> Público</span>`;
                
                return `
                    <div class="relative pl-8">
                        <div class="absolute left-0 top-3 w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10"></div>
                        <div class="absolute left-[3.5px] top-6 bottom-[-24px] w-px bg-gradient-to-b from-primary/30 to-transparent"></div>
                        <div class="glass-panel rounded-2xl p-4 bg-white/40 hover:bg-white/60 transition-all border-white/40 cursor-pointer flex items-center gap-4 shadow-sm hover:shadow-md" onclick="window.location.href='../trip-detail/index.html?id=${trip.id}'">
                            <div class="w-20 h-20 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                <img class="w-full h-full object-cover hover:scale-110 transition-transform duration-500" src="${img}" alt="${trip.nombre}">
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between mb-1 gap-2">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <h4 class="font-headline-sm text-base text-on-surface tracking-tight truncate">${trip.nombre}</h4>
                                        ${privacyBadge}
                                    </div>
                                    <span class="text-[10px] text-primary font-bold uppercase tracking-widest whitespace-nowrap">${fechaFormat}</span>
                                </div>
                                <p class="text-[12px] text-primary font-bold mb-1 uppercase tracking-wider truncate">${destRaw}</p>
                                <p class="text-[13px] text-on-surface-variant/80 truncate">
                                    ${dateRangeFormat}
                                </p>
                            </div>
                            <span class="material-symbols-outlined text-on-surface-variant/30 hidden sm:block text-sm">arrow_forward_ios</span>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (e) {
            console.error('Error fetching confirmed trips:', e);
            container.innerHTML = `
                <div class="text-center py-10">
                    <span class="material-symbols-outlined text-[40px] text-error mb-4">error</span>
                    <p class="text-error font-medium">Error al cargar los itinerarios.</p>
                </div>
            `;
        }
    }

    async function loadProfileAvatar() {
        const avatarEl = document.getElementById('profile-avatar');
        if (!avatarEl) return;

        // 1. Si el usuario tiene foto_perfil en el servidor
        if (currentUser?.foto_perfil) {
            try {
                const resp = await fetch(currentUser.foto_perfil, { method: 'HEAD' });
                if (resp.ok) {
                    avatarEl.src = currentUser.foto_perfil + '?t=' + Date.now();
                    return;
                }
            } catch (e) { /* servidor no disponible */ }
        }

        // 2. Intentar obtener foto actualizada del servidor
        if (currentUser?.id) {
            try {
                const resp = await fetch(`http://localhost:8000/api/usuarios/${currentUser.id}`);
                if (resp.ok) {
                    const freshUser = await resp.json();
                    if (freshUser.foto_perfil) {
                        currentUser.foto_perfil = freshUser.foto_perfil;
                        localStorage.setItem('itera_user', JSON.stringify(currentUser));
                        avatarEl.src = freshUser.foto_perfil + '?t=' + Date.now();
                        return;
                    }
                }
            } catch (e) { /* backend no disponible */ }
        }

        // 3. Fallback a base64 en localStorage
        const avatarStr = localStorage.getItem('itera_avatar');
        if (avatarStr) {
            avatarEl.src = avatarStr;
        }
    }

    function renderProfile() {
        if (!currentUser) return;
        document.getElementById('profile-fullname').textContent = `${currentUser.nombre || ''} ${currentUser.apellido || ''}`.trim() || 'Usuario Itera';
        document.getElementById('profile-username').textContent = currentUser.username ? `@${currentUser.username}` : '@usuario';
        document.getElementById('profile-email').textContent = currentUser.email || 'No especificado';
        document.getElementById('profile-nationality').textContent = currentUser.nacionalidad || 'No especificada';
        document.getElementById('profile-age').textContent = currentUser.edad ? `${currentUser.edad} años` : 'No especificada';
        const bioEl = document.getElementById('profile-bio');
        if (bioEl) {
            bioEl.textContent = currentUser.descripcion || 'Agrega una descripción a tu perfil...';
        }
    }

    function setDefaultUserData() {
        document.getElementById('profile-fullname').textContent = 'Usuario Invitado';
        document.getElementById('profile-username').textContent = '@invitado';
        document.getElementById('profile-email').textContent = 'Inicia sesión para ver tu correo';
        document.getElementById('profile-nationality').textContent = 'No especificada';
        document.getElementById('profile-age').textContent = '-';
        currentUser = { nombre: '', apellido: '', username: '', email: '', nacionalidad: '', edad: '', descripcion: '' };
        const bioEl = document.getElementById('profile-bio');
        if (bioEl) {
            bioEl.textContent = 'Agrega una descripción a tu perfil...';
        }
    }

    // Modal Profile Elements
    const modalProfile = document.getElementById('modal-edit-profile');
    const btnEditProfile = document.getElementById('btn-edit-profile');
    const btnCloseProfile = document.getElementById('btn-close-profile');
    const formEditProfile = document.getElementById('form-edit-profile');

    if (btnEditProfile) {
        btnEditProfile.addEventListener('click', () => {
            if (!currentUser) return;
            document.getElementById('edit-nombre').value = currentUser.nombre || '';
            document.getElementById('edit-apellido').value = currentUser.apellido || '';
            document.getElementById('edit-username').value = currentUser.username || '';
            document.getElementById('edit-email').value = currentUser.email || '';
            document.getElementById('edit-nacionalidad').value = currentUser.nacionalidad || '';
            document.getElementById('edit-edad').value = currentUser.edad || '';
            const descInput = document.getElementById('edit-descripcion');
            if (descInput) descInput.value = currentUser.descripcion || '';
            modalProfile.classList.remove('hidden');
        });
    }

    if (btnCloseProfile) {
        btnCloseProfile.addEventListener('click', () => {
            modalProfile.classList.add('hidden');
        });
    }

    if (formEditProfile) {
        formEditProfile.addEventListener('submit', (e) => {
            e.preventDefault();
            currentUser.nombre = document.getElementById('edit-nombre').value;
            currentUser.apellido = document.getElementById('edit-apellido').value;
            currentUser.username = document.getElementById('edit-username').value;
            currentUser.email = document.getElementById('edit-email').value;
            currentUser.nacionalidad = document.getElementById('edit-nacionalidad').value;
            currentUser.edad = parseInt(document.getElementById('edit-edad').value) || null;
            const descInput = document.getElementById('edit-descripcion');
            if (descInput) currentUser.descripcion = descInput.value;
            
            localStorage.setItem('itera_user', JSON.stringify(currentUser));
            renderProfile();
            modalProfile.classList.add('hidden');
        });
    }

    // Avatar
    const btnChangeAvatar = document.getElementById('btn-change-avatar');
    const avatarInput = document.getElementById('avatar-input');
    
    if (btnChangeAvatar && avatarInput) {
        btnChangeAvatar.addEventListener('click', () => {
            avatarInput.click();
        });

        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validación local del tipo
            if (!file.type.startsWith('image/')) {
                alert('Por favor seleccioná un archivo de imagen.');
                return;
            }

            // Mostrar preview inmediato (UX)
            const reader = new FileReader();
            reader.onload = (ev) => {
                const avatarEl = document.getElementById('profile-avatar');
                if (avatarEl) avatarEl.src = ev.target.result;
            };
            reader.readAsDataURL(file);

            // Deshabilitar botón mientras sube
            btnChangeAvatar.disabled = true;
            btnChangeAvatar.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">refresh</span>';

            try {
                const userId = currentUser?.id;
                if (!userId) throw new Error('No hay usuario en sesión.');

                const formData = new FormData();
                formData.append('file', file);

                const resp = await fetch(`http://localhost:8000/api/usuarios/${userId}/avatar`, {
                    method: 'POST',
                    body: formData
                });

                if (!resp.ok) {
                    const err = await resp.json().catch(() => ({}));
                    throw new Error(err.message || 'Error al subir la foto.');
                }

                const data = await resp.json();

                // Actualizar usuario en localStorage con la URL del servidor
                currentUser.foto_perfil = data.foto_perfil;
                localStorage.setItem('itera_user', JSON.stringify(currentUser));

                // Refrescar el avatar del header
                if (window.refreshHeaderAvatar) window.refreshHeaderAvatar();

                console.log('[AVATAR] Foto de perfil actualizada en el servidor:', data.foto_perfil);

            } catch (err) {
                console.error('[AVATAR] Error al subir foto:', err);
                // Fallback: guardar en localStorage como base64
                const reader2 = new FileReader();
                reader2.onload = (ev) => {
                    localStorage.setItem('itera_avatar', ev.target.result);
                    if (window.refreshHeaderAvatar) window.refreshHeaderAvatar();
                };
                reader2.readAsDataURL(file);
                alert('No se pudo conectar al servidor. La foto se guardó temporalmente en el navegador.');
            } finally {
                btnChangeAvatar.disabled = false;
                btnChangeAvatar.innerHTML = '<span class="material-symbols-outlined text-sm">edit</span>';
            }
        });
    }

    // Preferences
    let currentPrefs = null;

    function loadPreferences() {
        const prefsStr = localStorage.getItem('itera_prefs');
        if (prefsStr) {
            try {
                currentPrefs = JSON.parse(prefsStr);
            } catch(e) {
                currentPrefs = {...defaultPrefs};
            }
        } else {
            currentPrefs = {...defaultPrefs};
        }
        renderPreferences();
    }

    function renderPreferences() {
        // Estilo
        const estiloCont = document.getElementById('pref-estilo-container');
        if (estiloCont) {
            estiloCont.innerHTML = '';
            currentPrefs.estilo.forEach(est => {
                const span = document.createElement('span');
                span.className = "px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full";
                span.textContent = est;
                estiloCont.appendChild(span);
            });
        }

        // Presupuesto
        const prefPresupuestoText = document.getElementById('pref-presupuesto-text');
        if (prefPresupuestoText) prefPresupuestoText.textContent = currentPrefs.presupuesto;
        const bar = document.getElementById('pref-presupuesto-bar');
        if (bar) {
            if (currentPrefs.presupuesto === 'Económico') bar.className = "bg-emerald-500 w-1/3 h-full rounded-full";
            else if (currentPrefs.presupuesto === 'Moderado') bar.className = "bg-emerald-500 w-2/3 h-full rounded-full";
            else bar.className = "bg-emerald-500 w-full h-full rounded-full";
        }

        // Dieta
        const prefDietaText = document.getElementById('pref-dieta-text');
        if (prefDietaText) prefDietaText.textContent = currentPrefs.dieta;

        // Alojamiento
        const alojCont = document.getElementById('pref-alojamiento-container');
        if (alojCont) {
            alojCont.innerHTML = '';
            currentPrefs.alojamiento.forEach(al => {
                const span = document.createElement('span');
                span.className = "px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full";
                span.textContent = al;
                alojCont.appendChild(span);
            });
        }
    }

    // Modal Prefs
    const modalPref = document.getElementById('modal-edit-pref');
    const btnClosePref = document.getElementById('btn-close-pref');
    const formEditPref = document.getElementById('form-edit-pref');
    const inputContainer = document.getElementById('pref-input-container');
    const prefModalTitle = document.getElementById('pref-modal-title');
    const editPrefType = document.getElementById('edit-pref-type');

    document.querySelectorAll('.btn-edit-pref').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const prefType = e.currentTarget.dataset.pref;
            if (editPrefType) editPrefType.value = prefType;
            
            if (prefType === 'estilo') {
                if (prefModalTitle) prefModalTitle.textContent = 'Editar Estilo de Viaje';
                if (inputContainer) inputContainer.innerHTML = `
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Estilos (separados por coma)</label>
                    <input type="text" id="input-pref-estilo" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm" value="${currentPrefs.estilo.join(', ')}">
                `;
            } else if (prefType === 'presupuesto') {
                if (prefModalTitle) prefModalTitle.textContent = 'Editar Presupuesto';
                if (inputContainer) inputContainer.innerHTML = `
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Nivel de presupuesto</label>
                    <select id="input-pref-presupuesto" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm">
                        <option value="Económico" ${currentPrefs.presupuesto === 'Económico' ? 'selected' : ''}>Económico</option>
                        <option value="Moderado" ${currentPrefs.presupuesto === 'Moderado' ? 'selected' : ''}>Moderado</option>
                        <option value="Lujo" ${currentPrefs.presupuesto === 'Lujo' ? 'selected' : ''}>Lujo</option>
                    </select>
                `;
            } else if (prefType === 'dieta') {
                if (prefModalTitle) prefModalTitle.textContent = 'Editar Dieta';
                if (inputContainer) inputContainer.innerHTML = `
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Requisitos dietéticos</label>
                    <select id="input-pref-dieta" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm">
                        <option value="Sin restricciones" ${currentPrefs.dieta === 'Sin restricciones' ? 'selected' : ''}>Sin restricciones</option>
                        <option value="Vegetariano" ${currentPrefs.dieta === 'Vegetariano' ? 'selected' : ''}>Vegetariano</option>
                        <option value="Vegano" ${currentPrefs.dieta === 'Vegano' ? 'selected' : ''}>Vegano</option>
                        <option value="Celíaco (Sin TACC)" ${currentPrefs.dieta === 'Celíaco (Sin TACC)' ? 'selected' : ''}>Celíaco (Sin TACC)</option>
                    </select>
                `;
            } else if (prefType === 'alojamiento') {
                if (prefModalTitle) prefModalTitle.textContent = 'Editar Alojamiento';
                if (inputContainer) inputContainer.innerHTML = `
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Tipos de alojamiento (separados por coma)</label>
                    <input type="text" id="input-pref-alojamiento" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm" value="${currentPrefs.alojamiento.join(', ')}">
                `;
            }

            if (modalPref) modalPref.classList.remove('hidden');
        });
    });

    if (btnClosePref) {
        btnClosePref.addEventListener('click', () => {
            modalPref.classList.add('hidden');
        });
    }

    if (formEditPref) {
        formEditPref.addEventListener('submit', (e) => {
            e.preventDefault();
            const type = editPrefType.value;
            
            if (type === 'estilo') {
                const input = document.getElementById('input-pref-estilo');
                if (input) currentPrefs.estilo = input.value.split(',').map(s => s.trim()).filter(Boolean);
            } else if (type === 'presupuesto') {
                const input = document.getElementById('input-pref-presupuesto');
                if (input) currentPrefs.presupuesto = input.value;
            } else if (type === 'dieta') {
                const input = document.getElementById('input-pref-dieta');
                if (input) currentPrefs.dieta = input.value;
            } else if (type === 'alojamiento') {
                const input = document.getElementById('input-pref-alojamiento');
                if (input) currentPrefs.alojamiento = input.value.split(',').map(s => s.trim()).filter(Boolean);
            }

            localStorage.setItem('itera_prefs', JSON.stringify(currentPrefs));
            renderPreferences();
            modalPref.classList.add('hidden');
        });
    }

    // ── Reseñas Tab Logic ──
    const tabResenasBtn = document.getElementById('tab-btn-resenas');
    if (tabResenasBtn) {
        tabResenasBtn.addEventListener('click', () => {
            loadResenas();
        });
    }

    async function loadResenas() {
        const container = document.getElementById('tab-content-resenas');
        if (!container) return;

        if (!currentUser || !currentUser.id) {
            setTimeout(loadResenas, 100);
            return;
        }

        container.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-headline-md text-xl font-bold text-on-surface">Reseñas de la Comunidad</h3>
            </div>
            <div class="text-center py-10">
                <span class="material-symbols-outlined text-[40px] text-primary mb-4 animate-spin">refresh</span>
                <p class="text-on-surface-variant font-medium">Cargando reseñas...</p>
            </div>
        `;

        try {
            const resp = await fetch(`http://localhost:8000/api/resenas/usuario/${currentUser.id}`);
            if (!resp.ok) throw new Error('Error loading reviews');
            const reviews = await resp.json();

            if (reviews.length === 0) {
                container.innerHTML = `
                    <div class="flex flex-col items-center justify-center py-12 text-center">
                        <div class="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <span class="material-symbols-outlined text-[48px]">star_border</span>
                        </div>
                        <h4 class="font-headline-md text-headline-md mb-2">No hay reseñas aún</h4>
                        <p class="text-on-surface-variant/70 max-w-md mx-auto mb-8 font-body-lg">Parece que aún no has dejado ninguna reseña. ¡Comparte tus experiencias con la comunidad!</p>
                    </div>
                `;
                return;
            }

            const listHtml = reviews.map(r => {
                const starsHtml = Array(5).fill('').map((_, i) => `<span class="material-symbols-outlined text-[14px] ${i < r.rating ? 'text-amber-500' : 'text-outline-variant/30'}" style="font-variation-settings:'FILL' ${i < r.rating ? '1' : '0'};">star</span>`).join('');
                return `
                    <div class="glass-panel rounded-2xl p-6 hover:shadow-md transition-all border border-white/40 bg-white/40 flex flex-col mb-4">
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">attractions</span>
                                <div>
                                    <h4 class="font-bold text-sm text-on-surface">Atracción compartida</h4>
                                    <div class="flex items-center mt-0.5">${starsHtml}</div>
                                </div>
                            </div>
                            <span class="text-xs text-on-surface-variant/60 font-medium">${new Date(r.fecha).toLocaleDateString()}</span>
                        </div>
                        <p class="text-sm text-on-surface-variant mt-2 leading-relaxed bg-white/50 p-4 rounded-xl shadow-inner italic">"${r.comentario || 'Sin comentario'}"</p>
                    </div>
                `;
            }).join('');

            container.innerHTML = `
                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-headline-md text-xl font-bold text-on-surface">Reseñas de la Comunidad</h3>
                </div>
                <div class="space-y-4">
                    ${listHtml}
                </div>
            `;
        } catch (e) {
            container.innerHTML = `
                <div class="text-center py-10">
                    <span class="material-symbols-outlined text-[40px] text-error mb-4">error</span>
                    <p class="text-error font-medium">Error al cargar las reseñas.</p>
                </div>
            `;
        }
    }

    // ── Atracciones Tab & Form Logic ──
    const tabAtraccionesBtn = document.getElementById('tab-btn-atracciones');
    if (tabAtraccionesBtn) {
        tabAtraccionesBtn.addEventListener('click', () => {
            loadAtracciones();
        });
    }

    async function loadAtracciones() {
        const container = document.getElementById('tab-content-atracciones');
        if (!container) return;

        if (!currentUser || !currentUser.id) {
            setTimeout(loadAtracciones, 100);
            return;
        }

        const isOwner = window.isProfileOwner !== false;
        const btnHtml = isOwner ? `
            <button onclick="window.openCreateAttractionModal()" class="px-5 py-3 bg-primary text-white rounded-2xl font-bold shadow-md hover:scale-[1.02] active:scale-100 transition-all flex items-center gap-2 text-xs">
                <span class="material-symbols-outlined text-sm">add</span> Crear Atracción
            </button>
        ` : '';

        // Render skeleton state
        container.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-headline-md text-xl font-bold text-on-surface">Atracciones creadas</h3>
                ${btnHtml}
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="animate-pulse bg-white/40 rounded-3xl p-6 border border-white/50 h-44"></div>
                <div class="animate-pulse bg-white/40 rounded-3xl p-6 border border-white/50 h-44"></div>
            </div>
        `;

        try {
            const resp = await fetch(`http://localhost:8000/api/atracciones/search?creador_id=${currentUser.id}`);
            if (!resp.ok) throw new Error('Error loading attractions');
            let attractions = await resp.json();

            // Filtrar estrictamente en el frontend para asegurar que solo se muestren las creadas por este usuario
            attractions = attractions.filter(attr => attr.creador_id === currentUser.id);
            loadedAttractions = attractions;

            if (attractions.length === 0) {
                renderEmptyAtracciones(container);
                return;
            }

            const catImgs = {
                naturaleza: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80',
                cultura: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=600&q=80',
                aventura: 'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?auto=format&fit=crop&w=600&q=80',
                gastronomia: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
                entretenimiento: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'
            };

            const catIcons = {
                naturaleza: 'forest',
                cultura: 'museum',
                aventura: 'explore',
                gastronomia: 'restaurant',
                entretenimiento: 'theater_comedy'
            };

            const gridHtml = attractions.map(attr => {
                const categories = (attr.categoria || 'atraccion')
                    .split(',')
                    .map(c => c.trim().toLowerCase())
                    .filter(Boolean);

                const firstCat = categories[0] || 'atraccion';
                
                // Parse first image route from comma-separated string
                let firstPhoto = '';
                const photos = (attr.foto_url || attr.fotoUrl || '')
                    .split(',')
                    .map(p => p.trim())
                    .filter(Boolean);
                if (photos.length > 0) {
                    firstPhoto = photos[0];
                    if (!firstPhoto.startsWith('http')) {
                        if (firstPhoto.startsWith('/')) {
                            firstPhoto = 'http://localhost:8000' + firstPhoto;
                        } else {
                            firstPhoto = 'http://localhost:8000/' + firstPhoto;
                        }
                    }
                }
                const coverImg = firstPhoto || catImgs[firstCat] || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80';
                const hasRating = attr.rating !== null && attr.rating !== undefined && attr.rating > 0;

                const catPills = categories.map(cat => {
                    const icon = catIcons[cat] || 'place';
                    const nameMap = {
                        naturaleza: 'Naturaleza',
                        cultura: 'Cultura e Historia',
                        aventura: 'Aventura',
                        gastronomia: 'Gastronomía',
                        entretenimiento: 'Entretenimiento'
                    };
                    const label = nameMap[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
                    return `
                        <span class="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-primary/5">
                            <span class="material-symbols-outlined text-[12px]">${icon}</span>
                            ${label}
                        </span>
                    `;
                }).join('');

                // Parse and build accessibility pills
                const accOptions = (attr.accesibilidad || '')
                    .split(',')
                    .map(a => a.trim())
                    .filter(Boolean);

                const accIcons = {
                    todo_publico: 'groups',
                    silla_ruedas: 'accessible',
                    cochecitos: 'child_friendly',
                    personas_mayores: 'elderly'
                };

                const accLabels = {
                    todo_publico: 'Todo público',
                    silla_ruedas: 'Silla de ruedas',
                    cochecitos: 'Apto cochecitos',
                    personas_mayores: 'Personas mayores'
                };

                const accPills = accOptions.map(acc => {
                    const icon = accIcons[acc] || 'info';
                    const label = accLabels[acc] || acc;
                    return `
                        <span class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-305 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border border-slate-200/10 shadow-sm">
                            <span class="material-symbols-outlined text-[12px]">${icon}</span>
                            ${label}
                        </span>
                    `;
                }).join('');

                return `
                    <div class="glass-panel rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group border-white/40 bg-white/30 hover:bg-white/50">
                        <div class="h-44 w-full overflow-hidden relative">
                            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${coverImg}" alt="${attr.nombre}" onerror="this.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80'">
                            <div class="absolute top-4 left-4">
                                <span class="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm">
                                    Creada por usuario
                                </span>
                            </div>
                            ${hasRating ? `
                            <div class="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md">
                                <span class="material-symbols-outlined text-[13px] text-amber-400" style="font-variation-settings: 'FILL' 1">star</span>
                                ${attr.rating.toFixed(1)}
                            </div>
                            ` : ''}
                        </div>
                        <div class="p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <div class="flex flex-wrap gap-1.5 mb-3">
                                    ${catPills}
                                    ${accPills}
                                </div>
                                <h4 class="font-headline-sm text-lg text-on-surface group-hover:text-primary transition-colors line-clamp-1">${attr.nombre}</h4>
                                <p class="text-xs text-on-surface-variant/70 mb-3 truncate">${attr.direccion || 'Ubicación no especificada'}</p>
                                <p class="text-[13px] text-on-surface-variant/80 line-clamp-2 mb-4 leading-relaxed">${attr.descripcion || 'Sin descripción disponible.'}</p>
                            </div>
                            <div class="pt-4 border-t border-white/40 flex justify-between items-center mt-auto">
                                <span class="text-[11px] font-semibold text-on-surface-variant/60">
                                    Costo: ${(() => {
                                        const costLabels = {
                                            '0.0': 'Gratis', '1.0': 'Costo bajo', '2.0': 'Costo moderado', '3.0': 'Costo alto',
                                            '0': 'Gratis', '1': 'Costo bajo', '2': 'Costo moderado', '3': 'Costo alto'
                                        };
                                        const cStr = (attr.costo !== undefined && attr.costo !== null) ? attr.costo.toString() : '';
                                        return costLabels[cStr] || (attr.costo && attr.costo > 0 ? `$${attr.costo}` : 'Gratis');
                                    })()}
                                </span>
                                <div class="flex items-center gap-2">
                                    ${isOwner ? `
                                    <button onclick="window.openEditAttractionModal('${attr.id}')" class="text-slate-600 dark:text-slate-350 hover:text-primary transition-all text-xs font-bold flex items-center gap-1">
                                        <span class="material-symbols-outlined text-sm">edit</span> Editar
                                    </button>
                                    <span class="text-slate-300 dark:text-slate-600">|</span>
                                    ` : ''}
                                    <button onclick="window.location.href='../trip-detail/index.html?id=all'" class="text-primary hover:underline text-xs font-bold flex items-center gap-1">
                                        Explorar <span class="material-symbols-outlined text-sm">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML = `
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="font-headline-md text-xl font-bold text-on-surface">Atracciones creadas</h3>
                        <p class="text-xs text-on-surface-variant/60 mt-1">${isOwner ? 'Recomendadas por ti.' : 'Descubiertas por este usuario.'}</p>
                    </div>
                    ${btnHtml}
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${gridHtml}
                </div>
            `;
        } catch (e) {
            console.error('Error fetching attractions:', e);
            renderEmptyAtracciones(container);
        }
    }

    function renderEmptyAtracciones(container) {
        const isOwner = window.isProfileOwner !== false;
        if (isOwner) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-16 text-center">
                    <div class="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <span class="material-symbols-outlined text-[48px]">add_location_alt</span>
                    </div>
                    <h3 class="text-3xl font-extrabold text-on-surface mb-6">Crear una atracción</h3>
                    <button onclick="window.openCreateAttractionModal()" class="px-10 py-5 bg-white text-blue-600 hover:text-blue-700 hover:bg-slate-50 border-2 border-blue-600 rounded-2xl font-extrabold shadow-md hover:scale-[1.02] active:scale-100 transition-all flex items-center gap-3 text-lg">
                        <span class="material-symbols-outlined text-blue-600 font-bold">add</span> Crear una atracción
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-16 text-center">
                    <div class="w-24 h-24 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <span class="material-symbols-outlined text-[48px]">location_off</span>
                    </div>
                    <h3 class="text-xl font-bold text-on-surface-variant">Este usuario no ha descubierto una atracción</h3>
                </div>
            `;
        }
    }

    // Form create attraction submission handler
    const formCreateAttraction = document.getElementById('form-create-attraction');
    const attrFotosInput = document.getElementById('attr-fotos');
    if (attrFotosInput) {
        attrFotosInput.addEventListener('change', () => {
            const files = Array.from(attrFotosInput.files);
            const totalCount = selectedPhotos.length + files.length;
            if (totalCount > 5) {
                alert('Puedes seleccionar un máximo de 5 fotos.');
                attrFotosInput.value = '';
                return;
            }

            // Append to our tracking array
            selectedPhotos = selectedPhotos.concat(files);
            // Clear input so same file or more files can be added later
            attrFotosInput.value = '';
            
            renderPhotoPreviews();
        });
    }

    if (formCreateAttraction) {
        formCreateAttraction.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nombre = document.getElementById('attr-nombre').value;
            const descripcion = document.getElementById('attr-descripcion').value;
            const categoria = document.getElementById('attr-categoria').value;
            const direccion = document.getElementById('attr-ubicacion').value;
            const accesibilidad = document.getElementById('attr-accesibilidad').value;
            const costoValue = parseFloat(document.getElementById('attr-costo').value || '0.0');

            if (selectedPhotos.length > 5) {
                alert('Puedes seleccionar un máximo de 5 fotos.');
                return;
            }

            const submitBtn = formCreateAttraction.querySelector('button[type="submit"]');
            const originalHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">refresh</span> Guardando...';

            try {
                const isEdit = (editingAttractionId !== null);
                const existingAttr = isEdit ? loadedAttractions.find(a => a.id === editingAttractionId) : null;
                const fotoUrl = existingAttr ? (existingAttr.foto_url || existingAttr.fotoUrl) : null;
                const uniqueId = isEdit ? editingAttractionId : ('local-' + Date.now() + '-' + Math.floor(Math.random() * 1000));

                const payload = {
                    id: uniqueId,
                    nombre: nombre,
                    descripcion: descripcion,
                    categoria: categoria,
                    direccion: direccion,
                    costo: costoValue,
                    necesita_turno: false,
                    es_oficial: false,
                    foto_url: fotoUrl, // Conservamos la foto anterior si estamos editando y no se seleccionan nuevas
                    creador_id: currentUser.id,
                    latitud: selectedLat,
                    longitud: selectedLng,
                    google_place_id: selectedPlaceId,
                    accesibilidad: accesibilidad
                };

                const url = isEdit ? `http://localhost:8000/api/atracciones/${editingAttractionId}` : 'http://localhost:8000/api/atracciones';
                const method = isEdit ? 'PUT' : 'POST';

                const resp = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!resp.ok) {
                    const err = await resp.json().catch(() => ({}));
                    const detail = err.message || err.error || (err.errors ? err.errors.map(e => e.defaultMessage).join(', ') : '') || JSON.stringify(err);
                    throw new Error(detail || 'Error al guardar la atracción en la base de datos.');
                }

                // Subir fotos si se seleccionaron — no-fatal: si falla la foto, la atracción igual se guarda
                if (selectedPhotos.length > 0) {
                    try {
                        const formData = new FormData();
                        for (let i = 0; i < selectedPhotos.length; i++) {
                            formData.append('files', selectedPhotos[i]);
                        }

                        const uploadResp = await fetch(`http://localhost:8000/api/atracciones/${uniqueId}/fotos`, {
                            method: 'POST',
                            body: formData
                        });

                        if (!uploadResp.ok) {
                            const err = await uploadResp.json().catch(() => ({}));
                            console.warn('[ATRACCION] Las fotos no se pudieron subir:', err.message || err.detail || 'Error desconocido');
                        }
                    } catch (uploadErr) {
                        // ERR_CONNECTION_RESET u otro error de red — la atracción ya se guardó, solo falló la foto
                        console.warn('[ATRACCION] Error al subir fotos (no crítico, la atracción fue guardada):', uploadErr.message);
                    }
                }

                // Ocultar modal y limpiar formulario
                document.getElementById('modal-create-attraction').classList.add('hidden');
                formCreateAttraction.reset();
                resetCreateAttrMapState();
                resetCategoryDropdown();
                resetCostDropdown();
                resetScheduleSelectors();
                resetAccessibilityDropdown();
                resetPhotoUploadState();

                // Recargar listado en la UI
                loadAtracciones();

                // Feedback visual de éxito
                window.openSuccessAttractionModal(isEdit);

            } catch (err) {
                console.error('[ATRACCION] Error al guardar:', err);
                alert('No se pudo guardar la atracción: ' + err.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHtml;
            }
        });
    }

    // --- Google Maps and Pinning Logic for Custom Attractions ---
    function initCreateAttrMap() {
        const mapContainer = document.getElementById('create-attr-map');
        if (!mapContainer) return;

        // Default to Buenos Aires
        const defaultLatLng = { lat: -34.6037, lng: -58.3816 };

        createAttrMap = new google.maps.Map(mapContainer, {
            center: defaultLatLng,
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        });

        createAttrMarker = new google.maps.Marker({
            position: defaultLatLng,
            map: createAttrMap,
            draggable: true,
            title: "Ubicación de la atracción"
        });

        // Relocate marker and geocode on drag end
        createAttrMarker.addListener('dragend', () => {
            const pos = createAttrMarker.getPosition();
            selectedLat = pos.lat();
            selectedLng = pos.lng();
            updateLocationAddress(selectedLat, selectedLng);
        });

        // Relocate marker and geocode on map click
        createAttrMap.addListener('click', (event) => {
            const clickedLocation = event.latLng;
            createAttrMarker.setPosition(clickedLocation);
            selectedLat = clickedLocation.lat();
            selectedLng = clickedLocation.lng();
            updateLocationAddress(selectedLat, selectedLng);
        });
    }

    function initCreateAttrAutocomplete() {
        const input = document.getElementById('attr-ubicacion');
        if (!input) return;

        const autocomplete = new google.maps.places.Autocomplete(input, {
            types: ['geocode', 'establishment']
        });

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) {
                return;
            }

            const loc = place.geometry.location;
            selectedLat = loc.lat();
            selectedLng = loc.lng();
            selectedPlaceId = place.place_id || null;

            if (createAttrMap && createAttrMarker) {
                createAttrMap.setCenter(loc);
                createAttrMap.setZoom(16);
                createAttrMarker.setPosition(loc);
            }
        });
    }

    function updateLocationAddress(lat, lng) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat: lat, lng: lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const input = document.getElementById('attr-ubicacion');
                if (input) {
                    input.value = results[0].formatted_address;
                }
            }
        });
    }

    function resetCreateAttrMapState() {
        selectedLat = null;
        selectedLng = null;
        selectedPlaceId = null;
        const defaultLatLng = { lat: -34.6037, lng: -58.3816 };
        if (createAttrMap && createAttrMarker) {
            createAttrMap.setCenter(defaultLatLng);
            createAttrMap.setZoom(13);
            createAttrMarker.setPosition(defaultLatLng);
        }
    }

    window.openCreateAttractionModal = function() {
        editingAttractionId = null; // Limpiar ID de edición
        const modal = document.getElementById('modal-create-attraction');
        if (modal) {
            // Restaurar textos originales
            const titleEl = modal.querySelector('h2');
            if (titleEl) titleEl.textContent = 'Crear Atracción';
            const submitBtn = modal.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Guardar Atracción';

            modal.classList.remove('hidden');
            resetCategoryDropdown();
            resetCostDropdown();
            resetScheduleSelectors();
            resetAccessibilityDropdown();
            resetPhotoUploadState();
            
            // Initialize map & autocomplete on first open
            if (!createAttrMap) {
                initCreateAttrMap();
                initCreateAttrAutocomplete();
            } else {
                // Trigger resize and re-center to avoid rendering glitches
                google.maps.event.trigger(createAttrMap, 'resize');
                if (selectedLat && selectedLng) {
                    createAttrMap.setCenter({ lat: selectedLat, lng: selectedLng });
                } else {
                    createAttrMap.setCenter({ lat: -34.6037, lng: -58.3816 });
                }
            }
        }
    };

    window.closeCreateAttractionModal = function() {
        const modal = document.getElementById('modal-create-attraction');
        if (modal) {
            modal.classList.add('hidden');
        }
    };

    window.openSuccessAttractionModal = function(isEdit = false) {
        const modal = document.getElementById('modal-success-attraction');
        if (modal) {
            const titleEl = modal.querySelector('h3');
            const descEl = modal.querySelector('p');
            if (isEdit) {
                if (titleEl) titleEl.textContent = '¡Atracción Actualizada!';
                if (descEl) descEl.textContent = 'Los cambios en tu descubrimiento se han guardado con éxito y ya están compartidos con la comunidad.';
            } else {
                if (titleEl) titleEl.textContent = '¡Atracción Registrada!';
                if (descEl) descEl.textContent = 'Tu descubrimiento ha sido guardado con éxito y ya está compartido con toda la comunidad de ITERΛ.';
            }
            modal.classList.remove('hidden');
        }
    };

    window.closeSuccessAttractionModal = function() {
        const modal = document.getElementById('modal-success-attraction');
        if (modal) {
            modal.classList.add('hidden');
        }
    };

    window.openEditAttractionModal = function(attrId) {
        editingAttractionId = attrId;
        const attr = loadedAttractions.find(a => a.id === attrId);
        if (!attr) return;

        const modal = document.getElementById('modal-create-attraction');
        if (!modal) return;

        // Cambiar título y texto del botón
        const titleEl = modal.querySelector('h2');
        if (titleEl) titleEl.textContent = 'Editar Atracción';
        const submitBtn = modal.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Guardar Cambios';

        // Rellenar campos del formulario
        document.getElementById('attr-nombre').value = attr.nombre || '';
        document.getElementById('attr-descripcion').value = attr.descripcion || '';
        document.getElementById('attr-ubicacion').value = attr.direccion || '';

        // Poblar categorías
        const categories = (attr.categoria || '')
            .split(',')
            .map(c => c.trim().toLowerCase())
            .filter(Boolean);
        const catMenu = document.getElementById('attr-categoria-menu');
        const catInput = document.getElementById('attr-categoria');
        const catSummary = document.getElementById('attr-categoria-summary');
        
        if (catMenu && catInput && catSummary) {
            const checkboxes = catMenu.querySelectorAll('.category-option');
            const selectedVals = [];
            const labelsMap = {
                naturaleza: 'Naturaleza',
                cultura: 'Cultura e Historia',
                aventura: 'Aventura',
                gastronomia: 'Gastronomía',
                entretenimiento: 'Entretenimiento'
            };
            const selectedLabels = [];
            checkboxes.forEach(cb => {
                const val = cb.dataset.value;
                if (categories.includes(val)) {
                    cb.checked = true;
                    selectedVals.push(val);
                    selectedLabels.push(labelsMap[val] || val);
                } else {
                    cb.checked = false;
                }
            });
            catInput.value = selectedVals.join(',');
            catSummary.textContent = selectedLabels.length > 0 ? selectedLabels.join(', ') : 'Ninguna seleccionada';
        }

        // Poblar accesibilidad
        const accOptions = (attr.accesibilidad || '')
            .split(',')
            .map(a => a.trim())
            .filter(Boolean);
        const accMenu = document.getElementById('attr-accesibilidad-menu');
        const accInput = document.getElementById('attr-accesibilidad');
        const accSummary = document.getElementById('attr-accesibilidad-summary');
        if (accMenu && accInput && accSummary) {
            const checkboxes = accMenu.querySelectorAll('.accessibility-option');
            const selectedVals = [];
            const labelsMap = {
                todo_publico: 'Para todo público',
                silla_ruedas: 'Acceso en silla de ruedas',
                cochecitos: 'Apto para cochecitos',
                personas_mayores: 'Personas mayores'
            };
            const selectedLabels = [];
            checkboxes.forEach(cb => {
                const val = cb.dataset.value;
                if (accOptions.includes(val)) {
                    cb.checked = true;
                    selectedVals.push(val);
                    selectedLabels.push(labelsMap[val] || val);
                } else {
                    cb.checked = false;
                }
            });
            accInput.value = selectedVals.join(',');
            accSummary.textContent = selectedLabels.length > 0 ? selectedLabels.join(', ') : 'Ninguna seleccionada';
        }

        // Poblar costo
        const costMenu = document.getElementById('attr-costo-menu');
        const costInput = document.getElementById('attr-costo');
        const costSummary = document.getElementById('attr-costo-summary');
        if (costMenu && costInput && costSummary) {
            const radios = costMenu.querySelectorAll('.costo-option');
            const costVal = (attr.costo !== undefined && attr.costo !== null) ? attr.costo.toString() : '0.0';
            let parsedVal = '0.0';
            if (costVal === '0' || costVal === '0.0' || costVal === '0.00') parsedVal = '0.0';
            else if (costVal === '1' || costVal === '1.0' || costVal === '1.00') parsedVal = '1.0';
            else if (costVal === '2' || costVal === '2.0' || costVal === '2.00') parsedVal = '2.0';
            else if (costVal === '3' || costVal === '3.0' || costVal === '3.00') parsedVal = '3.0';

            const labelsMap = {
                '0.0': 'Gratis',
                '1.0': 'Costo bajo',
                '2.0': 'Costo moderado',
                '3.0': 'Costo alto'
            };
            radios.forEach(radio => {
                radio.checked = (radio.dataset.value === parsedVal);
            });
            costInput.value = parsedVal;
            costSummary.textContent = labelsMap[parsedVal] || 'Gratis';
        }

        // Poblar horario
        const check24h = document.getElementById('attr-horario-24h');
        const inputInicio = document.getElementById('attr-horario-inicio');
        const inputFin = document.getElementById('attr-horario-fin');
        const scheduleInput = document.getElementById('attr-horario');
        const selectores = document.getElementById('attr-horario-selectores');
        const scheduleStr = attr.horario || '';

        if (check24h && inputInicio && inputFin && scheduleInput && selectores) {
            if (scheduleStr.toLowerCase() === '24h') {
                check24h.checked = true;
                scheduleInput.value = '24h';
                selectores.classList.add('opacity-40', 'pointer-events-none');
            } else {
                check24h.checked = false;
                scheduleInput.value = scheduleStr;
                selectores.classList.remove('opacity-40', 'pointer-events-none');
                
                if (scheduleStr.includes('-')) {
                    const parts = scheduleStr.split('-');
                    inputInicio.value = parts[0].trim();
                    inputFin.value = parts[1].trim();
                }
            }
        }

        // Configuración de ubicación del mapa
        selectedLat = attr.latitud || null;
        selectedLng = attr.longitud || null;
        selectedPlaceId = attr.google_place_id || null;

        modal.classList.remove('hidden');

        const pos = (selectedLat && selectedLng) 
            ? { lat: parseFloat(selectedLat), lng: parseFloat(selectedLng) } 
            : { lat: -34.6037, lng: -58.3816 };

        if (!createAttrMap) {
            initCreateAttrMap();
            initCreateAttrAutocomplete();
            setTimeout(() => {
                if (createAttrMap && createAttrMarker) {
                    createAttrMap.setCenter(pos);
                    createAttrMarker.setPosition(pos);
                }
            }, 200);
        } else {
            google.maps.event.trigger(createAttrMap, 'resize');
            createAttrMap.setCenter(pos);
            createAttrMarker.setPosition(pos);
        }

        resetPhotoUploadState();
    };

    function setupCategoryDropdown() {
        const btn = document.getElementById('attr-categoria-btn');
        const menu = document.getElementById('attr-categoria-menu');
        const arrow = document.getElementById('attr-categoria-arrow');
        const hiddenInput = document.getElementById('attr-categoria');
        const summary = document.getElementById('attr-categoria-summary');

        if (!btn || !menu || !arrow || !hiddenInput || !summary) return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = !menu.classList.contains('hidden');
            if (isOpen) {
                menu.classList.add('hidden');
                arrow.classList.remove('rotate-180');
            } else {
                menu.classList.remove('hidden');
                arrow.classList.add('rotate-180');
            }
        });

        document.addEventListener('click', (e) => {
            if (!menu.classList.contains('hidden') && !menu.contains(e.target) && e.target !== btn) {
                menu.classList.add('hidden');
                arrow.classList.remove('rotate-180');
            }
        });

        const checkboxes = menu.querySelectorAll('.category-option');
        const labelsMap = {
            naturaleza: 'Naturaleza',
            cultura: 'Cultura e Historia',
            aventura: 'Aventura',
            gastronomia: 'Gastronomía',
            entretenimiento: 'Entretenimiento'
        };

        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                const selectedVals = [];
                const selectedLabels = [];

                checkboxes.forEach(c => {
                    if (c.checked) {
                        selectedVals.push(c.dataset.value);
                        selectedLabels.push(labelsMap[c.dataset.value] || c.dataset.value);
                    }
                });

                hiddenInput.value = selectedVals.join(',');
                summary.textContent = selectedLabels.length > 0 ? selectedLabels.join(', ') : 'Ninguna seleccionada';
            });
        });
    }

    function resetCategoryDropdown() {
        const menu = document.getElementById('attr-categoria-menu');
        const arrow = document.getElementById('attr-categoria-arrow');
        const hiddenInput = document.getElementById('attr-categoria');
        const summary = document.getElementById('attr-categoria-summary');

        if (menu) menu.classList.add('hidden');
        if (arrow) arrow.classList.remove('rotate-180');
        if (hiddenInput) hiddenInput.value = 'naturaleza';
        if (summary) summary.textContent = 'Naturaleza';

        if (menu) {
            const checkboxes = menu.querySelectorAll('.category-option');
            checkboxes.forEach(cb => {
                cb.checked = (cb.dataset.value === 'naturaleza');
            });
        }
    }

    function setupCostDropdown() {
        const btn = document.getElementById('attr-costo-btn');
        const menu = document.getElementById('attr-costo-menu');
        const arrow = document.getElementById('attr-costo-arrow');
        const hiddenInput = document.getElementById('attr-costo');
        const summary = document.getElementById('attr-costo-summary');

        if (!btn || !menu || !arrow || !hiddenInput || !summary) return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = !menu.classList.contains('hidden');
            if (isOpen) {
                menu.classList.add('hidden');
                arrow.classList.remove('rotate-180');
            } else {
                menu.classList.remove('hidden');
                arrow.classList.add('rotate-180');
            }
        });

        document.addEventListener('click', (e) => {
            if (!menu.classList.contains('hidden') && !menu.contains(e.target) && e.target !== btn) {
                menu.classList.add('hidden');
                arrow.classList.remove('rotate-180');
            }
        });

        const radios = menu.querySelectorAll('.costo-option');
        const labelsMap = {
            '0.0': 'Gratis',
            '1.0': 'Costo bajo',
            '2.0': 'Costo moderado',
            '3.0': 'Costo alto'
        };

        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    const val = radio.dataset.value;
                    hiddenInput.value = val;
                    summary.textContent = labelsMap[val] || 'Gratis';
                    menu.classList.add('hidden');
                    arrow.classList.remove('rotate-180');
                }
            });
        });
    }

    function resetCostDropdown() {
        const menu = document.getElementById('attr-costo-menu');
        const arrow = document.getElementById('attr-costo-arrow');
        const hiddenInput = document.getElementById('attr-costo');
        const summary = document.getElementById('attr-costo-summary');

        if (menu) menu.classList.add('hidden');
        if (arrow) arrow.classList.remove('rotate-180');
        if (hiddenInput) hiddenInput.value = '0.0';
        if (summary) summary.textContent = 'Gratis';

        if (menu) {
            const radios = menu.querySelectorAll('.costo-option');
            radios.forEach(radio => {
                radio.checked = (radio.dataset.value === '0.0');
            });
        }
    }

    function setupScheduleSelectors() {
        const check24h = document.getElementById('attr-horario-24h');
        const selectores = document.getElementById('attr-horario-selectores');
        const inputInicio = document.getElementById('attr-horario-inicio');
        const inputFin = document.getElementById('attr-horario-fin');
        const hiddenInput = document.getElementById('attr-horario');

        if (!check24h || !selectores || !inputInicio || !inputFin || !hiddenInput) return;

        function updateScheduleString() {
            if (check24h.checked) {
                hiddenInput.value = '24h';
                selectores.classList.add('opacity-40', 'pointer-events-none');
            } else {
                hiddenInput.value = `${inputInicio.value} - ${inputFin.value}`;
                selectores.classList.remove('opacity-40', 'pointer-events-none');
            }
        }

        check24h.addEventListener('change', updateScheduleString);
        inputInicio.addEventListener('change', updateScheduleString);
        inputFin.addEventListener('change', updateScheduleString);

        // Initial update
        updateScheduleString();
    }

    function resetScheduleSelectors() {
        const check24h = document.getElementById('attr-horario-24h');
        const inputInicio = document.getElementById('attr-horario-inicio');
        const inputFin = document.getElementById('attr-horario-fin');
        const hiddenInput = document.getElementById('attr-horario');

        if (check24h) check24h.checked = false;
        if (inputInicio) inputInicio.value = '09:00';
        if (inputFin) inputFin.value = '18:00';
        if (hiddenInput) hiddenInput.value = '09:00 - 18:00';

        const selectores = document.getElementById('attr-horario-selectores');
        if (selectores) selectores.classList.remove('opacity-40', 'pointer-events-none');
    }

    function setupAccessibilityDropdown() {
        const btn = document.getElementById('attr-accesibilidad-btn');
        const menu = document.getElementById('attr-accesibilidad-menu');
        const arrow = document.getElementById('attr-accesibilidad-arrow');
        const hiddenInput = document.getElementById('attr-accesibilidad');
        const summary = document.getElementById('attr-accesibilidad-summary');

        if (!btn || !menu || !arrow || !hiddenInput || !summary) return;

        // Toggle dropdown open/close
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = !menu.classList.contains('hidden');
            if (isOpen) {
                menu.classList.add('hidden');
                arrow.classList.remove('rotate-180');
            } else {
                menu.classList.remove('hidden');
                arrow.classList.add('rotate-180');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!menu.classList.contains('hidden') && !menu.contains(e.target) && e.target !== btn) {
                menu.classList.add('hidden');
                arrow.classList.remove('rotate-180');
            }
        });

        // Listen for checkbox changes to update hidden value and summary text
        const checkboxes = menu.querySelectorAll('.accessibility-option');
        const labelsMap = {
            todo_publico: 'Para todo público',
            silla_ruedas: 'Acceso en silla de ruedas',
            cochecitos: 'Apto para cochecitos',
            personas_mayores: 'Personas mayores'
        };

        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                const selectedVals = [];
                const selectedLabels = [];

                checkboxes.forEach(c => {
                    if (c.checked) {
                        selectedVals.push(c.dataset.value);
                        selectedLabels.push(labelsMap[c.dataset.value] || c.dataset.value);
                    }
                });

                hiddenInput.value = selectedVals.join(',');
                summary.textContent = selectedLabels.length > 0 ? selectedLabels.join(', ') : 'Ninguna seleccionada';
            });
        });
    }

    function resetAccessibilityDropdown() {
        const menu = document.getElementById('attr-accesibilidad-menu');
        const arrow = document.getElementById('attr-accesibilidad-arrow');
        const hiddenInput = document.getElementById('attr-accesibilidad');
        const summary = document.getElementById('attr-accesibilidad-summary');

        if (menu) menu.classList.add('hidden');
        if (arrow) arrow.classList.remove('rotate-180');
        if (hiddenInput) hiddenInput.value = 'todo_publico';
        if (summary) summary.textContent = 'Para todo público';

        if (menu) {
            const checkboxes = menu.querySelectorAll('.accessibility-option');
            checkboxes.forEach(cb => {
                cb.checked = (cb.dataset.value === 'todo_publico');
            });
        }
    }

    function renderPhotoPreviews() {
        const previewContainer = document.getElementById('attr-fotos-preview');
        const counterEl = document.getElementById('attr-fotos-counter');
        if (!previewContainer || !counterEl) return;

        previewContainer.innerHTML = '';
        counterEl.textContent = `${selectedPhotos.length} de 5 seleccionadas`;

        // Create and append placeholders synchronously to keep the selection order
        const cards = [];
        selectedPhotos.forEach((file, idx) => {
            const card = document.createElement('div');
            card.className = "relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/60 bg-white/20 group shadow-md animate-in fade-in zoom-in-95 duration-200 flex flex-col";
            
            const sizeStr = file.size > 1024 * 1024 
                ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
                : `${(file.size / 1024).toFixed(0)} KB`;

            card.innerHTML = `
                <div class="flex-1 w-full overflow-hidden relative bg-slate-900/5">
                    <div class="absolute inset-0 flex items-center justify-center text-primary/30 animate-pulse loading-icon">
                        <span class="material-symbols-outlined text-[24px]">image</span>
                    </div>
                    <img class="w-full h-full object-cover hidden" src="" alt="Preview ${idx + 1}">
                </div>
                <div class="p-2 bg-white/85 dark:bg-slate-905/85 backdrop-blur-sm border-t border-white/40 flex flex-col justify-center min-h-[48px]">
                    <p class="text-[10px] font-bold text-on-surface dark:text-white truncate" title="${file.name}">${file.name}</p>
                    <div class="flex items-center justify-between mt-0.5">
                        <span class="text-[8px] text-on-surface-variant/70 dark:text-slate-400 font-semibold">${sizeStr}</span>
                        <span class="flex items-center gap-0.5 text-[8px] text-emerald-600 dark:text-emerald-400 font-bold">
                            <span class="material-symbols-outlined text-[9px] font-bold">check_circle</span>
                            Cargada
                        </span>
                    </div>
                </div>
                <button type="button" class="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-95 text-white flex items-center justify-center transition-all shadow-md focus:outline-none z-10" title="Quitar foto">
                    <span class="material-symbols-outlined text-[14px] font-bold">close</span>
                </button>
            `;

            // Read the file data asynchronously to set the source of the image element
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = card.querySelector('img');
                const loadingIcon = card.querySelector('.loading-icon');
                if (img) {
                    img.src = e.target.result;
                    img.classList.remove('hidden');
                }
                if (loadingIcon) {
                    loadingIcon.remove();
                }
            };
            reader.readAsDataURL(file);

            // Handle card removal using index closure
            card.querySelector('button').addEventListener('click', (ev) => {
                ev.stopPropagation();
                selectedPhotos.splice(idx, 1);
                renderPhotoPreviews();
            });

            previewContainer.appendChild(card);
            cards.push(card);
        });
    }

    function resetPhotoUploadState() {
        selectedPhotos = [];
        const previewContainer = document.getElementById('attr-fotos-preview');
        const counterEl = document.getElementById('attr-fotos-counter');
        const fileInput = document.getElementById('attr-fotos');
        if (previewContainer) previewContainer.innerHTML = '';
        if (counterEl) counterEl.textContent = '0 de 5 seleccionadas';
        if (fileInput) fileInput.value = '';
    }

    // ── Lógica de Seguidores / Seguidos ──
    const btnShowFollowers = document.getElementById('btn-show-followers');
    const btnShowFollowing = document.getElementById('btn-show-following');
    const modalFollowList = document.getElementById('modal-follow-list');
    const followListContainer = document.getElementById('follow-list-container');
    const followModalTitle = document.getElementById('follow-modal-title');

    async function fetchAndShowFollowList(type) {
        if (!currentUser?.id) return;
        
        followModalTitle.textContent = type === 'seguidores' ? 'Seguidores' : 'Siguiendo';
        modalFollowList.classList.remove('hidden');
        followListContainer.innerHTML = `
            <div class="flex justify-center py-8">
                <span class="material-symbols-outlined text-[32px] text-primary animate-spin">refresh</span>
            </div>
        `;

        const loggedInUserStr = localStorage.getItem('itera_user');
        let currentUserId = '';
        if (loggedInUserStr) {
            try {
                currentUserId = JSON.parse(loggedInUserStr).id || '';
            } catch(e) {}
        }

        try {
            const endpoint = type === 'seguidores' ? 'seguidores' : 'seguidos';
            const resp = await fetch(`http://localhost:8000/api/usuarios/${currentUser.id}/${endpoint}?current_user_id=${currentUserId}`);
            if (!resp.ok) throw new Error('Error al obtener lista');
            
            const users = await resp.json();
            
            if (users.length === 0) {
                followListContainer.innerHTML = `
                    <div class="text-center py-8 text-on-surface-variant/70 font-medium">
                        No hay usuarios para mostrar.
                    </div>
                `;
                return;
            }

            followListContainer.innerHTML = users.map(u => {
                const isMe = currentUserId === u.id;
                const userAvatar = u.foto_perfil || u.fotoPerfil || defaultAvatar;
                
                // Botón de seguir/dejando de seguir (solo si no es uno mismo)
                let btnHtml = '';
                if (!isMe) {
                    if (u.siguiendo) {
                        btnHtml = `<button onclick="window.toggleFollowListUser('${u.id}', this)" class="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-full text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shrink-0">Siguiendo</button>`;
                    } else {
                        btnHtml = `<button onclick="window.toggleFollowListUser('${u.id}', this)" class="px-4 py-1.5 bg-primary text-white rounded-full text-xs font-bold hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors shrink-0">Seguir</button>`;
                    }
                }

                return `
                    <div class="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/50 transition-colors border border-transparent hover:border-white/60">
                        <img src="${userAvatar}" class="w-12 h-12 rounded-full object-cover cursor-pointer border border-white" onclick="window.location.href='../profile/index.html?id=${u.id}'" alt="Avatar">
                        <div class="flex-1 min-w-0 cursor-pointer" onclick="window.location.href='../profile/index.html?id=${u.id}'">
                            <p class="font-bold text-sm text-on-surface truncate">${u.nombre || ''} ${u.apellido || ''}</p>
                            <p class="text-[12px] text-on-surface-variant/60 truncate">@${u.username || 'usuario'}</p>
                        </div>
                        ${btnHtml}
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Error fetching list:', error);
            followListContainer.innerHTML = `
                <div class="text-center py-8 text-error font-medium">
                    Error al cargar la lista.
                </div>
            `;
        }
    }

    if (btnShowFollowers) {
        btnShowFollowers.addEventListener('click', () => fetchAndShowFollowList('seguidores'));
    }
    if (btnShowFollowing) {
        btnShowFollowing.addEventListener('click', () => fetchAndShowFollowList('seguidos'));
    }

    // Toggle follow desde la lista del modal
    window.toggleFollowListUser = async function(targetUserId, btnElement) {
        const loggedInUserStr = localStorage.getItem('itera_user');
        if (!loggedInUserStr) {
            alert('Inicia sesión para seguir usuarios.');
            return;
        }
        let currentUserId = '';
        try {
            currentUserId = JSON.parse(loggedInUserStr).id || '';
        } catch(e) {}

        if (!currentUserId) return;

        btnElement.disabled = true;
        const originalText = btnElement.textContent;
        btnElement.textContent = '...';

        try {
            const resp = await fetch(`http://localhost:8000/api/usuarios/${targetUserId}/seguir?current_user_id=${currentUserId}`, { method: 'POST' });
            if (resp.ok) {
                const data = await resp.json();
                if (data.siguiendo) {
                    btnElement.textContent = 'Siguiendo';
                    btnElement.className = "px-4 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-full text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shrink-0";
                } else {
                    btnElement.textContent = 'Seguir';
                    btnElement.className = "px-4 py-1.5 bg-primary text-white rounded-full text-xs font-bold hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors shrink-0";
                }
                
                // Refrescar el contador principal si estamos viendo nuestro propio perfil o si afecta al target actual
                if (window.refreshProfileStats) {
                    window.refreshProfileStats();
                }
            } else {
                btnElement.textContent = originalText;
            }
        } catch (e) {
            console.error('Error toggling follow:', e);
            btnElement.textContent = originalText;
        } finally {
            btnElement.disabled = false;
        }
    };

    // Start everything
    setupCategoryDropdown();
    setupCostDropdown();
    setupScheduleSelectors();
    setupAccessibilityDropdown();
    loadProfile();
});
