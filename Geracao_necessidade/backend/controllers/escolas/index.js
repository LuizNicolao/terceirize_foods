const { 
  criar, 
  atualizar, 
  deletar, 
  buscarPorId 
} = require('./EscolasCRUDController');

const { 
  listar, 
  listarTodas,
  buscarPorRota 
} = require('./EscolasListController');

const { 
  obterEstatisticas, 
  obterResumo 
} = require('./EscolasStatsController');

module.exports = {
  // CRUD Operations
  criar,
  atualizar,
  deletar,
  buscarPorId,
  
  // List Operations
  listar,
  listarTodas,
  buscarPorRota,
  
  // Statistics Operations
  obterEstatisticas,
  obterResumo
};
