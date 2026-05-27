document.addEventListener('DOMContentLoaded', () => {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const errorMsg = document.getElementById('error-msg');
  const successMsg = document.getElementById('success-msg');

  // Toggle PW Login
  const loginPwInput = document.getElementById('login-password');
  const loginTogglePw = document.getElementById('login-toggle-pw');
  if (loginTogglePw && loginPwInput) {
    loginTogglePw.addEventListener('click', () => {
      loginPwInput.type = loginPwInput.type === 'password' ? 'text' : 'password';
    });
  }

  // Toggle PW Reg
  const regPwInput = document.getElementById('reg-password');
  const regTogglePw = document.getElementById('reg-toggle-pw');
  if (regTogglePw && regPwInput) {
    regTogglePw.addEventListener('click', () => {
      regPwInput.type = regPwInput.type === 'password' ? 'text' : 'password';
    });
  }

  // Tab switching
  if (tabLogin && tabRegister && formLogin && formRegister) {
    tabLogin.addEventListener('click', () => {
      formLogin.classList.remove('hidden');
      formRegister.classList.add('hidden');
      tabLogin.className = "font-bold transition-colors text-blue-600 border-b-2 border-blue-600";
      tabRegister.className = "font-bold transition-colors text-slate-400 hover:text-slate-600";
      if (errorMsg) errorMsg.classList.add('hidden');
      if (successMsg) successMsg.classList.add('hidden');
    });

    tabRegister.addEventListener('click', () => {
      formRegister.classList.remove('hidden');
      formLogin.classList.add('hidden');
      tabRegister.className = "font-bold transition-colors text-blue-600 border-b-2 border-blue-600";
      tabLogin.className = "font-bold transition-colors text-slate-400 hover:text-slate-600";
      if (errorMsg) errorMsg.classList.add('hidden');
      if (successMsg) successMsg.classList.add('hidden');
    });
  }

  // Login handler
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('login-btn');
      btn.disabled = true;
      btn.innerText = 'Cargando...';
      if (errorMsg) errorMsg.classList.add('hidden');

      const email = document.getElementById('login-email').value;
      const password = loginPwInput.value;

      try {
        const response = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('itera_user', JSON.stringify(data));
          window.location.href = '../home/index.html'; // Redirect to home
        } else {
          if (errorMsg) {
            errorMsg.innerText = data.detail || 'Error al iniciar sesión';
            errorMsg.classList.remove('hidden');
          }
        }
      } catch (err) {
        if (errorMsg) {
          errorMsg.innerText = 'Error de red. Asegúrate de que el backend esté encendido.';
          errorMsg.classList.remove('hidden');
        }
      } finally {
        btn.disabled = false;
        btn.innerText = 'Iniciar Sesión';
      }
    });
  }

  // Country fetching
  let countries = [];
  const nacInput = document.getElementById('reg-nacionalidad');
  const nacDropdown = document.getElementById('nac-dropdown');

  if (nacInput && nacDropdown) {
    fetch('https://restcountries.com/v3.1/all?fields=name,cca2,translations')
      .then(res => res.json())
      .then(data => {
        countries = data.map(c => ({
          name: c.translations?.spa?.common || c.name.common,
          code: c.cca2.toLowerCase()
        })).sort((a,b) => a.name.localeCompare(b.name));
      })
      .catch(err => console.error("Error cargando países:", err));

    nacInput.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase();
      const filtered = countries.filter(c => c.name.toLowerCase().includes(val));
      renderNacDropdown(filtered);
      nacDropdown.classList.remove('hidden');
    });

    nacInput.addEventListener('focus', () => {
      const val = nacInput.value.toLowerCase();
      const filtered = countries.filter(c => c.name.toLowerCase().includes(val));
      renderNacDropdown(filtered);
      nacDropdown.classList.remove('hidden');
    });

    nacInput.addEventListener('blur', () => {
      setTimeout(() => nacDropdown.classList.add('hidden'), 200);
    });
  }

  function renderNacDropdown(list) {
    nacDropdown.innerHTML = '';
    if(list.length === 0) { nacDropdown.classList.add('hidden'); return; }
    list.forEach(nac => {
      const li = document.createElement('li');
      li.className = "px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 flex items-center gap-3";
      li.innerHTML = `
        <img src="https://flagcdn.com/w20/${nac.code}.png" srcset="https://flagcdn.com/w40/${nac.code}.png 2x" alt="${nac.name}" class="w-5 h-auto rounded-sm border border-slate-200 shadow-sm block" />
        <span class="font-medium text-slate-700">${nac.name}</span>
      `;
      li.addEventListener('mousedown', () => {
        nacInput.value = nac.name;
        nacDropdown.classList.add('hidden');
      });
      nacDropdown.appendChild(li);
    });
  }

  // Register handler
  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('reg-btn');
      btn.disabled = true;
      btn.innerText = 'Creando cuenta...';
      if (errorMsg) errorMsg.classList.add('hidden');
      if (successMsg) successMsg.classList.add('hidden');

      const payload = {
        nombre: document.getElementById('reg-nombre').value,
        apellido: document.getElementById('reg-apellido').value,
        username: document.getElementById('reg-username').value,
        email: document.getElementById('reg-email').value,
        password: regPwInput.value,
        nacionalidad: nacInput ? nacInput.value : '',
        edad: parseInt(document.getElementById('reg-edad').value, 10),
        fecha_nacimiento: document.getElementById('reg-dob').value || null
      };

      try {
        const response = await fetch('http://localhost:8000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.removeItem('itera_avatar');
          localStorage.setItem('itera_user', JSON.stringify(data));
          window.location.href = '../home/index.html';
        } else {
          if (errorMsg) {
            errorMsg.innerText = data.detail || 'Error al registrarse';
            errorMsg.classList.remove('hidden');
          }
        }
      } catch (err) {
        if (errorMsg) {
          errorMsg.innerText = 'Error de red al registrarse.';
          errorMsg.classList.remove('hidden');
        }
      } finally {
        btn.disabled = false;
        btn.innerText = 'Unirse a ITERA';
      }
    });
  }
});
