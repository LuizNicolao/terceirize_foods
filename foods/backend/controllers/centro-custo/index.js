/**
 * Índice dos Controllers de Centro de Custo
 * Centraliza a exportação de todos os controllers organizados
 */

const CentroCustoListController = require('./CentroCustoListController');
const CentroCustoCRUDController = require('./CentroCustoCRUDController');
const CentroCustoSearchController = require('./CentroCustoSearchController');
const CentroCustoStatsController = require('./CentroCustoStatsController');

module.exports = {
  // Métodos de Listagem
  listarCentrosCusto: CentroCustoListController.listarCentrosCusto,
  buscarCentroCustoPorId: CentroCustoListController.buscarCentroCustoPorId,
  
  // Métodos CRUD
  criarCentroCusto: CentroCustoCRUDController.criarCentroCusto,
  atualizarCentroCusto: CentroCustoCRUDController.atualizarCentroCusto,
  excluirCentroCusto: CentroCustoCRUDController.excluirCentroCusto,
  obterProximoCodigo: CentroCustoCRUDController.obterProximoCodigo,
  
  // Métodos de Busca
  buscarCentrosCustoAtivos: CentroCustoSearchController.buscarCentrosCustoAtivos,
  buscarCentroCustoPorCodigo: CentroCustoSearchController.buscarCentroCustoPorCodigo,
  buscarCentrosCustoPorFilial: CentroCustoSearchController.buscarCentrosCustoPorFilial,
  
  // Métodos de Estatísticas
  buscarEstatisticas: CentroCustoStatsController.buscarEstatisticas
};

