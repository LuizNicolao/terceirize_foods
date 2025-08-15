/**
 * Index dos Controllers de Produto Genérico
 * Centraliza todas as operações relacionadas a produtos genéricos
 */

const ProdutoGenericoListController = require('./ProdutoGenericoListController');
const ProdutoGenericoCRUDController = require('./ProdutoGenericoCRUDController');
const ProdutoGenericoSearchController = require('./ProdutoGenericoSearchController');
const ProdutoGenericoStatsController = require('./ProdutoGenericoStatsController');

const ProdutoGenericoController = {
  // Operações de Listagem
  listarProdutosGenericos: ProdutoGenericoListController.listarProdutosGenericos,
  buscarProdutoGenericoPorId: ProdutoGenericoListController.buscarProdutoGenericoPorId,
  buscarProdutosGenericosPorGrupo: ProdutoGenericoListController.buscarProdutosGenericosPorGrupo,
  buscarProdutosGenericosPorSubgrupo: ProdutoGenericoListController.buscarProdutosGenericosPorSubgrupo,
  buscarProdutosGenericosPorClasse: ProdutoGenericoListController.buscarProdutosGenericosPorClasse,
  buscarProdutosGenericosPorProdutoOrigem: ProdutoGenericoListController.buscarProdutosGenericosPorProdutoOrigem,
  buscarProdutosGenericosAtivos: ProdutoGenericoListController.buscarProdutosGenericosAtivos,
  buscarProdutosGenericosPadrao: ProdutoGenericoListController.buscarProdutosGenericosPadrao,
  buscarProdutoGenericoPorCodigo: ProdutoGenericoListController.buscarProdutoGenericoPorCodigo,

  // Operações de CRUD
  criarProdutoGenerico: ProdutoGenericoCRUDController.criarProdutoGenerico,
  atualizarProdutoGenerico: ProdutoGenericoCRUDController.atualizarProdutoGenerico,
  excluirProdutoGenerico: ProdutoGenericoCRUDController.excluirProdutoGenerico,
  limparVinculosDuplicados: ProdutoGenericoCRUDController.limparVinculosDuplicados,

  // Operações de Busca
  buscarProdutosGenericosSimilares: ProdutoGenericoSearchController.buscarProdutosGenericosSimilares,

  // Operações de Estatísticas
  buscarEstatisticas: ProdutoGenericoStatsController.buscarEstatisticas
};

module.exports = ProdutoGenericoController;
