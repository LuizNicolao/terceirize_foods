const RegistrosDiariosCRUDController = require('./RegistrosDiariosCRUDController');
const RegistrosDiariosListController = require('./RegistrosDiariosListController');
const RegistrosDiariosStatsController = require('./RegistrosDiariosStatsController');

module.exports = {
  criar: RegistrosDiariosCRUDController.criar,
  buscarPorEscolaData: RegistrosDiariosCRUDController.buscarPorEscolaData,
  excluir: RegistrosDiariosCRUDController.excluir,
  listar: RegistrosDiariosListController.listar,
  listarMedias: RegistrosDiariosListController.listarMedias,
  obterEstatisticas: RegistrosDiariosStatsController.obterEstatisticas
};

