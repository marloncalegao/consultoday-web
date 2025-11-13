import { apiRequest } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const listaEl = document.getElementById("listaConsultas");

  // tenta pegar por ID (compatibilidade), senão tenta pegar pelos buttons com data-status
  let tabAgendadas = document.getElementById("tabAgendadas");
  let tabRealizadas = document.getElementById("tabRealizadas");
  let tabCanceladas = document.getElementById("tabCanceladas");

  // fallback: procura botões com data-status (como em versões anteriores)
  if (!tabAgendadas) tabAgendadas = document.querySelector('[data-status="PENDENTE"], [data-status="AGENDADAS"]');
  if (!tabRealizadas) tabRealizadas = document.querySelector('[data-status="REALIZADO"], [data-status="FINALIZADO"]');
  if (!tabCanceladas) tabCanceladas = document.querySelector('[data-status="CANCELADO"]');

  // Se ainda não existir qualquer um, tenta pegar pela classe .filtro-categoria na ordem esperada
  const fallbackBtns = document.querySelectorAll(".filtro-categoria");
  if ((!tabAgendadas || !tabRealizadas || !tabCanceladas) && fallbackBtns.length >= 3) {
    tabAgendadas = tabAgendadas || fallbackBtns[0];
    tabRealizadas = tabRealizadas || fallbackBtns[1];
    tabCanceladas = tabCanceladas || fallbackBtns[2];
  }

  const userType = (localStorage.getItem("userType") || "").toUpperCase();

  let consultas = [];
  let categoriaSelecionada = "AGENDADAS"; // padrão

  // ===========================
  // Carregar Consultas
  // ===========================
  async function carregarConsultas() {
    try {
      const resposta = await apiRequest("/api/consultas", "GET");
      consultas = resposta?.content ?? [];

      // ordenar por dataHora decrescente (mais recentes primeiro)
      consultas.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));

      renderizarConsultas();
    } catch (err) {
      console.error("Erro ao carregar consultas:", err);
      listaEl.innerHTML = `<p class="text-danger text-center">Erro ao carregar consultas.</p>`;
    }
  }

  // ===========================
  // Filtrar por Categoria
  // ===========================
  function filtrarPorCategoria(lista) {
    return lista.filter(c => {
      switch (categoriaSelecionada) {
        case "AGENDADAS":
        case "PENDENTE": // aceitar ambos por segurança
          return ["AGENDADO", "PENDENTE", "CONFIRMADO", "AGENDADAS"].includes(c.status);
        case "REALIZADAS":
        case "FINALIZADO":
          return ["REALIZADO", "FINALIZADO"].includes(c.status);
        case "CANCELADAS":
        case "CANCELADO":
          return c.status === "CANCELADO";
        default:
          return true;
      }
    });
  }

  // ===========================
  // Renderizar cards
  // ===========================
  function renderizarConsultas() {
    const filtradas = filtrarPorCategoria(consultas);

    if (filtradas.length === 0) {
      listaEl.innerHTML = `<p class="text-center text-muted fs-5">Nenhuma consulta encontrada.</p>`;
      return;
    }

    listaEl.innerHTML = filtradas.map(consulta => criarCard(consulta)).join("");
  }

  // ===========================
  // Card Template
  // ===========================
    function criarCard(c) {
    const dataPart = (c.dataHora || "").split("T")[0] || "";
    const horaPart = (c.dataHora || "").split("T")[1] || "";
    const data = dataPart ? dataPart.split("-").reverse().join("/") : "-";
    const hora = horaPart ? horaPart.substring(0, 5) : "-";

    const badgeClass = {
        PENDENTE: "bg-primary",
        CONFIRMADO: "bg-info",
        AGENDADO: "bg-primary",
        CANCELADO: "bg-danger",
        REALIZADO: "bg-success",
        FINALIZADO: "bg-success",
    }[c.status] || "bg-secondary";

    const isMedico = userType === "MEDICO";

    // Status que permitem ações
    const podeFinalizar = ["AGENDADO", "PENDENTE", "CONFIRMADO"].includes(c.status);
    const podeCancelar = ["AGENDADO", "PENDENTE", "CONFIRMADO"].includes(c.status);

    return `
        <div class="col-md-6">
        <div class="consulta-card shadow-sm p-3">

            <div class="d-flex justify-content-between">
            <strong>${data} • ${hora}</strong>
            <span class="badge ${badgeClass}">${c.status}</span>
            </div>

            <p class="mt-2 mb-1">
            <i class="bi bi-person-vcard"></i>
            <strong>Médico:</strong> ${c.nomeMedico ?? "-"} ${c.crmMedico ? `(CRM ${c.crmMedico})` : ""}
            </p>

            <p class="mb-1">
            <i class="bi bi-person-circle"></i>
            <strong>Paciente:</strong> ${c.nomePaciente ?? "-"}
            </p>

            ${c.status === "CANCELADO" ? `
            <p class="text-danger small"><strong>Motivo:</strong> ${c.motivoCancelamento ?? "-"}</p>
            ` : ""}

            <div class="mt-2 d-grid gap-2">
            ${isMedico && podeFinalizar ? `
                <button class="btn btn-success finalizar-btn" data-id="${c.idAgendamento}">
                Finalizar Consulta
                </button>
            ` : ""}

            ${podeCancelar ? `
                <button class="btn btn-outline-danger cancelar-btn" data-id="${c.idAgendamento}">
                Cancelar Consulta
                </button>
            ` : ""}
            </div>

        </div>
        </div>
    `;
    }


  // ===========================
  // Eventos de clique (delegation)
  // ===========================
  document.addEventListener("click", async (e) => {
    // Finalizar
    if (e.target.classList.contains("finalizar-btn")) {
      const id = e.target.dataset.id;
      if (!id) return;
      if (!confirm("Confirmar finalização da consulta?")) return;
      try {
        await apiRequest(`/api/consultas/finalizar/${id}`, "PUT");
        await carregarConsultas();
      } catch (err) {
        alert("Erro ao finalizar consulta: " + (err.message || err));
      }
      return;
    }

    // Cancelar (caso ainda exista botão cancelar na interface)
    if (e.target.classList.contains("cancelar-btn")) {
      const id = e.target.dataset.id;
      if (!id) return;
      const motivo = prompt("Informe o motivo do cancelamento:");
      if (!motivo) return;
      try {
        await apiRequest(`/api/consultas/cancelar/${id}`, "DELETE", { motivo });
        await carregarConsultas();
      } catch (err) {
        alert("Erro ao cancelar: " + (err.message || err));
      }
      return;
    }
  });

  // ===========================
  // Abas: adicionar listeners só se os elementos existirem
  // ===========================
  function ativarAbaElemento(elem) {
    if (!elem) return;
    // remove class active de todos (se existirem)
    const todos = [tabAgendadas, tabRealizadas, tabCanceladas].filter(Boolean);
    todos.forEach(t => t.classList.remove("active"));
    elem.classList.add("active");
  }

  if (tabAgendadas) {
    tabAgendadas.addEventListener("click", () => {
      categoriaSelecionada = "AGENDADAS";
      ativarAbaElemento(tabAgendadas);
      renderizarConsultas();
    });
  }

  if (tabRealizadas) {
    tabRealizadas.addEventListener("click", () => {
      categoriaSelecionada = "REALIZADAS";
      ativarAbaElemento(tabRealizadas);
      renderizarConsultas();
    });
  }

  if (tabCanceladas) {
    tabCanceladas.addEventListener("click", () => {
      categoriaSelecionada = "CANCELADAS";
      ativarAbaElemento(tabCanceladas);
      renderizarConsultas();
    });
  }

  // ativa aba padrão (se existir)
  ativarAbaElemento(tabAgendadas);

  // inicializa carregamento
  carregarConsultas();
});
