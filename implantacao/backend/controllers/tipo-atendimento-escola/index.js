const TipoAtendimentoEscolaCRUDController = require('./TipoAtendimentoEscolaCRUDController');
const TipoAtendimentoEscolaListController = require('./TipoAtendimentoEscolaListController');

module.exports = {
  ...TipoAtendimentoEscolaCRUDController,
  ...TipoAtendimentoEscolaListController
};

