const EfetivosListController = require('./EfetivosListController');
const EfetivosCRUDController = require('./EfetivosCRUDController');

module.exports = {
  // Listagem
  listarEfetivos: EfetivosListController.listarEfetivos,
  buscarEfetivoPorId: EfetivosListController.buscarEfetivoPorId,
  
  // CRUD
  criarEfetivo: EfetivosCRUDController.criarEfetivo,
  atualizarEfetivo: EfetivosCRUDController.atualizarEfetivo,
  excluirEfetivo: EfetivosCRUDController.excluirEfetivo
};
