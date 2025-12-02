/**
 * Index dos Controllers de Ficha Homologação
 * Centraliza todas as operações relacionadas a fichas de homologação
 */

const FichaHomologacaoListController = require('./FichaHomologacaoListController');
const FichaHomologacaoCRUDController = require('./FichaHomologacaoCRUDController');
const FichaHomologacaoSearchController = require('./FichaHomologacaoSearchController');
const FichaHomologacaoStatsController = require('./FichaHomologacaoStatsController');
const FichaHomologacaoExportController = require('./FichaHomologacaoExportController');

const FichaHomologacaoController = {
  // Operações de Listagem
  listarFichasHomologacao: FichaHomologacaoListController.listarFichasHomologacao,
  buscarFichaHomologacaoPorId: FichaHomologacaoListController.buscarFichaHomologacaoPorId,
  buscarFichasHomologacaoAtivas: FichaHomologacaoListController.buscarFichasHomologacaoAtivas,
  buscarFichasHomologacaoPorTipo: FichaHomologacaoListController.buscarFichasHomologacaoPorTipo,
  buscarFichasHomologacaoPorNomeGenerico: FichaHomologacaoListController.buscarFichasHomologacaoPorNomeGenerico,
  buscarFichasHomologacaoPorFornecedor: FichaHomologacaoListController.buscarFichasHomologacaoPorFornecedor,
  buscarFichasHomologacaoPorAvaliador: FichaHomologacaoListController.buscarFichasHomologacaoPorAvaliador,

  // Operações de CRUD
  criarFichaHomologacao: FichaHomologacaoCRUDController.criarFichaHomologacao,
  atualizarFichaHomologacao: FichaHomologacaoCRUDController.atualizarFichaHomologacao,
  excluirFichaHomologacao: FichaHomologacaoCRUDController.excluirFichaHomologacao,

  // Operações de Busca
  buscarFichasHomologacaoSimilares: FichaHomologacaoSearchController.buscarFichasHomologacaoSimilares,

  // Operações de Estatísticas
  buscarEstatisticas: FichaHomologacaoStatsController.buscarEstatisticas,

  // Operações de Exportação
  exportarXLSX: FichaHomologacaoExportController.exportarXLSX,
  exportarPDF: FichaHomologacaoExportController.exportarPDF
};

module.exports = FichaHomologacaoController;

