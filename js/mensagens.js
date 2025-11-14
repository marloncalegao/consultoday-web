// js/mensagens.js

export function mostrarMensagem(tipo, texto) {
  let msg = document.getElementById("mensagem");

  // cria container se não existir
  if (!msg) {
    msg = document.createElement("div");
    msg.id = "mensagem";
    msg.className = "alert text-center mx-auto mt-3 d-none";
    msg.style.maxWidth = "600px";

    const header = document.querySelector("header");
    if (header && header.parentNode) {
      header.parentNode.insertBefore(msg, header.nextSibling);
    } else {
      document.body.prepend(msg);
    }
  }

  // limpa classes anteriores
  msg.classList.remove("d-none", "alert-success", "alert-danger", "alert-info");

  // define cor
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

  // define texto
  msg.textContent = texto;

  // garante renderização imediata antes de qualquer redirecionamento
  msg.style.opacity = "1";
  void msg.offsetHeight;   // força reflow → força o navegador a exibir agora

  // esconder após 3 segundos
  setTimeout(() => msg.classList.add("d-none"), 3000);
}


// -----------------------------------------------------
// NOVA FUNÇÃO: mensagem + redirecionamento com delay
// -----------------------------------------------------
export function mostrarMensagemERedirecionar(tipo, texto, url, delay = 1200) {
  mostrarMensagem(tipo, texto);
  
  setTimeout(() => {
    window.location.href = url;
  }, delay);
}
