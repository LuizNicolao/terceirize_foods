/**
 * Controllers de Substituições de Necessidades
 * Centraliza a exportação de todos os controllers
 */

const SubstituicoesListController = require('./SubstituicoesListController');
const SubstituicoesCRUDController = require('./SubstituicoesCRUDController');
const SubstituicoesNutricionistaController = require('./SubstituicoesNutricionistaController');
const SubstituicoesCoordenacaoController = require('./SubstituicoesCoordenacaoController');
const SubstituicoesExportController = require('./SubstituicoesExportController');

module.exports = {
  // List Operations
  listarParaSubstituicao: SubstituicoesListController.listarParaSubstituicao,
  buscarSemanaConsumo: SubstituicoesListController.buscarSemanaConsumo,
  buscarProdutosGenericos: SubstituicoesListController.buscarProdutosGenericos,

  // CRUD Operations
  salvarSubstituicao: SubstituicoesCRUDController.salvarSubstituicao,
  deletarSubstituicao: SubstituicoesCRUDController.deletarSubstituicao,
  aprovarSubstituicao: SubstituicoesCRUDController.aprovarSubstituicao,

  // Nutricionista Operations
  listarParaNutricionista: SubstituicoesNutricionistaController.listarParaNutricionista,
  iniciarAjustes: SubstituicoesNutricionistaController.iniciarAjustes,
  liberarParaCoordenacao: SubstituicoesNutricionistaController.liberarParaCoordenacao,

  // Coordenação Operations
  listarParaCoordenacao: SubstituicoesCoordenacaoController.listarParaCoordenacao,
  aprovarSubstituicaoCoordenacao: SubstituicoesCoordenacaoController.aprovarSubstituicao,
  rejeitarSubstituicao: SubstituicoesCoordenacaoController.rejeitarSubstituicao,
  aprovarTodas: SubstituicoesCoordenacaoController.aprovarTodas,

  // Export Operations
  exportarPDF: SubstituicoesExportController.exportarPDF,
  exportarXLSX: SubstituicoesExportController.exportarXLSX
};
