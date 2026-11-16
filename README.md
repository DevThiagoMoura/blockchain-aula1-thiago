# blockchain-aula1-thiago

Registro de entregas à prova de adulteração, feito em Node.js, aplicando as três ideias vistas em aula:

1. **Hash que identifica cada bloco**: SHA-256 de `indice`, `dados` e `hashAnterior`, calculado pelo próprio bloco.
2. **Encadeamento pelo hash anterior**: cada bloco guarda o hash do bloco que vem antes; o gênese usa `'0'`.
3. **Validação que percorre a cadeia**: `ehValida()` recalcula os hashes e confere os elos do bloco 1 até o fim.

## Arquivos

| Arquivo               | Responsabilidade                                                                        |
|-----------------------|-----------------------------------------------------------------------------------------|
| `bloco.js`            | Classe `Bloco`: valida os dados (3 a 80 caracteres) e calcula o próprio hash.             |
| `blockchain.js`       | Classe `Blockchain`: começa com o gênese, `adicionar(dados)`, `ehValida()` e `verificarBloco(i)`. |
| `principal.js`        | Programa de terminal: cadastra entregas, testa dados inválidos e simula adulteração.      |
| `entregas-exemplo.js` | Entregas de exemplo usadas pelo terminal e pela tela.                                    |
| `servidor.js`         | Servidor Express que usa as mesmas classes e expõe a cadeia para a tela.                 |
| `public/`             | Tela no navegador (HTML, CSS e JavaScript).                                              |

## Como executar

Requer Node.js 18 ou superior.

### Programa de terminal (o fluxo pedido no enunciado)

```bash
node principal.js
```

Mostra o cadastro de 4 entregas, a cadeia válida, as tentativas com dados inválidos (cada erro aparece sem derrubar o programa) e a adulteração de `registro.cadeia[1].dados`, que deixa a cadeia inválida.

### Tela interativa

```bash
npm install
npm start
```

Abra http://localhost:3000. Na tela dá para:

- cadastrar entregas (dados inválidos mostram a mensagem de erro do `Bloco`);
- ver cada bloco com seus dados, hash e hash anterior, e o elo que o liga ao bloco de antes;
- **adulterar** os dados de um bloco: o selo da cadeia fica vermelho e o bloco mostra que o hash guardado não bate com o recalculado;
- **recalcular o hash** do bloco adulterado: o bloco parece íntegro, mas o elo com o bloco seguinte quebra;
- **reiniciar** a cadeia com as entregas de exemplo.

A cadeia fica na memória do servidor, então ela volta ao estado inicial quando o servidor é reiniciado.
