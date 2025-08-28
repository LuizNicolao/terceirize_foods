/**
 * Índice dos Controllers de Unidades Escolares
 * Centraliza a exportação de todos os controllers organizados
 */

const UnidadesEscolaresListController = require('./UnidadesEscolaresListController');
const UnidadesEscolaresCRUDController = require('./UnidadesEscolaresCRUDController');
const UnidadesEscolaresSearchController = require('./UnidadesEscolaresSearchController');
const UnidadesEscolaresStatsController = require('./UnidadesEscolaresStatsController');

module.exports = {
  // Métodos de Listagem
  listarUnidadesEscolares: UnidadesEscolaresListController.listarUnidadesEscolares,
  buscarUnidadeEscolarPorId: UnidadesEscolaresListController.buscarUnidadeEscolarPorId,
  listarAlmoxarifadosUnidadeEscolar: UnidadesEscolaresListController.listarAlmoxarifadosUnidadeEscolar,
  
  // Métodos CRUD
  criarUnidadeEscolar: UnidadesEscolaresCRUDController.criarUnidadeEscolar,
  atualizarUnidadeEscolar: UnidadesEscolaresCRUDController.atualizarUnidadeEscolar,
  excluirUnidadeEscolar: UnidadesEscolaresCRUDController.excluirUnidadeEscolar,
  
  // Métodos de Busca
  buscarUnidadesEscolaresAtivas: UnidadesEscolaresSearchController.buscarUnidadesEscolaresAtivas,
  buscarUnidadesEscolaresPorEstado: UnidadesEscolaresSearchController.buscarUnidadesEscolaresPorEstado,
  buscarUnidadesEscolaresPorRota: UnidadesEscolaresSearchController.buscarUnidadesEscolaresPorRota,
  listarEstados: UnidadesEscolaresSearchController.listarEstados,
  listarCentrosDistribuicao: UnidadesEscolaresSearchController.listarCentrosDistribuicao,
  
  // Métodos de Estatísticas
  buscarEstatisticas: UnidadesEscolaresStatsController.buscarEstatisticas
};
