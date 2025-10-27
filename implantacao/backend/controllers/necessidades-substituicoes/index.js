/**
 * Controllers de Substituições de Necessidades
 * Centraliza a exportação de todos os controllers
 */

const SubstituicoesListController = require('./SubstituicoesListController');
const SubstituicoesCRUDController = require('./SubstituicoesCRUDController');

module.exports = {
  // List Operations
  listarParaSubstituicao: SubstituicoesListController.listarParaSubstituicao,
  buscarProdutosGenericos: SubstituicoesListController.buscarProdutosGenericos,

  // CRUD Operations
  salvarSubstituicao: SubstituicoesCRUDController.salvarSubstituicao,
  deletarSubstituicao: SubstituicoesCRUDController.deletarSubstituicao,
  aprovarSubstituicao: SubstituicoesCRUDController.aprovarSubstituicao
};
