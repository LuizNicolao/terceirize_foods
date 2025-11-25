/**
 * Controller de Listagem de Centro de Custo
 * Responsável por listar e buscar centros de custo
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class CentroCustoListController {
  
  /**
   * Listar centros de custo com paginação, busca e HATEOAS
   */
  static listarCentrosCusto = asyncHandler(async (req, res) => {
    const { search = '', status, filial_id } = req.query;
    const pagination = req.pagination;

    // Query base com dados da filial
    let baseQuery = `
      SELECT 
        cc.id, 
        cc.codigo,
        cc.nome, 
        cc.descricao,
        cc.filial_id,
        f.filial as filial_nome,
        f.codigo_filial,
        cc.status, 
        cc.criado_em,
        cc.atualizado_em,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
      FROM centro_custo cc
      LEFT JOIN filiais f ON cc.filial_id = f.id
      LEFT JOIN usuarios uc ON cc.usuario_cadastro_id = uc.id
      LEFT JOIN usuarios ua ON cc.usuario_atualizacao_id = ua.id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (cc.nome LIKE ? OR cc.codigo LIKE ? OR cc.descricao LIKE ? OR f.filial LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== undefined && status !== '') {
      baseQuery += ' AND cc.status = ?';
      params.push(status === 1 || status === '1' ? 1 : 0);
    }

    if (filial_id) {
      baseQuery += ' AND cc.filial_id = ?';
      params.push(filial_id);
    }

    baseQuery += ' ORDER BY cc.nome ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const centrosCusto = await executeQuery(query, params);

    // Contar total de registros
    let countQuery = `SELECT COUNT(*) as total FROM centro_custo cc LEFT JOIN filiais f ON cc.filial_id = f.id WHERE 1=1`;
    let countParams = [];
    
    if (search) {
      countQuery += ' AND (cc.nome LIKE ? OR cc.codigo LIKE ? OR cc.descricao LIKE ? OR f.filial LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (status !== undefined && status !== '') {
      countQuery += ' AND cc.status = ?';
      countParams.push(status === 1 || status === '1' ? 1 : 0);
    }
    
    if (filial_id) {
      countQuery += ' AND cc.filial_id = ?';
      countParams.push(filial_id);
    }
    
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Calcular estatísticas
    let statsQuery = `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN cc.status = 1 THEN 1 ELSE 0 END) as ativos,
      SUM(CASE WHEN cc.status = 0 THEN 1 ELSE 0 END) as inativos
      FROM centro_custo cc WHERE 1=1`;
    let statsParams = [];
    
    if (search) {
      statsQuery += ' AND (cc.nome LIKE ? OR cc.codigo LIKE ? OR cc.descricao LIKE ?)';
      statsParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (status !== undefined && status !== '') {
      statsQuery += ' AND cc.status = ?';
      statsParams.push(status === 1 || status === '1' ? 1 : 0);
    }
    
    if (filial_id) {
      statsQuery += ' AND cc.filial_id = ?';
      statsParams.push(filial_id);
    }
    
    const statsResult = await executeQuery(statsQuery, statsParams);
    const statistics = statsResult[0];

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/centro-custo', queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, centrosCusto, 'Centros de custo listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      statistics,
      actions,
      _links: res.addListLinks(centrosCusto, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar centro de custo por ID
   */
  static buscarCentroCustoPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const centrosCusto = await executeQuery(
      `SELECT 
        cc.id, 
        cc.codigo,
        cc.nome, 
        cc.descricao,
        cc.filial_id,
        f.filial as filial_nome,
        f.codigo_filial,
        cc.status, 
        cc.criado_em,
        cc.atualizado_em,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
       FROM centro_custo cc
       LEFT JOIN filiais f ON cc.filial_id = f.id
       LEFT JOIN usuarios uc ON cc.usuario_cadastro_id = uc.id
       LEFT JOIN usuarios ua ON cc.usuario_atualizacao_id = ua.id
       WHERE cc.id = ?`,
      [id]
    );

    if (centrosCusto.length === 0) {
      return notFoundResponse(res, 'Centro de custo não encontrado');
    }

    const centroCusto = centrosCusto[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(centroCusto);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, centroCusto.id);

    return successResponse(res, data, 'Centro de custo encontrado com sucesso', STATUS_CODES.OK, {
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

module.exports = CentroCustoListController;

