/**
 * Índice dos Controllers de Produtos
 * Centraliza a exportação de todos os controllers organizados
 */

const ProdutosListController = require('./ProdutosListController');
const ProdutosCRUDController = require('./ProdutosCRUDController');
const ProdutosSearchController = require('./ProdutosSearchController');
const ProdutosStatsController = require('./ProdutosStatsController');
const ProdutosExportController = require('./ProdutosExportController');

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
  buscarProdutosPorCodigoBarras: ProdutosSearchController.buscarProdutosPorCodigoBarras,
  listarGrupos: ProdutosSearchController.listarGrupos,
  listarSubgrupos: ProdutosSearchController.listarSubgrupos,
  listarClasses: ProdutosSearchController.listarClasses,
  listarUnidades: ProdutosSearchController.listarUnidades,
  listarMarcas: ProdutosSearchController.listarMarcas,
  
  // Métodos de Estatísticas
  buscarEstatisticas: ProdutosStatsController.buscarEstatisticas,
  
  // Métodos de Exportação
  exportarXLSX: ProdutosExportController.exportarXLSX,
  exportarPDF: ProdutosExportController.exportarPDF
};
