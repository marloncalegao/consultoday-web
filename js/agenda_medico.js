import { apiRequest } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Página de agenda do médico carregada (modo global FullCalendar).");

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const listaHorarios = document.getElementById("lista-horarios");
  const dataSelecionadaSpan = document.getElementById("data-selecionada");
  const btnAdicionar = document.getElementById("btnAdicionar");
  const novoHorarioInput = document.getElementById("novoHorario");

  let dataSelecionada = null;

  // 🔹 Usa a variável global injetada pelo bundle
  const calendarEl = document.getElementById("calendar");
  const calendar = new window.FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "pt-br",
    height: "auto",
    selectable: true,
    dateClick: async (info) => {
      dataSelecionada = info.dateStr;
      dataSelecionadaSpan.textContent = new Date(dataSelecionada).toLocaleDateString("pt-BR");
      await carregarHorarios();
    },
  });

  calendar.render();

  // === FUNÇÃO: CARREGAR HORÁRIOS ===
  async function carregarHorarios() {
    listaHorarios.innerHTML = "<p>Carregando horários...</p>";

    if (!dataSelecionada) {
      listaHorarios.innerHTML = "<p>Selecione um dia no calendário.</p>";
      return;
    }

    try {
      const horarios = await apiRequest(`/api/agenda-medico?date=${dataSelecionada}`, "GET", null, token);
      listaHorarios.innerHTML = "";

      if (!horarios || horarios.length === 0) {
        listaHorarios.innerHTML = "<p>Nenhum horário disponível neste dia.</p>";
        return;
      }

      horarios.forEach((slot) => {
        const div = document.createElement("div");
        div.className = `horario ${slot.disponivel ? "disponivel" : "bloqueado"}`;
        const hora = new Date(slot.dataHora).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        div.innerHTML = `
          <span><b>${hora}</b></span>
          <button class="btn btn-sm ${slot.disponivel ? "btn-danger" : "btn-success"}">
            ${slot.disponivel ? "Bloquear" : "Liberar"}
          </button>
        `;

        const btn = div.querySelector("button");
        btn.addEventListener("click", async () => {
          try {
            await apiRequest("/api/agenda-medico/toggle", "PUT", { dataHora: slot.dataHora }, token);
            await carregarHorarios();
          } catch (e) {
            console.error("Erro ao alternar horário:", e);
            alert("Erro ao alterar horário.");
          }
        });

        listaHorarios.appendChild(div);
      });
    } catch (e) {
      console.error("Erro ao carregar horários:", e);
      listaHorarios.innerHTML = "<p>Erro ao carregar horários.</p>";
    }
  }

  // === ADICIONAR NOVO HORÁRIO ===
  btnAdicionar.addEventListener("click", async () => {
    if (!dataSelecionada) {
      alert("Selecione um dia no calendário primeiro!");
      return;
    }

    const hora = novoHorarioInput.value;
    if (!hora) {
      alert("Informe um horário válido.");
      return;
    }

    const dataHora = `${dataSelecionada}T${hora}:00`;
    try {
      await apiRequest("/api/agenda-medico", "POST", { dataHora }, token);
      novoHorarioInput.value = "";
      await carregarHorarios();
    } catch (e) {
      alert(e.message || "Erro ao adicionar horário.");
    }
  });
});
