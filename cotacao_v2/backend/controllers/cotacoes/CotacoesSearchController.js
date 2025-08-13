/**
 * Controller de Busca de Cotações
 * Responsável por operações de busca e filtros
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class CotacoesSearchController {
  
  /**
   * Buscar cotações com filtros avançados
   */
  static buscarCotacoes = asyncHandler(async (req, res) => {
    const { 
      search, 
      status, 
      comprador, 
      tipo_compra, 
      page = 1, 
      limit = 10,
      data_inicio,
      data_fim
    } = req.query;

    const offset = (page - 1) * limit;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Construir query base
    let whereConditions = [];
    let queryParams = [];

    // Filtro por busca
    if (search) {
      whereConditions.push(`
        (c.local_entrega LIKE ? OR c.justificativa LIKE ? OR c.motivo_final LIKE ?)
      `);
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Filtro por status
    if (status) {
      whereConditions.push('c.status = ?');
      queryParams.push(status);
    }

    // Filtro por comprador
    if (comprador) {
      whereConditions.push('c.comprador = ?');
      queryParams.push(comprador);
    }

    // Filtro por tipo de compra
    if (tipo_compra) {
      whereConditions.push('c.tipo_compra = ?');
      queryParams.push(tipo_compra);
    }

    // Filtro por data
    if (data_inicio) {
      whereConditions.push('DATE(c.data_criacao) >= ?');
      queryParams.push(data_inicio);
    }

    if (data_fim) {
      whereConditions.push('DATE(c.data_criacao) <= ?');
      queryParams.push(data_fim);
    }

    // Filtro por permissões do usuário
    if (userRole === 'comprador') {
      whereConditions.push('c.comprador = ?');
      queryParams.push(userId);
    } else if (userRole === 'supervisor') {
      // Supervisor vê apenas suas próprias cotações na listagem principal
      whereConditions.push('c.comprador = ?');
      queryParams.push(userId);
    }
    // Gestor e administrador veem todas as cotações

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM cotacoes c
      LEFT JOIN users u ON c.comprador = u.id
      ${whereClause}
    `;

    const [countResult] = await executeQuery(countQuery, queryParams);
    const total = countResult.total;

    // Query principal
    const mainQuery = `
      SELECT 
        c.*,
        u.name as comprador_nome,
        u.role as comprador_role,
        (SELECT COUNT(*) FROM cotacao_produtos WHERE cotacao_id = c.id) as total_produtos,
        (SELECT COUNT(*) FROM cotacao_fornecedores WHERE cotacao_id = c.id) as total_fornecedores
      FROM cotacoes c
      LEFT JOIN users u ON c.comprador = u.id
      ${whereClause}
      ORDER BY c.data_criacao DESC
      LIMIT ? OFFSET ?
    `;

    const cotacoes = await executeQuery(mainQuery, [...queryParams, parseInt(limit), offset]);

    // Calcular metadados de paginação
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const meta = {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    };

    return successResponse(res, cotacoes, 'Cotações encontradas com sucesso', STATUS_CODES.OK, meta);
  });

  /**
   * Buscar cotações por status específico
   */
  static buscarPorStatus = asyncHandler(async (req, res) => {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const userRole = req.user.role;
    const userId = req.user.id;

    let whereConditions = ['c.status = ?'];
    let queryParams = [status];

    // Filtro por permissões do usuário
    if (userRole === 'comprador') {
      whereConditions.push('c.comprador = ?');
      queryParams.push(userId);
    } else if (userRole === 'supervisor') {
      whereConditions.push('c.comprador = ?');
      queryParams.push(userId);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const query = `
      SELECT 
        c.*,
        u.name as comprador_nome,
        u.role as comprador_role,
        (SELECT COUNT(*) FROM cotacao_produtos WHERE cotacao_id = c.id) as total_produtos,
        (SELECT COUNT(*) FROM cotacao_fornecedores WHERE cotacao_id = c.id) as total_fornecedores
      FROM cotacoes c
      LEFT JOIN users u ON c.comprador = u.id
      ${whereClause}
      ORDER BY c.data_criacao DESC
      LIMIT ? OFFSET ?
    `;

    const cotacoes = await executeQuery(query, [...queryParams, parseInt(limit), offset]);

    // Contar total
    const [countResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM cotacoes c ${whereClause}`,
      queryParams
    );

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    const meta = {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    };

    return successResponse(res, cotacoes, `Cotações com status ${status} encontradas`, STATUS_CODES.OK, meta);
  });

  /**
   * Buscar cotações por comprador
   */
  static buscarPorComprador = asyncHandler(async (req, res) => {
    const { comprador_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const userRole = req.user.role;
    const userId = req.user.id;

    // Verificar permissões
    if (userRole === 'comprador' && parseInt(comprador_id) !== userId) {
      return errorResponse(res, 'Acesso negado', STATUS_CODES.FORBIDDEN);
    }

    const query = `
      SELECT 
        c.*,
        u.name as comprador_nome,
        u.role as comprador_role,
        (SELECT COUNT(*) FROM cotacao_produtos WHERE cotacao_id = c.id) as total_produtos,
        (SELECT COUNT(*) FROM cotacao_fornecedores WHERE cotacao_id = c.id) as total_fornecedores
      FROM cotacoes c
      LEFT JOIN users u ON c.comprador = u.id
      WHERE c.comprador = ?
      ORDER BY c.data_criacao DESC
      LIMIT ? OFFSET ?
    `;

    const cotacoes = await executeQuery(query, [comprador_id, parseInt(limit), offset]);

    // Contar total
    const [countResult] = await executeQuery(
      'SELECT COUNT(*) as total FROM cotacoes WHERE comprador = ?',
      [comprador_id]
    );

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    const meta = {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    };

    return successResponse(res, cotacoes, 'Cotações do comprador encontradas', STATUS_CODES.OK, meta);
  });
}

module.exports = CotacoesSearchController;
