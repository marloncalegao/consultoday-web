import { login } from "./api.js";
import { mostrarMensagem } from "./mensagens.js";


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value;
    const senha = form.senha.value;

    try {
      const response = await login(email, senha);

      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("userType", response.tipoUsuario || "");
        localStorage.setItem("userName", response.nome || "");
        localStorage.setItem("userId", response.id); // 👈 adiciona o ID do usuário

        mostrarMensagem("sucesso", "Login realizado com sucesso! Redirecionando...");

        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      } else {
        mostrarMensagem("erro", "Credenciais inválidas!", 1500);
      }
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      mostrarMensagem("erro", "Erro ao realizar login. Verifique os dados e tente novamente.", 1500);
    }
  });
});
