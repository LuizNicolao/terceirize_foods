/**
 * Export centralizado de controllers de Relatório de Inspeção de Recebimento (RIR)
 */

const RIRListController = require('./RIRListController');
const RIRCRUDController = require('./RIRCRUDController');
const RIRIntegrationsController = require('./RIRIntegrationsController');

module.exports = {
  // Listagem
  listarRIRs: RIRListController.listarRIRs,
  buscarRIRPorId: RIRListController.buscarRIRPorId,

  // CRUD
  criarRIR: RIRCRUDController.criarRIR,
  atualizarRIR: RIRCRUDController.atualizarRIR,
  excluirRIR: RIRCRUDController.excluirRIR,

  // Integrações
  buscarProdutosPedido: RIRIntegrationsController.buscarProdutosPedido,
  buscarNQAGrupo: RIRIntegrationsController.buscarNQAGrupo,
  buscarPlanoPorLote: RIRIntegrationsController.buscarPlanoPorLote,
  buscarPedidosAprovados: RIRIntegrationsController.buscarPedidosAprovados,
  buscarGrupos: RIRIntegrationsController.buscarGrupos,
  calcularSaldoPedido: RIRIntegrationsController.calcularSaldoPedido
};

