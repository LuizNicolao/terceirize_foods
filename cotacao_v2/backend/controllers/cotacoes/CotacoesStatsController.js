/**
 * Controller de Estatísticas de Cotações
 * Responsável por operações de estatísticas e relatórios
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class CotacoesStatsController {
  
  /**
   * Buscar estatísticas gerais das cotações
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

    // Cotações em análise
    const [emAnaliseResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM cotacoes 
       ${whereClause} 
       AND status = 'em_analise'`,
      queryParams
    );

    // Cotações aprovadas
    const [aprovadasResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM cotacoes 
       ${whereClause} 
       AND status = 'aprovada'`,
      queryParams
    );

    // Cotações rejeitadas
    const [rejeitadasResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM cotacoes 
       ${whereClause} 
       AND status = 'rejeitada'`,
      queryParams
    );

    const estatisticas = {
      total: totalResult.total,
      mesAtual: mesAtualResult.total,
      pendentes: pendentesResult.total,
      emAnalise: emAnaliseResult.total,
      aprovadas: aprovadasResult.total,
      rejeitadas: rejeitadasResult.total,
      porStatus: stats
    };

    return successResponse(res, estatisticas, 'Estatísticas carregadas com sucesso');
  });

  /**
   * Buscar estatísticas por período
   */
  static buscarEstatisticasPorPeriodo = asyncHandler(async (req, res) => {
    const { data_inicio, data_fim } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    if (!data_inicio || !data_fim) {
      return errorResponse(res, 'Data de início e fim são obrigatórias', STATUS_CODES.BAD_REQUEST);
    }

    let whereConditions = ['DATE(data_criacao) >= ?', 'DATE(data_criacao) <= ?'];
    let queryParams = [data_inicio, data_fim];

    // Filtro por permissões do usuário
    if (userRole === 'comprador') {
      whereConditions.push('comprador = ?');
      queryParams.push(userId);
    } else if (userRole === 'supervisor') {
      whereConditions.push('comprador = ?');
      queryParams.push(userId);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Estatísticas por status no período
    const statsQuery = `
      SELECT 
        status,
        COUNT(*) as quantidade
      FROM cotacoes
      ${whereClause}
      GROUP BY status
    `;

    const stats = await executeQuery(statsQuery, queryParams);

    // Total no período
    const [totalResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM cotacoes ${whereClause}`,
      queryParams
    );

    // Média diária no período
    const [mediaDiariaResult] = await executeQuery(
      `SELECT 
        COUNT(*) / DATEDIFF(?, ?) as media_diaria
       FROM cotacoes 
       ${whereClause}`,
      [data_fim, data_inicio, ...queryParams]
    );

    // Cotações por tipo de compra
    const [porTipoResult] = await executeQuery(
      `SELECT 
        tipo_compra,
        COUNT(*) as quantidade
       FROM cotacoes 
       ${whereClause}
       GROUP BY tipo_compra`,
      queryParams
    );

    const estatisticas = {
      periodo: {
        inicio: data_inicio,
        fim: data_fim
      },
      total: totalResult.total,
      mediaDiaria: mediaDiariaResult.media_diaria || 0,
      porStatus: stats,
      porTipo: porTipoResult
    };

    return successResponse(res, estatisticas, 'Estatísticas do período carregadas com sucesso');
  });

  /**
   * Buscar estatísticas por comprador
   */
  static buscarEstatisticasPorComprador = asyncHandler(async (req, res) => {
    const { comprador_id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Verificar permissões
    if (userRole === 'comprador' && parseInt(comprador_id) !== userId) {
      return errorResponse(res, 'Acesso negado', STATUS_CODES.FORBIDDEN);
    }

    // Estatísticas por status do comprador
    const statsQuery = `
      SELECT 
        status,
        COUNT(*) as quantidade
      FROM cotacoes
      WHERE comprador = ?
      GROUP BY status
    `;

    const stats = await executeQuery(statsQuery, [comprador_id]);

    // Total do comprador
    const [totalResult] = await executeQuery(
      'SELECT COUNT(*) as total FROM cotacoes WHERE comprador = ?',
      [comprador_id]
    );

    // Cotações do mês atual
    const [mesAtualResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM cotacoes 
       WHERE comprador = ?
       AND MONTH(data_criacao) = MONTH(CURRENT_DATE())
       AND YEAR(data_criacao) = YEAR(CURRENT_DATE())`,
      [comprador_id]
    );

    // Última cotação
    const [ultimaCotacaoResult] = await executeQuery(
      `SELECT 
        id, status, data_criacao, local_entrega
       FROM cotacoes 
       WHERE comprador = ?
       ORDER BY data_criacao DESC
       LIMIT 1`,
      [comprador_id]
    );

    const estatisticas = {
      comprador_id: parseInt(comprador_id),
      total: totalResult.total,
      mesAtual: mesAtualResult.total,
      porStatus: stats,
      ultimaCotacao: ultimaCotacaoResult[0] || null
    };

    return successResponse(res, estatisticas, 'Estatísticas do comprador carregadas com sucesso');
  });

  /**
   * Buscar dashboard overview
   */
  static buscarDashboardOverview = asyncHandler(async (req, res) => {
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

    // Cotações pendentes
    const [pendentesResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM cotacoes 
       ${whereClause} 
       AND status = 'pendente'`,
      queryParams
    );

    // Cotações em análise
    const [emAnaliseResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM cotacoes 
       ${whereClause} 
       AND status = 'em_analise'`,
      queryParams
    );

    // Cotações aprovadas hoje
    const [aprovadasHojeResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM cotacoes 
       ${whereClause} 
       AND status = 'aprovada'
       AND DATE(data_atualizacao) = CURRENT_DATE()`,
      queryParams
    );

    // Cotações criadas hoje
    const [criadasHojeResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM cotacoes 
       ${whereClause} 
       AND DATE(data_criacao) = CURRENT_DATE()`,
      queryParams
    );

    const overview = {
      pendentes: pendentesResult.total,
      emAnalise: emAnaliseResult.total,
      aprovadasHoje: aprovadasHojeResult.total,
      criadasHoje: criadasHojeResult.total
    };

    return successResponse(res, overview, 'Dashboard overview carregado com sucesso');
  });
}

module.exports = CotacoesStatsController;
