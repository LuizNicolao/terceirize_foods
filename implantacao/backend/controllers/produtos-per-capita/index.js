/**
 * Controllers de Produtos Per Capita
 * Centraliza a exportação de todos os controllers
 */

const ProdutosPerCapitaCRUDController = require('./ProdutosPerCapitaCRUDController');
const ProdutosPerCapitaListController = require('./ProdutosPerCapitaListController');
const ProdutosPerCapitaStatsController = require('./ProdutosPerCapitaStatsController');

module.exports = {
  // CRUD Operations
  criar: ProdutosPerCapitaCRUDController.criar,
  buscarPorId: ProdutosPerCapitaCRUDController.buscarPorId,
  atualizar: ProdutosPerCapitaCRUDController.atualizar,
  excluir: ProdutosPerCapitaCRUDController.excluir,

  // List Operations
  listar: ProdutosPerCapitaListController.listar,
  buscarProdutosDisponiveis: ProdutosPerCapitaListController.buscarProdutosDisponiveis,
  buscarPorProdutos: ProdutosPerCapitaListController.buscarPorProdutos,

  // Stats Operations
  obterEstatisticas: ProdutosPerCapitaStatsController.obterEstatisticas,
  obterResumoPorPeriodo: ProdutosPerCapitaStatsController.obterResumoPorPeriodo,
  obterEstatisticasExportacao: ProdutosPerCapitaStatsController.obterEstatisticasExportacao
};
