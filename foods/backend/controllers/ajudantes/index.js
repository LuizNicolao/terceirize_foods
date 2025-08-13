/**
 * Índice dos Controllers de Ajudantes
 * Centraliza a exportação de todos os controllers organizados
 */

const AjudantesListController = require('./AjudantesListController');
const AjudantesCRUDController = require('./AjudantesCRUDController');
const AjudantesSearchController = require('./AjudantesSearchController');
const AjudantesStatsController = require('./AjudantesStatsController');

module.exports = {
  // Métodos de Listagem
  listarAjudantes: AjudantesListController.listarAjudantes,
  buscarAjudantePorId: AjudantesListController.buscarAjudantePorId,
  
  // Métodos CRUD
  criarAjudante: AjudantesCRUDController.criarAjudante,
  atualizarAjudante: AjudantesCRUDController.atualizarAjudante,
  excluirAjudante: AjudantesCRUDController.excluirAjudante,
  
  // Métodos de Busca
  buscarAjudantesAtivos: AjudantesSearchController.buscarAjudantesAtivos,
  buscarAjudantesPorFilial: AjudantesSearchController.buscarAjudantesPorFilial,
  buscarAjudantesPorStatus: AjudantesSearchController.buscarAjudantesPorStatus,
  listarStatus: AjudantesSearchController.listarStatus,
  
  // Métodos de Estatísticas
  buscarAjudantesDisponiveis: AjudantesStatsController.buscarAjudantesDisponiveis
};
