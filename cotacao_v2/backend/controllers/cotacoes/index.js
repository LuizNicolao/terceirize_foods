/**
 * Index dos Controllers de Cotações
 * Centraliza a exportação de todos os controllers do módulo
 */

const CotacoesCRUDController = require('./CotacoesCRUDController');
const CotacoesListController = require('./CotacoesListController');
const CotacoesSearchController = require('./CotacoesSearchController');
const CotacoesStatsController = require('./CotacoesStatsController');

module.exports = {
  CotacoesCRUDController,
  CotacoesListController,
  CotacoesSearchController,
  CotacoesStatsController
};
