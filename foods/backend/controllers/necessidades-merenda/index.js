/**
 * Índice dos Controllers de Necessidades da Merenda,
 * Centraliza a exportação de todos os controllers organizados,
 */

const NecessidadesMerendaListController = require('./NecessidadesMerendaListController');
const NecessidadesMerendaCRUDController = require('./NecessidadesMerendaCRUDController');
const NecessidadesMerendaGeracaoController = require('./NecessidadesMerendaGeracaoController');
const NecessidadesMerendaExportController = require('./NecessidadesMerendaExportController');

const NecessidadesMerendaExportController = require('./NecessidadesMerendaExportController');
module.exports = {
  // Métodos de Listagem
  listarNecessidades: NecessidadesMerendaListController.listarNecessidades,
  buscarNecessidadePorId: NecessidadesMerendaListController.buscarNecessidadePorId,
  listarNecessidadesAgrupadasPorData: NecessidadesMerendaListController.listarNecessidadesAgrupadasPorData,
  listarNecessidadesAgrupadasPorProduto: NecessidadesMerendaListController.listarNecessidadesAgrupadasPorProduto,
  
  // Métodos CRUD
  criarNecessidade: NecessidadesMerendaCRUDController.criarNecessidade,
  atualizarNecessidade: NecessidadesMerendaCRUDController.atualizarNecessidade,
  excluirNecessidade: NecessidadesMerendaCRUDController.excluirNecessidade,
  atualizarStatusMultiplas: NecessidadesMerendaCRUDController.atualizarStatusMultiplas,
  
  // Métodos de Geração
  processarPDFEGerarNecessidades: NecessidadesMerendaGeracaoController.processarPDFEGerarNecessidades,
  gerarNecessidadesDeCardapioExistente: NecessidadesMerendaGeracaoController.gerarNecessidadesDeCardapioExistente,
  
,
  // Métodos de Exportação
  exportarParaExcel: NecessidadesMerendaExportController.exportarParaExcel,
  exportarListaCompras: NecessidadesMerendaExportController.exportarListaCompras,
  exportarRelatorioCustos: NecessidadesMerendaExportController.exportarRelatorioCustos,
  
,
  // Métodos de Exportação
  exportarXLSX: NecessidadesMerendaExportController.exportarXLSX,
  exportarPDF: NecessidadesMerendaExportController.exportarPDF
};
