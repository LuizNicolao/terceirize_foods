const AlmoxarifadoEstoqueListController = require('./AlmoxarifadoEstoqueListController');
const AlmoxarifadoEstoqueCRUDController = require('./AlmoxarifadoEstoqueCRUDController');
const AlmoxarifadoEstoqueStatsController = require('./AlmoxarifadoEstoqueStatsController');

module.exports = {
  listarEstoques: AlmoxarifadoEstoqueListController.listarEstoques,
  buscarEstoquePorId: AlmoxarifadoEstoqueListController.buscarEstoquePorId,
  criarEstoque: AlmoxarifadoEstoqueCRUDController.criarEstoque,
  atualizarEstoque: AlmoxarifadoEstoqueCRUDController.atualizarEstoque,
  excluirEstoque: AlmoxarifadoEstoqueCRUDController.excluirEstoque,
  buscarEstatisticas: AlmoxarifadoEstoqueStatsController.buscarEstatisticas,
};

