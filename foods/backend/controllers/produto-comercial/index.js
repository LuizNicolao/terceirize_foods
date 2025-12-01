/**
 * Controllers de Produto Comercial
 * Centraliza todas as operações relacionadas a produtos comerciais
 */

const ProdutoComercialCRUDController = require('./ProdutoComercialCRUDController');
const ProdutoComercialListController = require('./ProdutoComercialListController');
const ProdutoComercialStatsController = require('./ProdutoComercialStatsController');

module.exports = {
  // Operações CRUD
  criarProdutoComercial: ProdutoComercialCRUDController.criarProdutoComercial,
  atualizarProdutoComercial: ProdutoComercialCRUDController.atualizarProdutoComercial,
  excluirProdutoComercial: ProdutoComercialCRUDController.excluirProdutoComercial,
  obterProximoCodigo: ProdutoComercialCRUDController.obterProximoCodigo,

  // Operações de listagem e busca
  listarProdutosComerciais: ProdutoComercialListController.listarProdutosComerciais,
  buscarProdutoComercialPorId: ProdutoComercialListController.buscarProdutoComercialPorId,

  // Listagens auxiliares
  listarGrupos: ProdutoComercialListController.listarGrupos,
  listarSubgrupos: ProdutoComercialListController.listarSubgrupos,
  listarClasses: ProdutoComercialListController.listarClasses,
  listarUnidadesMedida: ProdutoComercialListController.listarUnidadesMedida,

  // Operações de estatísticas
  estatisticasGerais: ProdutoComercialStatsController.estatisticasGerais
};

