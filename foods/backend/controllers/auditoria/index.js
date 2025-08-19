/**
 * Índice dos Controllers de Auditoria
 * Centraliza a exportação de todos os controllers organizados
 */

const AuditoriaListController = require('./AuditoriaListController');
const AuditoriaExportController = require('./AuditoriaExportController');
const AuditoriaTestController = require('./AuditoriaTestController');

module.exports = {
  // Métodos de Listagem
  listarLogs: AuditoriaListController.listarLogs,
  buscarEstatisticas: AuditoriaListController.buscarEstatisticas,
  
  // Métodos de Exportação
  exportarXLSX: AuditoriaExportController.exportarXLSX,
  exportarPDF: AuditoriaExportController.exportarPDF,
  
  // Métodos de Teste
  testarConectividade: AuditoriaTestController.testarConectividade,
  testarGetAuditLogs: AuditoriaTestController.testarGetAuditLogs,
  testarPermissoes: AuditoriaTestController.testarPermissoes,
  testarCompleto: AuditoriaTestController.testarCompleto
};
