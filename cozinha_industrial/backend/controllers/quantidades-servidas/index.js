const QuantidadesServidasCRUDController = require('./QuantidadesServidasCRUDController');
const QuantidadesServidasListController = require('./QuantidadesServidasListController');
const QuantidadesServidasStatsController = require('./QuantidadesServidasStatsController');
const QuantidadesServidasExportController = require('./QuantidadesServidasExportController');

module.exports = {
  QuantidadesServidasCRUDController,
  QuantidadesServidasListController,
  QuantidadesServidasStatsController,
  QuantidadesServidasExportController,
  // Métodos principais
  criar: QuantidadesServidasCRUDController.criar,
  buscarPorUnidadeData: QuantidadesServidasCRUDController.buscarPorUnidadeData,
  excluir: QuantidadesServidasCRUDController.excluir,
  listar: QuantidadesServidasListController.listar,
  listarMedias: QuantidadesServidasListController.listarMedias,
  listarHistorico: QuantidadesServidasListController.listarHistorico,
  calcularMediasPorPeriodo: QuantidadesServidasListController.calcularMediasPorPeriodo,
  obterEstatisticas: QuantidadesServidasStatsController.obterEstatisticas,
  exportarXLSX: QuantidadesServidasExportController.exportarXLSX,
  exportarPDF: QuantidadesServidasExportController.exportarPDF
};

