/**
 * Controller CRUD de Pedidos de Compras
 * Responsável por operações de Create, Update e Delete
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  conflictResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class PedidosComprasCRUDController {
  
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
   * Criar novo pedido de compras
   */
  static criarPedidoCompras = asyncHandler(async (req, res) => {
    const {
      solicitacao_compras_id,
      fornecedor_id,
      fornecedor_nome,
      fornecedor_cnpj,
      filial_faturamento_id,
      filial_cobranca_id,
      filial_entrega_id,
      forma_pagamento_id,
      prazo_pagamento_id,
      forma_pagamento,
      prazo_pagamento,
      observacoes,
      itens
    } = req.body;
    
    const usuario_id = req.user.id;

    // Validar campos obrigatórios
    if (!solicitacao_compras_id) {
      return errorResponse(res, 'A solicitação de compras é obrigatória', STATUS_CODES.BAD_REQUEST);
    }

    if (!fornecedor_nome || fornecedor_nome.trim() === '') {
      return errorResponse(res, 'O nome do fornecedor é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return errorResponse(res, 'É necessário adicionar pelo menos um item ao pedido', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se solicitação existe
    const solicitacao = await executeQuery(
      `SELECT s.*, f.filial as filial_nome, f.codigo_filial
       FROM solicitacoes_compras s
       LEFT JOIN filiais f ON s.filial_id = f.id
       WHERE s.id = ?`,
      [solicitacao_compras_id]
    );

    if (solicitacao.length === 0) {
      return notFoundResponse(res, 'Solicitação de compras não encontrada');
    }

    const solData = solicitacao[0];

    // Buscar dados das filiais (faturamento, cobrança, entrega)
    const filiaisData = {};
    for (const tipo of ['faturamento', 'cobranca', 'entrega']) {
      const filialId = req.body[`filial_${tipo}_id`];
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

    // Buscar nomes de forma_pagamento e prazo_pagamento pelos IDs se fornecidos
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

    // Gerar número do pedido
    const numero_pedido = await this.gerarNumeroPedido();

    // Inserir pedido
    const result = await executeQuery(
      `INSERT INTO pedidos_compras (
        numero_pedido, solicitacao_compras_id, fornecedor_id, fornecedor_nome, fornecedor_cnpj,
        filial_id, filial_nome,
        filial_faturamento_id, filial_cobranca_id, filial_entrega_id,
        endereco_faturamento, endereco_cobranca, endereco_entrega,
        cnpj_faturamento, cnpj_cobranca, cnpj_entrega,
        data_entrega_cd, semana_abastecimento,
        forma_pagamento, prazo_pagamento,
        justificativa, numero_solicitacao,
        status, observacoes, criado_por
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        numero_pedido,
        solicitacao_compras_id,
        fornecedor_id || null,
        fornecedor_nome.trim(),
        fornecedor_cnpj || null,
        solData.filial_id,
        solData.filial_nome || null,
        filial_faturamento_id || null,
        filial_cobranca_id || null,
        filial_entrega_id || solData.filial_id,
        filiaisData.faturamento?.endereco || null,
        filiaisData.cobranca?.endereco || null,
        filiaisData.entrega?.endereco || null,
        filiaisData.faturamento?.cnpj || null,
        filiaisData.cobranca?.cnpj || null,
        filiaisData.entrega?.cnpj || null,
        solData.data_entrega_cd,
        solData.semana_abastecimento || null,
        formaPagamentoNome,
        prazoPagamentoNome,
        solData.justificativa || null,
        solData.numero_solicitacao || null,
        'em_digitacao',
        observacoes || null,
        usuario_id
      ]
    );

    const pedidoId = result.insertId;

    // Inserir itens do pedido
    for (const item of itens) {
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
        await executeQuery('DELETE FROM pedidos_compras WHERE id = ?', [pedidoId]);
        return errorResponse(res, `Item da solicitação não encontrado (ID: ${item.solicitacao_item_id})`, STATUS_CODES.BAD_REQUEST);
      }

      const saldo = parseFloat(saldoQuery[0].saldo);
      const quantidadePedido = parseFloat(item.quantidade_pedido);

      if (quantidadePedido > saldo) {
        await executeQuery('DELETE FROM pedidos_compras WHERE id = ?', [pedidoId]);
        return errorResponse(res, `Quantidade solicitada (${quantidadePedido}) excede o saldo disponível (${saldo})`, STATUS_CODES.BAD_REQUEST);
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
        continue;
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
    }

    // Buscar pedido criado com todos os dados
    const pedidoCriado = await this.buscarPedidoCompleto(pedidoId);

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(pedidoCriado);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, pedidoCriado.id);

    return successResponse(res, data, 'Pedido de compras criado com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar pedido de compras
   */
  static atualizarPedidoCompras = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      fornecedor_id,
      fornecedor_nome,
      fornecedor_cnpj,
      filial_faturamento_id,
      filial_cobranca_id,
      filial_entrega_id,
      forma_pagamento_id,
      prazo_pagamento_id,
      forma_pagamento,
      prazo_pagamento,
      data_entrega_cd,
      status,
      observacoes,
      itens
    } = req.body;

    // Verificar se pedido existe
    const pedidos = await executeQuery(
      'SELECT * FROM pedidos_compras WHERE id = ?',
      [id]
    );

    if (pedidos.length === 0) {
      return notFoundResponse(res, 'Pedido de compras não encontrado');
    }

    const pedidoExistente = pedidos[0];

    // Validar se pode editar (apenas em_digitacao ou cancelado)
    if (!['em_digitacao', 'cancelado'].includes(pedidoExistente.status) && status === 'em_digitacao') {
      return errorResponse(res, 'Não é possível reabrir um pedido que já foi processado', STATUS_CODES.CONFLICT);
    }

    // Validar campos obrigatórios
    if (fornecedor_nome && fornecedor_nome.trim() === '') {
      return errorResponse(res, 'O nome do fornecedor é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    // Buscar dados das filiais se necessário
    const filiaisData = {};
    if (filial_faturamento_id || filial_cobranca_id || filial_entrega_id) {
      for (const tipo of ['faturamento', 'cobranca', 'entrega']) {
        const filialId = req.body[`filial_${tipo}_id`];
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
    }

    // Buscar nomes de forma_pagamento e prazo_pagamento pelos IDs se fornecidos
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

    // Atualizar pedido
    await executeQuery(
      `UPDATE pedidos_compras 
       SET fornecedor_id = COALESCE(?, fornecedor_id),
           fornecedor_nome = COALESCE(?, fornecedor_nome),
           fornecedor_cnpj = COALESCE(?, fornecedor_cnpj),
           filial_faturamento_id = COALESCE(?, filial_faturamento_id),
           filial_cobranca_id = COALESCE(?, filial_cobranca_id),
           filial_entrega_id = COALESCE(?, filial_entrega_id),
           endereco_faturamento = COALESCE(?, endereco_faturamento),
           endereco_cobranca = COALESCE(?, endereco_cobranca),
           endereco_entrega = COALESCE(?, endereco_entrega),
           cnpj_faturamento = COALESCE(?, cnpj_faturamento),
           cnpj_cobranca = COALESCE(?, cnpj_cobranca),
           cnpj_entrega = COALESCE(?, cnpj_entrega),
           data_entrega_cd = COALESCE(?, data_entrega_cd),
           forma_pagamento = COALESCE(?, forma_pagamento),
           prazo_pagamento = COALESCE(?, prazo_pagamento),
           status = COALESCE(?, status),
           observacoes = COALESCE(?, observacoes),
           atualizado_em = NOW()
       WHERE id = ?`,
      [
        fornecedor_id,
        fornecedor_nome ? fornecedor_nome.trim() : null,
        fornecedor_cnpj || null,
        filial_faturamento_id || null,
        filial_cobranca_id || null,
        filial_entrega_id || null,
        filiaisData.faturamento?.endereco || null,
        filiaisData.cobranca?.endereco || null,
        filiaisData.entrega?.endereco || null,
        filiaisData.faturamento?.cnpj || null,
        filiaisData.cobranca?.cnpj || null,
        filiaisData.entrega?.cnpj || null,
        data_entrega_cd || null,
        formaPagamentoNome,
        prazoPagamentoNome,
        status || null,
        observacoes || null,
        id
      ]
    );

    // Se itens foram fornecidos, atualizar itens (lógica simplificada - pode ser expandida)
    if (itens && Array.isArray(itens)) {
      // Deletar itens existentes e recriar (lógica simplificada)
      await executeQuery('DELETE FROM pedido_compras_itens WHERE pedido_id = ?', [id]);
      
      for (const item of itens) {
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

        if (itemSolicitacao.length > 0) {
          const itemSol = itemSolicitacao[0];
          await executeQuery(
            `INSERT INTO pedido_compras_itens (
              pedido_id, solicitacao_item_id, produto_generico_id,
              codigo_produto, nome_produto,
              unidade_medida_id, unidade_medida,
              quantidade_solicitada, quantidade_pedido,
              valor_unitario, observacao
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              item.solicitacao_item_id,
              itemSol.produto_id || null, // produto_id na solicitação é o produto_generico_id
              itemSol.codigo_produto || null,
              itemSol.nome_produto || null,
              itemSol.unidade_medida_id || null,
              itemSol.unidade_simbolo || itemSol.unidade_medida || null,
              itemSol.quantidade || 0,
              parseFloat(item.quantidade_pedido) || 0,
              parseFloat(item.valor_unitario) || 0,
              item.observacao || null
            ]
          );
        }
      }
    }

    // Buscar pedido atualizado
    const pedidoAtualizado = await this.buscarPedidoCompleto(id);

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(pedidoAtualizado);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, pedidoAtualizado.id);

    return successResponse(res, data, 'Pedido de compras atualizado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir pedido de compras
   */
  static excluirPedidoCompras = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se pedido existe
    const pedidos = await executeQuery(
      'SELECT * FROM pedidos_compras WHERE id = ?',
      [id]
    );

    if (pedidos.length === 0) {
      return notFoundResponse(res, 'Pedido de compras não encontrado');
    }

    const pedido = pedidos[0];

    // Validar se pode excluir (apenas em_digitacao ou cancelado)
    if (!['em_digitacao', 'cancelado'].includes(pedido.status)) {
      return errorResponse(
        res, 
        'Apenas pedidos em digitação ou cancelados podem ser excluídos', 
        STATUS_CODES.CONFLICT
      );
    }

    // Excluir pedido (itens serão deletados automaticamente via CASCADE)
    await executeQuery(
      'DELETE FROM pedidos_compras WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Pedido de compras excluído com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar pedido completo (helper)
   */
  static async buscarPedidoCompleto(pedidoId) {
    const pedidos = await executeQuery(
      `SELECT 
        p.*,
        s.numero_solicitacao,
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

    // Buscar itens
    const itens = await executeQuery(
      `SELECT 
        pci.*,
        pg.nome as produto_generico_nome,
        pg.codigo as produto_generico_codigo
      FROM pedido_compras_itens pci
      LEFT JOIN produto_generico pg ON pci.produto_generico_id = pg.id
      WHERE pci.pedido_id = ?
      ORDER BY pci.id`,
      [pedidoId]
    );

    pedido.itens = itens;
    return pedido;
  }

  /**
   * Obter permissões do usuário (helper)
   */
  static getUserPermissions(user) {
    return ['visualizar', 'criar', 'editar', 'excluir'];
  }
}

module.exports = PedidosComprasCRUDController;

