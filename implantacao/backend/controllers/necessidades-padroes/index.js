/**
 * Necessidades Padrões - Controllers
 * Centraliza todos os controllers relacionados a necessidades padrões
 */

const NecessidadesPadroesListController = require('./NecessidadesPadroesListController');
const NecessidadesPadroesCRUDController = require('./NecessidadesPadroesCRUDController');
const NecessidadesPadroesGeracaoController = require('./NecessidadesPadroesGeracaoController');

module.exports = {
  NecessidadesPadroesListController,
  NecessidadesPadroesCRUDController,
  NecessidadesPadroesGeracaoController
};
