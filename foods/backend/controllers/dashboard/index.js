/**
 * Índice dos Controllers de Dashboard
 * Centraliza a exportação de todos os controllers organizados
 */

const DashboardStatsController = require('./DashboardStatsController');
const DashboardRecentesController = require('./DashboardRecentesController');

module.exports = {
  // Métodos de Estatísticas
  obterEstatisticas: DashboardStatsController.obterEstatisticas,
  
  // Métodos de Dados Recentes
  obterDadosRecentes: DashboardRecentesController.obterDadosRecentes,
  
  // Métodos de Alertas
  obterAlertas: DashboardStatsController.obterAlertas
};
