const Blockchain = require('./blockchain');
const ENTREGAS_EXEMPLO = require('./entregas-exemplo');

const TAMANHO_PREVIA_HASH = 10;

function previaHash(hash) {
  return hash.slice(0, TAMANHO_PREVIA_HASH);
}

// Só mostra o que recebe: não sabe de onde a cadeia vem.
function imprimirCadeia(cadeia) {
  for (const bloco of cadeia) {
    console.log(
      `  #${bloco.indice} | ${bloco.dados}\n` +
        `       hash: ${previaHash(bloco.hash)}... | anterior: ${previaHash(bloco.hashAnterior)}`
    );
  }
}

function imprimirTitulo(titulo) {
  console.log(`\n=== ${titulo} ===`);
}

function imprimirValidade(registro) {
  const resultado = registro.ehValida() ? 'SIM, a cadeia é válida' : 'NÃO, a cadeia foi adulterada';
  console.log(`  Cadeia válida? ${resultado}`);
}

function tentarCadastrar(registro, dados) {
  try {
    const bloco = registro.adicionar(dados);
    console.log(`  [ok] Bloco #${bloco.indice} cadastrado: "${bloco.dados}"`);
  } catch (erro) {
    console.log(`  [erro] Não foi possível cadastrar ${JSON.stringify(dados)}: ${erro.message}`);
  }
}

const registro = new Blockchain();

imprimirTitulo('Cadastrando entregas');
for (const entrega of ENTREGAS_EXEMPLO) {
  tentarCadastrar(registro, entrega);
}

imprimirTitulo('Cadeia de entregas');
imprimirCadeia(registro.cadeia);
imprimirValidade(registro);

imprimirTitulo('Tentando cadastrar dados inválidos');
const dadosInvalidos = ['', 'ok', 'X'.repeat(81), 12345, undefined];
for (const dados of dadosInvalidos) {
  tentarCadastrar(registro, dados);
}
console.log(`  A cadeia continua com ${registro.cadeia.length} blocos.`);
imprimirValidade(registro);

imprimirTitulo('Adulterando a entrega do bloco #1');
console.log(`  Antes:  "${registro.cadeia[1].dados}"`);
registro.cadeia[1].dados = 'Entrega E-001 para Ji-Paraná: entregue';
console.log(`  Depois: "${registro.cadeia[1].dados}"`);

imprimirTitulo('Cadeia após a adulteração');
imprimirCadeia(registro.cadeia);
imprimirValidade(registro);
