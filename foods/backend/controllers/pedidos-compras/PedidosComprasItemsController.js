/**
 * Controller de Itens de Pedidos de Compras
 * Responsável por inserir e atualizar itens do pedido
 */

const { executeQuery } = require('../../config/database');
const { errorResponse, STATUS_CODES } = require('../../middleware/responseHandler');

class PedidosComprasItemsController {
  /**
   * Inserir item do pedido (produto novo - sem solicitação)
   */
  static async inserirItemProdutoNovo(pedidoId, item) {
    // Buscar dados do produto genérico
    const [produto] = await executeQuery(
      `SELECT 
        pg.id,
        pg.codigo,
        pg.nome,
        pg.unidade_medida_id
      FROM produto_generico pg
      WHERE pg.id = ?`,
      [item.produto_generico_id]
    );

    if (!produto) {
      return {
        success: false,
        error: `Produto genérico não encontrado (ID: ${item.produto_generico_id})`
      };
    }

    // Buscar unidade de medida
    let unidadeMedida = item.unidade_medida || null;
    let unidadeMedidaId = produto.unidade_medida_id || null;
    
    if (unidadeMedidaId) {
      const [unidade] = await executeQuery(
        `SELECT sigla, nome FROM unidades_medida WHERE id = ?`,
        [unidadeMedidaId]
      );
      if (unidade) {
        unidadeMedida = unidade.sigla || unidade.nome || item.unidade_medida || null;
      }
    }

    // Inserir item do pedido (produto novo)
    await executeQuery(
      `INSERT INTO pedido_compras_itens (
        pedido_id, solicitacao_item_id, produto_generico_id,
        codigo_produto, nome_produto,
        unidade_medida_id, unidade_medida,
        quantidade_solicitada, quantidade_pedido,
        valor_unitario, observacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pedidoId,
        null, // solicitacao_item_id é null para produtos novos
        item.produto_generico_id,
        produto.codigo || null,
        produto.nome || null,
        unidadeMedidaId,
        unidadeMedida,
        0, // quantidade_solicitada é 0 para produtos novos
        parseFloat(item.quantidade_pedido) || 0,
        parseFloat(item.valor_unitario) || 0,
        item.observacao || null
      ]
    );

    return { success: true };
  }

  /**
   * Inserir item do pedido (da solicitação)
   */
  static async inserirItemSolicitacao(pedidoId, item) {
    // Validar saldo disponível
    const saldoQuery = await executeQuery(
      `SELECT 
        sci.quantidade as quantidade_solicitada,
        COALESCE(SUM(pci.quantidade_pedido), 0) as quantidade_atendida,
        (sci.quantidade - COALESCE(SUM(pci.quantidade_pedido), 0)) as saldo
      FROM solicitacao_compras_itens sci
      LEFT JOIN pedido_compras_itens pci ON pci.solicitacao_item_id = sci.id
      WHERE sci.id = ?
      GROUP BY sci.id`,
      [item.solicitacao_item_id]
    );

    if (saldoQuery.length === 0) {
      return {
        success: false,
        error: `Item da solicitação não encontrado (ID: ${item.solicitacao_item_id})`
      };
    }

    const saldo = parseFloat(saldoQuery[0].saldo);
    const quantidadePedido = parseFloat(item.quantidade_pedido);

    if (quantidadePedido > saldo) {
      return {
        success: false,
        error: `Quantidade solicitada (${quantidadePedido}) excede o saldo disponível (${saldo})`
      };
    }

    // Buscar dados do item da solicitação
    const itemSolicitacao = await executeQuery(
      `SELECT 
        sci.*,
        um.sigla as unidade_simbolo,
        um.nome as unidade_nome
      FROM solicitacao_compras_itens sci
      LEFT JOIN unidades_medida um ON sci.unidade_medida_id = um.id
      WHERE sci.id = ?`,
      [item.solicitacao_item_id]
    );

    if (itemSolicitacao.length === 0) {
      return { success: true }; // Item não encontrado, mas não é erro fatal
    }

    const itemSol = itemSolicitacao[0];

    // Inserir item do pedido
    await executeQuery(
      `INSERT INTO pedido_compras_itens (
        pedido_id, solicitacao_item_id, produto_generico_id,
        codigo_produto, nome_produto,
        unidade_medida_id, unidade_medida,
        quantidade_solicitada, quantidade_pedido,
        valor_unitario, observacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pedidoId,
        item.solicitacao_item_id,
        itemSol.produto_id || null, // produto_id na solicitação é o produto_generico_id
        itemSol.codigo_produto || null,
        itemSol.nome_produto || null,
        itemSol.unidade_medida_id || null,
        itemSol.unidade_simbolo || itemSol.unidade_medida || null,
        itemSol.quantidade || 0,
        quantidadePedido,
        parseFloat(item.valor_unitario) || 0,
        item.observacao || null
      ]
    );

    return { success: true };
  }

  /**
   * Inserir todos os itens do pedido
   */
  static async inserirItensPedido(pedidoId, itens) {
    for (const item of itens) {
      // Se for produto novo (tem produto_generico_id mas não tem solicitacao_item_id)
      if (item.produto_generico_id && !item.solicitacao_item_id) {
        const result = await this.inserirItemProdutoNovo(pedidoId, item);
        if (!result.success) {
          return result;
        }
      } else if (item.solicitacao_item_id) {
        // Item da solicitação (lógica original)
        const result = await this.inserirItemSolicitacao(pedidoId, item);
        if (!result.success) {
          return result;
        }
      }
    }
    
    return { success: true };
  }

  /**
   * Atualizar itens do pedido (deletar e recriar)
   */
  static async atualizarItensPedido(pedidoId, itens) {
    // Deletar itens existentes e recriar
    await executeQuery('DELETE FROM pedido_compras_itens WHERE pedido_id = ?', [pedidoId]);
    
    // Inserir novos itens
    return await this.inserirItensPedido(pedidoId, itens);
  }

  /**
   * Desvincular produtos do pedido (parcial ou total)
   * @param {number} pedidoId - ID do pedido
   * @param {Array<number>} itemIds - IDs dos itens a desvincular (opcional - se vazio, remove todos)
   */
  static async desvincularProdutosPedido(pedidoId, itemIds = []) {
    try {
      // Verificar se o pedido existe
      const pedidos = await executeQuery(
        'SELECT id, status FROM pedidos_compras WHERE id = ?',
        [pedidoId]
      );

      if (pedidos.length === 0) {
        return {
          success: false,
          error: 'Pedido de compras não encontrado'
        };
      }

      const pedido = pedidos[0];

      // Verificar se pode desvincular (apenas pedidos em digitação ou aprovados podem ter produtos removidos)
      // Nota: Dependendo da regra de negócio, pode ser apenas em_digitacao
      if (!['em_digitacao', 'aprovado'].includes(pedido.status)) {
        return {
          success: false,
          error: 'Não é possível desvincular produtos de um pedido com status ' + pedido.status
        };
      }

      // Se itemIds está vazio, remover todos os produtos
      if (itemIds.length === 0) {
        await executeQuery(
          'DELETE FROM pedido_compras_itens WHERE pedido_id = ?',
          [pedidoId]
        );
        return {
          success: true,
          message: 'Todos os produtos foram desvinculados do pedido'
        };
      }

      // Remover produtos específicos
      const placeholders = itemIds.map(() => '?').join(',');
      await executeQuery(
        `DELETE FROM pedido_compras_itens 
         WHERE pedido_id = ? AND id IN (${placeholders})`,
        [pedidoId, ...itemIds]
      );

      return {
        success: true,
        message: `${itemIds.length} produto(s) desvinculado(s) com sucesso`
      };
    } catch (error) {
      console.error('Erro ao desvincular produtos do pedido:', error);
      return {
        success: false,
        error: 'Erro ao desvincular produtos do pedido: ' + error.message
      };
    }
  }
}

module.exports = PedidosComprasItemsController;

