/**
 * Índice dos Controllers de Intolerâncias
 * Centraliza a exportação de todos os controllers organizados
 */

const IntoleranciasListController = require('./IntoleranciasListController');
const IntoleranciasCRUDController = require('./IntoleranciasCRUDController');

module.exports = {
  // Métodos de Listagem
  listarIntolerancias: IntoleranciasListController.listarIntolerancias,
  buscarIntoleranciaPorId: IntoleranciasListController.buscarIntoleranciaPorId,
  listarIntoleranciasAtivas: IntoleranciasListController.listarIntoleranciasAtivas,
  
  // Métodos CRUD
  criarIntolerancia: IntoleranciasCRUDController.criarIntolerancia,
  atualizarIntolerancia: IntoleranciasCRUDController.atualizarIntolerancia,
  excluirIntolerancia: IntoleranciasCRUDController.excluirIntolerancia
};
