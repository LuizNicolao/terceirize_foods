const { 
  criar, 
  atualizar, 
  deletar, 
  buscarPorId 
} = require('./UsuariosCRUDController');

const { 
  listar, 
  listarTodas,
  buscarPorEmail 
} = require('./UsuariosListController');

const { 
  obterEstatisticas, 
  obterResumo 
} = require('./UsuariosStatsController');

module.exports = {
  // CRUD Operations
  criar,
  atualizar,
  deletar,
  buscarPorId,
  
  // List Operations
  listar,
  listarTodas,
  buscarPorEmail,
  
  // Statistics Operations
  obterEstatisticas,
  obterResumo
};
