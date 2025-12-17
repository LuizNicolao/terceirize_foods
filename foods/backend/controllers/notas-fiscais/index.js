/**
 * Índice dos Controllers de Notas Fiscais
 * Centraliza a exportação de todos os controllers organizados
 */

const NotaFiscalListController = require('./NotaFiscalListController');
const NotaFiscalCRUDController = require('./NotaFiscalCRUDController');
const NotaFiscalRecalculoController = require('./NotaFiscalRecalculoController');

module.exports = {
  // Métodos de Listagem
  listarNotasFiscais: NotaFiscalListController.listarNotasFiscais,
  buscarNotaFiscalPorId: NotaFiscalListController.buscarNotaFiscalPorId,
  buscarQuantidadesLancadas: NotaFiscalListController.buscarQuantidadesLancadas,
  
  // Métodos CRUD
  criarNotaFiscal: NotaFiscalCRUDController.criarNotaFiscal,
  atualizarNotaFiscal: NotaFiscalCRUDController.atualizarNotaFiscal,
  excluirNotaFiscal: NotaFiscalCRUDController.excluirNotaFiscal,
  
  // Métodos de Recálculo
  recalcularMediasPonderadas: NotaFiscalRecalculoController.recalcularMediasPonderadas,
  recalcularMediaProduto: NotaFiscalRecalculoController.recalcularMediaProduto
};

