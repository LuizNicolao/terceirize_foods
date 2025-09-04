/**
 * Controllers de Tipos de Cardápio
 * Centraliza a exportação de todos os controllers relacionados a tipos de cardápio
 */

const TiposCardapioCRUDController = require('./TiposCardapioCRUDController');
const TiposCardapioListController = require('./TiposCardapioListController');
const TiposCardapioSearchController = require('./TiposCardapioSearchController');

module.exports = {
  // Controller principal com operações CRUD
  listar: TiposCardapioCRUDController.listar,
  buscarPorId: TiposCardapioCRUDController.buscarPorId,
  criar: TiposCardapioCRUDController.criar,
  atualizar: TiposCardapioCRUDController.atualizar,
  excluir: TiposCardapioCRUDController.excluir,

  // Controller de listagem
  listarTiposCardapio: TiposCardapioListController.listarTiposCardapio,
  buscarTipoCardapioPorId: TiposCardapioListController.buscarTipoCardapioPorId,

  // Controller de busca
  buscarAtivos: TiposCardapioSearchController.buscarAtivos,
  buscarPorFilial: TiposCardapioSearchController.buscarPorFilial,
  buscarDisponiveisParaUnidade: TiposCardapioSearchController.buscarDisponiveisParaUnidade,
  buscarPorIds: TiposCardapioSearchController.buscarPorIds
};
