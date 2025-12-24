/**
 * Controller de Histórico de Chamados
 * Responsável por buscar histórico de mudanças
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ChamadosHistoricoController {
  
  /**
   * Listar histórico de um chamado
   */
  static listarHistorico = asyncHandler(async (req, res) => {
    const { chamadoId } = req.params;
    const pagination = req.pagination;

    // Verificar se chamado existe
    const chamado = await executeQuery(
      'SELECT id FROM chamados WHERE id = ? AND ativo = 1',
      [chamadoId]
    );

    if (chamado.length === 0) {
      return notFoundResponse(res, 'Chamado não encontrado');
    }

    const baseQuery = `
      SELECT 
        ch.id,
        ch.chamado_id,
        ch.usuario_id,
        ch.campo_alterado,
        ch.valor_anterior,
        ch.valor_novo,
        ch.data_alteracao,
        u.nome as usuario_nome,
        u.email as usuario_email
      FROM chamados_historico ch
      LEFT JOIN usuarios u ON ch.usuario_id = u.id
      WHERE ch.chamado_id = ?
      ORDER BY ch.data_alteracao DESC
    `;

    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    const historico = await executeQuery(query, [chamadoId]);

    const totalResult = await executeQuery(
      'SELECT COUNT(*) as total FROM chamados_historico WHERE chamado_id = ?',
      [chamadoId]
    );
    const totalItems = totalResult[0].total;

    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/chamados/api/chamados/${chamadoId}/historico`, queryParams);

    const data = res.addListLinks(historico, meta.pagination, queryParams);

    return successResponse(res, data, 'Histórico listado com sucesso', STATUS_CODES.OK, {
      ...meta
    });
  });
}

module.exports = ChamadosHistoricoController;

