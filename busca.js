// Consultoday-web/js/busca.js
import { apiRequest } from "./api.js";

async function buscarConsultas() {
  const termo = document.getElementById("busca").value;

  try {
    const resultados = await apiRequest(`/api/consultas?termo=${termo}`, "GET");
    const lista = document.getElementById("resultadoBusca");
    lista.innerHTML = "";

    resultados.forEach(r => {
      const li = document.createElement("li");
      li.textContent = `Consulta com ${r.medico} em ${r.data}`;
      lista.appendChild(li);
    });
  } catch (error) {
    console.error("Erro ao buscar consultas:", error);
  }
}

document.getElementById("btnBuscar").addEventListener("click", buscarConsultas);
