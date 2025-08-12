/**
 * Índice dos Controllers de Rotas
 * Centraliza a exportação de todos os controllers organizados
 */

const RotasListController = require('./RotasListController');
const RotasCRUDController = require('./RotasCRUDController');
const RotasSearchController = require('./RotasSearchController');
const RotasStatsController = require('./RotasStatsController');

module.exports = {
  // Métodos de Listagem
  listarRotas: RotasListController.listarRotas,
  buscarRotaPorId: RotasListController.buscarRotaPorId,
  
  // Métodos CRUD
  criarRota: RotasCRUDController.criarRota,
  atualizarRota: RotasCRUDController.atualizarRota,
  excluirRota: RotasCRUDController.excluirRota,
  
  // Métodos de Busca
  buscarRotasAtivas: RotasSearchController.buscarRotasAtivas,
  buscarRotasPorFilial: RotasSearchController.buscarRotasPorFilial,
  buscarRotasPorTipo: RotasSearchController.buscarRotasPorTipo,
  listarTiposRota: RotasSearchController.listarTiposRota,
  buscarUnidadesEscolaresRota: RotasSearchController.buscarUnidadesEscolaresRota,
  
  // Métodos de Estatísticas
  buscarEstatisticasRotas: RotasStatsController.buscarEstatisticasRotas
};
