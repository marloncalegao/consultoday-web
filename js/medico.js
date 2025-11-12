// js/medico.js
import { apiRequest } from "./api.js";

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

  // Normaliza o texto de status (garante consistência)
  function normalizarStatus(status) {
  if (!status) return "DESCONHECIDO";

  // trata se for um objeto ou texto
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
  // FUNÇÃO: Carregar Consultas
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
              return status === "FINALIZADO" || new Date(c.dataHora) < agora;
            })
          : consultas.filter((c) => {
              const status = normalizarStatus(c.status);
              return (
                status !== "FINALIZADO" &&
                status !== "CANCELADO" &&
                new Date(c.dataHora) >= agora
              );
            });

      if (filtradas.length === 0) {
        msg.textContent =
          tipo === "historico"
            ? "Nenhuma consulta finalizada ou passada."
            : "Nenhuma consulta futura disponível.";
        msg.classList.remove("d-none");
        return;
      }

      filtradas.forEach((c) => {
        const tr = document.createElement("tr");
        const data = new Date(c.dataHora).toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        });

        const status = normalizarStatus(c.status);

        tr.innerHTML = `
            <td>${c.nomePaciente ?? "—"}</td>
            <td>${data}</td>
            <td>${status}</td>
            ${
              tipo === "futuras"
                ? `
                  <td>
                    <button class="btn btn-sm btn-success finalizar-btn" data-id="${c.idAgendamento}">Finalizar</button>
                    <button class="btn btn-sm btn-danger cancelar-btn" data-id="${c.idAgendamento}">Cancelar</button>
                  </td>`
                : `
                  <td>
                    ${status === "CANCELADO" 
                      ? c.motivoCancelamento 
                        ? c.motivoCancelamento 
                        : "—" 
                      : "—"}
                  </td>`
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

  // ==============================
  // BOTÃO: Cancelar Consulta
  // ==============================
  futurasBody.addEventListener("click", async (e) => {
    const btn = e.target.closest(".cancelar-btn");
    if (!btn) return;
    const id = btn.dataset.id;

    if (!confirm("Deseja cancelar esta consulta?")) return;

    try {
      await apiRequest(`/api/consultas/cancelar/${id}`, "DELETE", { motivo: "Cancelada pelo médico" }, token);
      alert("Consulta cancelada com sucesso.");
      carregarConsultas("futuras");
      carregarConsultas("historico");
    } catch {
      alert("Erro ao cancelar consulta.");
    }
  });

  // ==============================
  // BOTÃO: Finalizar Consulta
  // ==============================
  futurasBody.addEventListener("click", async (e) => {
    const btn = e.target.closest(".finalizar-btn");
    if (!btn) return;
    const id = btn.dataset.id;

    if (!confirm("Marcar esta consulta como finalizada?")) return;

    try {
      await apiRequest(`/api/consultas/finalizar/${id}`, "PUT", null, token);
      alert("Consulta finalizada com sucesso!");
      await carregarConsultas("futuras");
      await carregarConsultas("historico");
    } catch (err) {
      console.error(err);
      alert("Erro ao finalizar consulta.");
    }
  });

  // ==============================
  // TROCA DE ABAS
  // ==============================
  document.querySelectorAll('button[data-bs-toggle="tab"]').forEach((tab) => {
    tab.addEventListener("shown.bs.tab", (e) => {
      const target = e.target.getAttribute("data-bs-target");
      if (target === "#futuras") carregarConsultas("futuras");
      if (target === "#historico") carregarConsultas("historico");
    });
  });

  // Inicializa
  await carregarConsultas("futuras");
});
