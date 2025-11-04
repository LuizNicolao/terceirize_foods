/**
 * Controller de Status de Solicitações de Compras
 * Responsável por recalcular status baseado em vínculos com pedidos
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class SolicitacoesComprasStatusController {
  
  /**
   * Recalcular status de uma solicitação baseado em vínculos com pedidos
   */
  static recalcularStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se solicitação existe
    const [solicitacao] = await executeQuery(
      'SELECT id FROM solicitacoes_compras WHERE id = ?',
      [id]
    );

    if (!solicitacao) {
      return notFoundResponse(res, 'Solicitação de compras não encontrada');
    }

    // Buscar todos os itens com quantidades atendidas
    const itens = await executeQuery(
      `SELECT 
        sci.id,
        sci.quantidade as quantidade_solicitada,
        COALESCE(SUM(pci.quantidade_pedido), 0) as quantidade_utilizada
      FROM solicitacao_compras_itens sci
      LEFT JOIN pedido_compras_itens pci ON pci.solicitacao_item_id = sci.id
      WHERE sci.solicitacao_id = ?
      GROUP BY sci.id, sci.quantidade`,
      [id]
    );

    if (itens.length === 0) {
      // Se não tem itens, status é 'aberto'
      await executeQuery(
        'UPDATE solicitacoes_compras SET status = ? WHERE id = ?',
        ['aberto', id]
      );
      return successResponse(res, { status: 'aberto' }, 'Status recalculado com sucesso');
    }

    let totalSolicitado = 0;
    let totalAtendido = 0;
    let todosAtendidos = true;
    let algumAtendido = false;

    for (const item of itens) {
      const solicitado = parseFloat(item.quantidade_solicitada || 0);
      const atendido = parseFloat(item.quantidade_utilizada || 0);

      totalSolicitado += solicitado;
      totalAtendido += atendido;

      if (atendido > 0) algumAtendido = true;
      if (atendido < solicitado) todosAtendidos = false;
    }

    // Determinar status
    let status = 'aberto';
    if (totalAtendido === 0) {
      status = 'aberto';
    } else if (todosAtendidos && totalAtendido >= totalSolicitado) {
      status = 'finalizado';
    } else {
      status = 'parcial';
    }

    // Atualizar status no banco
    await executeQuery(
      'UPDATE solicitacoes_compras SET status = ? WHERE id = ?',
      [status, id]
    );

    return successResponse(res, { status }, 'Status recalculado com sucesso');
  });

  /**
   * Recalcular status de todas as solicitações
   */
  static recalcularTodosStatus = asyncHandler(async (req, res) => {
    // Buscar todas as solicitações
    const solicitacoes = await executeQuery(
      'SELECT id FROM solicitacoes_compras WHERE status != ?',
      ['cancelada']
    );

    let atualizadas = 0;
    let erros = 0;

    for (const solic of solicitacoes) {
      try {
        // Buscar todos os itens com quantidades atendidas
        const itens = await executeQuery(
          `SELECT 
            sci.id,
            sci.quantidade as quantidade_solicitada,
            COALESCE(SUM(pci.quantidade_pedido), 0) as quantidade_utilizada
          FROM solicitacao_compras_itens sci
          LEFT JOIN pedido_compras_itens pci ON pci.solicitacao_item_id = sci.id
          WHERE sci.solicitacao_id = ?
          GROUP BY sci.id, sci.quantidade`,
          [solic.id]
        );

        if (itens.length === 0) {
          await executeQuery(
            'UPDATE solicitacoes_compras SET status = ? WHERE id = ?',
            ['aberto', solic.id]
          );
          atualizadas++;
          continue;
        }

        let totalSolicitado = 0;
        let totalAtendido = 0;
        let todosAtendidos = true;

        for (const item of itens) {
          const solicitado = parseFloat(item.quantidade_solicitada || 0);
          const atendido = parseFloat(item.quantidade_utilizada || 0);

          totalSolicitado += solicitado;
          totalAtendido += atendido;

          if (atendido < solicitado) todosAtendidos = false;
        }

        // Determinar status
        let status = 'aberto';
        if (totalAtendido === 0) {
          status = 'aberto';
        } else if (todosAtendidos && totalAtendido >= totalSolicitado) {
          status = 'finalizado';
        } else {
          status = 'parcial';
        }

        await executeQuery(
          'UPDATE solicitacoes_compras SET status = ? WHERE id = ?',
          [status, solic.id]
        );

        atualizadas++;
      } catch (error) {
        console.error(`Erro ao recalcular status da solicitação ${solic.id}:`, error);
        erros++;
      }
    }

    return successResponse(res, {
      total: solicitacoes.length,
      atualizadas,
      erros
    }, 'Status de todas as solicitações recalculados com sucesso');
  });
}

module.exports = SolicitacoesComprasStatusController;

