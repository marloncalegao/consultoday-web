// js/editar_perfil.js
// Versão robusta do script de editar perfil — tenta médico -> paciente,
// popula campos (exibe campos não editáveis com mensagem), altera dados,
// altera senha e exclui conta usando os helpers já existentes em api.js.

import {
  getMedicoLogado,
  getPacienteLogado,
  atualizarMedico,
  atualizarPaciente,
  excluirMedico,
  excluirPaciente,
} from "./api.js";

import { mostrarMensagem } from "./mensagens.js";

// ====== inicialização ======
document.addEventListener("DOMContentLoaded", () => {
  // carregar perfil e configurar eventos
  carregarPerfil().then(() => configurarEventos());
});

const token = localStorage.getItem("token");
const tipoArmazenado = localStorage.getItem("tipoUsuario") || localStorage.getItem("userType") || null;
let tipo = tipoArmazenado ? tipoArmazenado.toUpperCase() : null; // 'PACIENTE' ou 'MEDICO' ou null
const id = localStorage.getItem("id") || localStorage.getItem("userId") || null;

/* ===========================================================
   FUNÇÃO: tentar obter perfil (tenta /me do médico e depois paciente)
   - Se 403 em médico, faz fallback para paciente
   - Se tudo falhar exibe alerta e sugere login
   =========================================================== */
async function carregarPerfil() {
  try {
    // se o tipo já estiver armazenado e for MEDICO/PACIENTE, priorize
    if (tipo === "MEDICO") {
      const dados = await safeGetMedico();
      if (dados) return preencherCampos(dados, "MEDICO");
      // se falhar, continue para tentar paciente
    } else if (tipo === "PACIENTE") {
      const dados = await safeGetPaciente();
      if (dados) return preencherCampos(dados, "PACIENTE");
    }

    // tentativa geral: tenta médico primeiro (caso token pertença a médico)
    const medico = await safeGetMedico();
    if (medico) {
      tipo = "MEDICO";
      return preencherCampos(medico, "MEDICO");
    }

    const paciente = await safeGetPaciente();
    if (paciente) {
      tipo = "PACIENTE";
      return preencherCampos(paciente, "PACIENTE");
    }


    // nada funcionou
    mostrarMensagem("erro", "Não foi possível carregar os dados do perfil. Faça login novamente.", 1500);
    // opcional: redirecionar para login
    // window.location.href = "login.html";
  } catch (err) {
    console.error("Erro ao carregar perfil (não esperado):", err);
    mostrarMensagem("erro", "Erro ao carregar perfil. Faça login novamente.", 1500);
  }
}

/* wrappers seguros que capturam 403 e retornam null ao invés de lançar */
async function safeGetMedico() {
  try {
    return await getMedicoLogado(token);
  } catch (err) {
    // somente log para debug
    console.debug("safeGetMedico falhou:", err && String(err));
    return null;
  }
}
async function safeGetPaciente() {
  try {
    return await getPacienteLogado(token);
  } catch (err) {
    console.debug("safeGetPaciente falhou:", err && String(err));
    return null;
  }
}

/* ===========================================================
   Preenche DOM com os dados e ajusta visibilidades
   =========================================================== */
function preencherCampos(dados, tipoDetectado) {
  // garantir forms existem
  const form = document.getElementById("formEditarPerfil");
  const formSenha = document.getElementById("formAlterarSenha");
  if (!form || !formSenha) {
    console.warn("Formulários não encontrados no HTML (ids esperados: formEditarPerfil, formAlterarSenha)");
    return;
  }

  // campos editáveis
  const nomeEl = document.getElementById("nome");
  const emailEl = document.getElementById("email");
  const telefoneEl = document.getElementById("telefone");
  const cidadeEl = document.getElementById("cidade");

  if (nomeEl) nomeEl.value = dados.nome ?? "";
  if (emailEl) emailEl.value = dados.email ?? "";
  if (telefoneEl) telefoneEl.value = dados.telefone ?? "";
  if (cidadeEl) cidadeEl.value = dados.cidade ?? "";

  // campos não-editáveis (mostra e preenche quando existir)
  // PACIENTE: cpf
  const cpfGroup = document.getElementById("cpfGroup");
  const cpfEl = document.getElementById("cpf");
  if (tipoDetectado === "PACIENTE") {
    if (cpfGroup) cpfGroup.classList.remove("d-none");
    if (cpfEl) {
      cpfEl.value = dados.cpf ?? "";
      cpfEl.setAttribute("disabled", "disabled");
    }
  } else {
    if (cpfGroup) cpfGroup.classList.add("d-none");
  }

  // MEDICO: crm + especialidade
  const crmGroup = document.getElementById("crmGroup");
  const crmEl = document.getElementById("crm");
  const espGroup = document.getElementById("espGroup");
  const espEl = document.getElementById("especialidade");

  if (tipoDetectado === "MEDICO") {
    if (crmGroup) crmGroup.classList.remove("d-none");
    if (crmEl) {
      crmEl.value = dados.crm ?? "";
      crmEl.setAttribute("disabled", "disabled");
    }

    if (espGroup) espGroup.classList.remove("d-none");
    if (espEl) {
      espEl.value = dados.especialidade ?? "";
      espEl.setAttribute("disabled", "disabled");
    }
  } else {
    if (crmGroup) crmGroup.classList.add("d-none");
    if (espGroup) espGroup.classList.add("d-none");
  }

  // atualizar 'tipo' global de runtime
  tipo = tipoDetectado;

  // habilitar formulários / botões (caso estivessem desabilitados)
  const btnSalvar = document.getElementById("btnSalvarPerfil");
  if (btnSalvar) btnSalvar.disabled = false;
  const btnExcluir = document.getElementById("btnExcluirConta");
  if (btnExcluir) btnExcluir.disabled = false;
}

/* helper: adiciona pequena mensagem explicativa abaixo do group */
function ensureHelperText(groupEl, message) {
  if (!groupEl) return;
  let hint = groupEl.querySelector(".non-editable-hint");
  if (!hint) {
    hint = document.createElement("div");
    hint.className = "small text-muted non-editable-hint mt-1";
    groupEl.appendChild(hint);
  }
  hint.textContent = message;
}

/* ===========================================================
   CONFIGURA EVENTOS (submit forms, excluir)
   =========================================================== */
function configurarEventos() {
  // salvar alterações de perfil
  const form = document.getElementById("formEditarPerfil");
  if (form) form.addEventListener("submit", salvarAlteracoes);

  // alterar senha
  const formSenha = document.getElementById("formAlterarSenha");
  if (formSenha) formSenha.addEventListener("submit", alterarSenha);

  // toggle visibilidade senha (botoes com classe 'toggleSenhaBtn' e data-target)
  document.querySelectorAll(".toggleSenhaBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      const icon = btn.querySelector("i");
      if (icon) icon.classList.toggle("bi-eye-slash");
    });
  });

  // excluir conta
  const btnExcluir = document.getElementById("btnExcluirConta");
  if (btnExcluir) {
    btnExcluir.addEventListener("click", excluirConta);
  }
}

/* ===========================================================
   SALVAR ALTERAÇÕES (nome, email, telefone)
   =========================================================== */
async function salvarAlteracoes(e) {
  e.preventDefault();
  const nome = (document.getElementById("nome")?.value || "").trim();
  const email = (document.getElementById("email")?.value || "").trim();
  const telefone = (document.getElementById("telefone")?.value || "").trim();

  if (!nome || !email) {
    mostrarMensagem("erro", "Nome e e-mail são obrigatórios.", 1500);
    return;
  }

  const body = { nome, email, telefone};

  try {
    if (tipo === "MEDICO") {
      await atualizarMedico(id, body, token);
    } else {
      await atualizarPaciente(id, body, token);
    }
    mostrarMensagem("sucesso", "Perfil atualizado com sucesso!", 1500);
    // atualizar a UI com novos dados
    carregarPerfil();
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    mostrarMensagem("erro", "Erro ao atualizar perfil: " + err.message, 1500);
  }
}

/* ===========================================================
   ALTERAR SENHA
   OBS: depende do backend aceitar um DTO contendo senhaAtual/novaSenha
   no endpoint de atualização do usuário. Se o backend exigir outro
   endpoint, ajuste para chamá-lo.
   =========================================================== */
async function alterarSenha(e) {
  e.preventDefault();
  const senhaAtual = (document.getElementById("senhaAtual")?.value || "").trim();
  const novaSenha = (document.getElementById("novaSenha")?.value || "").trim();
  const confirmar = (document.getElementById("confirmarSenha")?.value || "").trim();

  if (!senhaAtual || !novaSenha || !confirmar) {
    mostrarMensagem("Preencha todos os campos de senha.", 1500);
    return;
  }
  if (novaSenha !== confirmar) {
    mostrarMensagem("erro", "As senhas não coincidem.", 1500);
    return;
  }

  const body = { senhaAtual, novaSenha };

  try {
    // muitos backends esperam DTO separado para senha — aqui usamos mesmo endpoint de atualizar
    if (tipo === "MEDICO") {
      await atualizarMedico(id, body, token);
    } else {
      await atualizarPaciente(id, body, token);
    }
    mostrarMensagem("sucesso", "Senha alterada com sucesso!", 1500);
    document.getElementById("formAlterarSenha")?.reset();
  } catch (err) {
    console.error("Erro ao alterar senha:", err);
    mostrarMensagem("erro", "Erro ao alterar senha: " + err.message, 1500);
  }
}

/* ===========================================================
   EXCLUIR CONTA
   - chama excluirPaciente/excluirMedico conforme presente no api.js
   =========================================================== */
async function excluirConta() {
  if (!confirm("Tem certeza que deseja excluir sua conta? Esta ação pode ser revertida apenas pelo suporte.")) return;

  try {
    if (tipo === "MEDICO") {
      await excluirMedico(id, token);
    } else {
      await excluirPaciente(id, token);
    }
    mostrarMensagem("sucesso", "Conta excluída com sucesso.", 1500);
    localStorage.clear();
    window.location.href = "index.html";
  } catch (err) {
    console.error("Erro ao excluir conta:", err);
    mostrarMensagem("erro", "Erro ao excluir conta: " + err.message, 1500);
  }
}
