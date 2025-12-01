const AlmoxarifadoEstoqueListController = require('./AlmoxarifadoEstoqueListController');
const AlmoxarifadoEstoqueCRUDController = require('./AlmoxarifadoEstoqueCRUDController');
const AlmoxarifadoEstoqueStatsController = require('./AlmoxarifadoEstoqueStatsController');
const AlmoxarifadoEstoqueExportController = require('./AlmoxarifadoEstoqueExportController');

module.exports = {
  listarEstoques: AlmoxarifadoEstoqueListController.listarEstoques,
  buscarEstoquePorId: AlmoxarifadoEstoqueListController.buscarEstoquePorId,
  buscarVariacoesProduto: AlmoxarifadoEstoqueListController.buscarVariacoesProduto,
  obterOpcoesFiltros: AlmoxarifadoEstoqueListController.obterOpcoesFiltros,
  criarEstoque: AlmoxarifadoEstoqueCRUDController.criarEstoque,
  atualizarEstoque: AlmoxarifadoEstoqueCRUDController.atualizarEstoque,
  excluirEstoque: AlmoxarifadoEstoqueCRUDController.excluirEstoque,
  buscarEstatisticas: AlmoxarifadoEstoqueStatsController.buscarEstatisticas,
  exportarXLSX: AlmoxarifadoEstoqueExportController.exportarXLSX,
  exportarPDF: AlmoxarifadoEstoqueExportController.exportarPDF,
  exportarVariacoesPDF: AlmoxarifadoEstoqueExportController.exportarVariacoesPDF,
};

