/**
 * Índice dos Controllers de Patrimônios,
 * Centraliza a exportação de todos os controllers organizados,
 */

const PatrimoniosListController = require('./PatrimoniosListController');
const PatrimoniosCRUDController = require('./PatrimoniosCRUDController');
const PatrimoniosMovimentacaoController = require('./PatrimoniosMovimentacaoController');
const PatrimoniosProdutosController = require('./PatrimoniosProdutosController');

const PatrimoniosExportController = require('./PatrimoniosExportController');
module.exports = {
  // Métodos de Listagem
  listarPatrimonios: PatrimoniosListController.listarPatrimonios,
  obterPatrimonio: PatrimoniosListController.obterPatrimonio,
  listarPatrimoniosEscola: PatrimoniosListController.listarPatrimoniosEscola,
  
  // Métodos CRUD
  criarPatrimonio: PatrimoniosCRUDController.criarPatrimonio,
  atualizarPatrimonio: PatrimoniosCRUDController.atualizarPatrimonio,
  excluirPatrimonio: PatrimoniosCRUDController.excluirPatrimonio,
  
  // Métodos de Movimentação
  movimentarPatrimonio: PatrimoniosMovimentacaoController.movimentarPatrimonio,
  listarMovimentacoesPatrimonio: PatrimoniosMovimentacaoController.listarMovimentacoesPatrimonio,
  
  // Métodos de Produtos
  listarProdutosEquipamentos: PatrimoniosProdutosController.listarProdutosEquipamentos,
  
  // Métodos de Exportação
  exportarXLSX: PatrimoniosExportController.exportarXLSX,
  exportarPDF: PatrimoniosExportController.exportarPDF
};
