// js/mensagens.js

export function mostrarMensagem(tipo, texto) {
  let msg = document.getElementById("mensagem");

  // --- Se o container não existir, cria automaticamente ---
  if (!msg) {
    msg = document.createElement("div");
    msg.id = "mensagem";
    msg.className = "alert text-center mx-auto mt-3";
    msg.style.maxWidth = "600px";

    // insere logo no topo do body (após o header)
    const header = document.querySelector("header");
    if (header && header.parentNode) {
      header.parentNode.insertBefore(msg, header.nextSibling);
    } else {
      document.body.prepend(msg);
    }
  }

  // limpa classes de estado
  msg.classList.remove("d-none", "alert-success", "alert-danger", "alert-info");

  // adiciona classe baseada no tipo
  switch (tipo) {
    case "sucesso":
      msg.classList.add("alert-success");
      break;
    case "erro":
      msg.classList.add("alert-danger");
      break;
    default:
      msg.classList.add("alert-info");
  }

  msg.textContent = texto;

  // Oculta após 3 segundos
  setTimeout(() => {
    msg.classList.add("d-none");
  }, 3000);
}
