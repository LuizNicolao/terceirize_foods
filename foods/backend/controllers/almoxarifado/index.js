const AlmoxarifadoListController = require('./AlmoxarifadoListController');
const AlmoxarifadoCRUDController = require('./AlmoxarifadoCRUDController');
const AlmoxarifadoSearchController = require('./AlmoxarifadoSearchController');
const AlmoxarifadoStatsController = require('./AlmoxarifadoStatsController');
const AlmoxarifadoExportController = require('./AlmoxarifadoExportController');

module.exports = {
  listarAlmoxarifados: AlmoxarifadoListController.listarAlmoxarifados,
  buscarAlmoxarifadoPorId: AlmoxarifadoListController.buscarAlmoxarifadoPorId,
  listarAlmoxarifadosPorFilial: AlmoxarifadoListController.listarAlmoxarifadosPorFilial,
  criarAlmoxarifado: AlmoxarifadoCRUDController.criarAlmoxarifado,
  atualizarAlmoxarifado: AlmoxarifadoCRUDController.atualizarAlmoxarifado,
  excluirAlmoxarifado: AlmoxarifadoCRUDController.excluirAlmoxarifado,
  obterProximoCodigo: AlmoxarifadoCRUDController.obterProximoCodigo,
  buscarAlmoxarifadosAtivos: AlmoxarifadoSearchController.buscarAlmoxarifadosAtivos,
  buscarAlmoxarifadoPorCodigo: AlmoxarifadoSearchController.buscarAlmoxarifadoPorCodigo,
  buscarAlmoxarifadosPorFilial: AlmoxarifadoSearchController.buscarAlmoxarifadosPorFilial,
  buscarAlmoxarifadosPorCentroCusto: AlmoxarifadoSearchController.buscarAlmoxarifadosPorCentroCusto,
  buscarEstatisticas: AlmoxarifadoStatsController.buscarEstatisticas,
  exportarXLSX: AlmoxarifadoExportController.exportarXLSX,
  exportarPDF: AlmoxarifadoExportController.exportarPDF,
};

