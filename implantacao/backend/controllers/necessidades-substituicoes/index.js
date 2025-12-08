/**
 * Controllers de Substituições de Necessidades
 * Centraliza a exportação de todos os controllers
 */

const SubstituicoesNutricionistaListController = require('./nutricionista/SubstituicoesNutricionistaListController');
const SubstituicoesCoordenacaoListController = require('./coordenacao/SubstituicoesCoordenacaoListController');
const SubstituicoesSharedController = require('./shared/SubstituicoesSharedController');
const SubstituicoesCRUDController = require('./SubstituicoesCRUDController');
const SubstituicoesImpressaoController = require('./SubstituicoesImpressaoController');
const SubstituicoesExportController = require('./SubstituicoesExportController');

module.exports = {
  // List Operations - Nutricionista
  listarParaSubstituicao: SubstituicoesNutricionistaListController.listar,
  
  // List Operations - Coordenação
  listarParaCoordenacao: SubstituicoesCoordenacaoListController.listar,
  
  // Shared Operations
  buscarSemanaConsumo: SubstituicoesSharedController.buscarSemanaConsumo,
  buscarProdutosGenericos: SubstituicoesSharedController.buscarProdutosGenericos,
  buscarTiposRotaDisponiveis: SubstituicoesSharedController.buscarTiposRotaDisponiveis,
  buscarRotasDisponiveis: SubstituicoesSharedController.buscarRotasDisponiveis,
  buscarGruposDisponiveisParaSubstituicao: SubstituicoesSharedController.buscarGruposDisponiveisParaSubstituicao,
  buscarSemanasAbastecimentoDisponiveisParaSubstituicao: SubstituicoesSharedController.buscarSemanasAbastecimentoDisponiveisParaSubstituicao,

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
