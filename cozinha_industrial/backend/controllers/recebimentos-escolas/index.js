const { 
  criar, 
  atualizar, 
  deletar
} = require('./RecebimentosEscolasCRUDController');

const { 
  listar, 
  listarTodas,
  buscarPorId,
  listarProdutosPorTipo,
  listarEscolasNutricionista
} = require('./RecebimentosEscolasListController');

const { 
  obterEstatisticas, 
  obterResumo 
} = require('./RecebimentosEscolasStatsController');

const { 
  exportarXLSX, 
  exportarPDF 
} = require('./RecebimentosEscolasExportController');

module.exports = {
  // CRUD Operations
  criar,
  atualizar,
  deletar,
  
  // List Operations
  listar,
  listarTodas,
  buscarPorId,
  listarProdutosPorTipo,
  listarEscolasNutricionista,
  
  // Statistics Operations
  obterEstatisticas,
  obterResumo,
  
  // Export Operations
  exportarXLSX,
  exportarPDF
};
