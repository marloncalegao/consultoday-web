// js/editar_perfil.js
import { getUsuarioPorId, atualizarPaciente, atualizarMedico, apiRequest } from "./api.js";

function mostrarMensagem(tipo, texto) {
  const msgEl = document.getElementById("profileMessage");
  if (!msgEl) {
    alert(texto);
    return;
  }

  msgEl.classList.remove("d-none", "alert-success", "alert-danger");
  msgEl.classList.add(tipo === "sucesso" ? "alert-success" : "alert-danger");
  msgEl.textContent = texto;
}

document.addEventListener("DOMContentLoaded", async () => {
  // Recupera dados do localStorage
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId") || localStorage.getItem("userid");
  const userType = localStorage.getItem("userType");

  // Se não estiver logado, redireciona
  if (!token || !userId || !userType) {
    console.warn("Usuário não autenticado, redirecionando...");
    window.location.href = "login.html";
    return;
  }

  console.log("DEBUG storage:", {
  token: localStorage.getItem("token"),
  userId: localStorage.getItem("userId"),
  userType: localStorage.getItem("userType"),
});

  console.log("Editar perfil → token encontrado?", !!token, "| userId:", userId, "| userType:", userType);

  // Carrega dados do perfil logado
  try {
    const perfil = await getUsuarioPorId(userType, userId, token);
    console.log("Perfil carregado:", perfil);

    document.getElementById("nome").value = perfil.nome ?? perfil.nomeCompleto ?? "";
    document.getElementById("email").value = perfil.email ?? "";
    const telefone = Object.entries(perfil)
  .find(([key]) => key.toLowerCase().includes("tel") || key.toLowerCase().includes("fone"))?.[1];

document.getElementById("telefone").value = telefone ?? "";


    // Se for médico, exibe campos adicionais
    if (userType === "MEDICO") {
      document.getElementById("camposMedico")?.classList.remove("d-none");
      document.getElementById("crm").value = perfil.crm ?? "";
      document.getElementById("especialidade").value = perfil.especialidade ?? "";
    }

    document.getElementById("loadingIndicator")?.classList.add("d-none");
    document.getElementById("profileContent")?.classList.remove("d-none");
  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
    mostrarMensagem("erro", "Falha ao carregar dados do perfil. Faça login novamente.");
    return;
  }

  // Salvando alterações
  const form = document.getElementById("profileForm");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = {
      nome: document.getElementById("nome").value.trim(),
      telefone: document.getElementById("telefone").value.trim(),
    };

    try {
      if (userType === "MEDICO") {
        await atualizarMedico(userId, dados, token);
      } else {
        await atualizarPaciente(userId, dados, token);
      }
      mostrarMensagem("sucesso", "Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      mostrarMensagem("erro", "Erro ao atualizar perfil. Verifique os dados.");
    }
  });

  // Exclusão de conta
  document.getElementById("excluirContaButton")?.addEventListener("click", async () => {
    if (!confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível.")) return;

    try {
      const endpoint =
        userType === "MEDICO"
          ? `/api/medicos/excluir/${userId}`
          : `/api/pacientes/excluir/${userId}`;

      await apiRequest(endpoint, "DELETE", null, token);
      alert("Conta excluída com sucesso!");
      localStorage.clear();
      window.location.href = "index.html";
    } catch (err) {
      console.error("Erro ao excluir conta:", err);
      mostrarMensagem("erro", "Falha ao excluir conta.");
    }
  });
});
