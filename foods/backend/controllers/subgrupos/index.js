/**
 * Índice dos Controllers de Subgrupos
 * Centraliza a exportação de todos os controllers organizados
 */

const SubgruposListController = require('./SubgruposListController');
const SubgruposCRUDController = require('./SubgruposCRUDController');
const SubgruposSearchController = require('./SubgruposSearchController');
const SubgruposStatsController = require('./SubgruposStatsController');

module.exports = {
  // Métodos de Listagem
  listarSubgrupos: SubgruposListController.listarSubgrupos,
  buscarSubgrupoPorId: SubgruposListController.buscarSubgrupoPorId,
  
  // Métodos CRUD
  criarSubgrupo: SubgruposCRUDController.criarSubgrupo,
  atualizarSubgrupo: SubgruposCRUDController.atualizarSubgrupo,
  excluirSubgrupo: SubgruposCRUDController.excluirSubgrupo,
  
  // Métodos de Busca
  buscarSubgruposAtivos: SubgruposSearchController.buscarSubgruposAtivos,
  buscarSubgruposPorGrupo: SubgruposSearchController.buscarSubgruposPorGrupo,
  buscarSubgruposPorCodigo: SubgruposSearchController.buscarSubgruposPorCodigo,
  
  // Métodos de Estatísticas
  buscarEstatisticas: SubgruposStatsController.buscarEstatisticas
};
