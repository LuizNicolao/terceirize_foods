const AlmoxarifadoListController = require('./AlmoxarifadoListController');
const AlmoxarifadoCRUDController = require('./AlmoxarifadoCRUDController');
const AlmoxarifadoSearchController = require('./AlmoxarifadoSearchController');
const AlmoxarifadoStatsController = require('./AlmoxarifadoStatsController');

module.exports = {
  listarAlmoxarifados: AlmoxarifadoListController.listarAlmoxarifados,
  buscarAlmoxarifadoPorId: AlmoxarifadoListController.buscarAlmoxarifadoPorId,
  criarAlmoxarifado: AlmoxarifadoCRUDController.criarAlmoxarifado,
  atualizarAlmoxarifado: AlmoxarifadoCRUDController.atualizarAlmoxarifado,
  excluirAlmoxarifado: AlmoxarifadoCRUDController.excluirAlmoxarifado,
  obterProximoCodigo: AlmoxarifadoCRUDController.obterProximoCodigo,
  buscarAlmoxarifadosAtivos: AlmoxarifadoSearchController.buscarAlmoxarifadosAtivos,
  buscarAlmoxarifadoPorCodigo: AlmoxarifadoSearchController.buscarAlmoxarifadoPorCodigo,
  buscarAlmoxarifadosPorFilial: AlmoxarifadoSearchController.buscarAlmoxarifadosPorFilial,
  buscarAlmoxarifadosPorCentroCusto: AlmoxarifadoSearchController.buscarAlmoxarifadosPorCentroCusto,
  buscarEstatisticas: AlmoxarifadoStatsController.buscarEstatisticas,
};

