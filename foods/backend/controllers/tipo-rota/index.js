/**
 * Índice dos Controllers de Tipo de Rota
 * Centraliza a exportação de todos os controllers organizados
 */

const TipoRotaListController = require('./TipoRotaListController');
const TipoRotaCRUDController = require('./TipoRotaCRUDController');
const TipoRotaSearchController = require('./TipoRotaSearchController');
const TipoRotaStatsController = require('./TipoRotaStatsController');
const TipoRotaExportController = require('./TipoRotaExportController');

module.exports = {
  // Métodos de Listagem
  listarTipoRotas: TipoRotaListController.listarTipoRotas,
  buscarTipoRotaPorId: TipoRotaListController.buscarTipoRotaPorId,
  
  // Métodos CRUD
  criarTipoRota: TipoRotaCRUDController.criarTipoRota,
  atualizarTipoRota: TipoRotaCRUDController.atualizarTipoRota,
  excluirTipoRota: TipoRotaCRUDController.excluirTipoRota,
  
  // Métodos de Busca
  buscarTipoRotasAtivas: TipoRotaSearchController.buscarTipoRotasAtivas,
  buscarTipoRotasPorFilial: TipoRotaSearchController.buscarTipoRotasPorFilial,
  buscarTipoRotasPorGrupo: TipoRotaSearchController.buscarTipoRotasPorGrupo,
  buscarUnidadesEscolaresTipoRota: TipoRotaSearchController.buscarUnidadesEscolaresTipoRota,
  buscarUnidadesEscolaresDisponiveis: TipoRotaSearchController.buscarUnidadesEscolaresDisponiveis,
  buscarGruposDisponiveisPorFilial: TipoRotaSearchController.buscarGruposDisponiveisPorFilial,
  
  // Métodos de Estatísticas
  buscarEstatisticasTipoRotas: TipoRotaStatsController.buscarEstatisticasTipoRotas,
  
  // Métodos de Exportação
  exportarXLSX: TipoRotaExportController.exportarXLSX,
  exportarPDF: TipoRotaExportController.exportarPDF
};

