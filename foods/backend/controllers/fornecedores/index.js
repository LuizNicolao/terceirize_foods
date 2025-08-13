/**
 * Índice dos Controllers de Fornecedores
 * Centraliza a exportação de todos os controllers organizados
 */

const FornecedoresListController = require('./FornecedoresListController');
const FornecedoresCRUDController = require('./FornecedoresCRUDController');
const FornecedoresSearchController = require('./FornecedoresSearchController');
const FornecedoresStatsController = require('./FornecedoresStatsController');

module.exports = {
  // Métodos de Listagem
  listarFornecedores: FornecedoresListController.listarFornecedores,
  buscarFornecedorPorId: FornecedoresListController.buscarFornecedorPorId,
  
  // Métodos CRUD
  criarFornecedor: FornecedoresCRUDController.criarFornecedor,
  atualizarFornecedor: FornecedoresCRUDController.atualizarFornecedor,
  excluirFornecedor: FornecedoresCRUDController.excluirFornecedor,
  
  // Métodos de Busca
  buscarCNPJ: FornecedoresSearchController.buscarCNPJ,
  buscarPorUF: FornecedoresSearchController.buscarPorUF,
  buscarAtivos: FornecedoresSearchController.buscarAtivos,
  
  // Métodos de Estatísticas
  buscarEstatisticas: FornecedoresStatsController.buscarEstatisticas
};
