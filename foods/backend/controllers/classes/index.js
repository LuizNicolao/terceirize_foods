/**
 * Índice dos Controllers de Classes
 * Centraliza a exportação de todos os controllers organizados
 */

const ClassesListController = require('./ClassesListController');
const ClassesCRUDController = require('./ClassesCRUDController');
const ClassesSearchController = require('./ClassesSearchController');
const ClassesStatsController = require('./ClassesStatsController');
const ClassesExportController = require('./ClassesExportController');

module.exports = {
  // Métodos de Listagem
  listarClasses: ClassesListController.listarClasses,
  buscarClassePorId: ClassesListController.buscarClassePorId,
  
  // Métodos CRUD
  criarClasse: ClassesCRUDController.criarClasse,
  atualizarClasse: ClassesCRUDController.atualizarClasse,
  excluirClasse: ClassesCRUDController.excluirClasse,
  
  // Métodos de Busca
  buscarClassesAtivas: ClassesSearchController.buscarClassesAtivas,
  buscarClassesPorSubgrupo: ClassesSearchController.buscarClassesPorSubgrupo,
  buscarClassesPorCodigo: ClassesSearchController.buscarClassesPorCodigo,
  listarSubgrupos: ClassesSearchController.listarSubgrupos,
  
  // Métodos de Estatísticas
  buscarEstatisticas: ClassesStatsController.buscarEstatisticas,
  
  // Métodos de Exportação
  exportarXLSX: ClassesExportController.exportarXLSX,
  exportarPDF: ClassesExportController.exportarPDF
};
