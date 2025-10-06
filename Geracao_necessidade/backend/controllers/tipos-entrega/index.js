const { 
  criar, 
  atualizar, 
  deletar
} = require('./TiposEntregaCRUDController');

const { 
  listar, 
  listarTodas,
  buscarPorId
} = require('./TiposEntregaListController');

const { 
  obterEstatisticas, 
  obterResumo
} = require('./TiposEntregaStatsController');

module.exports = {
  // CRUD Operations
  criar,
  atualizar,
  deletar,
  
  // List Operations
  listar,
  listarTodas,
  buscarPorId,
  
  // Statistics Operations
  obterEstatisticas,
  obterResumo
};
