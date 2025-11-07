// Consultoday-web/js/index.js
import { apiRequest } from "./api.js";

async function listarConsultas() {
  try {
    const consultas = await apiRequest("/api/consultas", "GET");
    const lista = document.getElementById("listaConsultas");
    lista.innerHTML = "";

    consultas.forEach(c => {
      const li = document.createElement("li");
      li.textContent = `${c.medico} - ${c.data}`;
      lista.appendChild(li);
    });
  } catch (error) {
    console.error("Erro ao listar consultas:", error);
  }
}

document.addEventListener("DOMContentLoaded", listarConsultas);
