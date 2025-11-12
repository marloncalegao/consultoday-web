// js/footer.js

export function carregarFooter() {
  const footerHTML = `
    <footer>
      © 2025 Consultoday. Todos os direitos reservados.
    </footer>
  `;
  document.body.insertAdjacentHTML("beforeend", footerHTML);
}

document.addEventListener("DOMContentLoaded", carregarFooter);
