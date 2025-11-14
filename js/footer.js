// ================================
//  FOOTER CONSISTENTE COM O HEADER
// ================================

document.addEventListener("DOMContentLoaded", () => carregarFooter());

export function carregarFooter() {
  let footerContainer = document.querySelector("footer");

  if (!footerContainer) {
    footerContainer = document.createElement("footer");
    document.body.appendChild(footerContainer);
  }

  const footerHTML = `
    <div class="footer shadow-sm">
      <div class="container d-flex flex-column flex-md-row justify-content-between align-items-center py-3">

        <!-- Logotipo -->
        <div class="footer-brand fw-bold text-primary fs-5">
          Consulto<span class="text-dark">day</span>
        </div>

        <!-- Direitos Autorais -->
        <small class="text-muted mt-2 mt-md-0">
          © 2025 Consultoday — Todos os direitos reservados.
        </small>

      </div>
    </div>
  `;

  footerContainer.innerHTML = footerHTML;
}
