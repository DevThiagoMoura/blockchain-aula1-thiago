const path = require('path');
const express = require('express');
const Bloco = require('./bloco');
const Blockchain = require('./blockchain');
const ENTREGAS_EXEMPLO = require('./entregas-exemplo');

const PORTA = Number(process.env.PORT) || 3000;

function criarRegistroComExemplos() {
  const registro = new Blockchain();
  for (const dados of ENTREGAS_EXEMPLO) {
    registro.adicionar(dados);
  }
  return registro;
}

let registro = criarRegistroComExemplos();

function erroHttp(status, mensagem) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

// Monta o que a tela precisa: os blocos e, para cada um, o resultado da verificação.
function descreverCadeia() {
  return {
    valida: registro.ehValida(),
    limites: { minimo: Bloco.TAMANHO_MINIMO_DADOS, maximo: Bloco.TAMANHO_MAXIMO_DADOS },
    blocos: registro.cadeia.map((bloco, posicao) => ({
      indice: bloco.indice,
      dados: bloco.dados,
      hash: bloco.hash,
      hashAnterior: bloco.hashAnterior,
      ...registro.verificarBloco(posicao),
    })),
  };
}

function buscarBlocoAlteravel(indiceTexto) {
  const posicao = Number(indiceTexto);
  if (!Number.isInteger(posicao) || posicao < 0 || posicao >= registro.cadeia.length) {
    throw erroHttp(404, `Não existe bloco com índice ${indiceTexto}.`);
  }
  if (posicao === 0) {
    throw erroHttp(400, 'O bloco gênese não pode ser alterado nesta demonstração.');
  }
  return registro.cadeia[posicao];
}

// Executa a ação e responde sempre com a cadeia atualizada, ou com { erro } em português.
function responderComCadeia(acao, statusSucesso = 200) {
  return (req, res) => {
    try {
      acao(req);
      res.status(statusSucesso).json(descreverCadeia());
    } catch (erro) {
      res.status(erro.status || 400).json({ erro: erro.message });
    }
  };
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/cadeia', responderComCadeia(() => {}));

// O erro de validação do Bloco passa direto e vira a mensagem mostrada na tela.
app.post(
  '/api/entregas',
  responderComCadeia((req) => registro.adicionar(req.body?.dados), 201)
);

// Simula alguém mexendo direto em registro.cadeia[i].dados, sem passar pela validação.
app.patch(
  '/api/blocos/:indice',
  responderComCadeia((req) => {
    const bloco = buscarBlocoAlteravel(req.params.indice);
    const novosDados = req.body?.dados;
    if (typeof novosDados !== 'string') {
      throw erroHttp(400, 'Informe os novos dados do bloco como texto.');
    }
    bloco.dados = novosDados;
  })
);

// Simula o adulterador tentando "esconder" a alteração recalculando o hash do bloco.
app.post(
  '/api/blocos/:indice/recalcular-hash',
  responderComCadeia((req) => {
    const bloco = buscarBlocoAlteravel(req.params.indice);
    bloco.hash = bloco.calcularHash();
  })
);

app.post(
  '/api/reiniciar',
  responderComCadeia(() => {
    registro = criarRegistroComExemplos();
  })
);

// JSON malformado no corpo da requisição.
app.use((erro, req, res, next) => {
  res.status(erro.status || 500).json({ erro: 'Não foi possível ler a requisição enviada.' });
});

app.listen(PORTA, () => {
  console.log(`Registro de entregas rodando em http://localhost:${PORTA}`);
});
