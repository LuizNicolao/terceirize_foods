/**
 * Controllers de Substituições de Necessidades
 * Centraliza a exportação de todos os controllers
 */

const SubstituicoesListController = require('./SubstituicoesListController');
const SubstituicoesCRUDController = require('./SubstituicoesCRUDController');
const SubstituicoesImpressaoController = require('./SubstituicoesImpressaoController');
const SubstituicoesExportController = require('./SubstituicoesExportController');

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
  liberarAnalise: SubstituicoesCRUDController.liberarAnalise,
  trocarProdutoOrigem: SubstituicoesCRUDController.trocarProdutoOrigem,
  desfazerTrocaProduto: SubstituicoesCRUDController.desfazerTrocaProduto,

  // Impressão
  buscarDadosImpressao: SubstituicoesImpressaoController.buscarDadosImpressao,
  marcarComoImpresso: SubstituicoesImpressaoController.marcarComoImpresso,

  // Exportação
  exportarXLSX: SubstituicoesExportController.exportarXLSX,
  exportarPDF: SubstituicoesExportController.exportarPDF
};
