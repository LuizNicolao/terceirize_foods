/**
 * Índice dos Controllers de Unidades de Medida
 * Centraliza a exportação de todos os controllers organizados
 */

const UnidadesListController = require('./UnidadesListController');
const UnidadesCRUDController = require('./UnidadesCRUDController');
const UnidadesSearchController = require('./UnidadesSearchController');
const UnidadesStatsController = require('./UnidadesStatsController');
const UnidadesExportController = require('./UnidadesExportController');

module.exports = {
  // Métodos de Listagem
  listarUnidades: UnidadesListController.listarUnidades,
  buscarUnidadePorId: UnidadesListController.buscarUnidadePorId,
  
  // Métodos CRUD
  criarUnidade: UnidadesCRUDController.criarUnidade,
  atualizarUnidade: UnidadesCRUDController.atualizarUnidade,
  excluirUnidade: UnidadesCRUDController.excluirUnidade,
  
  // Métodos de Busca
  buscarUnidadesAtivas: UnidadesSearchController.buscarUnidadesAtivas,
  buscarUnidadesPorTipo: UnidadesSearchController.buscarUnidadesPorTipo,
  listarTiposUnidades: UnidadesSearchController.listarTiposUnidades,
  
  // Métodos de Estatísticas
  buscarUnidadesMaisUtilizadas: UnidadesStatsController.buscarUnidadesMaisUtilizadas
};
