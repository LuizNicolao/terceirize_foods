/**
 * Índice dos controllers de Receitas,
 * Centraliza a exportação dos controllers organizados,
 */

const ReceitasListController = require('./ReceitasListController');
const ReceitasCRUDController = require('./ReceitasCRUDController');
const ReceitasExportController = require('./ReceitasExportController');

module.exports = {
  ReceitasListController,
  ReceitasCRUDController,
  ReceitasExportController,
  
  // Métodos de Exportação
  exportarXLSX: ReceitasExportController.exportarXLSX,
  exportarPDF: ReceitasExportController.exportarPDF
};
