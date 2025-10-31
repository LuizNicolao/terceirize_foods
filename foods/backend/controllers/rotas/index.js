/**
 * Índice dos Controllers de Rotas
 * Centraliza a exportação de todos os controllers organizados
 */

const RotasListController = require('./RotasListController');
const RotasCRUDController = require('./RotasCRUDController');
const RotasSearchController = require('./RotasSearchController');
const RotasStatsController = require('./RotasStatsController');
const RotasExportController = require('./RotasExportController');

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
  listarFrequenciasEntrega: RotasSearchController.listarFrequenciasEntrega,
  adicionarFrequenciaEntrega: RotasSearchController.adicionarFrequenciaEntrega,
  buscarUnidadesEscolaresRota: RotasSearchController.buscarUnidadesEscolaresRota,
  
  // Métodos de Estatísticas
  buscarEstatisticasRotas: RotasStatsController.buscarEstatisticasRotas,
  
  // Métodos de Exportação
  exportarXLSX: RotasExportController.exportarXLSX,
  exportarPDF: RotasExportController.exportarPDF
};
