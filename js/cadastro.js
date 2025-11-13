// =========================================
//  IMPORTAÇÕES DA API
// =========================================
import { cadastrarPaciente, cadastrarMedico } from "./api.js";

// =========================================
//  FUNÇÃO GLOBAL DE MENSAGEM (com fade-in animado)
// =========================================
function showMessage(element, text, type = "danger") {
    if (!element) return alert(text);

    element.textContent = text;
    element.className = `mt-3 alert alert-${type} fade-in d-block`;
}

// =========================================
//  ANIMAÇÃO DE INPUT INVÁLIDO
// =========================================
function marcarInvalido(input) {
    input.classList.add("shake", "is-invalid");

    setTimeout(() => {
        input.classList.remove("shake");
    }, 600);

    setTimeout(() => {
        input.classList.remove("is-invalid");
    }, 1500);
}

// =========================================
//  MÁSCARAS DE INPUT
// =========================================
function aplicarMascaraTelefone(input) {
    let v = input.value.replace(/\D/g, "");

    if (v.length > 11) v = v.slice(0, 11);

    if (v.length <= 10) {
        input.value = v.replace(/(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
    } else {
        input.value = v.replace(/(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
    }
}

function aplicarMascaraCPF(input) {
    let v = input.value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);

    input.value = v
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function aplicarMascaraCRM(input) {
    input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

// =========================================
//  MOSTRAR / ESCONDER SENHA
// =========================================
function toggleSenha(btn, input) {
    const icon = btn.querySelector("i");

    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");
    }

    icon.classList.add("blink");

    setTimeout(() => icon.classList.remove("blink"), 200);
}

// =========================================
//  VALIDAÇÃO DE SENHAS EM TEMPO REAL
// =========================================
function validarSenhas(passwordInput, confirmInput, messageBox) {
    if (!confirmInput.value) return;

    if (passwordInput.value !== confirmInput.value) {
        messageBox.textContent = "As senhas não coincidem!";
        messageBox.className = "alert alert-warning mt-2 fade-in";
        confirmInput.classList.add("is-invalid");
    } else {
        messageBox.textContent = "";
        messageBox.className = "d-none";
        confirmInput.classList.remove("is-invalid");
    }
}

// =========================================
//  DETECTA AUTOMATICAMENTE A PÁGINA ATUAL
// =========================================
document.addEventListener("DOMContentLoaded", () => {

    const isPacientePage = document.getElementById("cadastroForm") !== null;
    const isMedicoPage = document.getElementById("cadastroMedicoForm") !== null;

    console.log("Página detectada:", {
        paciente: isPacientePage,
        medico: isMedicoPage
    });

    // =========================================
    //  CADASTRO DO PACIENTE
    // =========================================
    if (isPacientePage) {

        const form = document.getElementById("cadastroForm");
        const msg = document.createElement("div");
        msg.classList.add("d-none");
        form.appendChild(msg);

        // Máscaras
        form.cpf.addEventListener("input", () => aplicarMascaraCPF(form.cpf));
        form.telefone.addEventListener("input", () => aplicarMascaraTelefone(form.telefone));

        // Botões de mostrar senha
        const senhaInput = document.getElementById("senhaPaciente");
        const confirmarInput = document.getElementById("confirmarSenhaPaciente");

        const btnSenha = document.getElementById("toggleSenhaPaciente");
        const btnConfirmarSenha = document.getElementById("toggleConfirmSenhaPaciente");

        btnSenha.addEventListener("click", () => toggleSenha(btnSenha, senhaInput));
        btnConfirmarSenha.addEventListener("click", () => toggleSenha(btnConfirmarSenha, confirmarInput));

        // Validação em tempo real
        senhaInput.addEventListener("input", () =>
            validarSenhas(senhaInput, confirmarInput, msg)
        );
        confirmarInput.addEventListener("input", () =>
            validarSenhas(senhaInput, confirmarInput, msg)
        );

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector("button[type='submit']");
            submitBtn.disabled = true;
            submitBtn.textContent = "Enviando...";

            const nome = form.nome.value.trim();
            const email = form.email.value.trim();
            const cpf = form.cpf.value.trim();
            const telefone = form.telefone.value.trim();
            const senha = senhaInput.value.trim();
            const confirmarSenha = confirmarInput.value.trim();

            // Validações
            if (!nome || !email || !cpf || !senha || !confirmarSenha) {
                marcarInvalido(
                    !nome ? form.nome :
                    !email ? form.email :
                    !cpf ? form.cpf :
                    !senha ? senhaInput : confirmarInput
                );
                showMessage(msg, "Preencha todos os campos obrigatórios!");
                submitBtn.disabled = false;
                submitBtn.textContent = "Cadastrar";
                return;
            }

            if (senha !== confirmarSenha) {
                marcarInvalido(confirmarInput);
                showMessage(msg, "As senhas não coincidem!", "warning");
                submitBtn.disabled = false;
                submitBtn.textContent = "Cadastrar";
                return;
            }

            const dados = { nome, email, cpf, telefone, senha };

            try {
                await cadastrarPaciente(dados);
                showMessage(msg, "Cadastro realizado com sucesso!", "success");
                setTimeout(() => window.location.href = "login.html", 1500);
            } catch (err) {
                console.error("Erro no cadastro:", err);
                showMessage(msg, "Erro no cadastro: " + (err.message || "Falha inesperada"));
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Cadastrar";
            }
        });

        return;
    }


    // =========================================
    //  CADASTRO DO MÉDICO
    // =========================================
    if (isMedicoPage) {

        const form = document.getElementById("cadastroMedicoForm");
        const msg = document.createElement("div");
        msg.classList.add("d-none");
        form.appendChild(msg);

        // Máscaras
        form.crm.addEventListener("input", () => aplicarMascaraCRM(form.crm));
        form.telefone.addEventListener("input", () => aplicarMascaraTelefone(form.telefone));

        // Botões de mostrar senha
        const btnSenha = document.getElementById("toggleSenhaMedico");
        const btnConfirmarSenha = document.getElementById("toggleConfirmSenhaMedico");

        btnSenha.addEventListener("click", () => toggleSenha(btnSenha, form.senha));
        btnConfirmarSenha.addEventListener("click", () => toggleSenha(btnConfirmarSenha, form.confirmarSenha));

        // Validação em tempo real
        form.senha.addEventListener("input", () =>
            validarSenhas(form.senha, form.confirmarSenha, msg)
        );
        form.confirmarSenha.addEventListener("input", () =>
            validarSenhas(form.senha, form.confirmarSenha, msg)
        );

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector("button[type='submit']");
            submitBtn.disabled = true;
            submitBtn.textContent = "Enviando...";

            const nome = form.nome.value.trim();
            const email = form.email.value.trim();
            const crm = form.crm.value.trim();
            const especialidade = form.especialidade.value;
            const telefone = form.telefone.value.trim();
            const senha = form.senha.value.trim();
            const confirmarSenha = form.confirmarSenha.value.trim();

            if (!nome || !email || !crm || !especialidade || !senha || !confirmarSenha) {
                marcarInvalido(
                    !nome ? form.nome :
                        !email ? form.email :
                            !crm ? form.crm :
                                !especialidade ? form.especialidade :
                                    !senha ? form.senha : form.confirmarSenha
                );
                showMessage(msg, "Preencha todos os campos obrigatórios!", "warning");
                submitBtn.disabled = false;
                submitBtn.textContent = "Cadastrar";
                return;
            }

            if (senha !== confirmarSenha) {
                marcarInvalido(form.confirmarSenha);
                showMessage(msg, "As senhas não coincidem!", "warning");
                submitBtn.disabled = false;
                submitBtn.textContent = "Cadastrar";
                return;
            }

            const dados = { nome, email, crm, especialidade, telefone, senha };

            try {
                await cadastrarMedico(dados);
                showMessage(msg, "Cadastro realizado com sucesso!", "success");
                setTimeout(() => window.location.href = "login.html", 1500);
            } catch (err) {
                console.error("Erro no cadastro:", err);
                showMessage(msg, "Erro no cadastro: " + (err.message || "Falha inesperada"));
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Cadastrar";
            }
        });

        return;
    }
});
