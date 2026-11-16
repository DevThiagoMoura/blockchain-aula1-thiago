const Bloco = require('./bloco');

const HASH_ANTERIOR_GENESE = '0';
const DADOS_GENESE = 'Bloco gênese do registro de entregas';

class Blockchain {
  constructor() {
    this.cadeia = [Blockchain.criarBlocoGenese()];
  }

  static criarBlocoGenese() {
    return new Bloco(0, DADOS_GENESE, HASH_ANTERIOR_GENESE);
  }

  ultimoBloco() {
    return this.cadeia[this.cadeia.length - 1];
  }

  adicionar(dados) {
    // Se os dados forem inválidos, o erro do Bloco sobe direto e nada entra na cadeia.
    const novoBloco = new Bloco(this.cadeia.length, dados, this.ultimoBloco().hash);
    this.cadeia.push(novoBloco);
    return novoBloco;
  }

  ehValida() {
    for (let i = 1; i < this.cadeia.length; i++) {
      const { hashConfere, eloConfere } = this.verificarBloco(i);

      if (!hashConfere || !eloConfere) {
        return false;
      }
    }
    return true;
  }

  // Compara um bloco com o anterior. É a mesma regra usada pelo ehValida(),
  // reaproveitada pela tela para mostrar exatamente qual bloco ou elo quebrou.
  verificarBloco(posicao) {
    const bloco = this.cadeia[posicao];
    const hashEsperadoAnterior = posicao === 0 ? HASH_ANTERIOR_GENESE : this.cadeia[posicao - 1].hash;
    const hashRecalculado = bloco.calcularHash();

    return {
      hashRecalculado,
      hashConfere: bloco.hash === hashRecalculado,
      eloConfere: bloco.hashAnterior === hashEsperadoAnterior,
    };
  }
}

module.exports = Blockchain;
