/**
 * footer.js
 * Footer Compacto con Divisores Verticales de Itera.
 */

(function () {
  const year = new Date().getFullYear();

  const styles = `
    .itera-footer {
      background: #ffffff;
      color: #64748b;
      padding: 30px 24px 20px 24px;
      font-family: 'Inter', sans-serif;
      border-top: 1px solid #f1f5f9;
    }
    .itera-footer-content {
      max-width: 1000px;
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 0;
      margin-bottom: 24px;
    }
    .itera-footer-section {
      padding: 0 32px;
      flex: 1;
      min-width: 180px;
    }
    .itera-footer-section:not(:first-child) {
      border-left: 1px solid #f1f5f9;
    }
    .itera-footer-brand h2 {
      color: #0f172a;
      font-size: 18px;
      font-weight: 800;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    .itera-footer-brand h2 span {
      color: #0058bf;
    }
    .itera-footer-brand p {
      font-size: 13px;
      line-height: 1.5;
    }
    .itera-footer-heading {
      color: #1e293b;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 14px;
    }
    .itera-footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .itera-footer-links li {
      margin-bottom: 8px;
    }
    .itera-footer-links a {
      color: #64748b;
      text-decoration: none;
      font-size: 13px;
      transition: color 0.2s ease;
    }
    .itera-footer-links a:hover {
      color: #0058bf;
    }
    .itera-footer-bottom {
      max-width: 1000px;
      margin: 0 auto;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #94a3b8;
    }
    .itera-footer-social {
      display: flex;
      gap: 16px;
    }
    .itera-footer-social a {
      color: #cbd5e1;
      transition: color 0.2s;
    }
    .itera-footer-social a:hover {
      color: #0058bf;
    }
    @media (max-width: 768px) {
      .itera-footer-section {
        border-left: none !important;
        padding: 16px 0;
        border-bottom: 1px solid #f1f5f9;
      }
      .itera-footer-section:last-child {
        border-bottom: none;
      }
    }
  `;

  const html = `
    <style>${styles}</style>
    <footer class="itera-footer">
      <div class="itera-footer-content">
        <!-- Brand Section -->
        <div class="itera-footer-section itera-footer-brand" style="padding-left:0;">
          <h2><span style="font-family: 'Montserrat', sans-serif; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;">ITER<span style="letter-spacing: -2px;">Λ</span></span></h2>
          <p>Viaja con inteligencia.</p>
        </div>

        <!-- Column 1 -->
        <div class="itera-footer-section">
          <h4 class="itera-footer-heading">Plataforma</h4>
          <ul class="itera-footer-links">
            <li><a href="../home/index.html">Inicio</a></li>
            <li><a href="../dashboard/index.html">Mis Viajes</a></li>
          </ul>
        </div>

        <!-- Column 2 -->
        <div class="itera-footer-section">
          <h4 class="itera-footer-heading">Recursos</h4>
          <ul class="itera-footer-links">
            <li><a href="../destinations/index.html">Explorar</a></li>
            <li><a href="#">Ayuda</a></li>
          </ul>
        </div>

        <!-- Column 3 -->
        <div class="itera-footer-section">
          <h4 class="itera-footer-heading">Cuenta</h4>
          <ul class="itera-footer-links">
            <li><a href="../profile/index.html">Mi Perfil</a></li>
            <li><a href="../auth/index.html">Salir</a></li>
          </ul>
        </div>
      </div>

      <div class="itera-footer-bottom">
        <div>© ${year} Itera.</div>
        <div class="itera-footer-social">
          <a href="#" title="Instagram"><span class="material-symbols-outlined text-base">camera</span></a>
          <a href="#" title="Twitter"><span class="material-symbols-outlined text-base">share</span></a>
          <a href="#" title="LinkedIn"><span class="material-symbols-outlined text-base">public</span></a>
        </div>
      </div>
    </footer>
  `;

  function injectFooter() {
    const container = document.getElementById('footer-container');
    if (container) {
      container.innerHTML = html;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooter);
  } else {
    injectFooter();
  }
})();
