const TAMANHO_PREVIA_HASH = 16;

const elementos = {
  status: document.getElementById('status'),
  form: document.getElementById('form-entrega'),
  campo: document.getElementById('campo-dados'),
  mensagemForm: document.getElementById('mensagem-form'),
  contador: document.getElementById('contador'),
  cadeia: document.getElementById('cadeia'),
  mensagemCadeia: document.getElementById('mensagem-cadeia'),
  total: document.getElementById('total-blocos'),
  reiniciar: document.getElementById('botao-reiniciar'),
  modelo: document.getElementById('modelo-bloco'),
};

let limites = { minimo: 3, maximo: 80 };
let ultimoEstado = null;
let indiceEmEdicao = null;

// ---------- Comunicação com o servidor ----------

async function chamarApi(metodo, caminho, corpo) {
  const opcoes = { method: metodo, headers: {} };
  if (corpo !== undefined) {
    opcoes.headers['Content-Type'] = 'application/json';
    opcoes.body = JSON.stringify(corpo);
  }
  const resposta = await fetch(caminho, opcoes);
  const conteudo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(conteudo.erro || `Erro ${resposta.status} ao falar com o servidor.`);
  }
  return conteudo;
}

// Faz a requisição, redesenha a cadeia e mostra o resultado na área de mensagem indicada.
async function executar(requisicao, areaMensagem, textoSucesso, tipoSucesso = 'sucesso') {
  try {
    const estado = await requisicao();
    desenharCadeia(estado);
    mostrarMensagem(areaMensagem, typeof textoSucesso === 'function' ? textoSucesso(estado) : textoSucesso, tipoSucesso);
    return true;
  } catch (erro) {
    mostrarMensagem(areaMensagem, erro.message, 'erro');
    return false;
  }
}

// ---------- Desenho da tela ----------

function mostrarMensagem(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.className = `mensagem ${tipo}`;
}

function preencherHash(elemento, hash) {
  elemento.textContent = hash.length > TAMANHO_PREVIA_HASH ? `${hash.slice(0, TAMANHO_PREVIA_HASH)}…` : hash;
  elemento.title = hash;
}

function atualizarContador() {
  const tamanho = elementos.campo.value.length;
  const foraDoLimite = tamanho > limites.maximo || (tamanho > 0 && tamanho < limites.minimo);
  elementos.contador.textContent = `${tamanho}/${limites.maximo}`;
  elementos.contador.classList.toggle('fora-do-limite', foraDoLimite);
}

function desenharStatus(valida) {
  elementos.status.textContent = valida ? '✓ Cadeia válida' : '✕ Cadeia adulterada';
  elementos.status.className = `status ${valida ? 'valida' : 'invalida'}`;
}

function textoDoElo(bloco) {
  const anterior = `bloco #${bloco.indice - 1}`;
  return bloco.eloConfere
    ? `elo íntegro: o hash anterior bate com o hash do ${anterior}`
    : `elo quebrado: o hash anterior não bate mais com o hash do ${anterior}`;
}

function desenharSelo(selo, bloco) {
  if (bloco.indice === 0) {
    selo.textContent = 'gênese';
    selo.classList.add('genese');
  } else if (!bloco.hashConfere) {
    selo.textContent = 'hash não confere';
    selo.classList.add('erro');
  } else {
    selo.textContent = 'íntegro';
  }
}

function criarItemBloco(bloco) {
  const item = elementos.modelo.content.firstElementChild.cloneNode(true);
  const parte = (seletor) => item.querySelector(seletor);
  const ehGenese = bloco.indice === 0;
  const emEdicao = bloco.indice === indiceEmEdicao;

  item.dataset.indice = bloco.indice;

  parte('.elo').classList.toggle('quebrado', !bloco.eloConfere);
  parte('.elo-icone').textContent = bloco.eloConfere ? '✓' : '✕';
  parte('.elo-texto').textContent = textoDoElo(bloco);

  parte('.cartao').classList.toggle('adulterado', !bloco.hashConfere);
  parte('.indice').textContent = `Bloco #${bloco.indice}`;
  desenharSelo(parte('.selo'), bloco);
  parte('.dados').textContent = bloco.dados;

  preencherHash(parte('.hash'), bloco.hash);
  preencherHash(parte('.hash-anterior'), bloco.hashAnterior);
  preencherHash(parte('.hash-recalculado'), bloco.hashRecalculado);
  parte('.linha-recalculado').hidden = bloco.hashConfere;

  const idCampo = `adulterar-${bloco.indice}`;
  parte('.rotulo-adulterar').htmlFor = idCampo;
  parte('.campo-adulterar').id = idCampo;
  parte('.form-adulterar').hidden = !emEdicao;
  if (emEdicao) parte('.campo-adulterar').value = bloco.dados;

  parte('.acoes').hidden = ehGenese;
  parte('[data-acao="adulterar"]').hidden = emEdicao;
  parte('[data-acao="recalcular"]').hidden = bloco.hashConfere;

  return item;
}

function desenharCadeia(estado) {
  ultimoEstado = estado;
  limites = estado.limites;
  atualizarContador();
  desenharStatus(estado.valida);
  elementos.total.textContent = `(${estado.blocos.length} blocos)`;
  elementos.cadeia.replaceChildren(...estado.blocos.map(criarItemBloco));
}

// ---------- Edição (adulteração) de um bloco ----------

function abrirEdicao(indice) {
  indiceEmEdicao = indice;
  desenharCadeia(ultimoEstado);
  const campo = document.getElementById(`adulterar-${indice}`);
  campo.focus();
  campo.select();
}

function fecharEdicao() {
  const indice = indiceEmEdicao;
  indiceEmEdicao = null;
  desenharCadeia(ultimoEstado);
  elementos.cadeia.querySelector(`[data-indice="${indice}"] [data-acao="adulterar"]`)?.focus();
}

function indiceDoBloco(elemento) {
  return Number(elemento.closest('.bloco').dataset.indice);
}

// ---------- Eventos ----------

elementos.campo.addEventListener('input', atualizarContador);

elementos.form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const cadastrou = await executar(
    () => chamarApi('POST', '/api/entregas', { dados: elementos.campo.value }),
    elementos.mensagemForm,
    (estado) => `Bloco #${estado.blocos.length - 1} cadastrado e ligado ao anterior.`
  );
  if (cadastrou) {
    elementos.campo.value = '';
    atualizarContador();
  }
  elementos.campo.focus();
});

elementos.cadeia.addEventListener('click', (evento) => {
  const botao = evento.target.closest('button[data-acao]');
  if (!botao) return;
  const indice = indiceDoBloco(botao);

  const acoes = {
    adulterar: () => abrirEdicao(indice),
    cancelar: () => fecharEdicao(),
    recalcular: () =>
      executar(
        () => chamarApi('POST', `/api/blocos/${indice}/recalcular-hash`),
        elementos.mensagemCadeia,
        `Hash do bloco #${indice} recalculado. Veja o elo com o bloco seguinte.`,
        'info'
      ),
  };
  acoes[botao.dataset.acao]?.();
});

elementos.cadeia.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const indice = indiceDoBloco(evento.target);
  const dados = evento.target.elements.dados.value;
  indiceEmEdicao = null;
  executar(
    () => chamarApi('PATCH', `/api/blocos/${indice}`, { dados }),
    elementos.mensagemCadeia,
    `Bloco #${indice} adulterado direto na cadeia, sem passar pela validação.`,
    'info'
  );
});

elementos.cadeia.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape' && indiceEmEdicao !== null) fecharEdicao();
});

elementos.reiniciar.addEventListener('click', () => {
  indiceEmEdicao = null;
  executar(
    () => chamarApi('POST', '/api/reiniciar'),
    elementos.mensagemCadeia,
    'Cadeia reiniciada com as entregas de exemplo.',
    'info'
  );
});

// ---------- Início ----------

chamarApi('GET', '/api/cadeia')
  .then(desenharCadeia)
  .catch(() => {
    elementos.status.textContent = 'Servidor indisponível';
    elementos.status.className = 'status invalida';
  });
