/**
 * Helpers para Pedidos de Compras
 * Funções auxiliares reutilizáveis
 */

const { executeQuery } = require('../../config/database');

class PedidosComprasHelpers {
  /**
   * Gerar próximo número de pedido
   */
  static async gerarNumeroPedido() {
    const ultimo = await executeQuery(
      `SELECT numero_pedido FROM pedidos_compras 
       WHERE numero_pedido LIKE 'PC%' 
       ORDER BY id DESC LIMIT 1`
    );

    if (ultimo.length === 0) {
      return 'PC000001';
    }

    const numero = parseInt(ultimo[0].numero_pedido.substring(2));
    const proximo = 'PC' + String(numero + 1).padStart(6, '0');
    return proximo;
  }

  /**
   * Buscar dados das filiais (faturamento, cobrança, entrega)
   */
  static async buscarDadosFiliais(filiaisIds) {
    const filiaisData = {};
    
    for (const tipo of ['faturamento', 'cobranca', 'entrega']) {
      const filialId = filiaisIds[`filial_${tipo}_id`];
      if (filialId) {
        const filial = await executeQuery(
          `SELECT id, filial, codigo_filial, cnpj, razao_social, 
                  logradouro, numero, bairro, cidade, estado, cep
           FROM filiais WHERE id = ?`,
          [filialId]
        );
        if (filial.length > 0) {
          const f = filial[0];
          filiaisData[tipo] = {
            id: f.id,
            nome: f.filial,
            cnpj: f.cnpj,
            razao_social: f.razao_social,
            endereco: `${f.logradouro || ''}, ${f.numero || ''}${f.bairro ? ' - ' + f.bairro : ''}${f.cidade ? ' - ' + f.cidade : ''}${f.estado ? '/' + f.estado : ''}${f.cep ? ' - CEP: ' + f.cep : ''}`.trim()
          };
        }
      }
    }
    
    return filiaisData;
  }

  /**
   * Buscar nomes de forma_pagamento e prazo_pagamento pelos IDs
   */
  static async buscarFormasPrazos(forma_pagamento_id, prazo_pagamento_id, forma_pagamento, prazo_pagamento) {
    let formaPagamentoNome = forma_pagamento || null;
    let prazoPagamentoNome = prazo_pagamento || null;
    
    if (forma_pagamento_id && !formaPagamentoNome) {
      const [forma] = await executeQuery(
        'SELECT nome FROM formas_pagamento WHERE id = ?',
        [forma_pagamento_id]
      );
      if (forma) {
        formaPagamentoNome = forma.nome;
      }
    }
    
    if (prazo_pagamento_id && !prazoPagamentoNome) {
      const [prazo] = await executeQuery(
        'SELECT nome FROM prazos_pagamento WHERE id = ?',
        [prazo_pagamento_id]
      );
      if (prazo) {
        prazoPagamentoNome = prazo.nome;
      }
    }

    return {
      formaPagamentoNome,
      prazoPagamentoNome
    };
  }

  /**
   * Buscar pedido completo (helper)
   */
  static async buscarPedidoCompleto(pedidoId) {
    const pedidos = await executeQuery(
      `SELECT 
        p.id,
        p.numero_pedido,
        p.solicitacao_compras_id,
        p.fornecedor_id,
        p.fornecedor_nome,
        p.fornecedor_cnpj,
        p.filial_id,
        p.filial_nome,
        p.filial_faturamento_id,
        p.filial_cobranca_id,
        p.filial_entrega_id,
        p.endereco_faturamento,
        p.endereco_cobranca,
        p.endereco_entrega,
        p.cnpj_faturamento,
        p.cnpj_cobranca,
        p.cnpj_entrega,
        p.data_entrega_cd,
        p.semana_abastecimento,
        p.valor_total,
        p.status,
        p.observacoes,
        p.forma_pagamento,
        p.prazo_pagamento,
        p.justificativa,
        p.numero_solicitacao,
        p.criado_por,
        p.criado_em,
        p.atualizado_em,
        s.numero_solicitacao as solicitacao_numero,
        s.justificativa as solicitacao_justificativa,
        u.nome as criado_por_nome,
        DATE_FORMAT(p.criado_em, '%d/%m/%Y %H:%i') as data_criacao,
        DATE_FORMAT(p.atualizado_em, '%d/%m/%Y %H:%i') as data_atualizacao,
        DATE_FORMAT(p.data_entrega_cd, '%d/%m/%Y') as data_entrega_formatada
      FROM pedidos_compras p
      LEFT JOIN solicitacoes_compras s ON p.solicitacao_compras_id = s.id
      LEFT JOIN usuarios u ON p.criado_por = u.id
      WHERE p.id = ?`,
      [pedidoId]
    );

    if (pedidos.length === 0) {
      return null;
    }

    const pedido = pedidos[0];

    // Buscar itens com todos os campos
    const itens = await executeQuery(
      `SELECT 
        pci.id,
        pci.pedido_id,
        pci.solicitacao_item_id,
        pci.produto_generico_id,
        pci.codigo_produto,
        pci.nome_produto,
        pci.unidade_medida_id,
        pci.unidade_medida,
        pci.quantidade_solicitada,
        pci.quantidade_pedido,
        pci.valor_unitario,
        pci.valor_total,
        pci.observacao,
        pci.criado_em,
        pg.nome as produto_generico_nome,
        pg.codigo as produto_generico_codigo,
        um.sigla as unidade_sigla,
        um.nome as unidade_nome
      FROM pedido_compras_itens pci
      LEFT JOIN produto_generico pg ON pci.produto_generico_id = pg.id
      LEFT JOIN unidades_medida um ON pci.unidade_medida_id = um.id
      WHERE pci.pedido_id = ?
      ORDER BY pci.id`,
      [pedidoId]
    );

    pedido.itens = itens;
    return pedido;
  }

  /**
   * Atualizar status da solicitação baseado nos pedidos aprovados
   * Considera apenas pedidos com status 'aprovado' ou superior
   */
  static async atualizarStatusSolicitacao(solicitacaoId) {
    // Buscar todos os itens da solicitação com quantidades utilizadas em pedidos aprovados
    const itens = await executeQuery(
      `SELECT 
        sci.id,
        sci.quantidade as quantidade_solicitada,
        COALESCE(SUM(CASE WHEN pc.status IN ('aprovado', 'enviado', 'confirmado', 'em_transito', 'entregue', 'parcial', 'finalizado') 
          THEN pci.quantidade_pedido ELSE 0 END), 0) as quantidade_utilizada
      FROM solicitacao_compras_itens sci
      LEFT JOIN pedido_compras_itens pci ON pci.solicitacao_item_id = sci.id
      LEFT JOIN pedidos_compras pc ON pci.pedido_id = pc.id
      WHERE sci.solicitacao_id = ?
      GROUP BY sci.id, sci.quantidade`,
      [solicitacaoId]
    );

    if (itens.length === 0) {
      // Se não tem itens, manter status atual ou definir como 'aberto'
      return;
    }

    let todosAtendidos = true;
    let algumAtendido = false;

    for (const item of itens) {
      const solicitado = parseFloat(item.quantidade_solicitada || 0);
      const utilizado = parseFloat(item.quantidade_utilizada || 0);

      if (utilizado > 0) {
        algumAtendido = true;
      }

      if (utilizado < solicitado) {
        todosAtendidos = false;
      }
    }

    // Determinar status
    let novoStatus = 'aberto';
    if (algumAtendido && todosAtendidos) {
      novoStatus = 'finalizado';
    } else if (algumAtendido) {
      novoStatus = 'parcial';
    }

    // Atualizar status da solicitação
    await executeQuery(
      'UPDATE solicitacoes_compras SET status = ? WHERE id = ?',
      [novoStatus, solicitacaoId]
    );

    return novoStatus;
  }

  /**
   * Obter permissões do usuário (helper)
   */
  static getUserPermissions(user) {
    return ['visualizar', 'criar', 'editar', 'excluir'];
  }
}

module.exports = PedidosComprasHelpers;

