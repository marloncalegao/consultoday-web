// js/cadastro.js
import { cadastrarPaciente, cadastrarMedico } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroForm");
  const tipo = document.getElementById("tipoUsuario");
  const msg = document.getElementById("cadastroMessage");
  const camposMedico = document.getElementById("camposMedico");

  tipo.addEventListener("change", () => {
    camposMedico.style.display = tipo.value === "medico" ? "block" : "none";
  });

  function showMessage(m, type = "danger") {
    msg.textContent = m;
    msg.className = `mt-3 alert alert-${type} d-block`;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = form.nome.value.trim();
    const email = form.email.value.trim();
    const cpf = form.cpf.value.trim();
    const telefone = form.telefone.value.trim();
    const senha = form.senha.value.trim();
    const confirmarSenha = form.confirmarSenha.value.trim();

    if (senha !== confirmarSenha) {
      showMessage("As senhas não coincidem!", "warning");
      return;
    }

    const dados = { nome, email, senha, cpf, telefone };

    try {
      if (tipo.value === "paciente") {
        await cadastrarPaciente(dados);
      } else {
        const crm = form.crm.value.trim();
        const especialidade = form.especialidade.value.trim();

        if (!crm || !especialidade) {
          showMessage("Preencha CRM e Especialidade para cadastrar médico!", "warning");
          return;
        }

        await cadastrarMedico({ ...dados, crm, especialidade });
      }

      showMessage("Cadastro realizado com sucesso!", "success");
      setTimeout(() => (window.location.href = "login.html"), 1500);
    } catch (err) {
      console.error("Erro no cadastro:", err);
      showMessage("Erro no cadastro: " + (err.message || "Falha inesperada"));
    }
  });
});
