/**
 * Índice dos Controllers de Unidades Escolares
 * Centraliza a exportação de todos os controllers organizados
 */

const UnidadesEscolaresListController = require('./UnidadesEscolaresListController');
const UnidadesEscolaresCRUDController = require('./UnidadesEscolaresCRUDController');
const UnidadesEscolaresSearchController = require('./UnidadesEscolaresSearchController');
const UnidadesEscolaresStatsController = require('./UnidadesEscolaresStatsController');
const UnidadesEscolaresImportController = require('./UnidadesEscolaresImportController');
const UnidadesEscolaresExportController = require('./UnidadesEscolaresExportController');

module.exports = {
  // Métodos de Listagem
  listarUnidadesEscolares: UnidadesEscolaresListController.listarUnidadesEscolares,
  buscarUnidadeEscolarPorId: UnidadesEscolaresListController.buscarUnidadeEscolarPorId,
  
  // Métodos CRUD
  criarUnidadeEscolar: UnidadesEscolaresCRUDController.criarUnidadeEscolar,
  atualizarUnidadeEscolar: UnidadesEscolaresCRUDController.atualizarUnidadeEscolar,
  excluirUnidadeEscolar: UnidadesEscolaresCRUDController.excluirUnidadeEscolar,
  
  // Métodos de Busca
  buscarUnidadesEscolaresAtivas: UnidadesEscolaresSearchController.buscarUnidadesEscolaresAtivas,
  buscarUnidadesEscolaresPorEstado: UnidadesEscolaresSearchController.buscarUnidadesEscolaresPorEstado,
  buscarUnidadesEscolaresPorRota: UnidadesEscolaresSearchController.buscarUnidadesEscolaresPorRota,
  buscarUnidadesEscolaresPorFilial: UnidadesEscolaresSearchController.buscarUnidadesEscolaresPorFilial,
  buscarUnidadesEscolaresDisponiveisPorFilial: UnidadesEscolaresSearchController.buscarUnidadesEscolaresDisponiveisPorFilial,
  buscarUnidadesEscolaresPorIds: UnidadesEscolaresSearchController.buscarUnidadesEscolaresPorIds,
  listarEstados: UnidadesEscolaresSearchController.listarEstados,
  listarCentrosDistribuicao: UnidadesEscolaresSearchController.listarCentrosDistribuicao,
  
  // Métodos de Estatísticas
  buscarEstatisticas: UnidadesEscolaresStatsController.buscarEstatisticas,
  
  // Métodos de Importação
  importarUnidadesEscolares: UnidadesEscolaresImportController.importarUnidadesEscolares,
  gerarTemplate: UnidadesEscolaresImportController.gerarTemplate,

  // Métodos de Exportação
  exportarXLSX: UnidadesEscolaresExportController.exportarXLSX,
  exportarPDF: UnidadesEscolaresExportController.exportarPDF,

  // Métodos de Tipos de Cardápio
  getTiposCardapioUnidade: UnidadesEscolaresCRUDController.getTiposCardapioUnidade,
  vincularTipoCardapio: UnidadesEscolaresCRUDController.vincularTipoCardapio,
  desvincularTipoCardapio: UnidadesEscolaresCRUDController.desvincularTipoCardapio,

  // Métodos de Períodos de Refeição
  getPeriodosRefeicao: UnidadesEscolaresCRUDController.getPeriodosRefeicao,
  vincularPeriodoRefeicao: UnidadesEscolaresCRUDController.vincularPeriodoRefeicao,
  atualizarQuantidadesEfetivos: UnidadesEscolaresCRUDController.atualizarQuantidadesEfetivos,
  desvincularPeriodoRefeicao: UnidadesEscolaresCRUDController.desvincularPeriodoRefeicao
};
