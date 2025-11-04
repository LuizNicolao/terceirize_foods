/**
 * Índice de Controllers de Formas de Pagamento
 * Exporta todos os controllers para uso nas rotas
 */

const FormasPagamentoListController = require('./FormasPagamentoListController');
const FormasPagamentoCRUDController = require('./FormasPagamentoCRUDController');

module.exports = {
  // Métodos de Listagem
  listarFormasPagamento: FormasPagamentoListController.listarFormasPagamento,
  buscarFormaPagamentoPorId: FormasPagamentoListController.buscarFormaPagamentoPorId,
  buscarFormasPagamentoAtivas: FormasPagamentoListController.buscarFormasPagamentoAtivas,
  
  // Métodos CRUD
  criarFormaPagamento: FormasPagamentoCRUDController.criarFormaPagamento,
  atualizarFormaPagamento: FormasPagamentoCRUDController.atualizarFormaPagamento,
  excluirFormaPagamento: FormasPagamentoCRUDController.excluirFormaPagamento
};

