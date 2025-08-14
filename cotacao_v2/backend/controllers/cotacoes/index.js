/**
 * Índice dos Controllers de Cotações
 * Centraliza a exportação de todos os controllers organizados
 */

const CotacoesListController = require('./CotacoesListController');
const CotacoesCRUDController = require('./CotacoesCRUDController');
const CotacoesStatsController = require('./CotacoesStatsController');

module.exports = {
  // Métodos de Listagem
  listarCotacoes: CotacoesListController.listarCotacoes,
  buscarCotacaoPorId: CotacoesListController.buscarCotacaoPorId,
  listarPendentesSupervisor: CotacoesListController.listarPendentesSupervisor,
  listarAprovacoes: CotacoesListController.listarAprovacoes,
  
  // Métodos CRUD
  criarCotacao: CotacoesCRUDController.criarCotacao,
  atualizarCotacao: CotacoesCRUDController.atualizarCotacao,
  excluirCotacao: CotacoesCRUDController.excluirCotacao,
  enviarParaSupervisor: CotacoesCRUDController.enviarParaSupervisor,
  
  // Métodos de Estatísticas
  buscarEstatisticas: CotacoesStatsController.buscarEstatisticas,
  buscarEstatisticasPorPeriodo: CotacoesStatsController.buscarEstatisticasPorPeriodo,
  buscarEstatisticasPorUsuario: CotacoesStatsController.buscarEstatisticasPorUsuario,
  buscarEstatisticasPorTipo: CotacoesStatsController.buscarEstatisticasPorTipo,
  buscarResumoGeral: CotacoesStatsController.buscarResumoGeral
};
