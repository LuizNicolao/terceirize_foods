/**
 * Índice dos Controllers de Grupos
 * Centraliza a exportação de todos os controllers organizados
 */

const GruposListController = require('./GruposListController');
const GruposCRUDController = require('./GruposCRUDController');
const GruposSearchController = require('./GruposSearchController');
const GruposStatsController = require('./GruposStatsController');

module.exports = {
  // Métodos de Listagem
  listarGrupos: GruposListController.listarGrupos,
  buscarGrupoPorId: GruposListController.buscarGrupoPorId,
  
  // Métodos CRUD
  criarGrupo: GruposCRUDController.criarGrupo,
  atualizarGrupo: GruposCRUDController.atualizarGrupo,
  excluirGrupo: GruposCRUDController.excluirGrupo,
  
  // Métodos de Busca
  buscarGruposAtivos: GruposSearchController.buscarGruposAtivos,
  buscarGruposPorCodigo: GruposSearchController.buscarGruposPorCodigo,
  buscarSubgruposPorGrupo: GruposSearchController.buscarSubgruposPorGrupo,
  
  // Métodos de Estatísticas
  buscarEstatisticas: GruposStatsController.buscarEstatisticas
};
