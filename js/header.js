// js/header.js
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => inicializarHeader(), 50); // Aguarda o DOM estabilizar (importante no Live Server)
});

function inicializarHeader() {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  // 🔹 Captura o nome do arquivo da URL (sempre em minúsculas)
  const currentPage = (window.location.pathname.split("/").pop() || "").toLowerCase();

  // 🔹 Define as páginas públicas (sem necessidade de login)
  const publicPages = [
    "index.html",
    "",
    "login.html",
    "cadastro_paciente.html",
    "cadastro_medico.html"
  ];

  

  // 🔹 HTML do header (mantendo estilo original)
  const headerHTML = `
    <header class="bg-primary text-white py-3 shadow-sm fixed-top">
      <div class="container d-flex justify-content-between align-items-center">
        <a href="index.html" class="text-white text-decoration-none fw-bold fs-4">
          Consul<span class="text-light">Today</span>
        </a>
        <nav>
          <div id="nav-auth">
            <a href="login.html" class="btn btn-outline-light me-2">Login</a>
            <div class="dropdown d-inline">
              <button
                class="btn btn-light dropdown-toggle"
                type="button"
                id="cadastroDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false">
                Cadastrar
              </button>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="cadastroDropdown">
                <li><a class="dropdown-item" href="cadastro_paciente.html">Paciente</a></li>
                <li><a class="dropdown-item" href="cadastro_medico.html">Médico</a></li>
              </ul>
            </div>
          </div>

          <div id="nav-user" class="dropdown d-none">
            <button
              class="btn btn-light rounded-circle d-flex align-items-center justify-content-center position-relative"
              id="profileDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style="width: 45px; height: 45px; padding: 0;">
              <i class="bi bi-person-fill text-primary fs-4"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown" id="userMenu">
              <li><a class="dropdown-item" href="editar_perfil.html">Editar Perfil</a></li>
              <li><a class="dropdown-item" href="painel_paciente.html" id="menuPainel">Histórico de Consultas</a></li>
              <li><a class="dropdown-item d-none" href="agenda_medico.html" id="menuAgenda">Minha Agenda</a></li>
              <li><hr class="dropdown-divider" /></li>
              <li><a class="dropdown-item text-danger" href="#" id="logoutBtn">Sair</a></li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  `;

  

  // Evita duplicar header
  if (!document.querySelector("header")) {
    document.body.insertAdjacentHTML("afterbegin", headerHTML);
  }

  const navAuth = document.getElementById("nav-auth");
  const navUser = document.getElementById("nav-user");
  const logoutBtn = document.getElementById("logoutBtn");
  const menuPainel = document.getElementById("menuPainel");
  const menuAgenda = document.getElementById("menuAgenda");

  const paginaAtual = window.location.pathname.split("/").pop();

  // Só redireciona se não estiver logado e estiver em página protegida
  if (!token && !paginasPublicas.includes(paginaAtual)) {
    window.location.href = "login.html";
    return;
  }

  // 🔹 Alterna menus conforme login
  if (token) {
    navAuth.classList.add("d-none");
    navUser.classList.remove("d-none");

    if (userType === "MEDICO") {
      menuPainel.textContent = "Painel do Médico";
      menuPainel.href = "painel_medico.html";
      menuAgenda.classList.remove("d-none");
    }
  } else {
    navAuth.classList.remove("d-none");
    navUser.classList.add("d-none");
  }

  // 🔹 Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "index.html";
    });
  }

  // 🔹 Ajusta espaçamento do conteúdo (compensa header fixo)
  const header = document.querySelector("header");
  const main = document.querySelector("main");
  if (header && main) {
    main.style.marginTop = `${header.offsetHeight + 20}px`;
  }
}
