/**
 * Controller CRUD de Pedidos de Compras
 * Responsável por operações de Create, Update e Delete
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const PedidosComprasHelpers = require('./PedidosComprasHelpers');
const PedidosComprasItemsController = require('./PedidosComprasItemsController');

class PedidosComprasCRUDController {

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

    // Buscar dados das filiais
    const filiaisData = await PedidosComprasHelpers.buscarDadosFiliais({
      filial_faturamento_id,
      filial_cobranca_id,
      filial_entrega_id
    });

    // Buscar nomes de forma_pagamento e prazo_pagamento
    const { formaPagamentoNome, prazoPagamentoNome } = await PedidosComprasHelpers.buscarFormasPrazos(
      forma_pagamento_id,
      prazo_pagamento_id,
      forma_pagamento,
      prazo_pagamento
    );

    // Gerar número do pedido
    const numero_pedido = await PedidosComprasHelpers.gerarNumeroPedido();

    // Preparar valores para inserção
    const enderecoCobranca = filiaisData.cobranca?.endereco || null;
    const cnpjCobranca = filiaisData.cobranca?.cnpj || null;

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
        enderecoCobranca,
        filiaisData.entrega?.endereco || null,
        filiaisData.faturamento?.cnpj || null,
        cnpjCobranca,
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
    const itensResult = await PedidosComprasItemsController.inserirItensPedido(pedidoId, itens);
    
    if (!itensResult.success) {
      await executeQuery('DELETE FROM pedidos_compras WHERE id = ?', [pedidoId]);
      return errorResponse(res, itensResult.error, STATUS_CODES.BAD_REQUEST);
    }

    // Calcular valor_total do pedido (soma de quantidade_pedido * valor_unitario de todos os itens)
    const valorTotalResult = await executeQuery(
      `SELECT COALESCE(SUM(quantidade_pedido * valor_unitario), 0) as valor_total
       FROM pedido_compras_itens
       WHERE pedido_id = ?`,
      [pedidoId]
    );

    const valorTotal = parseFloat(valorTotalResult[0]?.valor_total || 0);

    // Atualizar valor_total no pedido
    await executeQuery(
      'UPDATE pedidos_compras SET valor_total = ? WHERE id = ?',
      [valorTotal, pedidoId]
    );

    // Atualizar status da solicitação baseado nos pedidos vinculados
    // Atualiza imediatamente ao criar o pedido, mesmo em digitação,
    // pois o pedido já está vinculado e usando saldo da solicitação
    if (solicitacao_compras_id) {
      await PedidosComprasHelpers.atualizarStatusSolicitacao(solicitacao_compras_id);
    }

    // Buscar pedido criado com todos os dados
    const pedidoCriado = await PedidosComprasHelpers.buscarPedidoCompleto(pedidoId);

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(pedidoCriado);

    // Gerar links de ações
    const userPermissions = req.user ? PedidosComprasHelpers.getUserPermissions(req.user) : [];
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
    const statusPermitemEdicao = ['em_digitacao', 'cancelado'];
    if (!statusPermitemEdicao.includes(pedidoExistente.status)) {
      return errorResponse(
        res, 
        `Não é possível editar um pedido com status "${pedidoExistente.status}". Apenas pedidos em digitação ou cancelados podem ser editados.`, 
        STATUS_CODES.CONFLICT
      );
    }

    // Validar transição de status: não permite voltar para em_digitacao se já foi processado
    if (status && status !== pedidoExistente.status) {
      // Se está tentando mudar para em_digitacao e não está em em_digitacao ou cancelado
      if (status === 'em_digitacao' && !statusPermitemEdicao.includes(pedidoExistente.status)) {
        return errorResponse(res, 'Não é possível reabrir um pedido que já foi processado', STATUS_CODES.CONFLICT);
      }
      
      // Não permite mudar status de pedidos que já foram usados em RIR/NF
      if (['parcial', 'finalizado'].includes(pedidoExistente.status)) {
        return errorResponse(
          res, 
          'Não é possível alterar o status de um pedido que já foi usado em Relatórios de Inspeção ou Notas Fiscais', 
          STATUS_CODES.CONFLICT
        );
      }
    }

    // Validar campos obrigatórios
    if (fornecedor_nome && fornecedor_nome.trim() === '') {
      return errorResponse(res, 'O nome do fornecedor é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    // Buscar dados das filiais se necessário
    const filiaisData = await PedidosComprasHelpers.buscarDadosFiliais({
      filial_faturamento_id,
      filial_cobranca_id,
      filial_entrega_id
    });

    // Buscar nomes de forma_pagamento e prazo_pagamento
    const { formaPagamentoNome, prazoPagamentoNome } = await PedidosComprasHelpers.buscarFormasPrazos(
      forma_pagamento_id,
      prazo_pagamento_id,
      forma_pagamento,
      prazo_pagamento
    );

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

    // Se itens foram fornecidos, atualizar itens
    if (itens && Array.isArray(itens)) {
      const itensResult = await PedidosComprasItemsController.atualizarItensPedido(id, itens);
      
      if (!itensResult.success) {
        return errorResponse(res, itensResult.error, STATUS_CODES.BAD_REQUEST);
      }

      // Recalcular valor_total do pedido após atualizar itens
      const valorTotalResult = await executeQuery(
        `SELECT COALESCE(SUM(quantidade_pedido * valor_unitario), 0) as valor_total
         FROM pedido_compras_itens
         WHERE pedido_id = ?`,
        [id]
      );

      const valorTotal = parseFloat(valorTotalResult[0]?.valor_total || 0);

      // Atualizar valor_total no pedido
      await executeQuery(
        'UPDATE pedidos_compras SET valor_total = ? WHERE id = ?',
        [valorTotal, id]
      );

      // Atualizar status da solicitação após atualizar itens do pedido
      // Pois as quantidades podem ter mudado, afetando o saldo utilizado
      if (pedidoExistente.solicitacao_compras_id) {
        await PedidosComprasHelpers.atualizarStatusSolicitacao(pedidoExistente.solicitacao_compras_id);
      }
    }

    // Buscar pedido atualizado
    const pedidoAtualizado = await PedidosComprasHelpers.buscarPedidoCompleto(id);

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(pedidoAtualizado);

    // Gerar links de ações
    const userPermissions = req.user ? PedidosComprasHelpers.getUserPermissions(req.user) : [];
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

    // Salvar solicitacao_compras_id antes de excluir para atualizar status depois
    const solicitacaoId = pedido.solicitacao_compras_id;

    // Excluir itens do pedido primeiro (garantir exclusão mesmo se CASCADE não estiver configurado)
    await executeQuery(
      'DELETE FROM pedido_compras_itens WHERE pedido_id = ?',
      [id]
    );

    // Excluir pedido
    await executeQuery(
      'DELETE FROM pedidos_compras WHERE id = ?',
      [id]
    );

    // Atualizar status da solicitação se houver
    if (solicitacaoId) {
      await PedidosComprasHelpers.atualizarStatusSolicitacao(solicitacaoId);
    }

    return successResponse(res, null, 'Pedido de compras excluído com sucesso', STATUS_CODES.OK);
  });

  /**
   * Desvincular produtos do pedido (parcial ou total)
   * Endpoint: DELETE /api/pedidos-compras/:id/itens
   * Body: { item_ids: [1, 2, 3] } ou {} para remover todos
   */
  static desvincularProdutosPedido = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { item_ids = [] } = req.body;

    const result = await PedidosComprasItemsController.desvincularProdutosPedido(id, item_ids);

    if (!result.success) {
      return errorResponse(res, result.error, STATUS_CODES.BAD_REQUEST);
    }

    return successResponse(res, null, result.message, STATUS_CODES.OK);
  });
}

module.exports = PedidosComprasCRUDController;

