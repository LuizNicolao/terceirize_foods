/**
 * Controller de Listagem de Subgrupos
 * Responsável por listar e buscar subgrupos
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class SubgruposListController {
  
  /**
   * Listar subgrupos com paginação, busca e HATEOAS
   */
  static listarSubgrupos = asyncHandler(async (req, res) => {
    const { search = '', grupo_id, status, sortField, sortDirection } = req.query;
    const pagination = req.pagination;

    // Query base com informações do grupo
    let baseQuery = `
      SELECT 
        sg.id, 
        sg.nome, 
        sg.codigo,
        sg.descricao,
        sg.grupo_id,
        sg.status, 
        sg.data_cadastro as criado_em,
        sg.data_atualizacao as atualizado_em,
        g.nome as grupo_nome,
        (
          SELECT COUNT(*) 
          FROM produto_origem po 
          WHERE po.subgrupo_id = sg.id
        ) as total_produtos_origem,
        (
          SELECT COUNT(*) 
          FROM produto_generico pg 
          WHERE pg.subgrupo_id = sg.id
        ) as total_produtos_genericos,
        (
          SELECT COUNT(*) 
          FROM produtos p 
          WHERE p.subgrupo_id = sg.id
        ) as total_produtos_finais
      FROM subgrupos sg
      LEFT JOIN grupos g ON sg.grupo_id = g.id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND sg.nome LIKE ?';
      params.push(`%${search}%`);
    }

    if (grupo_id) {
      baseQuery += ' AND sg.grupo_id = ?';
      params.push(grupo_id);
    }

    if (status !== undefined) {
      baseQuery += ' AND sg.status = ?';
      params.push(status === 1 || status === '1' ? 'ativo' : 'inativo');
    }

    // Aplicar ordenação
    let orderBy = 'sg.nome ASC';
    if (sortField && sortDirection) {
      const validFields = ['codigo', 'nome', 'status', 'grupo_id'];
      if (validFields.includes(sortField)) {
        const direction = sortDirection.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        
        // Mapear campos para colunas do banco
        const fieldMap = {
          'codigo': 'sg.codigo',
          'nome': 'sg.nome',
          'status': 'sg.status',
          'grupo_id': 'sg.grupo_id'
        };
        
        orderBy = `${fieldMap[sortField]} ${direction}`;
      }
    }
    baseQuery += ` ORDER BY ${orderBy}`;

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const subgrupos = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM subgrupos sg 
      WHERE 1=1
      ${search ? ' AND sg.nome LIKE ?' : ''}
      ${grupo_id ? ' AND sg.grupo_id = ?' : ''}
      ${status !== undefined ? ' AND sg.status = ?' : ''}
    `;
    const countParams = [];
    if (search) {
      countParams.push(`%${search}%`);
    }
    if (grupo_id) {
      countParams.push(grupo_id);
    }
    if (status !== undefined) {
      countParams.push(status === 1 || status === '1' ? 'ativo' : 'inativo');
    }
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Calcular estatísticas
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN sg.status = 'ativo' THEN 1 ELSE 0 END) as ativos,
        SUM(CASE WHEN sg.status = 'inativo' THEN 1 ELSE 0 END) as inativos
      FROM subgrupos sg 
      WHERE 1=1
      ${search ? ' AND sg.nome LIKE ?' : ''}
      ${grupo_id ? ' AND sg.grupo_id = ?' : ''}
      ${status !== undefined ? ' AND sg.status = ?' : ''}
    `;
    const statsParams = [];
    if (search) {
      statsParams.push(`%${search}%`);
    }
    if (grupo_id) {
      statsParams.push(grupo_id);
    }
    if (status !== undefined) {
      statsParams.push(status === 1 || status === '1' ? 'ativo' : 'inativo');
    }
    const statsResult = await executeQuery(statsQuery, statsParams);
    const statistics = statsResult[0];

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/subgrupos', queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, subgrupos, 'Subgrupos listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      statistics,
      actions,
      _links: res.addListLinks(subgrupos, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar subgrupo por ID
   */
  static buscarSubgrupoPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const subgrupos = await executeQuery(
      `SELECT 
        sg.id, 
        sg.nome, 
        sg.codigo,
        sg.descricao,
        sg.grupo_id,
        sg.status, 
        sg.data_cadastro as criado_em,
        sg.data_atualizacao as atualizado_em,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
       FROM subgrupos sg
       LEFT JOIN grupos g ON sg.grupo_id = g.id
       LEFT JOIN produtos p ON sg.id = p.subgrupo_id
       WHERE sg.id = ?
       GROUP BY sg.id, sg.nome, sg.codigo, sg.descricao, sg.grupo_id, sg.status, sg.data_cadastro, sg.data_atualizacao, g.nome`,
      [id]
    );

    if (subgrupos.length === 0) {
      return notFoundResponse(res, 'Subgrupo não encontrado');
    }

    const subgrupo = subgrupos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(subgrupo);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, subgrupo.id);

    return successResponse(res, data, 'Subgrupo encontrado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Obter permissões do usuário (método auxiliar)
   */
  static getUserPermissions(user) {
    // Implementar lógica de permissões baseada no usuário
    // Por enquanto, retorna permissões básicas
    return ['visualizar', 'criar', 'editar', 'excluir'];
  }
}

module.exports = SubgruposListController;
