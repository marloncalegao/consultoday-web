// Consultoday-web/js/medico.js
import { apiRequest } from "./api.js";

async function carregarMedicos() {
  try {
    const medicos = await apiRequest("/api/medicos", "GET");
    const lista = document.getElementById("listaMedicos");
    lista.innerHTML = "";

    medicos.forEach(m => {
      const li = document.createElement("li");
      li.textContent = `${m.nome} - ${m.especialidade}`;
      lista.appendChild(li);
    });
  } catch (error) {
    console.error("Erro ao carregar médicos:", error);
  }
}

async function excluirMedico(id) {
  try {
    await apiRequest(`/api/medicos/excluir/${id}`, "DELETE");
    alert("Médico excluído com sucesso!");
    carregarMedicos();
  } catch (error) {
    alert("Erro ao excluir médico.");
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", carregarMedicos);
