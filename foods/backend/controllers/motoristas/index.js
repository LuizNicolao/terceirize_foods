/**
 * Índice dos Controllers de Motoristas
 * Centraliza a exportação de todos os controllers organizados
 */

const MotoristasListController = require('./MotoristasListController');
const MotoristasCRUDController = require('./MotoristasCRUDController');
const MotoristasSearchController = require('./MotoristasSearchController');
const MotoristasStatsController = require('./MotoristasStatsController');

module.exports = {
  // Métodos de Listagem
  listarMotoristas: MotoristasListController.listarMotoristas,
  buscarMotoristaPorId: MotoristasListController.buscarMotoristaPorId,
  
  // Métodos CRUD
  criarMotorista: MotoristasCRUDController.criarMotorista,
  atualizarMotorista: MotoristasCRUDController.atualizarMotorista,
  excluirMotorista: MotoristasCRUDController.excluirMotorista,
  
  // Métodos de Busca
  buscarMotoristasAtivos: MotoristasSearchController.buscarMotoristasAtivos,
  buscarMotoristasPorFilial: MotoristasSearchController.buscarMotoristasPorFilial,
  buscarMotoristasPorCategoriaCnh: MotoristasSearchController.buscarMotoristasPorCategoriaCnh,
  listarCategoriasCnh: MotoristasSearchController.listarCategoriasCnh,
  
  // Métodos de Estatísticas
  buscarMotoristasCnhVencendo: MotoristasStatsController.buscarMotoristasCnhVencendo
};
