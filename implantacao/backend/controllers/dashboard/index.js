/**
 * Export centralizado de controllers de Dashboard
 */
const DashboardController = require('./DashboardController');

module.exports = {
  obterEstatisticas: DashboardController.obterEstatisticas,
  obterResumoExecutivo: DashboardController.obterResumoExecutivo
};

