/**
 * Índice dos Controllers de Plano de Amostragem
 * Centraliza a exportação de todos os controllers organizados
 */

const NQAListController = require('./NQAListController');
const NQACRUDController = require('./NQACRUDController');
const TabelaAmostragemListController = require('./TabelaAmostragemListController');
const TabelaAmostragemCRUDController = require('./TabelaAmostragemCRUDController');
const GruposNQAController = require('./GruposNQAController');

module.exports = {
  // Métodos de Listagem - NQA
  listarNQAs: NQAListController.listarNQAs,
  buscarNQAPorId: NQAListController.buscarNQAPorId,
  buscarNQAsAtivos: NQAListController.buscarNQAsAtivos,
  
  // Métodos CRUD - NQA
  criarNQA: NQACRUDController.criarNQA,
  atualizarNQA: NQACRUDController.atualizarNQA,
  excluirNQA: NQACRUDController.excluirNQA,
  
  // Métodos de Listagem - Tabela de Amostragem
  listarFaixas: TabelaAmostragemListController.listarFaixas,
  buscarFaixaPorId: TabelaAmostragemListController.buscarFaixaPorId,
  buscarFaixasPorNQA: TabelaAmostragemListController.buscarFaixasPorNQA,
  buscarPlanoPorLote: TabelaAmostragemListController.buscarPlanoPorLote,
  
  // Métodos CRUD - Tabela de Amostragem
  criarFaixa: TabelaAmostragemCRUDController.criarFaixa,
  atualizarFaixa: TabelaAmostragemCRUDController.atualizarFaixa,
  excluirFaixa: TabelaAmostragemCRUDController.excluirFaixa,
  criarNQAAutomatico: TabelaAmostragemCRUDController.criarNQAAutomatico,
  
  // Métodos - Grupos ↔ NQA
  vincularGrupo: GruposNQAController.vincularGrupo,
  desvincularGrupo: GruposNQAController.desvincularGrupo,
  listarGruposPorNQA: GruposNQAController.listarGruposPorNQA,
  listarTodosVinculos: GruposNQAController.listarTodosVinculos,
  buscarNQAPorGrupo: GruposNQAController.buscarNQAPorGrupo
};

