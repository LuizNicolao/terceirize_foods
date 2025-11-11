const RegistrosDiariosCRUDController = require('./RegistrosDiariosCRUDController');
const RegistrosDiariosListController = require('./RegistrosDiariosListController');
const RegistrosDiariosStatsController = require('./RegistrosDiariosStatsController');
const RegistrosDiariosExportController = require('./RegistrosDiariosExportController');

module.exports = {
  criar: RegistrosDiariosCRUDController.criar,
  buscarPorEscolaData: RegistrosDiariosCRUDController.buscarPorEscolaData,
  excluir: RegistrosDiariosCRUDController.excluir,
  listar: RegistrosDiariosListController.listar,
  listarMedias: RegistrosDiariosListController.listarMedias,
  listarHistorico: RegistrosDiariosListController.listarHistorico,
  calcularMediasPorPeriodo: RegistrosDiariosListController.calcularMediasPorPeriodo,
  obterEstatisticas: RegistrosDiariosStatsController.obterEstatisticas,
  exportarXLSX: RegistrosDiariosExportController.exportarXLSX,
  exportarPDF: RegistrosDiariosExportController.exportarPDF
};

