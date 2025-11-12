// js/api.js

const BASE_URL =
  window.location.hostname.includes("localhost") ||
  window.location.hostname.includes("127.0.0.1")
    ? "http://localhost:8080"
    : "https://seu-dominio-em-producao.com";

/**
 * Tenta recuperar token a partir de várias chaves possíveis no localStorage.
 * Retorna null se não encontrar.
 */
function recuperarTokenDoLocalStorage() {
  // chaves possíveis que seu projeto pode ter usado
  const candidates = [
    "token",
    "accessToken",
    "authToken",
    "jwt",
    "userToken",
    // talvez salvou objeto JSON na key "auth" ou "login"
    "auth",
    "loginResponse",
    "dadosLogin",
  ];

  for (const key of candidates) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    // se for JSON, tenta parsear e encontrar campo token / tokenJWT / accessToken
    try {
      const parsed = JSON.parse(raw);
      if (!parsed) continue;
      if (parsed.token) return parsed.token;
      if (parsed.tokenJWT) return parsed.tokenJWT;
      if (parsed.accessToken) return parsed.accessToken;
      if (parsed.data && parsed.data.token) return parsed.data.token;
      // se objeto tem alguma propriedade parecida
      const values = Object.values(parsed).flat?.() ?? Object.values(parsed);
      for (const v of values) {
        if (typeof v === "string" && v.split(".").length === 3) return v; // provável JWT
      }
    } catch {
      // não JSON: raw pode ser o próprio token string
      if (raw.split(".").length === 3) return raw;
    }
  }

  // fallback: check "token" explicitamente (novamente)
  const t = localStorage.getItem("token");
  if (t && t.split(".").length === 3) return t;

  return null;
}

/**
 * Função genérica para requisições.
 * Se token parâmetro for nulo, tenta recuperar do localStorage (fallback).
 */
export async function apiRequest(endpoint, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };

  // se não passou token, tenta recuperar do localStorage
  const effectiveToken = token ?? recuperarTokenDoLocalStorage();
  if (effectiveToken) headers["Authorization"] = `Bearer ${effectiveToken}`;

  // DEBUG opcional (comente/descomente para menos logs)
  if (effectiveToken) console.log("apiRequest - Authorization header presente");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!response.ok) {
    // tenta extrair mensagem amigável do corpo
    let errorText = `HTTP ${response.status}`;
    try {
      const ct = response.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        const j = await response.json();
        // checa campos comuns
        if (j.message) errorText = j.message;
        else if (j.error) errorText = j.error;
        else errorText = JSON.stringify(j);
      } else {
        errorText = await response.text();
      }
    } catch (e) {
      // fallback
    }
    console.error("Erro na API:", response.status, errorText);
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }

  // 204 No Content
  if (response.status === 204) return null;

  // tenta retornar JSON, senão retorna texto vazio
  try {
    return await response.json();
  } catch {
    return {};
  }
}

/* ---------- Export helpers ---------- */

export async function login(email, senha) {
  return apiRequest("/auth/login", "POST", { email, senha });
}

/* Pacientes */
export async function cadastrarPaciente(dados) {
  return apiRequest("/api/pacientes/cadastrar", "POST", dados);
}
export async function atualizarPaciente(id, body, token = null) {
  return apiRequest(`/api/pacientes/atualizar/${id}`, "PUT", body, token);
}
export async function excluirPaciente(id, senhaAtual, token = null) {
  return apiRequest(`/api/pacientes/excluir/${id}`, "DELETE", { senhaAtual }, token);
}

/* Medicos */
export async function cadastrarMedico(dados) {
  return apiRequest("/api/medicos/cadastrar", "POST", dados);
}
export async function atualizarMedico(id, body, token = null) {
  return apiRequest(`/api/medicos/atualizar/${id}`, "PUT", body, token);
}
export async function excluirMedico(id, senhaAtual, token = null) {
  return apiRequest(`/api/medicos/excluir/${id}`, "DELETE", { senhaAtual }, token);
}

/* Perfil / leitura de usuário */
export async function getUsuarioPorId(tipo, id, token) {
  const endpoint =
    tipo === "PACIENTE"
      ? `/api/pacientes/me`
      : `/api/medicos/me`;
  return apiRequest(endpoint, "GET", null, token);
}

/* Consultas (Agendamentos) */
export async function cancelarConsulta(id, motivo, token = null) {
  return apiRequest(`/api/consultas/cancelar/${id}`, "DELETE", { motivo }, token);
}

/* =============================
 *  MÉDICOS - BUSCA
 * ============================= */
export async function buscarMedicosAvancado(filtros = {}, token = null) {
  const params = new URLSearchParams();

  if (filtros.nome) params.append("nome", filtros.nome);
  if (filtros.especialidade) params.append("especialidade", filtros.especialidade);
  if (filtros.cidade) params.append("cidade", filtros.cidade);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  return apiRequest(`/api/medicos${queryString}`, "GET", null, token);
}

/* =============================
 *  CONSULTAS - HORÁRIOS DISPONÍVEIS
 * ============================= */
export async function getHorariosDisponiveis(idMedico, token = null) {
  return apiRequest(`/api/consultas/disponiveis/${idMedico}`, "GET", null, token);
}



