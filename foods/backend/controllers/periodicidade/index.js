/**
 * Índice dos Controllers de Periodicidade
 * Centraliza a exportação de todos os controllers organizados
 */

const PeriodicidadeListController = require('./PeriodicidadeListController');
const PeriodicidadeCRUDController = require('./PeriodicidadeCRUDController');

module.exports = {
  // Métodos de Listagem
  listarAgrupamentos: PeriodicidadeListController.listarAgrupamentos,
  listarTipos: PeriodicidadeListController.listarTipos,
  buscarAgrupamentosPorEscola: PeriodicidadeListController.buscarAgrupamentosPorEscola,
  buscarProdutosVinculados: PeriodicidadeListController.buscarProdutosVinculados,
  buscarHistoricoAplicacoes: PeriodicidadeListController.buscarHistoricoAplicacoes,
  buscarEstatisticas: PeriodicidadeListController.buscarEstatisticas,
  buscarProdutosPorGrupo: PeriodicidadeListController.buscarProdutosPorGrupo,
  buscarContagemProdutosPorGrupo: PeriodicidadeListController.buscarContagemProdutosPorGrupo,
  
  // Métodos CRUD
  buscarTipoPorId: PeriodicidadeCRUDController.buscarTipoPorId,
  criarAgrupamento: PeriodicidadeCRUDController.criarAgrupamento,
  buscarAgrupamentoPorId: PeriodicidadeCRUDController.buscarAgrupamentoPorId,
  atualizarAgrupamento: PeriodicidadeCRUDController.atualizarAgrupamento,
  excluirAgrupamento: PeriodicidadeCRUDController.excluirAgrupamento,
  vincularEscolas: PeriodicidadeCRUDController.vincularEscolas,
  buscarEscolasVinculadas: PeriodicidadeCRUDController.buscarEscolasVinculadas,
  buscarAgrupamentosPorUnidade: PeriodicidadeCRUDController.buscarAgrupamentosPorUnidade
};
