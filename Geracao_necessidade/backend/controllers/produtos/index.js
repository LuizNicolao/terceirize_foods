const { 
  criar, 
  atualizar, 
  deletar, 
  buscarPorId 
} = require('./ProdutosCRUDController');

const { 
  listar, 
  listarTodas,
  buscarPorGrupo,
  buscarGrupos 
} = require('./ProdutosListController');

const { 
  obterEstatisticas, 
  obterResumo 
} = require('./ProdutosStatsController');

module.exports = {
  // CRUD Operations
  criar,
  atualizar,
  deletar,
  buscarPorId,
  
  // List Operations
  listar,
  listarTodas,
  buscarPorGrupo,
  buscarGrupos,
  
  // Statistics Operations
  obterEstatisticas,
  obterResumo
};
