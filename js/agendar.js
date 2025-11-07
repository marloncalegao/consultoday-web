// Consultoday-web/js/agendar.js
import { apiRequest } from "./api.js";

async function agendarConsulta() {
  const dados = {
    pacienteId: document.getElementById("pacienteId").value,
    medicoId: document.getElementById("medicoId").value,
    data: document.getElementById("data").value,
    hora: document.getElementById("hora").value
  };

  try {
    await apiRequest("/api/consultas/agendar", "POST", dados);
    alert("Consulta agendada com sucesso!");
  } catch (error) {
    alert("Erro ao agendar consulta.");
    console.error(error);
  }
}

document.getElementById("btnAgendar").addEventListener("click", agendarConsulta);
