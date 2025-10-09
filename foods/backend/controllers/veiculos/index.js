/**
 * Índice dos Controllers de Veículos
 * Centraliza a exportação de todos os controllers organizados
 */

const VeiculosListController = require('./VeiculosListController');
const VeiculosCRUDController = require('./VeiculosCRUDController');
const VeiculosSearchController = require('./VeiculosSearchController');
const VeiculosStatsController = require('./VeiculosStatsController');

const VeiculosExportController = require('./VeiculosExportController');
module.exports = {
  // Métodos de Listagem
  listarVeiculos: VeiculosListController.listarVeiculos,
  buscarVeiculoPorId: VeiculosListController.buscarVeiculoPorId,
  
  // Métodos CRUD
  criarVeiculo: VeiculosCRUDController.criarVeiculo,
  atualizarVeiculo: VeiculosCRUDController.atualizarVeiculo,
  excluirVeiculo: VeiculosCRUDController.excluirVeiculo,
  
  // Métodos de Busca
  buscarVeiculosAtivos: VeiculosSearchController.buscarVeiculosAtivos,
  buscarVeiculosPorFilial: VeiculosSearchController.buscarVeiculosPorFilial,
  buscarVeiculosPorTipo: VeiculosSearchController.buscarVeiculosPorTipo,
  listarTiposVeiculos: VeiculosSearchController.listarTiposVeiculos,
  listarCategoriasVeiculos: VeiculosSearchController.listarCategoriasVeiculos,
  
  // Métodos de Estatísticas
  buscarVeiculosDocumentacaoVencendo: VeiculosStatsController.buscarVeiculosDocumentacaoVencendo
  
  // Métodos de Exportação
  exportarXLSX: VeiculosExportController.exportarXLSX,
  exportarPDF: VeiculosExportController.exportarPDF
};
