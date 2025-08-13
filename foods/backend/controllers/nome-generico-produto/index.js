/**
 * Índice dos Controllers de Nomes Genéricos
 * Centraliza a exportação de todos os controllers organizados
 */

const NomeGenericoListController = require('./NomeGenericoListController');
const NomeGenericoCRUDController = require('./NomeGenericoCRUDController');
const NomeGenericoSearchController = require('./NomeGenericoSearchController');
const NomeGenericoStatsController = require('./NomeGenericoStatsController');

module.exports = {
  // Métodos de Listagem
  listarNomesGenericos: NomeGenericoListController.listarNomesGenericos,
  buscarNomeGenericoPorId: NomeGenericoListController.buscarNomeGenericoPorId,
  
  // Métodos CRUD
  criarNomeGenerico: NomeGenericoCRUDController.criarNomeGenerico,
  atualizarNomeGenerico: NomeGenericoCRUDController.atualizarNomeGenerico,
  excluirNomeGenerico: NomeGenericoCRUDController.excluirNomeGenerico,
  
  // Métodos de Busca
  buscarNomesGenericosAtivos: NomeGenericoSearchController.buscarNomesGenericosAtivos,
  buscarNomesGenericosPorGrupo: NomeGenericoSearchController.buscarNomesGenericosPorGrupo,
  buscarNomesGenericosPorSubgrupo: NomeGenericoSearchController.buscarNomesGenericosPorSubgrupo,
  buscarNomesGenericosPorClasse: NomeGenericoSearchController.buscarNomesGenericosPorClasse,
  buscarProdutosNomeGenerico: NomeGenericoSearchController.buscarProdutosNomeGenerico,
  
  // Métodos de Estatísticas
  buscarEstatisticas: NomeGenericoStatsController.buscarEstatisticas
};
