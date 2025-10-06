const { 
  criar, 
  atualizar, 
  deletar
} = require('./RegistrosDiariosCRUDController');

const { 
  listar, 
  listarTodas,
  buscarPorId,
  calcularMediasPorPeriodo
} = require('./RegistrosDiariosListController');

const { 
  obterEstatisticas, 
  obterResumo,
  calcularMedias
} = require('./RegistrosDiariosStatsController');

module.exports = {
  // CRUD Operations
  criar,
  atualizar,
  deletar,
  
  // List Operations
  listar,
  listarTodas,
  buscarPorId,
  calcularMediasPorPeriodo,
  
  // Statistics Operations
  obterEstatisticas,
  obterResumo,
  calcularMedias
};
