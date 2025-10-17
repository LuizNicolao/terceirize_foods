const { 
  criar, 
  atualizar, 
  deletar, 
  buscarPorId 
} = require('./NecessidadesCRUDController');

const { 
  listar, 
  listarTodas 
} = require('./NecessidadesListController');

const { 
  obterEstatisticas, 
  obterResumo 
} = require('./NecessidadesStatsController');

const { 
  gerarNecessidade 
} = require('./NecessidadesSpecialController');

module.exports = {
  // CRUD Operations
  criar,
  atualizar,
  deletar,
  buscarPorId,
  
  // List Operations
  listar,
  listarTodas,
  
  // Statistics Operations
  obterEstatisticas,
  obterResumo,
  
  // Special Operations
  gerarNecessidade
};

