import { apiRequest } from "./api.js";
import { mostrarMensagem } from "./mensagens.js";

document.addEventListener("DOMContentLoaded", async () => {

  const detalhesDiv = document.getElementById("detalhesContainer");
  const btnConfirmar = document.getElementById("btnConfirmar");

  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  const params = new URLSearchParams(window.location.search);
  const idMedico = params.get("idMedico");
  const dataHoraString = params.get("dataHora");

  if (userType !== "PACIENTE") {
    mostrarMensagem("Somente pacientes podem agendar consultas.", 1500);
    window.location.href = "index.html";
    return;
  }

  if (!idMedico || !dataHoraString) {
    detalhesDiv.innerHTML = `<div class="alert alert-danger">Dados do agendamento inválidos.</div>`;
    btnConfirmar.disabled = true;
    return;
  }

  const endpointUsuario = "/api/pacientes/me";

  try {
    const medico = await apiRequest(`/api/medicos/${idMedico}`, "GET", null, token);
    const usuario = await apiRequest(endpointUsuario, "GET", null, token);

    detalhesDiv.innerHTML = `
      <p><span class="confirm-label">Médico:</span> ${medico.nome}</p>
      <p><span class="confirm-label">CRM:</span> ${medico.crm}</p>
      <p><span class="confirm-label">Especialidade:</span> ${medico.especialidade}</p>
      <p><span class="confirm-label">Paciente:</span> ${usuario.nome}</p>
      <p><span class="confirm-label">Data e Hora:</span> 
        ${new Date(dataHoraString).toLocaleString("pt-BR")}
      </p>

      <div class="mt-3">
        <label class="form-label fw-semibold">Observações</label>
        <textarea id="observacoes" class="form-control" rows="3"
        placeholder="Ex: levar exames anteriores..."></textarea>
      </div>
    `;

    btnConfirmar.addEventListener("click", async () => {
      const observacoes = document.getElementById("observacoes")?.value || "";

      try {
        const body = {
          idMedico: parseInt(idMedico),
          dataHora: dataHoraString,
          observacoes,
        };

        await apiRequest("/api/consultas/agendar", "POST", body, token);

        mostrarMensagem("sucesso", "Consulta agendada com sucesso!", 1500);
        window.location.href = "minhas_consultas.html";

      } catch (err) {
        console.error(err);
        mostrarMensagem("erro", "Erro ao confirmar agendamento.", 1500);
      }
    });

  } catch (err) {
    console.error("Erro ao carregar detalhes:", err);
    detalhesDiv.innerHTML = `<div class="alert alert-danger">Erro ao carregar detalhes do médico ou paciente.</div>`;
  }
});
