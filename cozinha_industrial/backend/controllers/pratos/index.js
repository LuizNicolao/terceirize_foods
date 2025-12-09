const PratosCRUDController = require('./PratosCRUDController');
const PratosListController = require('./PratosListController');
const PratosExportController = require('./PratosExportController');
const { PratosImportController, upload } = require('./PratosImportController');

module.exports = {
  // Métodos CRUD
  criar: PratosCRUDController.criar,
  buscarPorId: PratosCRUDController.buscarPorId,
  atualizar: PratosCRUDController.atualizar,
  excluir: PratosCRUDController.excluir,
  
  // Métodos de Listagem
  listar: PratosListController.listar,
  exportarJSON: PratosListController.exportarJSON,
  
  // Métodos de Exportação
  exportarXLSX: PratosExportController.exportarXLSX,
  exportarPDF: PratosExportController.exportarPDF,
  
  // Métodos de Importação
  baixarModelo: PratosImportController.baixarModelo,
  importar: PratosImportController.importar,
  upload
};

