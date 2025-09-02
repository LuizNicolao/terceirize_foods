/**
 * Índice das Rotas de Permissões
 * Centraliza a exportação do router e funções auxiliares
 */

const permissoesRouter = require('./permissoesRoute');
const { atualizarPermissoesPorTipoNivel } = require('./modules/permissoesUtils');

module.exports = {
  router: permissoesRouter,
  atualizarPermissoesPorTipoNivel
};
