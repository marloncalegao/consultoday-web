(function () {
  const API_URL = "http://localhost:8080/api";

  function toast(msg, type = "primary") {
    const el = document.createElement("div");
    el.className = `toast align-items-center text-white bg-${type} border-0`;
    el.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${msg}</div>
        <button class="btn-close btn-close-white me-2 m-auto"></button>
      </div>`;
    document.getElementById("toastContainer").appendChild(el);
    const bs = new bootstrap.Toast(el, { delay: 2500 });
    bs.show();
    el.addEventListener("hidden.bs.toast", () => el.remove());
  }

  async function callApi(path, method = "GET", body = null) {
    const token = localStorage.getItem("token");
    const resp = await fetch(`${API_URL}/${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : undefined
      },
      body: body ? JSON.stringify(body) : null
    });

    const text = await resp.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch {}

    if (!resp.ok) throw new Error(data?.message || text);
    return data;
  }

  /* ===========================
     CALENDÁRIO SIMPLIFICADO
  =========================== */
  const calendar = document.getElementById("customCalendar");
  const tituloDataLabel = document.getElementById("tituloDataLabel");
  const subtitle = document.getElementById("subtitle");

  let selectedDate = new Date().toISOString().split("T")[0];

  async function renderCalendar(date = selectedDate) {
    const base = new Date(date);
    const month = base.getMonth();
    const year = base.getFullYear();

    const first = new Date(year, month, 1).getDay();
    const last = new Date(year, month + 1, 0).getDate();

    calendar.innerHTML = `
      <div class="calendar-header">
        <button id="prevM" class="btn btn-sm btn-light"><</button>
        <div>${base.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</div>
        <button id="nextM" class="btn btn-sm btn-light">></button>
      </div>

      <div class="calendar-weekdays">
        <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
      </div>

      <div class="calendar-days"></div>
    `;

    const daysEl = calendar.querySelector(".calendar-days");

    for (let i = 0; i < first; i++) {
      daysEl.innerHTML += "<div></div>";
    }

    const todayIso = new Date().toISOString().split("T")[0];

    for (let d = 1; d <= last; d++) {
      const dt = new Date(year, month, d);
      const iso = dt.toISOString().split("T")[0];

      const div = document.createElement("div");
      div.textContent = d;

      if (iso === selectedDate) div.classList.add("selected");
      if (iso === todayIso) div.classList.add("today");
      if (iso < todayIso) div.classList.add("disabled-day");

      div.onclick = () => {
        selectedDate = iso;
        updateHeader();
        renderCalendar(selectedDate);
        carregarHorarios(selectedDate);
      };

      daysEl.appendChild(div);
    }

    document.getElementById("prevM").onclick = () => {
      const d = new Date(year, month - 1, 1);
      renderCalendar(d.toISOString().split("T")[0]);
    };

    document.getElementById("nextM").onclick = () => {
      const d = new Date(year, month + 1, 1);
      renderCalendar(d.toISOString().split("T")[0]);
    };
  }

  /* ===========================
     HORÁRIOS
  =========================== */
  const disponiveisEl = document.getElementById("horarios-disponiveis");
  const bloqueadosEl = document.getElementById("horarios-bloqueados");

  async function carregarHorarios(iso) {
    disponiveisEl.innerHTML = "Carregando...";
    bloqueadosEl.innerHTML = "";

    const slots = await callApi(`agenda-medico?date=${iso}`);

    const disp = slots.filter(s => s.disponivel);
    const bloc = slots.filter(s => !s.disponivel);

    disponiveisEl.innerHTML = disp.length
      ? disp.map(s => slotHTML(s, true)).join("")
      : "<small class='text-muted'>Nenhum horário</small>";

    bloqueadosEl.innerHTML = bloc.length
      ? bloc.map(s => slotHTML(s, false)).join("")
      : "<small class='text-muted'>Nenhum horário</small>";

    ativarToggle();
  }

  function slotHTML(slot, disponivel) {
    const time = slot.dataHora.split("T")[1].substring(0, 5);
    return `
      <div class="list-group-item">
        <strong>${time}</strong>
        <button class="btn btn-sm ${disponivel ? "btn-outline-danger btn-bloquear" : "btn-outline-success btn-liberar"}"
                data-hora="${time}">
          <i class="bi ${disponivel ? "bi-lock" : "bi-unlock"}"></i>
        </button>
      </div>
    `;
  }

  function ativarToggle() {
    document.querySelectorAll(".btn-bloquear").forEach(b =>
      b.onclick = async () => {
        const h = b.dataset.hora;
        await callApi("agenda-medico/toggle", "PUT", { dataHora: `${selectedDate}T${h}:00` });
        carregarHorarios(selectedDate);
        toast("Horário bloqueado", "danger");
      }
    );

    document.querySelectorAll(".btn-liberar").forEach(b =>
      b.onclick = async () => {
        const h = b.dataset.hora;
        await callApi("agenda-medico/toggle", "PUT", { dataHora: `${selectedDate}T${h}:00` });
        carregarHorarios(selectedDate);
        toast("Horário liberado", "success");
      }
    );
  }

  /* ===========================
     ADICIONAR HORÁRIOS
  =========================== */
  const predefinedSelect = document.getElementById("predefinedSlots");
  const customHour = document.getElementById("customHour");

  function preencherSelect() {
    let html = `<option value="">Horários padrão...</option>`;
    for (let h = 6; h <= 21; h++) {
      html += `<option value="${String(h).padStart(2,"0")}:00">${String(h).padStart(2,"0")}:00</option>`;
    }
    predefinedSelect.innerHTML = html;
  }

  document.getElementById("btnAddHora").onclick = async () => {
    const padrao = predefinedSelect.value;
    const custom = customHour.value.trim();

    let hora = padrao || custom;

    if (!hora) return toast("Informe um horário", "warning");

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora))
      return toast("Horário inválido", "danger");

    await callApi("agenda-medico", "POST", { dataHora: `${selectedDate}T${hora}:00` });
    toast("Horário adicionado", "success");

    predefinedSelect.value = "";
    customHour.value = "";

    carregarHorarios(selectedDate);
  };

  /* ===========================
     HEADER
  =========================== */
  function updateHeader() {
    const dt = new Date(selectedDate);
    tituloDataLabel.textContent = dt.toLocaleDateString("pt-BR");
    subtitle.textContent = dt.toLocaleDateString("pt-BR", { weekday: "long" });
  }

  /* ===========================
     INIT
  =========================== */
  (async function init() {
    preencherSelect();
    updateHeader();
    await renderCalendar(selectedDate);
    await carregarHorarios(selectedDate);

    document.getElementById("btnRefresh").onclick = () => carregarHorarios(selectedDate);
  })();

})();
