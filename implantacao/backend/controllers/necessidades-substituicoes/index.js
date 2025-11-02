/**
 * Controllers de Substituições de Necessidades
 * Centraliza a exportação de todos os controllers
 */

const SubstituicoesListController = require('./SubstituicoesListController');
const SubstituicoesCRUDController = require('./SubstituicoesCRUDController');

module.exports = {
  // List Operations
  listarParaSubstituicao: SubstituicoesListController.listarParaSubstituicao,
  listarParaCoordenacao: SubstituicoesListController.listarParaCoordenacao,
  buscarSemanaConsumo: SubstituicoesListController.buscarSemanaConsumo,
  buscarProdutosGenericos: SubstituicoesListController.buscarProdutosGenericos,
  buscarTiposRotaDisponiveis: SubstituicoesListController.buscarTiposRotaDisponiveis,
  buscarRotasDisponiveis: SubstituicoesListController.buscarRotasDisponiveis,
  buscarGruposDisponiveisParaSubstituicao: SubstituicoesListController.buscarGruposDisponiveisParaSubstituicao,
  buscarSemanasAbastecimentoDisponiveisParaSubstituicao: SubstituicoesListController.buscarSemanasAbastecimentoDisponiveisParaSubstituicao,

  // CRUD Operations
  salvarSubstituicao: SubstituicoesCRUDController.salvarSubstituicao,
  deletarSubstituicao: SubstituicoesCRUDController.deletarSubstituicao,
  liberarAnalise: SubstituicoesCRUDController.liberarAnalise
};
