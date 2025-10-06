const { 
  criar, 
  atualizar, 
  deletar
} = require('./RecebimentosEscolasCRUDController');

const { 
  listar, 
  listarTodas,
  buscarPorId,
  listarProdutosPorTipo
} = require('./RecebimentosEscolasListController');

const { 
  obterEstatisticas, 
  obterResumo 
} = require('./RecebimentosEscolasStatsController');

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
  
  // Statistics Operations
  obterEstatisticas,
  obterResumo
};
