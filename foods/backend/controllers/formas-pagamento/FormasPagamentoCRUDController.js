/**
 * Controller CRUD de Formas de Pagamento
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

class FormasPagamentoCRUDController {
  
  /**
   * Criar nova forma de pagamento
   */
  static criarFormaPagamento = asyncHandler(async (req, res) => {
    const { nome, descricao, prazo_padrao, ativo = 1 } = req.body;
    const usuario_id = req.user.id;

    // Validar campos obrigatórios
    if (!nome || nome.trim() === '') {
      return errorResponse(res, 'O nome da forma de pagamento é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se forma de pagamento já existe
    const existingForma = await executeQuery(
      'SELECT id FROM formas_pagamento WHERE nome = ?',
      [nome.trim()]
    );

    if (existingForma.length > 0) {
      return conflictResponse(res, 'Forma de pagamento já cadastrada');
    }

    // Inserir forma de pagamento
    const result = await executeQuery(
      `INSERT INTO formas_pagamento (nome, descricao, prazo_padrao, ativo, criado_por, criado_em)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [nome.trim(), descricao || null, prazo_padrao || null, ativo, usuario_id]
    );

    const novaFormaId = result.insertId;

    // Buscar forma de pagamento criada
    const formasPagamento = await executeQuery(
      `SELECT 
        fp.id,
        fp.nome,
        fp.descricao,
        fp.prazo_padrao,
        fp.ativo,
        fp.criado_em,
        fp.atualizado_em,
        fp.criado_por,
        u.nome as criado_por_nome
      FROM formas_pagamento fp
      LEFT JOIN usuarios u ON fp.criado_por = u.id
      WHERE fp.id = ?`,
      [novaFormaId]
    );

    const formaCriada = formasPagamento[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(formaCriada);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, formaCriada.id);

    return successResponse(res, data, 'Forma de pagamento criada com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar forma de pagamento
   */
  static atualizarFormaPagamento = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nome, descricao, prazo_padrao, ativo } = req.body;

    // Verificar se forma de pagamento existe
    const formasPagamento = await executeQuery(
      'SELECT * FROM formas_pagamento WHERE id = ?',
      [id]
    );

    if (formasPagamento.length === 0) {
      return notFoundResponse(res, 'Forma de pagamento não encontrada');
    }

    const formaExistente = formasPagamento[0];

    // Validar campos obrigatórios
    if (!nome || nome.trim() === '') {
      return errorResponse(res, 'O nome da forma de pagamento é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se nome já existe em outra forma de pagamento
    const existingForma = await executeQuery(
      'SELECT id FROM formas_pagamento WHERE nome = ? AND id != ?',
      [nome.trim(), id]
    );

    if (existingForma.length > 0) {
      return conflictResponse(res, 'Já existe uma forma de pagamento com este nome');
    }

    // Atualizar forma de pagamento
    await executeQuery(
      `UPDATE formas_pagamento 
       SET nome = ?, descricao = ?, prazo_padrao = ?, ativo = ?, atualizado_em = NOW()
       WHERE id = ?`,
      [nome.trim(), descricao || null, prazo_padrao || null, ativo !== undefined ? ativo : formaExistente.ativo, id]
    );

    // Buscar forma de pagamento atualizada
    const formasPagamentoAtualizadas = await executeQuery(
      `SELECT 
        fp.id,
        fp.nome,
        fp.descricao,
        fp.prazo_padrao,
        fp.ativo,
        fp.criado_em,
        fp.atualizado_em,
        fp.criado_por,
        u.nome as criado_por_nome
      FROM formas_pagamento fp
      LEFT JOIN usuarios u ON fp.criado_por = u.id
      WHERE fp.id = ?`,
      [id]
    );

    const formaAtualizada = formasPagamentoAtualizadas[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(formaAtualizada);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, formaAtualizada.id);

    return successResponse(res, data, 'Forma de pagamento atualizada com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir forma de pagamento
   */
  static excluirFormaPagamento = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se forma de pagamento existe
    const formasPagamento = await executeQuery(
      'SELECT * FROM formas_pagamento WHERE id = ?',
      [id]
    );

    if (formasPagamento.length === 0) {
      return notFoundResponse(res, 'Forma de pagamento não encontrada');
    }

    const formaPagamento = formasPagamento[0];

    // Verificar se está em uso em pedidos de compras
    const emUso = await executeQuery(
      `SELECT COUNT(*) as total 
       FROM pedido_compras 
       WHERE forma_pagamento = ?`,
      [formaPagamento.nome]
    );

    if (emUso[0].total > 0) {
      return errorResponse(
        res, 
        `Não é possível excluir esta forma de pagamento pois ela está sendo utilizada em ${emUso[0].total} pedido(s)`, 
        STATUS_CODES.CONFLICT
      );
    }

    // Excluir forma de pagamento
    await executeQuery(
      'DELETE FROM formas_pagamento WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Forma de pagamento excluída com sucesso', STATUS_CODES.OK);
  });

  /**
   * Obter permissões do usuário (helper)
   */
  static getUserPermissions(user) {
    // Implementação básica - ajustar conforme necessário
    return ['visualizar', 'criar', 'editar', 'excluir'];
  }
}

module.exports = FormasPagamentoCRUDController;

