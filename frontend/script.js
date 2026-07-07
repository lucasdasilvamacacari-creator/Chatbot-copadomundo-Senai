const chat = document.getElementById("chat");
const mensagem = document.getElementById("mensagem");
const btnEnviar = document.getElementById("btnEnviar");
const btnLimpar = document.getElementById("btnLimpar");

const API_URL = "http://127.0.0.1:5000/chat";

const mensagemInicial =
  "Olá! Sou um assistente especializado em Copas do Mundo de futebol. Posso ajudar com dúvidas sobre história, seleções, regras, sedes, recordes e curiosidades de todas as edições do torneio.";

const ICONE_BOT =
  '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.3"/><path d="M12 7l2.3 1.6-.9 2.7h-2.8l-.9-2.7z" fill="currentColor"/></svg>';

const ICONE_USER =
  '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="3.4" fill="currentColor"/><path d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

// Cria uma bolha de mensagem e retorna o elemento de conteúdo (para poder
// atualizar o texto depois, útil no estado de "digitando...").
function adicionarMensagem(texto, tipo, digitando = false) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message", tipo);

  const icone = document.createElement("span");
  icone.classList.add("msg-icon");
  icone.setAttribute("aria-hidden", "true");
  icone.innerHTML = tipo === "bot" ? ICONE_BOT : ICONE_USER;

  const conteudo = document.createElement("div");
  conteudo.classList.add("msg-content");

  if (digitando) {
    conteudo.innerHTML =
      '<span class="typing"><span></span><span></span><span></span></span>';
  } else {
    conteudo.textContent = texto;
  }

  wrapper.appendChild(icone);
  wrapper.appendChild(conteudo);
  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;

  return conteudo;
}

function ajustarAlturaTextarea() {
  mensagem.style.height = "auto";
  mensagem.style.height = Math.min(mensagem.scrollHeight, 140) + "px";
}

function alternarEnvio(desabilitado) {
  btnEnviar.disabled = desabilitado;
}

async function enviarMensagem() {
  const texto = mensagem.value.trim();

  if (texto === "") {
    alert("Digite uma pergunta antes de enviar.");
    return;
  }

  adicionarMensagem(texto, "user");
  mensagem.value = "";
  ajustarAlturaTextarea();
  alternarEnvio(true);

  const conteudoCarregando = adicionarMensagem("", "bot", true);

  try {
    const resposta = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mensagem: texto
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      conteudoCarregando.textContent =
        dados.erro || "Erro ao processar a mensagem.";
      return;
    }

    conteudoCarregando.textContent = dados.resposta;

  } catch (erro) {
    conteudoCarregando.textContent =
      "Erro ao conectar com o backend. Verifique se o servidor Python está em execução.";
    console.error(erro);
  } finally {
    alternarEnvio(false);
    mensagem.focus();
  }
}

btnEnviar.addEventListener("click", enviarMensagem);

mensagem.addEventListener("input", ajustarAlturaTextarea);

mensagem.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    enviarMensagem();
  }
});

btnLimpar.addEventListener("click", function () {
  chat.innerHTML = "";
  adicionarMensagem(mensagemInicial, "bot");
});