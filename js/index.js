import { buscarMedicosAvancado, apiRequest } from "./api.js";
import { mostrarMensagem } from "./mensagens.js";

document.addEventListener("DOMContentLoaded", () => {
  configurarBuscaRapida();
  configurarEspecialidadesPopulares();
  carregarProximaConsulta(); // card de próxima consulta
});

/* ============================================================
   FORMULÁRIO DE BUSCA DA HOME
============================================================ */
function configurarBuscaRapida() {
  const form = document.getElementById("homeSearchForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = document.getElementById("searchNome").value.trim();
    const esp = document.getElementById("searchEspecialidade").value.trim();
    const cidade = document.getElementById("searchCidade").value.trim();

    const filtros = { nome, especialidade: esp, cidade };
    localStorage.setItem("filtros_busca_medico", JSON.stringify(filtros));

    const params = new URLSearchParams();
    if (nome) params.append("nome", nome);
    if (esp) params.append("especialidade", esp);
    if (cidade) params.append("cidade", cidade);

    const url = params.toString()
      ? `resultados_medicos.html?${params.toString()}`
      : `resultados_medicos.html`;

    window.location.href = url;
  });
}

/* ============================================================
   ESPECIALIDADES POPULARES - CARDS CLICÁVEIS
============================================================ */
function configurarEspecialidadesPopulares() {
  const cards = document.querySelectorAll(".specialty-card");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const esp = card.dataset.esp;
      if (!esp) return;

      const filtros = { nome: "", especialidade: esp, cidade: "" };
      localStorage.setItem("filtros_busca_medico", JSON.stringify(filtros));

      window.location.href =
        `resultados_medicos.html?especialidade=${encodeURIComponent(esp)}`;
    });
  });
}

/* ============================================================
   CARD "PRÓXIMA CONSULTA"
============================================================ */
async function carregarProximaConsulta() {
  const token = localStorage.getItem("token");
  if (!token) return;

  // Decodifica role do token
  let role = "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    role = payload.role || payload.authorities?.[0] || "";
  } catch {}

  if (!role.includes("PACIENTE")) return;

  const cardSection = document.getElementById("cardProximaConsulta");
  const nomeMedicoSpan = document.getElementById("pc_medico");
  const dataSpan = document.getElementById("pc_data");
  const btnDetalhes = document.getElementById("btnDetalhesProx");

  if (!cardSection) return;

  try {
    const resp = await apiRequest("/api/consultas?page=0&size=50");
    const consultas = resp?.content || [];

    const agora = new Date();

    const futuras = consultas
      .filter(c => c.status === "AGENDADO")
      .filter(c => new Date(c.dataHora) > agora)
      .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

    if (futuras.length === 0) return;

    const prox = futuras[0];
    console.log("Consulta recebida:", prox);


    // Nome correto do médico
    nomeMedicoSpan.textContent =
  prox.nomeMedico ||
  prox.medico?.nome ||
  "Médico";


    const dt = new Date(prox.dataHora);
    dataSpan.textContent =
      dt.toLocaleDateString("pt-BR") +
      " às " +
      dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    cardSection.classList.remove("d-none");

    btnDetalhes.onclick = () => {
      window.location.href = "minhas_consultas.html";
    };

  } catch (err) {
    console.warn("Erro ao carregar próxima consulta:", err);
  }
}

