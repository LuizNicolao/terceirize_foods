const ConsultaStatusController = require('./ConsultaStatusController');

module.exports = {
  listarStatusNecessidades: ConsultaStatusController.listarStatusNecessidades,
  obterEstatisticas: ConsultaStatusController.obterEstatisticas,
  exportarXLSX: ConsultaStatusController.exportarXLSX,
  exportarPDF: ConsultaStatusController.exportarPDF
};
