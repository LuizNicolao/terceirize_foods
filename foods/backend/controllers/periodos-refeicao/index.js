/**
 * Controllers para Períodos de Refeição
 */

const PeriodosRefeicaoCRUDController = require('./PeriodosRefeicaoCRUDController');
const PeriodosRefeicaoListController = require('./PeriodosRefeicaoListController');
const PeriodosRefeicaoSearchController = require('./PeriodosRefeicaoSearchController');

module.exports = {
  // CRUD Operations
  listar: PeriodosRefeicaoCRUDController.listar,
  buscarPorId: PeriodosRefeicaoCRUDController.buscarPorId,
  criar: PeriodosRefeicaoCRUDController.criar,
  atualizar: PeriodosRefeicaoCRUDController.atualizar,
  excluir: PeriodosRefeicaoCRUDController.excluir,

  // List Operations
  listarPeriodosRefeicao: PeriodosRefeicaoListController.listarPeriodosRefeicao,
  buscarPeriodoRefeicaoPorId: PeriodosRefeicaoListController.buscarPeriodoRefeicaoPorId,

  // Search Operations
  buscarAtivos: PeriodosRefeicaoSearchController.buscarAtivos,
  buscarPorFilial: PeriodosRefeicaoSearchController.buscarPorFilial,
  buscarDisponiveisParaUnidade: PeriodosRefeicaoSearchController.buscarDisponiveisParaUnidade,
  buscarPorIds: PeriodosRefeicaoSearchController.buscarPorIds
};
