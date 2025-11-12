// js/confirmar_agendamento.js

import { apiRequest } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const detalhesDiv = document.getElementById("detalhesContainer");
  const btnConfirmar = document.getElementById("btnConfirmar");
  const token = localStorage.getItem("token");

  const params = new URLSearchParams(window.location.search);
  const idMedico = params.get("idMedico");
  const dataHora = new Date(params.get("dataHora"));

  if (!idMedico || !dataHora) {
    detalhesDiv.innerHTML = `<div class="alert alert-danger">Dados do agendamento inválidos.</div>`;
    btnConfirmar.disabled = true;
    return;
  }

  try {
    const medico = await apiRequest(`/api/medicos/${idMedico}`, "GET", null, token);
    const usuario = await apiRequest("/api/pacientes/me", "GET", null, token);

    detalhesDiv.innerHTML = `
      <h4 class="mb-3 text-primary">Detalhes da Consulta</h4>
      <p><strong>Médico:</strong> ${medico.nome}</p>
      <p><strong>CRM:</strong> ${medico.crm}</p>
      <p><strong>Especialidade:</strong> ${medico.especialidade}</p>
      <p><strong>Paciente:</strong> ${usuario.nome}</p>
      <p><strong>Data e Hora:</strong> ${dataHora.toLocaleString("pt-BR")}</p>
      <div class="mt-3">
        <label for="observacoes" class="form-label">Observações</label>
        <textarea id="observacoes" class="form-control" rows="3" placeholder="Ex: levar exames anteriores..."></textarea>
      </div>
    `;

    btnConfirmar.addEventListener("click", async () => {
      const observacoes = document.getElementById("observacoes").value;

      try {
        const body = {
          idMedico: parseInt(idMedico),
          dataHora: dataHora.toISOString(),
          observacoes,
        };

        await apiRequest("/api/consultas/agendar", "POST", body, token);
        alert("Consulta agendada com sucesso!");
        window.location.href = "painel_paciente.html";
      } catch (err) {
        console.error(err);
        alert("Erro ao confirmar agendamento.");
      }
    });
  } catch (err) {
    console.error("Erro ao carregar detalhes:", err);
    detalhesDiv.innerHTML = `<div class="alert alert-danger">Erro ao carregar detalhes do médico ou paciente.</div>`;
  }
});
