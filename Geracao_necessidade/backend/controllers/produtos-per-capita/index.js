const { 
  criar, 
  atualizar, 
  deletar
} = require('./ProdutosPerCapitaCRUDController');

const { 
  listar, 
  listarTodas,
  buscarPorId,
  listarProdutosDisponiveis,
  listarTodosProdutos,
  buscarPorProdutos
} = require('./ProdutosPerCapitaListController');

const { 
  obterEstatisticas, 
  obterResumo 
} = require('./ProdutosPerCapitaStatsController');

module.exports = {
  // CRUD Operations
  criar,
  atualizar,
  deletar,
  
  // List Operations
  listar,
  listarTodas,
  buscarPorId,
  listarProdutosDisponiveis,
  listarTodosProdutos,
  buscarPorProdutos,
  
  // Statistics Operations
  obterEstatisticas,
  obterResumo
};
