/**
 * Índice de Controllers de Pedidos de Compras
 * Exporta todos os controllers para uso nas rotas
 */

const PedidosComprasListController = require('./PedidosComprasListController');
const PedidosComprasCRUDController = require('./PedidosComprasCRUDController');
const PedidosComprasStatusController = require('./PedidosComprasStatusController');

module.exports = {
  // Métodos de Listagem
  listarPedidosCompras: PedidosComprasListController.listarPedidosCompras,
  buscarPedidoComprasPorId: PedidosComprasListController.buscarPedidoComprasPorId,
  buscarSolicitacoesDisponiveis: PedidosComprasListController.buscarSolicitacoesDisponiveis,
  buscarItensSolicitacao: PedidosComprasListController.buscarItensSolicitacao,
  buscarItensDisponiveis: PedidosComprasListController.buscarItensDisponiveis,
  buscarDadosFilial: PedidosComprasListController.buscarDadosFilial,
  
  // Métodos CRUD
  criarPedidoCompras: PedidosComprasCRUDController.criarPedidoCompras,
  atualizarPedidoCompras: PedidosComprasCRUDController.atualizarPedidoCompras,
  excluirPedidoCompras: PedidosComprasCRUDController.excluirPedidoCompras,
  desvincularProdutosPedido: PedidosComprasCRUDController.desvincularProdutosPedido,
  
  // Métodos de Status (Ações em Lote)
  aprovarPedidosEmLote: PedidosComprasStatusController.aprovarPedidosEmLote,
  reabrirPedidosEmLote: PedidosComprasStatusController.reabrirPedidosEmLote
};

