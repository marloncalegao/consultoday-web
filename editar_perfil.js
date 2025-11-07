// Consultoday-web/js/editar_perfil.js
import { apiRequest } from "./api.js";

async function atualizarPerfil() {
  const token = localStorage.getItem("token");
  const dados = {
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    telefone: document.getElementById("telefone").value
  };

  try {
    await apiRequest("/api/pacientes/atualizar/1", "PUT", dados, token); // id do paciente
    alert("Perfil atualizado com sucesso!");
  } catch (error) {
    alert("Erro ao atualizar perfil.");
    console.error(error);
  }
}

document.getElementById("btnSalvar").addEventListener("click", atualizarPerfil);
