/**
 * Índice dos controllers de Receitas,
 * Centraliza a exportação dos controllers organizados,
 */

const ReceitasListController = require('./ReceitasListController');
const ReceitasCRUDController = require('./ReceitasCRUDController');
const ReceitasExportController = require('./ReceitasExportController');

module.exports = {
  // Métodos de Listagem
  listar: ReceitasListController.listar,
  buscarPorId: ReceitasListController.buscarPorId,
  listarReceitas: ReceitasListController.listarReceitas,
  buscarReceitaPorId: ReceitasListController.buscarReceitaPorId,
  
  // Métodos CRUD
  criar: ReceitasCRUDController.criar,
  atualizar: ReceitasCRUDController.atualizar,
  excluir: ReceitasCRUDController.excluir,
  criarReceita: ReceitasCRUDController.criarReceita,
  atualizarReceita: ReceitasCRUDController.atualizarReceita,
  excluirReceita: ReceitasCRUDController.excluirReceita,
  
  // Métodos de Exportação
  exportarXLSX: ReceitasExportController.exportarXLSX,
  exportarPDF: ReceitasExportController.exportarPDF
};
