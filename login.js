// Consultoday-web/js/login.js
import { login } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("loginMessage");

  function showMessage(m, type = "danger") {
    msg.textContent = m;
    msg.className = `mt-3 alert alert-${type} d-block`;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value;
    const senha = form.senha.value;

    try {
      const data = await login(email, senha);
      localStorage.setItem("token", data.token);

      showMessage("Login realizado com sucesso!", "success");
      setTimeout(() => {
        window.location.href = "painel_paciente.html";
      }, 1000);
    } catch (err) {
      console.error("Erro no login:", err);
      showMessage("Falha no login. Verifique suas credenciais.");
    }
  });
});
