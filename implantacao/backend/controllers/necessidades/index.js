const { 
  criar, 
  atualizar, 
  deletar, 
  buscarPorId,
  validarPedido
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

module.exports = {
  // CRUD Operations
  criar,
  atualizar,
  deletar,
  buscarPorId,
  validarPedido,
  
  // List Operations
  listar,
  listarTodas,
  listarEscolasNutricionista,
  
  // Statistics Operations
  obterEstatisticas,
  obterResumo,
  
  // Special Operations
  gerarNecessidade
};

