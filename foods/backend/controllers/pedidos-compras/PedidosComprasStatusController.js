/**
 * Controller de Status de Pedidos de Compras
 * Gerencia ações em lote de aprovação e reabertura
 */

const { executeQuery } = require('../../config/database');
const { successResponse, errorResponse, STATUS_CODES } = require('../../utils/responseHandler');

class PedidosComprasStatusController {
  /**
   * POST /api/pedidos-compras/acoes-em-lote/aprovar
   * Aprova múltiplos pedidos (apenas em_digitacao)
   */
  static async aprovarPedidosEmLote(req, res) {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return errorResponse(res, 'Lista de IDs é obrigatória', STATUS_CODES.BAD_REQUEST);
      }

      // Verificar quais pedidos podem ser aprovados
      const placeholders = ids.map(() => '?').join(',');
      const pedidos = await executeQuery(
        `SELECT id, numero_pedido, status FROM pedidos_compras WHERE id IN (${placeholders})`,
        ids
      );

      const pedidosAprovados = [];
      const pedidosIgnorados = [];

      for (const pedido of pedidos) {
        if (pedido.status === 'em_digitacao') {
          await executeQuery(
            'UPDATE pedidos_compras SET status = ? WHERE id = ?',
            ['aprovado', pedido.id]
          );
          pedidosAprovados.push(pedido.numero_pedido);
        } else {
          pedidosIgnorados.push({
            numero: pedido.numero_pedido,
            motivo: `Status atual: ${pedido.status}`
          });
        }
      }

      const message = pedidosAprovados.length > 0
        ? `${pedidosAprovados.length} pedido(s) aprovado(s) com sucesso`
        : 'Nenhum pedido foi aprovado';

      return successResponse(
        res,
        {
          aprovados: pedidosAprovados,
          ignorados: pedidosIgnorados
        },
        message,
        STATUS_CODES.OK
      );
    } catch (error) {
      console.error('Erro ao aprovar pedidos em lote:', error);
      return errorResponse(res, 'Erro ao aprovar pedidos', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * POST /api/pedidos-compras/acoes-em-lote/reabrir
   * Reabre múltiplos pedidos (apenas aprovado)
   */
  static async reabrirPedidosEmLote(req, res) {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return errorResponse(res, 'Lista de IDs é obrigatória', STATUS_CODES.BAD_REQUEST);
      }

      // Verificar quais pedidos podem ser reabertos
      const placeholders = ids.map(() => '?').join(',');
      const pedidos = await executeQuery(
        `SELECT id, numero_pedido, status FROM pedidos_compras WHERE id IN (${placeholders})`,
        ids
      );

      const pedidosReabertos = [];
      const pedidosIgnorados = [];

      for (const pedido of pedidos) {
        if (pedido.status === 'aprovado') {
          await executeQuery(
            'UPDATE pedidos_compras SET status = ? WHERE id = ?',
            ['em_digitacao', pedido.id]
          );
          pedidosReabertos.push(pedido.numero_pedido);
        } else {
          pedidosIgnorados.push({
            numero: pedido.numero_pedido,
            motivo: pedido.status === 'parcial' || pedido.status === 'finalizado'
              ? 'Pedido já foi usado em Notas Fiscais/RIR'
              : `Status atual: ${pedido.status}`
          });
        }
      }

      const message = pedidosReabertos.length > 0
        ? `${pedidosReabertos.length} pedido(s) reaberto(s) com sucesso`
        : 'Nenhum pedido foi reaberto';

      return successResponse(
        res,
        {
          reabertos: pedidosReabertos,
          ignorados: pedidosIgnorados
        },
        message,
        STATUS_CODES.OK
      );
    } catch (error) {
      console.error('Erro ao reabrir pedidos em lote:', error);
      return errorResponse(res, 'Erro ao reabrir pedidos', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = PedidosComprasStatusController;

