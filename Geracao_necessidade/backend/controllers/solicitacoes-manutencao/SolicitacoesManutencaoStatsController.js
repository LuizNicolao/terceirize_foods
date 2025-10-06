const { query } = require('../../config/database');

const obterEstatisticas = async (req, res) => {
  try {
    const { data_inicio, data_fim, status } = req.query;
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Lógica de permissões por tipo de usuário
    if (userType === 'Nutricionista') {
      whereClause += ' AND sm.nutricionista_email = ?';
      params.push(req.user.email);
    } else if (userType === 'Coordenacao' || userType === 'Supervisor') {
      // Acesso total
    } else {
      whereClause += ' AND sm.nutricionista_email = ?';
      params.push(req.user.email);
    }

    // Filtros opcionais
    if (data_inicio) {
      whereClause += ' AND sm.data_solicitacao >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND sm.data_solicitacao <= ?';
      params.push(data_fim);
    }

    if (status) {
      whereClause += ' AND sm.status = ?';
      params.push(status);
    }

    // Estatísticas gerais
    const stats = await query(`
      SELECT 
        COUNT(*) as total_solicitacoes,
        COUNT(CASE WHEN sm.status = 'Pendente' THEN 1 END) as solicitacoes_pendentes,
        COUNT(CASE WHEN sm.status = 'Aprovado' THEN 1 END) as solicitacoes_aprovadas,
        COUNT(CASE WHEN sm.status = 'Reprovado' THEN 1 END) as solicitacoes_reprovadas,
        COUNT(CASE WHEN sm.status = 'Pendente manutencao' THEN 1 END) as solicitacoes_pendente_manutencao,
        COUNT(CASE WHEN sm.status = 'Concluido' THEN 1 END) as solicitacoes_concluidas,
        SUM(CASE WHEN sm.valor IS NOT NULL THEN sm.valor ELSE 0 END) as valor_total,
        AVG(CASE WHEN sm.valor IS NOT NULL THEN sm.valor ELSE NULL END) as valor_medio,
        COUNT(CASE WHEN sm.data_solicitacao >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as solicitacoes_ultimos_30_dias,
        COUNT(CASE WHEN sm.data_solicitacao >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as solicitacoes_ultimos_7_dias
      FROM solicitacoes_manutencao sm
      INNER JOIN escolas e ON sm.escola_id = e.id
      LEFT JOIN usuarios u ON sm.nutricionista_email COLLATE utf8mb4_unicode_ci = u.email
      ${whereClause}
    `, params);

    // Estatísticas por status
    const statsPorStatus = await query(`
      SELECT 
        sm.status,
        COUNT(*) as quantidade,
        SUM(CASE WHEN sm.valor IS NOT NULL THEN sm.valor ELSE 0 END) as valor_total
      FROM solicitacoes_manutencao sm
      INNER JOIN escolas e ON sm.escola_id = e.id
      LEFT JOIN usuarios u ON sm.nutricionista_email COLLATE utf8mb4_unicode_ci = u.email
      ${whereClause}
      GROUP BY sm.status
      ORDER BY quantidade DESC
    `, params);

    // Estatísticas por escola
    const statsPorEscola = await query(`
      SELECT 
        e.nome_escola,
        e.rota,
        COUNT(*) as total_solicitacoes,
        COUNT(CASE WHEN sm.status = 'Pendente' THEN 1 END) as pendentes,
        COUNT(CASE WHEN sm.status = 'Concluido' THEN 1 END) as concluidas,
        SUM(CASE WHEN sm.valor IS NOT NULL THEN sm.valor ELSE 0 END) as valor_total
      FROM solicitacoes_manutencao sm
      INNER JOIN escolas e ON sm.escola_id = e.id
      LEFT JOIN usuarios u ON sm.nutricionista_email COLLATE utf8mb4_unicode_ci = u.email
      ${whereClause}
      GROUP BY e.id, e.nome_escola, e.rota
      ORDER BY total_solicitacoes DESC
      LIMIT 10
    `, params);

    // Estatísticas por nutricionista
    const statsPorNutricionista = await query(`
      SELECT 
        u.nome as nutricionista_nome,
        COUNT(*) as total_solicitacoes,
        COUNT(CASE WHEN sm.status = 'Pendente' THEN 1 END) as pendentes,
        COUNT(CASE WHEN sm.status = 'Concluido' THEN 1 END) as concluidas,
        SUM(CASE WHEN sm.valor IS NOT NULL THEN sm.valor ELSE 0 END) as valor_total
      FROM solicitacoes_manutencao sm
      INNER JOIN escolas e ON sm.escola_id = e.id
      LEFT JOIN usuarios u ON sm.nutricionista_email COLLATE utf8mb4_unicode_ci = u.email
      ${whereClause}
      GROUP BY u.email, u.nome
      ORDER BY total_solicitacoes DESC
      LIMIT 10
    `, params);

    // Evolução temporal (últimos 12 meses)
    const evolucaoTemporal = await query(`
      SELECT 
        DATE_FORMAT(sm.data_solicitacao, '%Y-%m') as mes,
        COUNT(*) as total_solicitacoes,
        COUNT(CASE WHEN sm.status = 'Concluido' THEN 1 END) as concluidas,
        SUM(CASE WHEN sm.valor IS NOT NULL THEN sm.valor ELSE 0 END) as valor_total
      FROM solicitacoes_manutencao sm
      INNER JOIN escolas e ON sm.escola_id = e.id
      LEFT JOIN usuarios u ON sm.nutricionista_email COLLATE utf8mb4_unicode_ci = u.email
      ${whereClause}
      AND sm.data_solicitacao >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(sm.data_solicitacao, '%Y-%m')
      ORDER BY mes DESC
    `, params);

    res.json({
      success: true,
      data: {
        gerais: stats[0] || {
          total_solicitacoes: 0,
          solicitacoes_pendentes: 0,
          solicitacoes_aprovadas: 0,
          solicitacoes_reprovadas: 0,
          solicitacoes_pendente_manutencao: 0,
          solicitacoes_concluidas: 0,
          valor_total: 0,
          valor_medio: 0,
          solicitacoes_ultimos_30_dias: 0,
          solicitacoes_ultimos_7_dias: 0
        },
        porStatus: statsPorStatus,
        porEscola: statsPorEscola,
        porNutricionista: statsPorNutricionista,
        evolucaoTemporal: evolucaoTemporal
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas de solicitações de manutenção:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao obter estatísticas de solicitações de manutenção'
    });
  }
};

const obterResumo = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Lógica de permissões por tipo de usuário
    if (userType === 'Nutricionista') {
      whereClause += ' AND sm.nutricionista_email = ?';
      params.push(req.user.email);
    } else if (userType === 'Coordenacao' || userType === 'Supervisor') {
      // Acesso total
    } else {
      whereClause += ' AND sm.nutricionista_email = ?';
      params.push(req.user.email);
    }

    // Resumo rápido
    const resumo = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN sm.status = 'Pendente' THEN 1 END) as pendentes,
        COUNT(CASE WHEN sm.status = 'Aprovado' THEN 1 END) as aprovadas,
        COUNT(CASE WHEN sm.status = 'Pendente manutencao' THEN 1 END) as pendente_manutencao,
        COUNT(CASE WHEN sm.status = 'Concluido' THEN 1 END) as concluidas,
        SUM(CASE WHEN sm.valor IS NOT NULL THEN sm.valor ELSE 0 END) as valor_total
      FROM solicitacoes_manutencao sm
      INNER JOIN escolas e ON sm.escola_id = e.id
      LEFT JOIN usuarios u ON sm.nutricionista_email COLLATE utf8mb4_unicode_ci = u.email
      ${whereClause}
    `, params);

    // Últimas solicitações
    const ultimasSolicitacoes = await query(`
      SELECT 
        sm.id,
        sm.data_solicitacao,
        sm.status,
        e.nome_escola,
        u.nome as nutricionista_nome,
        LEFT(sm.manutencao_descricao, 50) as descricao_resumida
      FROM solicitacoes_manutencao sm
      INNER JOIN escolas e ON sm.escola_id = e.id
      LEFT JOIN usuarios u ON sm.nutricionista_email COLLATE utf8mb4_unicode_ci = u.email
      ${whereClause}
      ORDER BY sm.data_cadastro DESC
      LIMIT 5
    `, params);

    res.json({
      success: true,
      data: {
        resumo: resumo[0] || {
          total: 0,
          pendentes: 0,
          aprovadas: 0,
          pendente_manutencao: 0,
          concluidas: 0,
          valor_total: 0
        },
        ultimasSolicitacoes: ultimasSolicitacoes
      }
    });
  } catch (error) {
    console.error('Erro ao obter resumo de solicitações de manutenção:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao obter resumo de solicitações de manutenção'
    });
  }
};

module.exports = {
  obterEstatisticas,
  obterResumo
};
