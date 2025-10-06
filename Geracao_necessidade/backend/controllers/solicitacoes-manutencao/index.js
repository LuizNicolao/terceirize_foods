const { 
  criar, 
  atualizar, 
  deletar, 
  buscarPorId 
} = require('./SolicitacoesManutencaoCRUDController');

const { 
  listar, 
  listarTodas 
} = require('./SolicitacoesManutencaoListController');

const { 
  obterEstatisticas, 
  obterResumo 
} = require('./SolicitacoesManutencaoStatsController');

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
  obterResumo
};
