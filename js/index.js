// js/index.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("Página inicial carregada.");

  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  const navAuth = document.getElementById("nav-auth");
  const navUser = document.getElementById("nav-user");
  const logoutBtn = document.getElementById("logoutBtn");

  if (token && navAuth && navUser) {
    // Usuário logado → mostra menu de perfil (avatar)
    navAuth.classList.add("d-none");
    navUser.classList.remove("d-none");

    // Ajusta o link de histórico conforme o tipo
    const historicoLink = navUser.querySelector('a[href="painel_paciente.html"]');
    if (userType === "MEDICO" && historicoLink) {
      historicoLink.href = "painel_medico.html";
    }
  } else if (navAuth && navUser) {
    // Não logado
    navAuth.classList.remove("d-none");
    navUser.classList.add("d-none");
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "index.html";
    });
  }
});
