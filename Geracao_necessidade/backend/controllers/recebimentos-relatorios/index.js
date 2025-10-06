const { 
  relatorioPendencias,
  relatorioCompletos,
  listar
} = require('./RecebimentosRelatoriosListController');

const { 
  dashboardRelatorios,
  obterEstatisticas,
  obterResumo
} = require('./RecebimentosRelatoriosStatsController');

module.exports = {
  // List Operations
  relatorioPendencias,
  relatorioCompletos,
  listar,
  
  // Statistics Operations
  dashboardRelatorios,
  obterEstatisticas,
  obterResumo
};
