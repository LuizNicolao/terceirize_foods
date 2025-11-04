/**
 * Controller de Listagem de Prazos de Pagamento
 * Responsável por listar e buscar prazos de pagamento
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class PrazosPagamentoListController {
  
  /**
   * Listar prazos de pagamento com paginação, busca e HATEOAS
   */
  static listarPrazosPagamento = asyncHandler(async (req, res) => {
    const { search = '', ativo } = req.query;
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
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
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (pp.nome LIKE ? OR pp.descricao LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (ativo !== undefined && ativo !== '') {
      baseQuery += ' AND pp.ativo = ?';
      params.push(ativo);
    }

    baseQuery += ' ORDER BY pp.dias ASC, pp.parcelas ASC';

    // Aplicar paginação
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const prazosPagamento = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM prazos_pagamento pp WHERE 1=1${search ? ' AND (pp.nome LIKE ? OR pp.descricao LIKE ?)' : ''}${ativo !== undefined && ativo !== '' ? ' AND pp.ativo = ?' : ''}`;
    const countParams = [...params];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Calcular estatísticas
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) as ativos,
        SUM(CASE WHEN ativo = 0 THEN 1 ELSE 0 END) as inativos
      FROM prazos_pagamento
      WHERE 1=1${search ? ' AND (nome LIKE ? OR descricao LIKE ?)' : ''}
    `;
    const statsResult = await executeQuery(statsQuery, countParams.slice(0, search ? 2 : 0));
    const statistics = statsResult[0] || { total: 0, ativos: 0, inativos: 0 };

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/prazos-pagamento', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(prazosPagamento, meta.pagination, queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, prazosPagamento, 'Prazos de pagamento listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      statistics,
      actions,
      _links: res.addListLinks(prazosPagamento, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar prazo de pagamento por ID
   */
  static buscarPrazoPagamentoPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

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
      [id]
    );

    if (prazosPagamento.length === 0) {
      return notFoundResponse(res, 'Prazo de pagamento não encontrado');
    }

    const prazoPagamento = prazosPagamento[0];

    // Calcular vencimentos se for parcelado
    if (prazoPagamento.parcelas > 1 && prazoPagamento.intervalo_dias) {
      const vencimentos = [];
      for (let i = 0; i < prazoPagamento.parcelas; i++) {
        const diasVencimento = prazoPagamento.dias + (i * prazoPagamento.intervalo_dias);
        vencimentos.push(diasVencimento);
      }
      prazoPagamento.vencimentos = vencimentos;
    }

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(prazoPagamento);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, prazoPagamento.id);

    return successResponse(res, prazoPagamento, 'Prazo de pagamento encontrado', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Buscar prazos de pagamento ativos (para uso em selects)
   */
  static buscarPrazosPagamentoAtivos = asyncHandler(async (req, res) => {
    const prazosPagamento = await executeQuery(
      `SELECT 
        id,
        nome,
        dias,
        parcelas,
        intervalo_dias
      FROM prazos_pagamento 
      WHERE ativo = 1 
      ORDER BY dias ASC, parcelas ASC`
    );

    return successResponse(res, prazosPagamento, 'Prazos de pagamento ativos listados com sucesso', STATUS_CODES.OK);
  });

  /**
   * Obter permissões do usuário (helper)
   */
  static getUserPermissions(user) {
    // Implementação básica - ajustar conforme necessário
    return ['visualizar', 'criar', 'editar', 'excluir'];
  }
}

module.exports = PrazosPagamentoListController;

