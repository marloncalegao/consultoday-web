// js/api.js

const BASE_URL =
  window.location.hostname.includes("localhost") ||
  window.location.hostname.includes("127.0.0.1")
    ? "http://localhost:8080"
    : "https://seu-dominio-em-producao.com";

export async function apiRequest(endpoint, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (token) console.log("Token enviado:", token);

  const response = await fetch(`http://localhost:8080${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
    credentials: "include"
  });

  if (!response.ok) {
    console.error("Erro na API:", response.status, await response.text());
    throw new Error(`Erro ${response.status}`);
  }

  try {
    return await response.json();
  } catch {
    return {};
  }
  
}

export async function login(email, senha) {
  return apiRequest("/auth/login", "POST", { email, senha });
}

/**
 * Cadastro de paciente
 * @param {object} dados - { nome, email, senha, cpf, telefone }
 */
export async function cadastrarPaciente(dados) {
  return apiRequest("/api/pacientes/cadastrar", "POST", dados);
}

/**
 * Cadastro de médico
 * @param {object} dados - { nome, email, senha, cpf, telefone, crm, especialidade }
 */
export async function cadastrarMedico(dados) {
  return apiRequest("/api/medicos/cadastrar", "POST", dados);
}

/**
 * Lista de médicos
 * @param {object} [params] - filtros opcionais (ex: especialidade)
 */
export async function getMedicos(params = {}) {
  const queryParams = new URLSearchParams(params).toString();
  return apiRequest(`/api/medicos${queryParams ? `?${queryParams}` : ""}`, "GET");
}

/**
 * Detalhes de um médico por ID
 */
export async function getMedicoById(id) {
  return apiRequest(`/api/medicos/${id}`, "GET");
}

/**
 * Agendar uma consulta
 * @param {object} dados - { medicoId, data, tipo }
 * @param {string} token - JWT do paciente logado
 */
export async function agendarConsulta(dados, token) {
  return apiRequest("/api/consultas/agendar", "POST", dados, token);
}

/**
 * Listar consultas do usuário logado
 */
export async function getConsultas(token) {
  return apiRequest("/api/consultas", "GET", null, token);
}

/**
 * Cancelar uma consulta
 */
export async function cancelarConsulta(idConsulta, token) {
  return apiRequest(`/api/consultas/cancelar/${idConsulta}`, "PUT", null, token);
}

/**
 * Concluir consulta (para médicos)
 */
export async function concluirConsulta(idConsulta, token) {
  return apiRequest(`/api/consultas/concluir/${idConsulta}`, "PUT", null, token);
}

/**
 * Buscar perfil do usuário logado
 * @param {"PACIENTE"|"MEDICO"} tipo
 * @param {number} id
 * @param {string} token
 */
export async function getMeuPerfil(tipo, id, token) {
  const endpoint =
    tipo === "PACIENTE"
      ? `/api/pacientes/${id}`
      : `/api/medicos/${id}`;
  return apiRequest(endpoint, "GET", null, token);
}

/**
 * Atualizar perfil de paciente
 */
export async function atualizarPaciente(id, body, token) {
  return apiRequest(`/api/pacientes/atualizar/${id}`, "PUT", body, token);
}

/**
 * Atualizar perfil de médico
 */
export async function atualizarMedico(id, body, token) {
  return apiRequest(`/api/medicos/atualizar/${id}`, "PUT", body, token);
}

/**
 * Excluir conta de paciente
 */
export async function excluirPaciente(id, senhaAtual, token) {
  return apiRequest(`/api/pacientes/excluir/${id}`, "DELETE", { senhaAtual }, token);
}

/**
 * Excluir conta de médico
 */
export async function excluirMedico(id, senhaAtual, token) {
  return apiRequest(`/api/medicos/excluir/${id}`, "DELETE", { senhaAtual }, token);
}
