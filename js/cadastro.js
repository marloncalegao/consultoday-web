// =========================================
//  IMPORTAÇÕES DA API
// =========================================
import { cadastrarPaciente, cadastrarMedico } from "./api.js";

// =========================================
//  ENUM DE ESPECIALIDADES — igual ao backend
// =========================================
const ESPECIALIDADES = [
    "CLINICA_GERAL",
    "MEDICINA_INTERNA",
    "CARDIOLOGIA",
    "ANGIOLOGIA",
    "CIRURGIA_CARDIOVASCULAR",
    "NEUROLOGIA",
    "NEUROCIRURGIA",
    "ORTOPEDIA",
    "REUMATOLOGIA",
    "ENDOCRINOLOGIA",
    "NUTROLOGIA",
    "PNEUMOLOGIA",
    "PEDIATRIA",
    "GERIATRIA",
    "PSIQUIATRIA",
    "HEMATOLOGIA",
    "PATOLOGIA",
    "RADIOLOGIA",
    "CIRURGIA_GERAL",
    "CIRURGIA_PLASTICA",
    "CIRURGIA_TORACICA",
    "CIRURGIA_VASCULAR",
    "GINECOLOGIA",
    "OBSTETRICIA",
    "MASTOLOGIA",
    "OFTALMOLOGIA",
    "OTORRINOLARINGOLOGIA",
    "UROLOGIA",
    "NEFROLOGIA",
    "GASTROENTEROLOGIA",
    "DERMATOLOGIA"
];

// =========================================
//  Preencher o select de especialidades
// =========================================
function preencherEspecialidades(select) {
    select.innerHTML = `<option value="">Selecione...</option>`;

    ESPECIALIDADES.forEach(esp => {
        const option = document.createElement("option");
        option.value = esp;
        option.textContent = esp.replace(/_/g, " ");
        select.appendChild(option);
    });
}

// =========================================
//  FUNÇÃO GLOBAL DE MENSAGEM
// =========================================
function showMessage(element, text, type = "danger") {
    element.textContent = text;
    element.className = `mt-3 alert alert-${type} fade-in d-block`;
}

// =========================================
//  ANIMAÇÃO DE INPUT INVÁLIDO
// =========================================
function marcarInvalido(input) {
    input.classList.add("shake", "is-invalid");
    setTimeout(() => input.classList.remove("shake"), 600);
    setTimeout(() => input.classList.remove("is-invalid"), 1500);
}

// =========================================
//  MÁSCARAS
// =========================================
function aplicarMascaraTelefone(input) {
    let v = input.value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);

    input.value = v.length <= 10
        ? v.replace(/(\d{2})(\d{4})(\d+)/, "($1) $2-$3")
        : v.replace(/(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
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
        icon.classList.replace("bi-eye", "bi-eye-slash");
    } else {
        input.type = "password";
        icon.classList.replace("bi-eye-slash", "bi-eye");
    }
}

// =========================================
//  VALIDAÇÃO SENHAS
// =========================================
function validarSenhas(pass, confirm, msg) {
    if (!confirm.value) return;

    if (pass.value !== confirm.value) {
        msg.textContent = "As senhas não coincidem!";
        msg.className = "alert alert-warning mt-2 fade-in";
        confirm.classList.add("is-invalid");
    } else {
        msg.textContent = "";
        msg.className = "d-none";
        confirm.classList.remove("is-invalid");
    }
}

// =========================================
//  SCRIPT PRINCIPAL
// =========================================
document.addEventListener("DOMContentLoaded", () => {

    const isPaciente = document.getElementById("cadastroForm") !== null;
    const isMedico = document.getElementById("cadastroMedicoForm") !== null;

    // ====================================
    // CADASTRO PACIENTE
    // ====================================
    if (isPaciente) {
        const form = document.getElementById("cadastroForm");
        const msg = document.createElement("div");
        msg.className = "d-none";
        form.appendChild(msg);

        form.cpf.addEventListener("input", () => aplicarMascaraCPF(form.cpf));
        form.telefone.addEventListener("input", () => aplicarMascaraTelefone(form.telefone));

        const senha = document.getElementById("senhaPaciente");
        const confirmar = document.getElementById("confirmarSenhaPaciente");

        document.getElementById("toggleSenhaPaciente").addEventListener("click", () =>
            toggleSenha(toggleSenhaPaciente, senha)
        );

        document.getElementById("toggleConfirmSenhaPaciente").addEventListener("click", () =>
            toggleSenha(toggleConfirmSenhaPaciente, confirmar)
        );

        senha.addEventListener("input", () => validarSenhas(senha, confirmar, msg));
        confirmar.addEventListener("input", () => validarSenhas(senha, confirmar, msg));

        form.addEventListener("submit", async e => {
            e.preventDefault();

            const dados = {
                nome: form.nome.value.trim(),
                email: form.email.value.trim(),
                cpf: form.cpf.value.replace(/\D/g, ""),
                telefone: form.telefone.value.replace(/\D/g, ""),
                senha: senha.value.trim()
            };

            try {
                await cadastrarPaciente(dados);
                showMessage(msg, "Cadastro realizado com sucesso!", "success");
                setTimeout(() => window.location.href = "login.html", 1200);
            } catch (err) {
                showMessage(msg, "Erro: " + err.message);
            }
        });

        return;
    }

    // ====================================
    // CADASTRO MÉDICO
    // ====================================
    if (isMedico) {
        const form = document.getElementById("cadastroMedicoForm");
        const msg = document.createElement("div");
        msg.className = "d-none";
        form.appendChild(msg);

        // Preencher especialidades
        preencherEspecialidades(document.getElementById("especialidade"));

        form.crm.addEventListener("input", () => aplicarMascaraCRM(form.crm));
        form.telefone.addEventListener("input", () => aplicarMascaraTelefone(form.telefone));

        const senha = form.senha;
        const confirmar = form.confirmarSenha;

        document.getElementById("toggleSenhaMedico").addEventListener("click", () =>
            toggleSenha(toggleSenhaMedico, senha)
        );

        document.getElementById("toggleConfirmSenhaMedico").addEventListener("click", () =>
            toggleSenha(toggleConfirmSenhaMedico, confirmar)
        );

        senha.addEventListener("input", () => validarSenhas(senha, confirmar, msg));
        confirmar.addEventListener("input", () => validarSenhas(senha, confirmar, msg));

        form.addEventListener("submit", async e => {
            e.preventDefault();

            const dados = {
                nome: form.nome.value.trim(),
                email: form.email.value.trim(),
                crm: form.crm.value.trim(),
                especialidade: form.especialidade.value,
                telefone: form.telefone.value.replace(/\D/g, ""),
                senha: senha.value.trim()
            };

            try {
                await cadastrarMedico(dados);
                showMessage(msg, "Cadastro realizado com sucesso!", "success");
                setTimeout(() => window.location.href = "login.html", 1200);
            } catch (err) {
                showMessage(msg, "Erro: " + err.message);
            }
        });
    }

});
