const ConsultaStatusController = require('./ConsultaStatusController');

module.exports = {
  listarStatusNecessidades: ConsultaStatusController.listarStatusNecessidades,
  obterEstatisticas: ConsultaStatusController.obterEstatisticas,
  obterOpcoesFiltros: ConsultaStatusController.obterOpcoesFiltros,
  buscarProdutosPorGrupo: ConsultaStatusController.buscarProdutosPorGrupo,
  exportarXLSX: ConsultaStatusController.exportarXLSX,
  exportarPDF: ConsultaStatusController.exportarPDF,
  listarNecVsConf: ConsultaStatusController.listarNecVsConf
};
