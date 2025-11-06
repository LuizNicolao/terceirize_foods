const TipoAtendimentoEscolaCRUDController = require('./TipoAtendimentoEscolaCRUDController');
const TipoAtendimentoEscolaListController = require('./TipoAtendimentoEscolaListController');

module.exports = {
  // CRUD Operations
  criar: TipoAtendimentoEscolaCRUDController.criar,
  atualizar: TipoAtendimentoEscolaCRUDController.atualizar,
  deletar: TipoAtendimentoEscolaCRUDController.deletar,
  buscarPorId: TipoAtendimentoEscolaCRUDController.buscarPorId,
  
  // List Operations
  listar: TipoAtendimentoEscolaListController.listar,
  buscarPorEscola: TipoAtendimentoEscolaListController.buscarPorEscola,
  buscarEscolasPorTipo: TipoAtendimentoEscolaListController.buscarEscolasPorTipo
};

