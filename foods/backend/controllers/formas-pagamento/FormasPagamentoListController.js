/**
 * Controller de Listagem de Formas de Pagamento
 * Responsável por listar e buscar formas de pagamento
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class FormasPagamentoListController {
  
  /**
   * Listar formas de pagamento com paginação, busca e HATEOAS
   */
  static listarFormasPagamento = asyncHandler(async (req, res) => {
    const { search = '', ativo } = req.query;
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
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
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (fp.nome LIKE ? OR fp.descricao LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (ativo !== undefined && ativo !== '') {
      baseQuery += ' AND fp.ativo = ?';
      params.push(ativo);
    }

    baseQuery += ' ORDER BY fp.nome ASC';

    // Aplicar paginação
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const formasPagamento = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM formas_pagamento fp WHERE 1=1${search ? ' AND (fp.nome LIKE ? OR fp.descricao LIKE ?)' : ''}${ativo !== undefined && ativo !== '' ? ' AND fp.ativo = ?' : ''}`;
    const countParams = [...params];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/formas-pagamento', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(formasPagamento, meta.pagination, queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, formasPagamento, 'Formas de pagamento listadas com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions,
      _links: res.addListLinks(formasPagamento, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar forma de pagamento por ID
   */
  static buscarFormaPagamentoPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

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
      [id]
    );

    if (formasPagamento.length === 0) {
      return notFoundResponse(res, 'Forma de pagamento não encontrada');
    }

    const formaPagamento = formasPagamento[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(formaPagamento);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, formaPagamento.id);

    return successResponse(res, formaPagamento, 'Forma de pagamento encontrada', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Buscar formas de pagamento ativas (para uso em selects)
   */
  static buscarFormasPagamentoAtivas = asyncHandler(async (req, res) => {
    const formasPagamento = await executeQuery(
      `SELECT 
        id,
        nome,
        prazo_padrao
      FROM formas_pagamento 
      WHERE ativo = 1 
      ORDER BY nome ASC`
    );

    return successResponse(res, formasPagamento, 'Formas de pagamento ativas listadas com sucesso', STATUS_CODES.OK);
  });

  /**
   * Obter permissões do usuário (helper)
   */
  static getUserPermissions(user) {
    // Implementação básica - ajustar conforme necessário
    return ['visualizar', 'criar', 'editar', 'excluir'];
  }
}

module.exports = FormasPagamentoListController;

