/**
 * Índice dos Controllers de Receitas
 * Centraliza a exportação de todos os controllers organizados
 */

const ReceitasCRUDController = require('./ReceitasCRUDController');
const ReceitasListController = require('./ReceitasListController');
const ReceitasExportController = require('./ReceitasExportController');
const { ReceitasImportController, upload } = require('./ReceitasImportController');

module.exports = {
  // Métodos CRUD
  criar: ReceitasCRUDController.criar,
  buscarPorId: ReceitasCRUDController.buscarPorId,
  atualizar: ReceitasCRUDController.atualizar,
  excluir: ReceitasCRUDController.excluir,
  verificarReceitaPorCentroCustoEProdutos: ReceitasCRUDController.verificarReceitaPorCentroCustoEProdutos,
  
  // Métodos de Listagem
  listar: ReceitasListController.listar,
  exportarJSON: ReceitasListController.exportarJSON,
  
  // Métodos de Exportação
  exportarXLSX: ReceitasExportController.exportarXLSX,
  exportarPDF: ReceitasExportController.exportarPDF,
  
  // Métodos de Importação
  baixarModelo: ReceitasImportController.baixarModelo,
  importar: ReceitasImportController.importar,
  upload
};

