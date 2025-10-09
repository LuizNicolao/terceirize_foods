/**
 * Índice dos Controllers de Intolerâncias
 * Centraliza a exportação de todos os controllers organizados
 */

const IntoleranciasListController = require('./IntoleranciasListController');
const IntoleranciasCRUDController = require('./IntoleranciasCRUDController');
const IntoleranciasStatsController = require('./IntoleranciasStatsController');
const IntoleranciasExportController = require('./IntoleranciasExportController');

module.exports = {
  // Métodos de Listagem
  listarIntolerancias: IntoleranciasListController.listarIntolerancias,
  buscarIntoleranciaPorId: IntoleranciasListController.buscarIntoleranciaPorId,
  buscarIntoleranciasAtivas: IntoleranciasListController.buscarIntoleranciasAtivas,
  
  // Métodos CRUD
  criarIntolerancia: IntoleranciasCRUDController.criarIntolerancia,
  atualizarIntolerancia: IntoleranciasCRUDController.atualizarIntolerancia,
  excluirIntolerancia: IntoleranciasCRUDController.excluirIntolerancia,
  
  // Métodos de Estatísticas
  buscarEstatisticas: IntoleranciasStatsController.buscarEstatisticas,
  
  // Métodos de Exportação
  exportarXLSX: IntoleranciasExportController.exportarXLSX,
  exportarPDF: IntoleranciasExportController.exportarPDF
};
