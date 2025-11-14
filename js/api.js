// js/api.js

// Detecta automaticamente se está rodando em localhost ou produção
const BASE_URL =
  window.location.hostname.includes("localhost") ||
  window.location.hostname.includes("127.0.0.1")
    ? "http://localhost:8080"
    : "https://seu-dominio-em-producao.com";

/* ======================================================
   Recuperação Inteligente do Token
====================================================== */
function recuperarTokenDoLocalStorage() {
  const keys = [
    "token",
    "accessToken",
    "authToken",
    "jwt",
    "userToken",
    "auth",
    "loginResponse",
    "dadosLogin",
  ];

  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      if (parsed?.token) return parsed.token;
      if (parsed?.accessToken) return parsed.accessToken;
      if (parsed?.tokenJWT) return parsed.tokenJWT;

      const values = Object.values(parsed);
      for (const v of values) {
        if (typeof v === "string" && v.split(".").length === 3) return v;
      }
    } catch {
      if (raw.split(".").length === 3) return raw;
    }
  }

  const fallback = localStorage.getItem("token");
  if (fallback?.split(".").length === 3) return fallback;

  return null;
}

/* ======================================================
   Requisição Genérica
====================================================== */
export async function apiRequest(endpoint, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };

  const effectiveToken = token ?? recuperarTokenDoLocalStorage();
  if (effectiveToken) {
    headers["Authorization"] = `Bearer ${effectiveToken}`;
    console.log("apiRequest - Authorization header presente");
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!response.ok) {
    let errorText = `HTTP ${response.status}`;

    try {
      const ct = response.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        const json = await response.json();
        if (json.message) errorText = json.message;
        else if (json.error) errorText = json.error;
        else errorText = JSON.stringify(json);
      } else {
        errorText = await response.text();
      }
    } catch {}

    console.error("Erro na API:", response.status, errorText);
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }

  if (response.status === 204) return null;

  try {
    return await response.json();
  } catch {
    return {};
  }
}

/* ======================================================
   LOGIN
====================================================== */
export async function login(email, senha) {
  return apiRequest("/auth/login", "POST", { email, senha });
}

/* ======================================================
   PACIENTES
====================================================== */
export async function cadastrarPaciente(dados) {
  return apiRequest("/api/pacientes/cadastrar", "POST", dados);
}

export async function atualizarPaciente(id, body, token = null) {
  return apiRequest(`/api/pacientes/atualizar/${id}`, "PUT", body, token);
}

export async function excluirPaciente(id, token = null) {
  return apiRequest(`/api/pacientes/excluir/${id}`, "DELETE", null, token);
}

export async function getPacienteLogado(token = null) {
  return apiRequest("/api/pacientes/me", "GET", null, token);
}

/* ======================================================
   MÉDICOS
====================================================== */
export async function cadastrarMedico(dados) {
  return apiRequest("/api/medicos/cadastrar", "POST", dados);
}

export async function atualizarMedico(id, body, token = null) {
  return apiRequest(`/api/medicos/atualizar/${id}`, "PUT", body, token);
}

export async function excluirMedico(id, token = null) {
  return apiRequest(`/api/medicos/excluir/${id}`, "DELETE", null, token);
}

export async function getMedicoLogado(token = null) {
  return apiRequest("/api/medicos/me", "GET", null, token);
}

/* ======================================================
   BUSCA DE MÉDICOS (PÚBLICA)
====================================================== */
export async function buscarMedicosAvancado(filtros = {}, token = null) {
  const params = new URLSearchParams();

  if (filtros.nome) params.append("nome", filtros.nome);
  if (filtros.especialidade) params.append("especialidade", filtros.especialidade);
  if (filtros.cidade) params.append("cidade", filtros.cidade);

  const query = params.toString() ? `?${params}` : "";

  return apiRequest(`/api/medicos${query}`, "GET", null, token);
}

/* ======================================================
   HORÁRIOS DE CONSULTA
====================================================== */
export async function getHorariosDisponiveis(idMedico, token = null) {
  return apiRequest(`/api/consultas/disponiveis/${idMedico}`, "GET", null, token);
}

/* ======================================================
   CANCELAMENTO DE CONSULTA
====================================================== */
export async function cancelarConsulta(id, motivo, token = null) {
  return apiRequest(`/api/consultas/cancelar/${id}`, "DELETE", { motivo }, token);
}
