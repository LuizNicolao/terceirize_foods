/**
 * Controller de Listagem de Cotações
 * Responsável por operações de listagem e busca
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class CotacoesListController {
  
  /**
   * Listar todas as cotações com filtros
   */
  static listarCotacoes = asyncHandler(async (req, res) => {
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

    return successResponse(res, cotacoes, 'Cotações listadas com sucesso', STATUS_CODES.OK, meta);
  });

  /**
   * Listar cotações pendentes para supervisor
   */
  static listarCotacoesPendentesSupervisor = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        c.*,
        u.name as comprador_nome,
        u.role as comprador_role,
        (SELECT COUNT(*) FROM cotacao_produtos WHERE cotacao_id = c.id) as total_produtos,
        (SELECT COUNT(*) FROM cotacao_fornecedores WHERE cotacao_id = c.id) as total_fornecedores
      FROM cotacoes c
      LEFT JOIN users u ON c.comprador = u.id
      WHERE c.status = 'pendente'
      ORDER BY c.data_criacao ASC
      LIMIT ? OFFSET ?
    `;

    const cotacoes = await executeQuery(query, [parseInt(limit), offset]);

    // Contar total
    const [countResult] = await executeQuery(
      'SELECT COUNT(*) as total FROM cotacoes WHERE status = ?',
      ['pendente']
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

    return successResponse(res, cotacoes, 'Cotações pendentes listadas com sucesso', STATUS_CODES.OK, meta);
  });

  /**
   * Listar cotações para aprovação
   */
  static listarCotacoesAprovacao = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        c.*,
        u.name as comprador_nome,
        u.role as comprador_role,
        (SELECT COUNT(*) FROM cotacao_produtos WHERE cotacao_id = c.id) as total_produtos,
        (SELECT COUNT(*) FROM cotacao_fornecedores WHERE cotacao_id = c.id) as total_fornecedores
      FROM cotacoes c
      LEFT JOIN users u ON c.comprador = u.id
      WHERE c.status IN ('em_analise', 'pendente_aprovacao')
      ORDER BY c.data_criacao ASC
      LIMIT ? OFFSET ?
    `;

    const cotacoes = await executeQuery(query, [parseInt(limit), offset]);

    // Contar total
    const [countResult] = await executeQuery(
      'SELECT COUNT(*) as total FROM cotacoes WHERE status IN (?, ?)',
      ['em_analise', 'pendente_aprovacao']
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

    return successResponse(res, cotacoes, 'Cotações para aprovação listadas com sucesso', STATUS_CODES.OK, meta);
  });

  /**
   * Buscar estatísticas das cotações
   */
  static buscarEstatisticas = asyncHandler(async (req, res) => {
    const userRole = req.user.role;
    const userId = req.user.id;

    let whereClause = '';
    let queryParams = [];

    // Filtro por permissões do usuário
    if (userRole === 'comprador') {
      whereClause = 'WHERE comprador = ?';
      queryParams.push(userId);
    } else if (userRole === 'supervisor') {
      whereClause = 'WHERE comprador = ?';
      queryParams.push(userId);
    }

    // Estatísticas por status
    const statsQuery = `
      SELECT 
        status,
        COUNT(*) as quantidade
      FROM cotacoes
      ${whereClause}
      GROUP BY status
    `;

    const stats = await executeQuery(statsQuery, queryParams);

    // Total de cotações
    const [totalResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM cotacoes ${whereClause}`,
      queryParams
    );

    // Cotações do mês atual
    const [mesAtualResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM cotacoes 
       ${whereClause} 
       AND MONTH(data_criacao) = MONTH(CURRENT_DATE())
       AND YEAR(data_criacao) = YEAR(CURRENT_DATE())`,
      queryParams
    );

    // Cotações pendentes
    const [pendentesResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM cotacoes 
       ${whereClause} 
       AND status = 'pendente'`,
      queryParams
    );

    const estatisticas = {
      total: totalResult.total,
      mesAtual: mesAtualResult.total,
      pendentes: pendentesResult.total,
      porStatus: stats
    };

    return successResponse(res, estatisticas, 'Estatísticas carregadas com sucesso');
  });
}

module.exports = CotacoesListController;
