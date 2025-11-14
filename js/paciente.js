// js/paciente.js
import { apiRequest, cancelarConsulta } from "./api.js";

import { mostrarMensagem } from "./mensagens.js";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Página de painel do paciente carregada.");

  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  if (!token || userType !== "PACIENTE") {
    console.warn("Usuário não autenticado ou não é paciente. Redirecionando...");
    window.location.href = "login.html";
    return;
  }

  const futurasBody = document.getElementById("futurasTableBody");
  const historicoBody = document.getElementById("historicoTableBody");
  const futurasMsg = document.getElementById("futurasMessage");
  const historicoMsg = document.getElementById("historicoMessage");
  const futurasLoading = document.getElementById("futurasLoading");
  const historicoLoading = document.getElementById("historicoLoading");

  // Normaliza o texto de status (garante consistência) - mesmo do medico.js
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

    // limpa e configura visual
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
              const d = new Date(c.dataHora);
              return status === "FINALIZADO" || status === "CANCELADO" || d < agora;
            })
          : consultas.filter((c) => {
              const status = normalizarStatus(c.status);
              const d = new Date(c.dataHora);
              return (
                status !== "FINALIZADO" &&
                status !== "CANCELADO" &&
                d >= agora
              );
            });

      if (filtradas.length === 0) {
        msg.textContent =
          tipo === "historico"
            ? "Nenhuma consulta finalizada ou passada."
            : "Nenhuma consulta futura disponível.";
        msg.classList.remove("d-none");

        // esconder loading e tabela
        loading.classList.add("d-none");
        const tabela = corpo.closest("table");
        if (tabela) tabela.classList.add("d-none");

        return;
      }

      // tem registros → mostra tabela
      const tabela = corpo.closest("table");
      if (tabela) tabela.classList.remove("d-none");
      loading.classList.add("d-none");

      // monta linhas
      filtradas.forEach((c) => {
        const data = new Date(c.dataHora).toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        });

        const status = normalizarStatus(c.status);

        const tr = document.createElement("tr");

        if (tipo === "futuras") {
          tr.innerHTML = `
            <td>${c.nomeMedico ?? "—"}</td>
            <td>${c.crmMedico ?? "—"}</td>
            <td>${data}</td>
            <td>${status}</td>
            <td>
              <button class="btn btn-sm btn-danger btn-cancelar" data-id="${c.idAgendamento}">Cancelar</button>
            </td>
          `;
        } else {
          tr.innerHTML = `
            <td>${c.nomeMedico ?? "—"}</td>
            <td>${c.crmMedico ?? "—"}</td>
            <td>${data}</td>
            <td>${status}</td>
            <td>${c.motivoCancelamento ?? "—"}</td>
          `;
        }

        corpo.appendChild(tr);
      });
    } catch (err) {
      console.error("Erro ao carregar consultas:", err);
      msg.textContent = "Erro ao carregar consultas.";
      msg.classList.remove("d-none");
      loading.classList.add("d-none");
    } finally {
      // Adiciona os listeners de cancelamento (fora do try para garantir execução)
      // (adiciona somente nos elementos atuais)
      const cancelarBtns = futurasBody.querySelectorAll(".btn-cancelar");
      cancelarBtns.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = btn.dataset.id;
          if (!id) return;

          if (!confirm("Deseja cancelar esta consulta?")) return;

          const motivo = prompt("Informe o motivo do cancelamento:", "Cancelamento pelo paciente");
          if (!motivo) return;

          try {
            await cancelarConsulta(id, motivo, token);
            mostrarMensagem("sucesso", "Consulta cancelada com sucesso!", 1500);
            await carregarConsultas("futuras");
            await carregarConsultas("historico");
          } catch (error) {
            console.error("Erro ao cancelar consulta:", error);
            mostrarMensagem("erro", "Erro ao cancelar a consulta.", 1500);
          }
        });
      });
    }
  }

  // Inicializa
  await carregarConsultas("futuras");

  // Alternância entre abas (compatível com markup do painel do paciente)
  document.querySelectorAll('#consultaTabs a[data-bs-toggle="tab"]').forEach((tab) => {
    tab.addEventListener("shown.bs.tab", (e) => {
      const target = e.target.getAttribute("href");
      if (target === "#futuras") carregarConsultas("futuras");
      if (target === "#historico") carregarConsultas("historico");
    });
  });
});
