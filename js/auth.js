// js/auth.js
import { apiRequest } from "./api.js";

async function login() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!email || !senha) {
    alert("Preencha e-mail e senha.");
    return;
  }

  try {
    const data = await apiRequest("/auth/login", "POST", { email, senha });
    console.log("Resposta do login:", data);

    // pega o token, id e tipo independentemente do nome que o backend usa
    const token =
      data.token || data.tokenJWT || data.accessToken || data.jwt || null;
    const id =
      data.id || data.userId || data.usuarioId || data.usuario_id || null;
    const tipo =
      data.tipoUsuario || data.tipo || data.role || data.perfil || null;
    const nome = data.nome || data.userName || data.username || "Usuário";

    if (!token || !id || !tipo) {
      console.error("Login retornou dados inválidos:", data);
      alert("Erro ao efetuar login — dados incompletos retornados do servidor.");
      return;
    }

    // salva no localStorage (padronizado)
    localStorage.setItem("token", token);
    localStorage.setItem("userId", id);
    localStorage.setItem("userType", tipo.toUpperCase());
    localStorage.setItem("userName", nome);

    alert("Login realizado com sucesso!");
    console.log("Login salvo no localStorage:", { token, id, tipo });

    // redireciona
    if (tipo.toUpperCase() === "MEDICO") {
      window.location.href = "painel_medico.html";
    } else {
      window.location.href = "painel_paciente.html";
    }
  } catch (err) {
    console.error("Erro no login:", err);
    alert("Falha no login. Verifique suas credenciais.");
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

document.getElementById("btnLogin")?.addEventListener("click", login);
document.getElementById("logoutButton")?.addEventListener("click", logout);
