/**
 * Controller de Listagem de Grupos
 * Responsável por listar e buscar grupos
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class GruposListController {
  
  /**
   * Listar grupos com paginação, busca e HATEOAS
   */
  static listarGrupos = asyncHandler(async (req, res) => {
    const { search = '', status } = req.query;
    const pagination = req.pagination;

    // Query base com contagem de subgrupos
    let baseQuery = `
      SELECT 
        g.id, 
        g.nome, 
        g.codigo,
        g.descricao,
        g.status, 
        g.data_cadastro as criado_em,
        g.data_atualizacao as atualizado_em,
        COUNT(sg.id) as subgrupos_count
      FROM grupos g
      LEFT JOIN subgrupos sg ON g.id = sg.grupo_id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (g.nome LIKE ? OR g.codigo LIKE ? OR g.descricao LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== undefined) {
      baseQuery += ' AND g.status = ?';
      params.push(status === 1 ? 'ativo' : 'inativo');
    }

    baseQuery += ' GROUP BY g.id, g.nome, g.codigo, g.descricao, g.status, g.data_cadastro, g.data_atualizacao ORDER BY g.nome ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const grupos = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(DISTINCT g.id) as total FROM grupos g WHERE 1=1${search ? ' AND (g.nome LIKE ? OR g.codigo LIKE ? OR g.descricao LIKE ?)' : ''}${status !== undefined ? ' AND g.status = ?' : ''}`;
    const countParams = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];
    if (status !== undefined) {
      countParams.push(status === 1 ? 'ativo' : 'inativo');
    }
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/grupos', queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, grupos, 'Grupos listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions,
      _links: res.addListLinks(grupos, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar grupo por ID
   */
  static buscarGrupoPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const grupos = await executeQuery(
      `SELECT 
        g.id, 
        g.nome, 
        g.codigo,
        g.descricao,
        g.status, 
        g.data_cadastro as criado_em,
        g.data_atualizacao as atualizado_em,
        COUNT(sg.id) as subgrupos_count
       FROM grupos g
       LEFT JOIN subgrupos sg ON g.id = sg.grupo_id
       WHERE g.id = ?
       GROUP BY g.id, g.nome, g.codigo, g.descricao, g.status, g.data_cadastro, g.data_atualizacao`,
      [id]
    );

    if (grupos.length === 0) {
      return notFoundResponse(res, 'Grupo não encontrado');
    }

    const grupo = grupos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(grupo);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, grupo.id);

    return successResponse(res, data, 'Grupo encontrado com sucesso', STATUS_CODES.OK, {
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

module.exports = GruposListController;
