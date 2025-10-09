/**
 * Índice dos Controllers de Filiais,
 * Centraliza a exportação de todos os controllers organizados,
 */

const FiliaisListController = require('./FiliaisListController');
const FiliaisCRUDController = require('./FiliaisCRUDController');
const FiliaisSearchController = require('./FiliaisSearchController');
const FiliaisStatsController = require('./FiliaisStatsController');

const FiliaisExportController = require('./FiliaisExportController');
module.exports = {
  // Métodos de Listagem
  listarFiliais: FiliaisListController.listarFiliais,
  buscarFilialPorId: FiliaisListController.buscarFilialPorId,
  
  // Métodos CRUD
  criarFilial: FiliaisCRUDController.criarFilial,
  atualizarFilial: FiliaisCRUDController.atualizarFilial,
  excluirFilial: FiliaisCRUDController.excluirFilial,
  
  // Métodos de Busca
  buscarFiliaisAtivas: FiliaisSearchController.buscarFiliaisAtivas,
  buscarFiliaisPorEstado: FiliaisSearchController.buscarFiliaisPorEstado,
  buscarFiliaisPorSupervisao: FiliaisSearchController.buscarFiliaisPorSupervisao,
  buscarFiliaisPorCoordenacao: FiliaisSearchController.buscarFiliaisPorCoordenacao,
  listarEstados: FiliaisSearchController.listarEstados,
  listarSupervisoes: FiliaisSearchController.listarSupervisoes,
  listarCoordenacoes: FiliaisSearchController.listarCoordenacoes,
  consultarCNPJ: FiliaisSearchController.consultarCNPJ,
  buscarCNPJ: FiliaisSearchController.consultarCNPJ,
  
  // Métodos de Estatísticas
  buscarEstatisticas: FiliaisStatsController.buscarEstatisticas,
  
  // Métodos de Almoxarifados
  listarAlmoxarifados: FiliaisListController.listarAlmoxarifados,
  criarAlmoxarifado: FiliaisCRUDController.criarAlmoxarifado,
  atualizarAlmoxarifado: FiliaisCRUDController.atualizarAlmoxarifado,
  excluirAlmoxarifado: FiliaisCRUDController.excluirAlmoxarifado,
  listarItensAlmoxarifado: FiliaisListController.listarItensAlmoxarifado,
  adicionarItemAlmoxarifado: FiliaisCRUDController.adicionarItemAlmoxarifado,
  removerItemAlmoxarifado: FiliaisCRUDController.removerItemAlmoxarifado,
  
  // Métodos de Exportação
  exportarXLSX: FiliaisExportController.exportarXLSX,
  exportarPDF: FiliaisExportController.exportarPDF
};
