/**
 * Índice dos Controllers de Produtos
 * Centraliza a exportação de todos os controllers organizados
 */

const ProdutosListController = require('./ProdutosListController');
const ProdutosCRUDController = require('./ProdutosCRUDController');
const ProdutosSearchController = require('./ProdutosSearchController');
const ProdutosStatsController = require('./ProdutosStatsController');

module.exports = {
  // Métodos de Listagem
  listarProdutos: ProdutosListController.listarProdutos,
  buscarProdutoPorId: ProdutosListController.buscarProdutoPorId,
  
  // Métodos CRUD
  criarProduto: ProdutosCRUDController.criarProduto,
  atualizarProduto: ProdutosCRUDController.atualizarProduto,
  excluirProduto: ProdutosCRUDController.excluirProduto,
  
  // Métodos de Busca
  buscarProdutosAtivos: ProdutosSearchController.buscarProdutosAtivos,
  buscarProdutosPorGrupo: ProdutosSearchController.buscarProdutosPorGrupo,
  buscarProdutosPorFornecedor: ProdutosSearchController.buscarProdutosPorFornecedor,
  buscarProdutosPorCodigoBarras: ProdutosSearchController.buscarProdutosPorCodigoBarras,
  buscarProdutosEstoqueBaixo: ProdutosSearchController.buscarProdutosEstoqueBaixo,
  listarGrupos: ProdutosSearchController.listarGrupos,
  listarSubgrupos: ProdutosSearchController.listarSubgrupos,
  listarClasses: ProdutosSearchController.listarClasses,
  listarUnidades: ProdutosSearchController.listarUnidades,
  
  // Métodos de Estatísticas
  buscarEstatisticas: ProdutosStatsController.buscarEstatisticas
};
