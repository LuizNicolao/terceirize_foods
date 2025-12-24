/**
 * Controller de Listagem de Notificações
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const NotificacoesService = require('../../services/notificacoes/NotificacoesService');

class NotificacoesListController {
  
  /**
   * Listar notificações do usuário
   */
  static listarNotificacoes = asyncHandler(async (req, res) => {
    const usuarioId = req.user.id;
    const { lida, tipo, limit = 20 } = req.query;
    const pagination = req.pagination;

    let baseQuery = `
      SELECT 
        n.id,
        n.chamado_id,
        n.tipo,
        n.titulo,
        n.mensagem,
        n.lida,
        n.data_criacao,
        n.data_leitura,
        c.titulo as chamado_titulo,
        c.status as chamado_status
      FROM notificacoes n
      LEFT JOIN chamados c ON n.chamado_id = c.id
      WHERE n.usuario_id = ? AND n.ativo = 1
    `;
    
    let params = [usuarioId];

    if (lida !== undefined) {
      baseQuery += ' AND n.lida = ?';
      params.push(lida === 'true' ? 1 : 0);
    }

    if (tipo) {
      baseQuery += ' AND n.tipo = ?';
      params.push(tipo);
    }

    baseQuery += ' ORDER BY n.data_criacao DESC';

    const limitValue = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limitValue} OFFSET ${offset}`;
    
    const notificacoes = await executeQuery(query, params);

    // Contar total
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM notificacoes n
      WHERE n.usuario_id = ? AND n.ativo = 1
    `;
    let countParams = [usuarioId];

    if (lida !== undefined) {
      countQuery += ' AND n.lida = ?';
      countParams.push(lida === 'true' ? 1 : 0);
    }

    if (tipo) {
      countQuery += ' AND n.tipo = ?';
      countParams.push(tipo);
    }

    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Contar não lidas
    const naoLidas = await NotificacoesService.contarNaoLidas(usuarioId);

    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/chamados/api/notificacoes', queryParams);

    const data = res.addListLinks(notificacoes, meta.pagination, queryParams);

    return successResponse(res, data, 'Notificações listadas com sucesso', STATUS_CODES.OK, {
      ...meta,
      naoLidas
    });
  });

  /**
   * Obter contagem de notificações não lidas
   */
  static contarNaoLidas = asyncHandler(async (req, res) => {
    const usuarioId = req.user.id;
    const total = await NotificacoesService.contarNaoLidas(usuarioId);

    return successResponse(res, { total }, 'Contagem obtida com sucesso', STATUS_CODES.OK);
  });
}

module.exports = NotificacoesListController;

