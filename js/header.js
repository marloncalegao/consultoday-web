document.addEventListener("DOMContentLoaded", () => {
  carregarHeader();
});

function carregarHeader() {
  let headerContainer = document.querySelector("header");
  if (!headerContainer) {
    headerContainer = document.createElement("header");
    document.body.insertBefore(headerContainer, document.body.firstChild);
  }

  const headerHTML = `
    <div class="bg-primary text-white py-3 shadow-sm fixed-top">
      <div class="container d-flex justify-content-between align-items-center">
        <a href="index.html" class="text-white text-decoration-none fw-bold fs-4">
          Consul<span class="text-light">Today</span>
        </a>

        <nav>
          <div id="nav-auth">
            <a href="login.html" class="btn btn-outline-light me-2">Login</a>

            <div class="dropdown d-inline">
              <button class="btn btn-light dropdown-toggle" type="button" id="cadastroDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                Cadastrar
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="cadastro_paciente.html">Paciente</a></li>
                <li><a class="dropdown-item" href="cadastro_medico.html">Médico</a></li>
              </ul>
            </div>
          </div>

          <div id="nav-user" class="dropdown d-none">
            <button class="btn btn-light rounded-pill px-3 d-flex align-items-center gap-2" id="profileDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-person-circle text-primary fs-5"></i>
              <span id="headerUserName" class="fw-semibold text-primary">Usuário</span>
            </button>

            <ul class="dropdown-menu dropdown-menu-end" id="userMenu">
              <li><a class="dropdown-item" href="editar_perfil.html">Editar Perfil</a></li>

              <!-- NOVO REDIRECIONAMENTO -->
              <li><a class="dropdown-item" href="minhas_consultas.html" id="menuPainel">Minhas Consultas</a></li>

              <li><a class="dropdown-item d-none" href="agenda_medico.html" id="menuAgenda">Minha Agenda</a></li>

              <li><hr class="dropdown-divider"/></li>

              <li><a class="dropdown-item text-danger" href="#" id="logoutBtn">Sair</a></li>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  `;

  headerContainer.innerHTML = headerHTML;
  inicializarHeader();
}

function inicializarHeader() {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("tipoUsuario") || localStorage.getItem("userType");
  const nomeUsuario = localStorage.getItem("nome") || localStorage.getItem("userName") || localStorage.getItem("nomeUsuario");

  const privatePages = [
    "minhas_consultas.html",
    "agenda_medico.html",
    "editar_perfil.html"
  ];

  const paginaAtual = window.location.pathname.split("/").pop().toLowerCase();
  if (!token && privatePages.includes(paginaAtual)) {
    window.location.href = "login.html";
    return;
  }

  const navAuth = document.getElementById("nav-auth");
  const navUser = document.getElementById("nav-user");
  const logoutBtn = document.getElementById("logoutBtn");
  const menuAgenda = document.getElementById("menuAgenda");
  const headerUserName = document.getElementById("headerUserName");

  if (headerUserName && nomeUsuario) headerUserName.textContent = nomeUsuario;

  if (token) {
    navAuth?.classList.add("d-none");
    navUser?.classList.remove("d-none");

    if (userType && userType.toUpperCase().includes("MEDIC")) {
      menuAgenda?.classList.remove("d-none");
    }
  } else {
    navAuth?.classList.remove("d-none");
    navUser?.classList.add("d-none");
  }

  logoutBtn?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
  });

  const header = document.querySelector("header");
  const main = document.querySelector("main");
  if (header && main) {
    main.style.marginTop = `${header.offsetHeight + 12}px`;
  }
}
