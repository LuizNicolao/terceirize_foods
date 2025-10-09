/**
 * Índice dos Controllers de Marcas
 * Centraliza a exportação de todos os controllers organizados
 */

const MarcasListController = require('./MarcasListController');
const MarcasCRUDController = require('./MarcasCRUDController');
const MarcasSearchController = require('./MarcasSearchController');
const MarcasExportController = require('./MarcasExportController');

module.exports = {
  // Métodos de Listagem
  listarMarcas: MarcasListController.listarMarcas,
  buscarMarcaPorId: MarcasListController.buscarMarcaPorId,
  
  // Métodos CRUD
  criarMarca: MarcasCRUDController.criarMarca,
  atualizarMarca: MarcasCRUDController.atualizarMarca,
  excluirMarca: MarcasCRUDController.excluirMarca,
  
  // Métodos de Busca
  buscarAtivas: MarcasSearchController.buscarAtivas,
  buscarPorFabricante: MarcasSearchController.buscarPorFabricante,
  
  // Métodos de Exportação
  exportarXLSX: MarcasExportController.exportarXLSX,
  exportarPDF: MarcasExportController.exportarPDF
};
