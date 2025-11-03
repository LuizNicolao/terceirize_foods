/**
 * Controller de Listagem de NQA
 * Responsável por listar e buscar NQAs
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class NQAListController {
  
  /**
   * Listar NQAs com paginação, busca e HATEOAS
   */
  static listarNQAs = asyncHandler(async (req, res) => {
    const { search = '', status } = req.query;
    const pagination = req.pagination;

    // Query base com contagem de faixas e grupos
    let baseQuery = `
      SELECT 
        n.id, 
        n.nome, 
        n.codigo,
        n.descricao,
        n.nivel_inspecao,
        n.ativo,
        n.criado_em,
        n.atualizado_em,
        COUNT(DISTINCT ta.id) as faixas_count,
        COUNT(DISTINCT gn.id) as grupos_count
      FROM nqa n
      LEFT JOIN tabela_amostragem ta ON n.id = ta.nqa_id AND ta.ativo = 1
      LEFT JOIN grupos_nqa gn ON n.id = gn.nqa_id AND gn.ativo = 1
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (n.nome LIKE ? OR n.codigo LIKE ? OR n.descricao LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== undefined) {
      baseQuery += ' AND n.ativo = ?';
      params.push(status === 1 || status === '1' ? 1 : 0);
    }

    baseQuery += ' GROUP BY n.id, n.nome, n.codigo, n.descricao, n.nivel_inspecao, n.ativo, n.criado_em, n.atualizado_em ORDER BY n.codigo ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const nqas = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(DISTINCT n.id) as total FROM nqa n WHERE 1=1${search ? ' AND (n.nome LIKE ? OR n.codigo LIKE ? OR n.descricao LIKE ?)' : ''}${status !== undefined ? ' AND n.ativo = ?' : ''}`;
    const countParams = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];
    if (status !== undefined) {
      countParams.push(status === 1 || status === '1' ? 1 : 0);
    }
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Calcular estatísticas
    const statsQuery = `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN n.ativo = 1 THEN 1 ELSE 0 END) as ativos,
      SUM(CASE WHEN n.ativo = 0 THEN 1 ELSE 0 END) as inativos
      FROM nqa n WHERE 1=1${search ? ' AND (n.nome LIKE ? OR n.codigo LIKE ? OR n.descricao LIKE ?)' : ''}${status !== undefined ? ' AND n.ativo = ?' : ''}`;
    const statsParams = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];
    if (status !== undefined) {
      statsParams.push(status === 1 || status === '1' ? 1 : 0);
    }
    const statsResult = await executeQuery(statsQuery, statsParams);
    const statistics = statsResult[0];

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/plano-amostragem/nqa', queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, nqas, 'NQAs listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      statistics,
      actions,
      _links: res.addListLinks(nqas, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar NQA por ID
   */
  static buscarNQAPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const nqas = await executeQuery(
      `SELECT 
        n.id, 
        n.nome, 
        n.codigo,
        n.descricao,
        n.nivel_inspecao,
        n.ativo,
        n.criado_em,
        n.atualizado_em,
        COUNT(DISTINCT ta.id) as faixas_count,
        COUNT(DISTINCT gn.id) as grupos_count
       FROM nqa n
       LEFT JOIN tabela_amostragem ta ON n.id = ta.nqa_id AND ta.ativo = 1
       LEFT JOIN grupos_nqa gn ON n.id = gn.nqa_id AND gn.ativo = 1
       WHERE n.id = ?
       GROUP BY n.id, n.nome, n.codigo, n.descricao, n.nivel_inspecao, n.ativo, n.criado_em, n.atualizado_em`,
      [id]
    );

    if (nqas.length === 0) {
      return notFoundResponse(res, 'NQA não encontrado');
    }

    const nqa = nqas[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(nqa);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, nqa.id);

    return successResponse(res, data, 'NQA encontrado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Buscar NQAs ativos (para dropdowns)
   */
  static buscarNQAsAtivos = asyncHandler(async (req, res) => {
    const query = `
      SELECT 
        n.id, 
        n.nome, 
        n.codigo,
        n.nivel_inspecao
      FROM nqa n
      WHERE n.ativo = 1
      ORDER BY n.codigo ASC
    `;
    
    const nqas = await executeQuery(query, []);
    
    return successResponse(res, nqas, 'NQAs ativos listados com sucesso', STATUS_CODES.OK);
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

module.exports = NQAListController;

