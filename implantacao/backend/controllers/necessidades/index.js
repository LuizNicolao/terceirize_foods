const { 
  criar, 
  atualizar, 
  deletar, 
  buscarPorId 
} = require('./NecessidadesCRUDController');

const { 
  listar, 
  listarTodas,
  listarEscolasNutricionista
} = require('./NecessidadesListController');

const { 
  obterEstatisticas, 
  obterResumo 
} = require('./NecessidadesStatsController');

const { 
  gerarNecessidade 
} = require('./NecessidadesSpecialController');

const NecessidadesExportController = require('./NecessidadesExportController');
const NecessidadesImportController = require('./NecessidadesImportController');

// Ajuste Controllers
const {
  buscarSemanasConsumoDisponiveis,
  buscarGruposDisponiveis,
  buscarSemanaAbastecimentoPorConsumo,
  buscarEscolasDisponiveis,
  buscarProdutosParaModal
} = require('./NecessidadesAjusteFiltersController');

const {
  listarParaAjuste
} = require('./NecessidadesAjusteListController');

const {
  salvarAjustes,
  incluirProdutoExtra,
  excluirProdutoAjuste
} = require('./NecessidadesAjusteOperationsController');

const {
  liberarCoordenacao
} = require('./NecessidadesAjusteStatusController');

module.exports = {
  // CRUD Operations
  criar,
  atualizar,
  deletar,
  buscarPorId,
  
  // List Operations
  listar,
  listarTodas,
  listarEscolasNutricionista,
  
  // Statistics Operations
  obterEstatisticas,
  obterResumo,
  
  // Special Operations
  gerarNecessidade,
  
  // Export Operations
  exportarXLSX: NecessidadesExportController.exportarXLSX,
  exportarPDF: NecessidadesExportController.exportarPDF,
  
  // Import Operations
  importarExcel: NecessidadesImportController.importarExcel,
  baixarModelo: NecessidadesImportController.baixarModelo,
  
  // Ajuste Operations - Filters
  buscarSemanasConsumoDisponiveis,
  buscarGruposDisponiveis,
  buscarSemanaAbastecimentoPorConsumo,
  buscarEscolasDisponiveis,
  buscarProdutosParaModal,
  
  // Ajuste Operations - List
  listarParaAjuste,
  
  // Ajuste Operations - Operations
  salvarAjustes,
  incluirProdutoExtra,
  excluirProdutoAjuste,
  
  // Ajuste Operations - Status
  liberarCoordenacao
};

