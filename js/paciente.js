// js/paciente.js
import { apiRequest, cancelarConsulta } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Página de painel do paciente carregada.");

  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  if (!token || userType !== "PACIENTE") {
    console.warn("Usuário não autenticado ou não é paciente. Redirecionando...");
    window.location.href = "login.html";
    return;
  }

  // Elementos DOM
  const futurasBody = document.getElementById("futurasTableBody");
  const historicoBody = document.getElementById("historicoTableBody");
  const futurasMessage = document.getElementById("futurasMessage");
  const historicoMessage = document.getElementById("historicoMessage");
  const futurasLoading = document.getElementById("futurasLoading");
  const historicoLoading = document.getElementById("historicoLoading");

  if (!futurasBody || !historicoBody) {
    console.error("Erro: elementos de tabela não encontrados no DOM.");
    return;
  }

  // Normaliza o status do agendamento
  function normalizarStatus(agendamento) {
    if (agendamento.dataCancelamento) return "CANCELADA";
    if (agendamento.status?.toUpperCase().includes("FINAL")) return "FINALIZADA";
    if (new Date(agendamento.dataHora) < new Date()) return "REALIZADA";
    return "AGENDADA";
  }

  // Carregar consultas (futuras ou histórico)
  async function carregarConsultas(tipo = "futuras") {
    try {
      const dados = await apiRequest("/api/consultas", "GET", null, token);
      const consultas = dados?.content || [];
      const agora = new Date();

      const filtradas = consultas.filter((c) => {
        const status = normalizarStatus(c);
        const dataConsulta = new Date(c.dataHora);

        if (tipo === "futuras") {
          return status === "AGENDADA" && dataConsulta >= agora;
        } else {
          return status === "CANCELADA" || status === "FINALIZADA" || dataConsulta < agora;
        }
      });

      const corpoTabela = tipo === "historico" ? historicoBody : futurasBody;
      const mensagem = tipo === "historico" ? historicoMessage : futurasMessage;
      const loading = tipo === "historico" ? historicoLoading : futurasLoading;

      corpoTabela.innerHTML = "";
      mensagem.classList.add("d-none");
      loading.classList.add("d-none");

      if (filtradas.length === 0) {
        mensagem.textContent =
          tipo === "historico"
            ? "Nenhuma consulta no histórico."
            : "Nenhuma consulta futura agendada.";
        mensagem.classList.remove("d-none");
        return;
      }

      filtradas.forEach((c) => {
        const tr = document.createElement("tr");
        const data = new Date(c.dataHora).toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        });
        const status = normalizarStatus(c);

        if (tipo === "futuras") {
          tr.innerHTML = `
            <td>${c.nomeMedico ?? "—"}</td>
            <td>${c.CrmMedico ?? "—"}</td>
            <td>${data}</td>
            <td>${status}</td>
            <td>
              <button class="btn btn-sm btn-danger btn-cancelar" data-id="${c.idAgendamento}">
                Cancelar
              </button>
            </td>
          `;
        } else {
          tr.innerHTML = `
            <td>${c.nomeMedico ?? "—"}</td>
            <td>${c.CrmMedico ?? "—"}</td>
            <td>${data}</td>
            <td>${status}</td>
            <td>${c.motivoCancelamento ?? "—"}</td>
          `;
        }

        corpoTabela.appendChild(tr);
      });

      // Adiciona evento de cancelamento
      corpoTabela.querySelectorAll(".btn-cancelar").forEach((botao) => {
        botao.addEventListener("click", async () => {
          const id = botao.dataset.id;
          if (!id) return;

          if (!confirm("Tem certeza que deseja cancelar esta consulta?")) return;

          const motivo = prompt("Informe o motivo do cancelamento:", "Cancelamento pelo paciente");
          if (!motivo) return;

          try {
            await cancelarConsulta(id, motivo, token);
            alert("Consulta cancelada com sucesso!");
            await carregarConsultas("futuras");
            await carregarConsultas("historico");
          } catch (erro) {
            console.error("Erro ao cancelar consulta:", erro);
            alert("Erro ao cancelar a consulta.");
          }
        });
      });
    } catch (error) {
      console.error("Erro ao carregar consultas:", error);
      const mensagem = tipo === "historico" ? historicoMessage : futurasMessage;
      mensagem.textContent = "Erro ao carregar consultas.";
      mensagem.classList.remove("d-none");
    }
  }

  // Inicializa a aba de consultas futuras
  await carregarConsultas("futuras");

  // Alternância entre abas
  document.querySelectorAll('#consultaTabs a[data-bs-toggle="tab"]').forEach((aba) => {
    aba.addEventListener("shown.bs.tab", (event) => {
      const target = event.target.getAttribute("href");
      if (target === "#historico") carregarConsultas("historico");
      else if (target === "#futuras") carregarConsultas("futuras");
    });
  });
});
