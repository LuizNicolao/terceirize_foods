const { 
  criar, 
  atualizar, 
  deletar,
  resetarPadrao
} = require('./PermissoesCRUDController');

const { 
  listar, 
  listarTodas,
  buscarPorId,
  verificarPermissao
} = require('./PermissoesListController');

const { 
  obterEstatisticas, 
  obterResumo,
  sincronizarPermissoes
} = require('./PermissoesStatsController');

module.exports = {
  // CRUD Operations
  criar,
  atualizar,
  deletar,
  resetarPadrao,
  
  // List Operations
  listar,
  listarTodas,
  buscarPorId,
  verificarPermissao,
  
  // Statistics Operations
  obterEstatisticas,
  obterResumo,
  sincronizarPermissoes
};
