// js/mensagens.js
export function mostrarMensagem(tipo, texto) {
  const msgSucesso = document.getElementById("mensagemSucesso");
  const msgErro = document.getElementById("mensagemErro");

  if (tipo === "sucesso") {
    msgErro.classList.add("d-none");
    msgSucesso.textContent = texto;
    msgSucesso.classList.remove("d-none");
  } else if (tipo === "erro") {
    msgSucesso.classList.add("d-none");
    msgErro.textContent = texto;
    msgErro.classList.remove("d-none");
  }

  // Remove automaticamente após 5 segundos
  setTimeout(() => {
    msgSucesso.classList.add("d-none");
    msgErro.classList.add("d-none");
  }, 5000);
}
