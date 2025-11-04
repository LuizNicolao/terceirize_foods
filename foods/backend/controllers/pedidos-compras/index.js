/**
 * Índice de Controllers de Pedidos de Compras
 * Exporta todos os controllers para uso nas rotas
 */

const PedidosComprasListController = require('./PedidosComprasListController');
const PedidosComprasCRUDController = require('./PedidosComprasCRUDController');

module.exports = {
  // Métodos de Listagem
  listarPedidosCompras: PedidosComprasListController.listarPedidosCompras,
  buscarPedidoComprasPorId: PedidosComprasListController.buscarPedidoComprasPorId,
  buscarSolicitacoesDisponiveis: PedidosComprasListController.buscarSolicitacoesDisponiveis,
  
  // Métodos CRUD
  criarPedidoCompras: PedidosComprasCRUDController.criarPedidoCompras,
  atualizarPedidoCompras: PedidosComprasCRUDController.atualizarPedidoCompras,
  excluirPedidoCompras: PedidosComprasCRUDController.excluirPedidoCompras
};

