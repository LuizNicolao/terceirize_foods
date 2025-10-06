const { query } = require('../../config/database');

const obterEstatisticas = async (req, res) => {
  try {
    const { rota, cidade, estado, ativo, data_inicio, data_fim } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtros opcionais
    if (rota) {
      whereClause += ' AND e.rota = ?';
      params.push(rota);
    }

    if (cidade) {
      whereClause += ' AND e.cidade = ?';
      params.push(cidade);
    }

    if (estado) {
      whereClause += ' AND e.estado = ?';
      params.push(estado);
    }

    if (ativo !== undefined) {
      whereClause += ' AND e.ativo = ?';
      params.push(ativo === 'true' ? 1 : 0);
    }

    if (data_inicio) {
      whereClause += ' AND DATE(e.data_cadastro) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND DATE(e.data_cadastro) <= ?';
      params.push(data_fim);
    }

    // Estatísticas gerais
    const stats = await query(`
      SELECT 
        COUNT(*) as total_escolas,
        COUNT(CASE WHEN e.ativo = 1 THEN 1 END) as escolas_ativas,
        COUNT(CASE WHEN e.ativo = 0 THEN 1 END) as escolas_inativas,
        COUNT(DISTINCT e.rota) as total_rotas,
        COUNT(DISTINCT e.cidade) as total_cidades,
        COUNT(DISTINCT e.estado) as total_estados,
        COUNT(CASE WHEN e.email_nutricionista IS NOT NULL AND e.email_nutricionista != '' THEN 1 END) as escolas_com_nutricionista
      FROM escolas e
      ${whereClause}
    `, params);

    // Estatísticas por rota
    const statsPorRota = await query(`
      SELECT 
        e.rota,
        COUNT(*) as total_escolas,
        COUNT(CASE WHEN e.ativo = 1 THEN 1 END) as escolas_ativas,
        COUNT(CASE WHEN e.ativo = 0 THEN 1 END) as escolas_inativas
      FROM escolas e
      ${whereClause}
      GROUP BY e.rota
      ORDER BY total_escolas DESC
      LIMIT 10
    `, params);

    // Estatísticas por cidade
    const statsPorCidade = await query(`
      SELECT 
        e.cidade,
        COUNT(*) as total_escolas,
        COUNT(CASE WHEN e.ativo = 1 THEN 1 END) as escolas_ativas
      FROM escolas e
      ${whereClause}
      GROUP BY e.cidade
      ORDER BY total_escolas DESC
      LIMIT 10
    `, params);

    // Estatísticas por estado
    const statsPorEstado = await query(`
      SELECT 
        e.estado,
        COUNT(*) as total_escolas,
        COUNT(CASE WHEN e.ativo = 1 THEN 1 END) as escolas_ativas
      FROM escolas e
      ${whereClause}
      GROUP BY e.estado
      ORDER BY total_escolas DESC
    `, params);

    res.json({
      success: true,
      data: {
        gerais: stats[0] || {
          total_escolas: 0,
          escolas_ativas: 0,
          escolas_inativas: 0,
          total_rotas: 0,
          total_cidades: 0,
          total_estados: 0,
          escolas_com_nutricionista: 0
        },
        porRota: statsPorRota,
        porCidade: statsPorCidade,
        porEstado: statsPorEstado
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao obter estatísticas'
    });
  }
};

const obterResumo = async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    if (data_inicio) {
      whereClause += ' AND DATE(e.data_cadastro) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND DATE(e.data_cadastro) <= ?';
      params.push(data_fim);
    }

    // Resumo por período
    const resumo = await query(`
      SELECT 
        DATE(e.data_cadastro) as data,
        COUNT(*) as total_escolas,
        COUNT(CASE WHEN e.ativo = 1 THEN 1 END) as escolas_ativas,
        COUNT(CASE WHEN e.ativo = 0 THEN 1 END) as escolas_inativas
      FROM escolas e
      ${whereClause}
      GROUP BY DATE(e.data_cadastro)
      ORDER BY data DESC
      LIMIT 30
    `, params);

    res.json({
      success: true,
      data: resumo
    });
  } catch (error) {
    console.error('Erro ao obter resumo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao obter resumo'
    });
  }
};

module.exports = {
  obterEstatisticas,
  obterResumo
};
