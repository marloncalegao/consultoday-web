// js/busca_medicos.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchForm");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = document.getElementById("nomeMedico").value.trim();
    const especialidade = document.getElementById("especialidade").value.trim();
    const cidade = document.getElementById("cidade").value.trim();

    const params = new URLSearchParams();
    if (nome) params.append("nome", nome);
    if (especialidade) params.append("especialidade", especialidade);
    if (cidade) params.append("cidade", cidade);

    // Redireciona para a nova página de resultados
    window.location.href = `resultados_medicos.html?${params.toString()}`;
  });
});
