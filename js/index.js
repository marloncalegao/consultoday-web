// index.js — lógica da página inicial do Consultoday

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("homeSearchForm");
  const inputNome = document.getElementById("searchNome");
  const inputEspecialidade = document.getElementById("searchEspecialidade");
  const inputCidade = document.getElementById("searchCidade");
  const btnBuscar = document.getElementById("homeSearchBtn");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = inputNome.value.trim();
    const esp = inputEspecialidade.value.trim();
    const cidade = inputCidade.value.trim();

    // salva filtros no localStorage (a página de busca médico vai ler isso)
    const filtros = { nome, especialidade: esp, cidade };
    localStorage.setItem("filtros_busca_medico", JSON.stringify(filtros));

    // opcional: construir URL com query params (SEO-friendly)
    const params = new URLSearchParams();
    if (nome) params.append("nome", nome);
    if (esp) params.append("especialidade", esp);
    if (cidade) params.append("cidade", cidade);

    const url = params.toString()
      ? `resultados_medicos.html?${params.toString()}`
      : `resultados_medicos.html`;

    // redireciona
    window.location.href = url;
  });
});
