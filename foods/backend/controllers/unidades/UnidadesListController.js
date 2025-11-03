/**
 * Controller de Listagem de Unidades de Medida
 * Responsável por listar e buscar unidades
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class UnidadesListController {
  
  /**
   * Listar unidades com paginação, busca e HATEOAS
   */
  static listarUnidades = asyncHandler(async (req, res) => {
    const { search = '', status, sortField, sortDirection } = req.query;
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        id, nome, sigla, status, 
        criado_em, atualizado_em 
      FROM unidades_medida 
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtro de busca
    if (search) {
      baseQuery += ' AND (nome LIKE ? OR sigla LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Aplicar filtro por status
    if (status !== undefined && status !== '') {
      baseQuery += ' AND status = ?';
      params.push(status);
    }

    // Aplicar ordenação
    let orderBy = 'nome ASC';
    if (sortField && sortDirection) {
      const validFields = ['nome', 'sigla', 'status'];
      if (validFields.includes(sortField)) {
        const direction = sortDirection.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        orderBy = `${sortField} ${direction}`;
      }
    }
    baseQuery += ` ORDER BY ${orderBy}`;

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const unidades = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM unidades_medida WHERE 1=1${search ? ' AND (nome LIKE ? OR sigla LIKE ?)' : ''}${status !== undefined && status !== '' ? ' AND status = ?' : ''}`;
    const countParams = [];
    if (search) countParams.push(`%${search}%`, `%${search}%`);
    if (status !== undefined && status !== '') countParams.push(status);
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/unidades', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(unidades, meta.pagination, queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, unidades, 'Unidades listadas com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions,
      _links: res.addListLinks(unidades, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar unidade por ID
   */
  static buscarUnidadePorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const unidades = await executeQuery(
      'SELECT id, nome, sigla, status, criado_em, atualizado_em FROM unidades_medida WHERE id = ?',
      [id]
    );

    if (unidades.length === 0) {
      return notFoundResponse(res, 'Unidade não encontrada');
    }

    // Buscar produtos que usam esta unidade
    const produtosQuery = `
      SELECT id, nome, codigo_barras, status
      FROM produtos 
      WHERE unidade_id = ?
      ORDER BY nome ASC
    `;
    const produtos = await executeQuery(produtosQuery, [id]);

    const unidade = unidades[0];
    unidade.produtos = produtos;
    unidade.total_produtos = produtos.length;

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(unidade);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, unidade.id);

    return successResponse(res, data, 'Unidade encontrada com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Obter permissões do usuário (método auxiliar)
   */
  static getUserPermissions(user) {
    const accessLevels = {
      'I': ['visualizar'],
      'II': ['visualizar', 'criar', 'editar'],
      'III': ['visualizar', 'criar', 'editar', 'excluir']
    };

    if (user.tipo_de_acesso === 'administrador') {
      return ['visualizar', 'criar', 'editar', 'excluir'];
    }

    return accessLevels[user.nivel_de_acesso] || [];
  }
}

module.exports = UnidadesListController;
