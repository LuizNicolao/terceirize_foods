const { query } = require('../../config/database');

const obterEstatisticas = async (req, res) => {
  try {
    const { tipo, ativo, data_inicio, data_fim } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtros opcionais
    if (tipo) {
      whereClause += ' AND p.tipo = ?';
      params.push(tipo);
    }

    if (ativo !== undefined) {
      whereClause += ' AND p.ativo = ?';
      params.push(ativo === 'true' ? 1 : 0);
    }

    if (data_inicio) {
      whereClause += ' AND DATE(p.data_cadastro) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND DATE(p.data_cadastro) <= ?';
      params.push(data_fim);
    }

    // Estatísticas gerais
    const stats = await query(`
      SELECT 
        COUNT(*) as total_produtos,
        COUNT(CASE WHEN p.ativo = 1 THEN 1 END) as produtos_ativos,
        COUNT(CASE WHEN p.ativo = 0 THEN 1 END) as produtos_inativos,
        COUNT(DISTINCT p.tipo) as total_tipos,
        COUNT(DISTINCT p.unidade_medida) as total_unidades
      FROM produtos p
      ${whereClause}
    `, params);

    // Estatísticas por tipo
    const statsPorTipo = await query(`
      SELECT 
        p.tipo,
        COUNT(*) as total_produtos,
        COUNT(CASE WHEN p.ativo = 1 THEN 1 END) as produtos_ativos,
        COUNT(CASE WHEN p.ativo = 0 THEN 1 END) as produtos_inativos
      FROM produtos p
      ${whereClause}
      GROUP BY p.tipo
      ORDER BY total_produtos DESC
    `, params);

    // Estatísticas por unidade de medida
    const statsPorUnidade = await query(`
      SELECT 
        p.unidade_medida,
        COUNT(*) as total_produtos,
        COUNT(CASE WHEN p.ativo = 1 THEN 1 END) as produtos_ativos
      FROM produtos p
      ${whereClause}
      GROUP BY p.unidade_medida
      ORDER BY total_produtos DESC
      LIMIT 10
    `, params);

    res.json({
      success: true,
      data: {
        gerais: stats[0] || {
          total_produtos: 0,
          produtos_ativos: 0,
          produtos_inativos: 0,
          total_tipos: 0,
          total_unidades: 0
        },
        porTipo: statsPorTipo,
        porUnidade: statsPorUnidade
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
      whereClause += ' AND DATE(p.data_cadastro) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND DATE(p.data_cadastro) <= ?';
      params.push(data_fim);
    }

    // Resumo por período
    const resumo = await query(`
      SELECT 
        DATE(p.data_cadastro) as data,
        COUNT(*) as total_produtos,
        COUNT(CASE WHEN p.ativo = 1 THEN 1 END) as produtos_ativos,
        COUNT(CASE WHEN p.ativo = 0 THEN 1 END) as produtos_inativos
      FROM produtos p
      ${whereClause}
      GROUP BY DATE(p.data_cadastro)
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
