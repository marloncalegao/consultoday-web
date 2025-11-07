// Consultoday-web/js/paciente.js
import { apiRequest } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "login.html";
    return;
  }

  console.log("Token inicial:", token);

  await carregarConsultasFuturas(token);
  await carregarHistoricoConsultas(token);
});

// =============================
// 🔹 CONSULTAS FUTURAS
// =============================
async function carregarConsultasFuturas(token) {
  const loading = document.getElementById("futurasLoading");
  const tbody = document.getElementById("futurasTableBody");
  const msg = document.getElementById("futurasMessage");

  try {
    const page = await apiRequest("/api/consultas", "GET", null, token);
    const consultas = page?.content || [];

    loading.classList.add("d-none");
    tbody.innerHTML = "";

    const agora = new Date();
    const futuras = consultas.filter(
      (c) => new Date(c.dataHora) > agora && c.dataCancelamento === null
    );

    if (futuras.length === 0) {
      msg.textContent = "Nenhuma consulta futura encontrada.";
      msg.classList.remove("d-none");
      return;
    }

    futuras.forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.nomeMedico || "Não informado"}</td>
        <td>${c.CrmMedico || "-"}</td>
        <td>${formatarDataHora(c.dataHora)}</td>
        <td>${c.MotivoCancelamento ? "Cancelada" : "Agendada"}</td>
        <td>
          ${
            !c.dataCancelamento
              ? `<button class="btn btn-danger btn-sm" data-id="${c.idAgendamento}">Cancelar</button>`
              : "-"
          }
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Vincula eventos de cancelamento depois que as linhas são criadas
    tbody.querySelectorAll("button[data-id]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const idConsulta = btn.getAttribute("data-id");
        await cancelarConsulta(idConsulta, token);
      });
    });
  } catch (error) {
    console.error("Erro ao carregar consultas futuras:", error);
    msg.textContent = "Erro ao carregar suas consultas futuras.";
    msg.classList.remove("d-none");
    loading.classList.add("d-none");
  }
}

// =============================
// 🔹 HISTÓRICO DE CONSULTAS
// =============================
async function carregarHistoricoConsultas(token) {
  const loading = document.getElementById("historicoLoading");
  const tbody = document.getElementById("historicoTableBody");
  const msg = document.getElementById("historicoMessage");

  try {
    const page = await apiRequest("/api/consultas", "GET", null, token);
    const consultas = page?.content || [];

    loading.classList.add("d-none");
    tbody.innerHTML = "";

    const agora = new Date();
    const historico = consultas.filter(
      (c) => new Date(c.dataHora) <= agora || c.dataCancelamento !== null
    );

    if (historico.length === 0) {
      msg.textContent = "Nenhum histórico encontrado.";
      msg.classList.remove("d-none");
      return;
    }

    historico.forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.nomeMedico || "Não informado"}</td>
        <td>${c.CrmMedico || "-"}</td>
        <td>${formatarDataHora(c.dataHora)}</td>
        <td>${c.MotivoCancelamento ? "Cancelada" : "Concluída"}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    msg.textContent = "Erro ao carregar histórico de consultas.";
    msg.classList.remove("d-none");
    loading.classList.add("d-none");
  }
}

// =============================
// 🔹 UTILITÁRIO: formatar data
// =============================
function formatarDataHora(isoString) {
  const data = new Date(isoString);
  return data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// =============================
// 🔹 CANCELAR CONSULTA
// =============================
let bloqueado = false;

async function cancelarConsulta(idConsulta, token) {
  if (bloqueado) return;
  bloqueado = true;

  try {
    const motivo = prompt("Informe o motivo do cancelamento:");
    if (!motivo) return;

    console.log("Token enviado (cancelar):", token);

    await apiRequest(`/api/consultas/cancelar/${idConsulta}`, "DELETE", { motivo }, token);

    alert("Consulta cancelada com sucesso!");

    // 🔸 Espera um pouco antes de recarregar
    setTimeout(() => {
      carregarConsultasFuturas(token);
      carregarHistoricoConsultas(token);
    }, 500);
  } catch (err) {
    console.error("Erro ao cancelar consulta:", err);
  } finally {
    bloqueado = false;
  }
}
