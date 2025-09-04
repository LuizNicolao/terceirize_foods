/**
 * Controllers de Rotas Nutricionistas
 * Centraliza a exportação de todos os controllers relacionados a rotas nutricionistas
 */

const RotasNutricionistasCRUDController = require('./RotasNutricionistasCRUDController');
const RotasNutricionistasExportController = require('./RotasNutricionistasExportController');

module.exports = {
  // Controller principal com operações CRUD
  listar: RotasNutricionistasCRUDController.listar,
  buscarPorId: RotasNutricionistasCRUDController.buscarPorId,
  criar: RotasNutricionistasCRUDController.criar,
  atualizar: RotasNutricionistasCRUDController.atualizar,
  excluir: RotasNutricionistasCRUDController.excluir,

  // Controller para exportação
  exportarXLSX: RotasNutricionistasExportController.exportarXLSX,
  exportarPDF: RotasNutricionistasExportController.exportarPDF
};
