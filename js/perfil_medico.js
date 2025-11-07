// js/perfil_medico.js
import { apiFetch } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const id = new URLSearchParams(window.location.search).get("id");
    const container = document.getElementById("perfilMedico");

    try {
        const medico = await apiFetch(`/api/medicos/${id}`, { method: "GET" });
        container.innerHTML = `
            <h2>${medico.nome}</h2>
            <p><strong>Especialidade:</strong> ${medico.especialidade}</p>
            <p><strong>CRM:</strong> ${medico.crm}</p>
        `;
    } catch {
        container.innerHTML = "<p>Erro ao carregar perfil.</p>";
    }
});
