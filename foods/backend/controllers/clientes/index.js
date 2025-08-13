/**
 * Índice dos Controllers de Clientes
 * Centraliza a exportação de todos os controllers organizados
 */

const ClientesListController = require('./ClientesListController');
const ClientesCRUDController = require('./ClientesCRUDController');
const ClientesSearchController = require('./ClientesSearchController');
const ClientesStatsController = require('./ClientesStatsController');

module.exports = {
  // Métodos de Listagem
  listarClientes: ClientesListController.listarClientes,
  buscarClientePorId: ClientesListController.buscarClientePorId,
  
  // Métodos CRUD
  criarCliente: ClientesCRUDController.criarCliente,
  atualizarCliente: ClientesCRUDController.atualizarCliente,
  excluirCliente: ClientesCRUDController.excluirCliente,
  
  // Métodos de Busca
  buscarCNPJ: ClientesSearchController.buscarCNPJ,
  buscarPorUF: ClientesSearchController.buscarPorUF,
  buscarAtivos: ClientesSearchController.buscarAtivos,
  
  // Métodos de Estatísticas
  buscarEstatisticas: ClientesStatsController.buscarEstatisticas
};
