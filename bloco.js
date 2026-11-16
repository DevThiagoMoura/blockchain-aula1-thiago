const crypto = require('crypto');

class Bloco {
  static TAMANHO_MINIMO_DADOS = 3;
  static TAMANHO_MAXIMO_DADOS = 80;

  constructor(indice, dados, hashAnterior) {
    // Valida tudo antes de guardar qualquer coisa: bloco inválido nem chega a existir.
    Bloco.validarIndice(indice);
    Bloco.validarDados(dados);
    Bloco.validarHashAnterior(hashAnterior);

    this.indice = indice;
    this.dados = dados;
    this.hashAnterior = hashAnterior;
    this.hash = this.calcularHash();
  }

  static validarIndice(indice) {
    if (!Number.isInteger(indice) || indice < 0) {
      throw new Error('O índice do bloco deve ser um número inteiro maior ou igual a zero.');
    }
  }

  static validarDados(dados) {
    if (dados === undefined || dados === null || dados === '') {
      throw new Error('Os dados da entrega são obrigatórios.');
    }
    if (typeof dados !== 'string') {
      throw new Error('Os dados da entrega devem ser um texto.');
    }
    if (dados.length < Bloco.TAMANHO_MINIMO_DADOS) {
      throw new Error(
        `Os dados da entrega devem ter no mínimo ${Bloco.TAMANHO_MINIMO_DADOS} caracteres (recebido: ${dados.length}).`
      );
    }
    if (dados.length > Bloco.TAMANHO_MAXIMO_DADOS) {
      throw new Error(
        `Os dados da entrega devem ter no máximo ${Bloco.TAMANHO_MAXIMO_DADOS} caracteres (recebido: ${dados.length}).`
      );
    }
  }

  static validarHashAnterior(hashAnterior) {
    if (typeof hashAnterior !== 'string' || hashAnterior.length === 0) {
      throw new Error('O hash anterior do bloco é obrigatório e deve ser um texto.');
    }
  }

  calcularHash() {
    // O separador "|" evita ambiguidades, como índice 1 + dados "1abc" vs índice 11 + dados "abc".
    const texto = [this.indice, this.dados, this.hashAnterior].join('|');
    return crypto.createHash('sha256').update(texto).digest('hex');
  }
}

module.exports = Bloco;
