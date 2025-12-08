/**
 * Índice dos Controllers de Receitas
 * Centraliza a exportação de todos os controllers organizados
 */

const ReceitasCRUDController = require('./ReceitasCRUDController');
const ReceitasListController = require('./ReceitasListController');

module.exports = {
  // Métodos CRUD
  criar: ReceitasCRUDController.criar,
  buscarPorId: ReceitasCRUDController.buscarPorId,
  atualizar: ReceitasCRUDController.atualizar,
  excluir: ReceitasCRUDController.excluir,
  
  // Métodos de Listagem
  listar: ReceitasListController.listar,
  exportarJSON: ReceitasListController.exportarJSON
};

