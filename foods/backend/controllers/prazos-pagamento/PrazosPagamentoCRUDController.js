/**
 * Controller CRUD de Prazos de Pagamento
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

class PrazosPagamentoCRUDController {
  
  /**
   * Criar novo prazo de pagamento
   */
  static criarPrazoPagamento = asyncHandler(async (req, res) => {
    const { nome, dias, parcelas = 1, intervalo_dias, descricao, ativo = 1 } = req.body;
    const usuario_id = req.user.id;

    // Validar campos obrigatórios
    if (!nome || nome.trim() === '') {
      return errorResponse(res, 'O nome do prazo de pagamento é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    if (dias === undefined || dias === null || dias === '') {
      return errorResponse(res, 'O número de dias é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    if (parcelas < 1) {
      return errorResponse(res, 'O número de parcelas deve ser pelo menos 1', STATUS_CODES.BAD_REQUEST);
    }

    // Lógica de intervalo
    let intervaloFinal = null;
    if (parcelas === 1) {
      intervaloFinal = null; // Não faz sentido ter intervalo para pagamento único
    } else if (parcelas > 1) {
      if (intervalo_dias && intervalo_dias > 0) {
        intervaloFinal = intervalo_dias;
      } else {
        // Se não informou intervalo, usar os dias como intervalo padrão (mensal)
        intervaloFinal = dias;
      }
    }

    // Verificar se prazo de pagamento já existe
    const existingPrazo = await executeQuery(
      'SELECT id FROM prazos_pagamento WHERE nome = ?',
      [nome.trim()]
    );

    if (existingPrazo.length > 0) {
      return conflictResponse(res, 'Prazo de pagamento já cadastrado');
    }

    // Inserir prazo de pagamento
    const result = await executeQuery(
      `INSERT INTO prazos_pagamento (nome, dias, parcelas, intervalo_dias, descricao, ativo, criado_por, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [nome.trim(), parseInt(dias), parseInt(parcelas), intervaloFinal, descricao || null, ativo, usuario_id]
    );

    const novoPrazoId = result.insertId;

    // Buscar prazo de pagamento criado
    const prazosPagamento = await executeQuery(
      `SELECT 
        pp.id,
        pp.nome,
        pp.dias,
        pp.parcelas,
        pp.intervalo_dias,
        pp.descricao,
        pp.ativo,
        pp.criado_em,
        pp.atualizado_em,
        pp.criado_por,
        u.nome as criado_por_nome
      FROM prazos_pagamento pp
      LEFT JOIN usuarios u ON pp.criado_por = u.id
      WHERE pp.id = ?`,
      [novoPrazoId]
    );

    const prazoCriado = prazosPagamento[0];

    // Calcular vencimentos se for parcelado
    if (prazoCriado.parcelas > 1 && prazoCriado.intervalo_dias) {
      const vencimentos = [];
      for (let i = 0; i < prazoCriado.parcelas; i++) {
        const diasVencimento = prazoCriado.dias + (i * prazoCriado.intervalo_dias);
        vencimentos.push(diasVencimento);
      }
      prazoCriado.vencimentos = vencimentos;
    }

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(prazoCriado);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, prazoCriado.id);

    return successResponse(res, data, 'Prazo de pagamento criado com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar prazo de pagamento
   */
  static atualizarPrazoPagamento = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nome, dias, parcelas, intervalo_dias, descricao, ativo } = req.body;

    // Verificar se prazo de pagamento existe
    const prazosPagamento = await executeQuery(
      'SELECT * FROM prazos_pagamento WHERE id = ?',
      [id]
    );

    if (prazosPagamento.length === 0) {
      return notFoundResponse(res, 'Prazo de pagamento não encontrado');
    }

    const prazoExistente = prazosPagamento[0];

    // Validar campos obrigatórios
    if (!nome || nome.trim() === '') {
      return errorResponse(res, 'O nome do prazo de pagamento é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    if (dias === undefined || dias === null || dias === '') {
      return errorResponse(res, 'O número de dias é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    const parcelasFinal = parcelas !== undefined ? parseInt(parcelas) : prazoExistente.parcelas;
    if (parcelasFinal < 1) {
      return errorResponse(res, 'O número de parcelas deve ser pelo menos 1', STATUS_CODES.BAD_REQUEST);
    }

    // Lógica de intervalo
    let intervaloFinal = null;
    if (parcelasFinal === 1) {
      intervaloFinal = null;
    } else if (parcelasFinal > 1) {
      if (intervalo_dias !== undefined && intervalo_dias !== null && intervalo_dias !== '') {
        intervaloFinal = parseInt(intervalo_dias);
      } else if (prazoExistente.intervalo_dias) {
        intervaloFinal = prazoExistente.intervalo_dias;
      } else {
        // Se não informou intervalo, usar os dias como intervalo padrão
        intervaloFinal = parseInt(dias);
      }
    }

    // Verificar se nome já existe em outro prazo de pagamento
    const existingPrazo = await executeQuery(
      'SELECT id FROM prazos_pagamento WHERE nome = ? AND id != ?',
      [nome.trim(), id]
    );

    if (existingPrazo.length > 0) {
      return conflictResponse(res, 'Já existe um prazo de pagamento com este nome');
    }

    // Atualizar prazo de pagamento
    await executeQuery(
      `UPDATE prazos_pagamento 
       SET nome = ?, dias = ?, parcelas = ?, intervalo_dias = ?, descricao = ?, ativo = ?, atualizado_em = NOW()
       WHERE id = ?`,
      [
        nome.trim(), 
        parseInt(dias), 
        parcelasFinal, 
        intervaloFinal, 
        descricao || null, 
        ativo !== undefined ? ativo : prazoExistente.ativo, 
        id
      ]
    );

    // Buscar prazo de pagamento atualizado
    const prazosPagamentoAtualizados = await executeQuery(
      `SELECT 
        pp.id,
        pp.nome,
        pp.dias,
        pp.parcelas,
        pp.intervalo_dias,
        pp.descricao,
        pp.ativo,
        pp.criado_em,
        pp.atualizado_em,
        pp.criado_por,
        u.nome as criado_por_nome
      FROM prazos_pagamento pp
      LEFT JOIN usuarios u ON pp.criado_por = u.id
      WHERE pp.id = ?`,
      [id]
    );

    const prazoAtualizado = prazosPagamentoAtualizados[0];

    // Calcular vencimentos se for parcelado
    if (prazoAtualizado.parcelas > 1 && prazoAtualizado.intervalo_dias) {
      const vencimentos = [];
      for (let i = 0; i < prazoAtualizado.parcelas; i++) {
        const diasVencimento = prazoAtualizado.dias + (i * prazoAtualizado.intervalo_dias);
        vencimentos.push(diasVencimento);
      }
      prazoAtualizado.vencimentos = vencimentos;
    }

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(prazoAtualizado);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, prazoAtualizado.id);

    return successResponse(res, data, 'Prazo de pagamento atualizado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir prazo de pagamento
   */
  static excluirPrazoPagamento = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se prazo de pagamento existe
    const prazosPagamento = await executeQuery(
      'SELECT * FROM prazos_pagamento WHERE id = ?',
      [id]
    );

    if (prazosPagamento.length === 0) {
      return notFoundResponse(res, 'Prazo de pagamento não encontrado');
    }

    const prazoPagamento = prazosPagamento[0];

    // Verificar se está em uso em pedidos de compras (vínculo por nome)
    const emUso = await executeQuery(
      `SELECT COUNT(*) as total 
       FROM pedido_compras 
       WHERE prazo_pagamento = ?`,
      [prazoPagamento.nome]
    );

    if (emUso[0].total > 0) {
      return errorResponse(
        res, 
        `Não é possível excluir este prazo de pagamento pois ele está sendo utilizado em ${emUso[0].total} pedido(s)`, 
        STATUS_CODES.CONFLICT
      );
    }

    // Excluir prazo de pagamento
    await executeQuery(
      'DELETE FROM prazos_pagamento WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Prazo de pagamento excluído com sucesso', STATUS_CODES.OK);
  });

  /**
   * Obter permissões do usuário (helper)
   */
  static getUserPermissions(user) {
    // Implementação básica - ajustar conforme necessário
    return ['visualizar', 'criar', 'editar', 'excluir'];
  }
}

module.exports = PrazosPagamentoCRUDController;

