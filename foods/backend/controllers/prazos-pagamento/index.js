/**
 * Índice de Controllers de Prazos de Pagamento
 * Exporta todos os controllers para uso nas rotas
 */

const PrazosPagamentoListController = require('./PrazosPagamentoListController');
const PrazosPagamentoCRUDController = require('./PrazosPagamentoCRUDController');

module.exports = {
  // Métodos de Listagem
  listarPrazosPagamento: PrazosPagamentoListController.listarPrazosPagamento,
  buscarPrazoPagamentoPorId: PrazosPagamentoListController.buscarPrazoPagamentoPorId,
  buscarPrazosPagamentoAtivos: PrazosPagamentoListController.buscarPrazosPagamentoAtivos,
  
  // Métodos CRUD
  criarPrazoPagamento: PrazosPagamentoCRUDController.criarPrazoPagamento,
  atualizarPrazoPagamento: PrazosPagamentoCRUDController.atualizarPrazoPagamento,
  excluirPrazoPagamento: PrazosPagamentoCRUDController.excluirPrazoPagamento
};

