const { 
  criar, 
  atualizar, 
  deletar
} = require('./MediasEscolasCRUDController');

const { 
  listar, 
  listarTodas,
  buscarPorEscola,
  buscarPorId,
  listarEscolasNutricionista
} = require('./MediasEscolasListController');

const { 
  obterEstatisticas, 
  obterResumo,
  calcularMedias,
  calcularMediasPorPeriodo
} = require('./MediasEscolasStatsController');

module.exports = {
  // CRUD Operations
  criar,
  atualizar,
  deletar,
  
  // List Operations
  listar,
  listarTodas,
  buscarPorEscola,
  buscarPorId,
  listarEscolasNutricionista,
  
  // Statistics Operations
  obterEstatisticas,
  obterResumo,
  
  // Calculation Operations
  calcularMedias,
  calcularMediasPorPeriodo
};
