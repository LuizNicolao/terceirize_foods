/**
 * Índice dos Controllers de Notificações
 */

const NotificacoesListController = require('./NotificacoesListController');
const NotificacoesCRUDController = require('./NotificacoesCRUDController');

module.exports = {
  listarNotificacoes: NotificacoesListController.listarNotificacoes,
  contarNaoLidas: NotificacoesListController.contarNaoLidas,
  marcarComoLida: NotificacoesCRUDController.marcarComoLida,
  marcarTodasComoLidas: NotificacoesCRUDController.marcarTodasComoLidas,
  excluirNotificacao: NotificacoesCRUDController.excluirNotificacao
};

