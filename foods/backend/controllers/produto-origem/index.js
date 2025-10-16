/**
 * Controllers de Produto Origem
 * Centraliza todas as operações relacionadas a produtos origem
 */

const ProdutoOrigemCRUDController = require('./ProdutoOrigemCRUDController');
const ProdutoOrigemListController = require('./ProdutoOrigemListController');
const ProdutoOrigemSearchController = require('./ProdutoOrigemSearchController');
const ProdutoOrigemStatsController = require('./ProdutoOrigemStatsController');
const ProdutoOrigemExportController = require('./ProdutoOrigemExportController');
const ProdutoOrigemImportController = require('./ProdutoOrigemImportController');

module.exports = {
  // Operações CRUD
  criarProdutoOrigem: ProdutoOrigemCRUDController.criarProdutoOrigem,
  atualizarProdutoOrigem: ProdutoOrigemCRUDController.atualizarProdutoOrigem,
  excluirProdutoOrigem: ProdutoOrigemCRUDController.excluirProdutoOrigem,
  obterProximoCodigo: ProdutoOrigemCRUDController.obterProximoCodigo,

  // Operações de listagem e busca
  listarProdutosOrigem: ProdutoOrigemListController.listarProdutosOrigem,
  buscarProdutoOrigemPorId: ProdutoOrigemListController.buscarProdutoOrigemPorId,
  buscarProdutosOrigemPorGrupo: ProdutoOrigemListController.buscarProdutosOrigemPorGrupo,
  buscarProdutosOrigemPorSubgrupo: ProdutoOrigemListController.buscarProdutosOrigemPorSubgrupo,
  buscarProdutosOrigemPorClasse: ProdutoOrigemListController.buscarProdutosOrigemPorClasse,
  buscarProdutosOrigemAtivos: ProdutoOrigemListController.buscarProdutosOrigemAtivos,
  buscarProdutoOrigemPorCodigo: ProdutoOrigemListController.buscarProdutoOrigemPorCodigo,

  // Listagens auxiliares
  listarGrupos: ProdutoOrigemListController.listarGrupos,
  listarSubgrupos: ProdutoOrigemListController.listarSubgrupos,
  listarClasses: ProdutoOrigemListController.listarClasses,
  listarUnidadesMedida: ProdutoOrigemListController.listarUnidadesMedida,
  listarProdutosGenericosPadrao: ProdutoOrigemListController.listarProdutosGenericosPadrao,

  // Operações de busca avançada
  buscaAvancada: ProdutoOrigemSearchController.buscaAvancada,
  buscarPorSimilaridade: ProdutoOrigemSearchController.buscarPorSimilaridade,
  buscarPorCodigo: ProdutoOrigemSearchController.buscarPorCodigo,
  buscarSemClassificacao: ProdutoOrigemSearchController.buscarSemClassificacao,

  // Operações de estatísticas
  estatisticasGerais: ProdutoOrigemStatsController.estatisticasGerais,
  estatisticasPorGrupo: ProdutoOrigemStatsController.estatisticasPorGrupo,
  estatisticasPorSubgrupo: ProdutoOrigemStatsController.estatisticasPorSubgrupo,
  estatisticasPorClasse: ProdutoOrigemStatsController.estatisticasPorClasse,
  estatisticasPorUnidadeMedida: ProdutoOrigemStatsController.estatisticasPorUnidadeMedida,
  produtosRecentes: ProdutoOrigemStatsController.produtosRecentes,
  produtosMaisAtualizados: ProdutoOrigemStatsController.produtosMaisAtualizados,
  relatorioSemClassificacao: ProdutoOrigemStatsController.relatorioSemClassificacao,
  distribuicaoFatorConversao: ProdutoOrigemStatsController.distribuicaoFatorConversao,
  distribuicaoPesoLiquido: ProdutoOrigemStatsController.distribuicaoPesoLiquido,
  
  // Métodos de Exportação
  exportarXLSX: ProdutoOrigemExportController.exportarXLSX,
  exportarPDF: ProdutoOrigemExportController.exportarPDF,
  
  // Métodos de Importação
  importarExcel: ProdutoOrigemImportController.importarExcel,
  baixarModelo: ProdutoOrigemImportController.baixarModelo
};
