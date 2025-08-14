/**
 * Controller de Listagem de Marcas
 * Responsável por listar e buscar marcas
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class MarcasListController {
  
  /**
   * Listar marcas com paginação, busca e HATEOAS
   */
  static listarMarcas = asyncHandler(async (req, res) => {
    const { search = '', status } = req.query;
    const pagination = req.pagination;

    // Query base com contagem de produtos
    let baseQuery = `
      SELECT 
        m.id, 
        m.marca, 
        m.fabricante,
        m.status, 
        m.criado_em,
        m.atualizado_em,
        COUNT(p.id) as total_produtos
      FROM marcas m
      LEFT JOIN produtos p ON m.id = p.marca_id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (m.marca LIKE ? OR m.fabricante LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status !== undefined) {
      baseQuery += ' AND m.status = ?';
      params.push(status);
    }

    baseQuery += ' GROUP BY m.id, m.marca, m.fabricante, m.status, m.criado_em, m.atualizado_em ORDER BY m.marca ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const marcas = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(DISTINCT m.id) as total FROM marcas m WHERE 1=1${search ? ' AND (m.marca LIKE ? OR m.fabricante LIKE ?)' : ''}${status !== undefined ? ' AND m.status = ?' : ''}`;
    const countParams = [...params];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/marcas', queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, marcas, 'Marcas listadas com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions,
      _links: res.addListLinks(marcas, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar marca por ID
   */
  static buscarMarcaPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const marcas = await executeQuery(
      `      SELECT 
        m.id, 
        m.marca, 
        m.fabricante,
        m.status, 
        m.criado_em,
        m.atualizado_em,
        COUNT(p.id) as total_produtos
      FROM marcas m
      LEFT JOIN produtos p ON m.id = p.marca_id
       WHERE m.id = ?
       GROUP BY m.id, m.marca, m.fabricante, m.status, m.criado_em, m.atualizado_em`,
      [id]
    );

    if (marcas.length === 0) {
      return notFoundResponse(res, 'Marca não encontrada');
    }

    const marca = marcas[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(marca);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, marca.id);

    return successResponse(res, data, 'Marca encontrada com sucesso', STATUS_CODES.OK, {
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

module.exports = MarcasListController;
