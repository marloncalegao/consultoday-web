// js/medico.js
import { apiRequest } from "./api.js";
import { mostrarMensagem } from "./mensagens.js";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Painel do médico carregado.");

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const futurasBody = document.getElementById("futurasTableBody");
  const historicoBody = document.getElementById("historicoTableBody");
  const futurasMsg = document.getElementById("futurasMessage");
  const historicoMsg = document.getElementById("historicoMessage");
  const futurasLoading = document.getElementById("futurasLoading");
  const historicoLoading = document.getElementById("historicoLoading");

  function normalizarStatus(status) {
    if (!status) return "DESCONHECIDO";

    if (typeof status === "object") {
      if (status.name) status = status.name;
      else if (status.status) status = status.status;
      else status = Object.values(status)[0];
    }

    const s = status.toString().trim().toUpperCase();

    if (s.includes("FINAL")) return "FINALIZADO";
    if (s.includes("CANCEL")) return "CANCELADO";
    if (s.includes("PEND") || s.includes("AGEND")) return "AGENDADO";

    return s || "DESCONHECIDO";
  }

  // ==============================
  // Carregar consultas
  // ==============================
  async function carregarConsultas(tipo = "futuras") {
    const corpo = tipo === "historico" ? historicoBody : futurasBody;
    const msg = tipo === "historico" ? historicoMsg : futurasMsg;
    const loading = tipo === "historico" ? historicoLoading : futurasLoading;

    corpo.innerHTML = "";
    msg.classList.add("d-none");
    loading.classList.remove("d-none");

    try {
      const page = await apiRequest("/api/consultas", "GET", null, token);
      const consultas = page?.content || [];
      const agora = new Date();

      const filtradas =
        tipo === "historico"
          ? consultas.filter((c) => {
              const status = normalizarStatus(c.status);
              const data = new Date(c.dataHora);

              return (
                status === "FINALIZADO" ||
                status === "CANCELADO" ||
                data < agora // CONSULTA PASSADA → HISTÓRICO
              );
            })
          : consultas.filter((c) => {
              const status = normalizarStatus(c.status);
              const data = new Date(c.dataHora);

              return (
                data >= agora && // FUTURA
                status !== "FINALIZADO" &&
                status !== "CANCELADO"
              );
            });

      if (filtradas.length === 0) {
        msg.textContent =
          tipo === "historico"
            ? "Nenhuma consulta finalizada ou passada."
            : "Nenhuma consulta futura disponível.";
        msg.classList.remove("d-none");

        loading.classList.add("d-none");
        const tabela = corpo.closest("table");
        if (tabela) tabela.classList.add("d-none");

        return;
      }

      const tabela = corpo.closest("table");
      if (tabela) tabela.classList.remove("d-none");
      loading.classList.add("d-none");

      filtradas.forEach((c) => {
        const tr = document.createElement("tr");

        const dataFormatada = new Date(c.dataHora).toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        });

        const status = normalizarStatus(c.status);

        tr.innerHTML = `
          <td>${c.nomePaciente ?? "—"}</td>
          <td>${dataFormatada}</td>
          <td>${status}</td>
          ${
            tipo === "futuras"
              ? `
                <td>
                  <button class="btn btn-sm btn-success finalizar-btn" data-id="${c.idAgendamento}">Finalizar</button>
                  <button class="btn btn-sm btn-danger cancelar-btn" data-id="${c.idAgendamento}">Cancelar</button>
                </td>
              `
              : `
                <td>${c.motivoCancelamento ?? "—"}</td>
              `
          }
        `;

        corpo.appendChild(tr);
      });
    } catch (err) {
      console.error("Erro ao carregar consultas:", err);
      msg.textContent = "Erro ao carregar consultas.";
      msg.classList.remove("d-none");
    }
  }

  // =====================
  // Cancelar
  // =====================
  futurasBody.addEventListener("click", async (e) => {
    const btn = e.target.closest(".cancelar-btn");
    if (!btn) return;

    const id = btn.dataset.id;
    if (!confirm("Deseja cancelar esta consulta?")) return;

    try {
      await apiRequest(`/api/consultas/cancelar/${id}`, "DELETE", {
        motivo: "Cancelada pelo médico",
      }, token);

      mostrarMensagem("sucesso", "Consulta cancelada.");
      carregarConsultas("futuras");
      carregarConsultas("historico");
    } catch {
      mostrarMensagem("erro", "Erro ao cancelar consulta.", 1500);
    }
  });

  // =====================
  // Finalizar
  // =====================
  futurasBody.addEventListener("click", async (e) => {
    const btn = e.target.closest(".finalizar-btn");
    if (!btn) return;

    const id = btn.dataset.id;
    if (!confirm("Finalizar esta consulta?")) return;

    try {
      await apiRequest(`/api/consultas/finalizar/${id}`, "PUT", null, token);
      mostrarMensagem("sucesso", "Consulta finalizada!", 1500);
      carregarConsultas("futuras");
      carregarConsultas("historico");
    } catch {
      mostrarMensagem("erro", "Erro ao finalizar consulta.", 1500);
    }
  });

  // Tabs
  document.querySelectorAll('button[data-bs-toggle="tab"]').forEach((tab) => {
    tab.addEventListener("shown.bs.tab", (e) => {
      const target = e.target.getAttribute("data-bs-target");
      if (target === "#futuras") carregarConsultas("futuras");
      if (target === "#historico") carregarConsultas("historico");
    });
  });

  // Inicial
  await carregarConsultas("futuras");
});
