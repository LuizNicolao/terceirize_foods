const EfetivosListController = require('./EfetivosListController');
const EfetivosCRUDController = require('./EfetivosCRUDController');

module.exports = {
  // Listagem
  listarEfetivos: EfetivosListController.listarEfetivos,
  listarTodosEfetivos: EfetivosListController.listarTodosEfetivos,
  buscarEfetivoPorId: EfetivosListController.buscarEfetivoPorId,
  buscarEstatisticas: EfetivosListController.buscarEstatisticas,
  
  // CRUD
  criarEfetivo: EfetivosCRUDController.criarEfetivo,
  criarEfetivoGeral: EfetivosCRUDController.criarEfetivoGeral,
  atualizarEfetivo: EfetivosCRUDController.atualizarEfetivo,
  excluirEfetivo: EfetivosCRUDController.excluirEfetivo
};
