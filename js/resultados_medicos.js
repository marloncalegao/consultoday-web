// js/resultados_medicos.js
import { buscarMedicosAvancado, getHorariosDisponiveis } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Página de resultados de médicos carregada.");

  const resultadosDiv = document.getElementById("resultadosMedicos");
  const token = localStorage.getItem("token");

  const params = new URLSearchParams(window.location.search);
  const filtros = {
    nome: params.get("nome") || "",
    especialidade: params.get("especialidade") || "",
    cidade: params.get("cidade") || "",
  };

  try {
    const dados = await buscarMedicosAvancado(filtros, token);
    const medicos = dados?.content || dados || [];

    if (medicos.length === 0) {
      resultadosDiv.innerHTML = `
        <div class="alert alert-info text-center mt-4">
          Nenhum médico encontrado com os critérios informados.
        </div>`;
      return;
    }

    resultadosDiv.innerHTML = medicos.map((m) => criarCardMedico(m)).join("");

    // Carregar horários de cada médico
    for (const m of medicos) {
      await carregarHorarios(m.id, token);
    }

    configurarEventos();
  } catch (erro) {
    console.error("Erro ao buscar médicos:", erro);
    resultadosDiv.innerHTML = `
      <div class="alert alert-danger text-center mt-4">
        Ocorreu um erro ao buscar médicos. Tente novamente mais tarde.
      </div>`;
  }
});

function criarCardMedico(m) {
  return `
    <div class="col-12">
      <div class="card shadow-sm p-4 mb-4 d-flex flex-row align-items-start justify-content-between">

        <div class="d-flex align-items-center me-4">
          <img src="${m.fotoUrl || 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'}"
               alt="Foto do Médico"
               class="rounded-circle border"
               width="100" height="100">
        </div>

        <div class="flex-grow-1">
          <h5 class="mb-1">${m.nome}</h5>
          <p class="mb-1 text-muted">CRM: ${m.crm}</p>
          <p class="mb-3"><strong>Especialidade:</strong> ${m.especialidade}</p>

          <div class="horarios-wrapper">
            <p class="fw-semibold mb-2 text-primary">Horários disponíveis:</p>
            <div class="horarios-container" id="horarios-${m.id}">
              <div class="text-center my-2">
                <div class="spinner-border text-primary" role="status" style="width: 1.5rem; height: 1.5rem;"></div>
                <small class="text-muted ms-2">Carregando horários...</small>
              </div>
            </div>
            <div class="text-center mt-2">
              <button class="btn btn-outline-primary btn-sm btn-carregar" data-id="${m.id}" style="display:none">
                Carregar mais horários
              </button>
            </div>
          </div>
        </div>

        <div class="text-end ms-4 align-self-center">
          <button class="btn btn-outline-success btn-lg btn-agendar" data-id="${m.id}" disabled>
            Agendar Consulta
          </button>
        </div>
      </div>
    </div>`;
}

async function carregarHorarios(medicoId, token) {
  const container = document.getElementById(`horarios-${medicoId}`);
  const btnAgendar = document.querySelector(`button.btn-agendar[data-id="${medicoId}"]`);
  const btnCarregar = document.querySelector(`button.btn-carregar[data-id="${medicoId}"]`);

  try {
    const horarios = await getHorariosDisponiveis(medicoId, token);
    const agora = new Date();

    // Filtra horários futuros e remove duplicados
    const horariosFuturos = Array.from(
      new Set(
        horarios
          .filter((h) => new Date(h.dataHora || h) > agora)
          .map((h) => h.dataHora || h)
      )
    ).sort((a, b) => new Date(a) - new Date(b));

    container.innerHTML = "";

    if (horariosFuturos.length === 0) {
      container.innerHTML = `<small class="text-muted">Sem horários futuros disponíveis.</small>`;
      return;
    }

    // Agrupar horários por data
    const horariosPorDia = {};
    horariosFuturos.forEach((h) => {
      const data = new Date(h).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      if (!horariosPorDia[data]) horariosPorDia[data] = [];
      horariosPorDia[data].push(h);
    });

    // Renderização paginada
    const dias = Object.keys(horariosPorDia);
    let exibidos = 0;
    const porPagina = 3; // 3 dias por vez

    function renderizarLote() {
      const lote = dias.slice(exibidos, exibidos + porPagina);
      lote.forEach((dia) => {
        const grupo = document.createElement("div");
        grupo.className = "mb-3";
        grupo.innerHTML = `<h6 class="fw-bold text-secondary border-bottom pb-1 mb-2">${dia}</h6>`;

        horariosPorDia[dia].forEach((h) => {
          const dt = new Date(h);
          const label = dt.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const btn = document.createElement("button");
          btn.className = "btn btn-outline-secondary btn-sm me-2 mb-2 btn-horario";
          btn.dataset.id = medicoId;
          btn.dataset.horario = h;
          btn.textContent = label;
          grupo.appendChild(btn);
        });

        container.appendChild(grupo);
      });

      exibidos += lote.length;
      btnCarregar.style.display = exibidos >= dias.length ? "none" : "inline-block";
    }

    btnCarregar.addEventListener("click", renderizarLote);
    renderizarLote();
    btnAgendar.disabled = false;
  } catch (err) {
    console.error("Erro ao carregar horários:", err);
    container.innerHTML = `<small class="text-danger">Erro ao carregar horários.</small>`;
  }
}

function configurarEventos() {
  const resultadosDiv = document.getElementById("resultadosMedicos");

  // Selecionar horário
  resultadosDiv.addEventListener("click", (e) => {
    const btnHorario = e.target.closest(".btn-horario");
    if (!btnHorario) return;

    resultadosDiv.querySelectorAll(".btn-horario").forEach((b) => b.classList.remove("active"));
    btnHorario.classList.add("active");

    const idMedico = btnHorario.dataset.id;
    const horario = btnHorario.dataset.horario;

    localStorage.setItem("agendamentoSelecionado", JSON.stringify({ idMedico, horario }));
  });

  // Redirecionar para página de confirmação
  // Redirecionar para página de confirmação ou login/cadastro
resultadosDiv.addEventListener("click", (e) => {
  const btnAgendar = e.target.closest(".btn-agendar");
  if (!btnAgendar) return;

  const token = localStorage.getItem("token");

  // 1. Usuário NÃO logado → direcionar para página de criação de conta
  if (!token) {
    // Você pode escolher entre:
    // login.html OU cadastro_paciente.html
    window.location.href = "cadastro_paciente.html";
    return;
  }

  // 2. Verifica seleção de horário
  const dados = JSON.parse(localStorage.getItem("agendamentoSelecionado"));
  if (!dados || dados.idMedico !== btnAgendar.dataset.id) {
    alert("Por favor, selecione um horário antes de agendar.");
    return;
  }

  // 3. Usuário logado → segue para a confirmação
  window.location.href =
    `confirmar_agendamento.html?idMedico=${dados.idMedico}&dataHora=${encodeURIComponent(dados.horario)}`;
});

}
