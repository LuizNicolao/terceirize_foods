const { 
  obterEstatisticas,
  obterMetricas,
  obterGraficos
} = require('./DashboardStatsController');

const { 
  obterDadosRecentes,
  obterAlertas
} = require('./DashboardRecentesController');

module.exports = {
  // Statistics Operations
  obterEstatisticas,
  obterMetricas,
  obterGraficos,
  
  // Recent Data Operations
  obterDadosRecentes,
  obterAlertas
};
