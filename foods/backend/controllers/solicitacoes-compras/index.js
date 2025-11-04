/**
 * Índice de Controllers de Solicitações de Compras
 * Exporta todos os controllers para uso nas rotas
 */

const SolicitacoesComprasListController = require('./SolicitacoesComprasListController');
const SolicitacoesComprasCRUDController = require('./SolicitacoesComprasCRUDController');
const SolicitacoesComprasStatusController = require('./SolicitacoesComprasStatusController');
const SolicitacoesComprasIntegrationsController = require('./SolicitacoesComprasIntegrationsController');
const SolicitacoesComprasPDFController = require('./SolicitacoesComprasPDFController');

module.exports = {
  // Métodos de Listagem
  listarSolicitacoes: SolicitacoesComprasListController.listarSolicitacoes,
  buscarSolicitacaoPorId: SolicitacoesComprasListController.buscarSolicitacaoPorId,
  
  // Métodos CRUD
  criarSolicitacao: SolicitacoesComprasCRUDController.criarSolicitacao,
  atualizarSolicitacao: SolicitacoesComprasCRUDController.atualizarSolicitacao,
  excluirSolicitacao: SolicitacoesComprasCRUDController.excluirSolicitacao,
  
  // Métodos de Status
  recalcularStatus: SolicitacoesComprasStatusController.recalcularStatus,
  recalcularTodosStatus: SolicitacoesComprasStatusController.recalcularTodosStatus,
  
  // Métodos de Integração
  buscarSemanaAbastecimento: SolicitacoesComprasIntegrationsController.buscarSemanaAbastecimento,
  
  // Métodos de PDF
  gerarPDF: SolicitacoesComprasPDFController.gerarPDF
};

