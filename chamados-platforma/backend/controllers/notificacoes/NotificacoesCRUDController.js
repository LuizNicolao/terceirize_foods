/**
 * Controller CRUD de Notificações
 */

const NotificacoesService = require('../../services/notificacoes/NotificacoesService');
const { 
  successResponse, 
  notFoundResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const { executeQuery } = require('../../config/database');

class NotificacoesCRUDController {
  
  /**
   * Marcar notificação como lida
   */
  static marcarComoLida = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.user.id;

    // Verificar se notificação existe e pertence ao usuário
    const notificacao = await executeQuery(
      'SELECT id FROM notificacoes WHERE id = ? AND usuario_id = ? AND ativo = 1',
      [id, usuarioId]
    );

    if (notificacao.length === 0) {
      return notFoundResponse(res, 'Notificação não encontrada');
    }

    await NotificacoesService.marcarComoLida(id, usuarioId);

    return successResponse(res, null, 'Notificação marcada como lida', STATUS_CODES.OK);
  });

  /**
   * Marcar todas as notificações como lidas
   */
  static marcarTodasComoLidas = asyncHandler(async (req, res) => {
    const usuarioId = req.user.id;

    await NotificacoesService.marcarTodasComoLidas(usuarioId);

    return successResponse(res, null, 'Todas as notificações foram marcadas como lidas', STATUS_CODES.OK);
  });

  /**
   * Excluir notificação (soft delete)
   */
  static excluirNotificacao = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.user.id;

    // Verificar se notificação existe e pertence ao usuário
    const notificacao = await executeQuery(
      'SELECT id FROM notificacoes WHERE id = ? AND usuario_id = ? AND ativo = 1',
      [id, usuarioId]
    );

    if (notificacao.length === 0) {
      return notFoundResponse(res, 'Notificação não encontrada');
    }

    await executeQuery(
      'UPDATE notificacoes SET ativo = 0 WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Notificação excluída com sucesso', STATUS_CODES.OK);
  });
}

module.exports = NotificacoesCRUDController;

