// Consultoday-web/js/auth.js
import { apiRequest } from "./api.js";

async function login() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  try {
    const data = await apiRequest("/auth/login", "POST", { email, senha });
    console.log("Resposta do login:", data);

    if (!data.token) {
      alert("Erro: o servidor não retornou um token válido.");
      return;
    }

    // salva o token
    localStorage.setItem("token", data.token);

    alert("Login realizado com sucesso!");
    // redireciona para o painel
    setTimeout(() => (window.location.href = "painel_paciente.html"), 500);
  } catch (err) {
    console.error("Erro no login:", err);
    alert("Falha no login. Verifique suas credenciais.");
  }
}

// logout simples
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// adiciona listeners apenas se os botões existirem
document.getElementById("btnLogin")?.addEventListener("click", login);
document.getElementById("logoutButton")?.addEventListener("click", logout);
