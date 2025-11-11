/**
 * Necessidades Padrões - Controllers
 * Centraliza todos os controllers relacionados a necessidades padrões
 */

const NecessidadesPadroesListController = require('./NecessidadesPadroesListController');
const NecessidadesPadroesCRUDController = require('./NecessidadesPadroesCRUDController');
const NecessidadesPadroesGeracaoController = require('./NecessidadesPadroesGeracaoController');
const NecessidadesPadroesExportController = require('./NecessidadesPadroesExportController');
const NecessidadesPadroesImportController = require('./NecessidadesPadroesImportController');

module.exports = {
  NecessidadesPadroesListController,
  NecessidadesPadroesCRUDController,
  NecessidadesPadroesGeracaoController,
  NecessidadesPadroesExportController,
  NecessidadesPadroesImportController
};
