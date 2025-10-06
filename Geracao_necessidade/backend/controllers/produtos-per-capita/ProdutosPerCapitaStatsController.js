const { query } = require('../../config/database');

const obterEstatisticas = async (req, res) => {
  try {
    const { ativo, data_inicio, data_fim } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtros opcionais
    if (ativo !== undefined) {
      whereClause += ' AND ppc.ativo = ?';
      params.push(ativo === 'true' ? 1 : 0);
    }

    if (data_inicio) {
      whereClause += ' AND DATE(ppc.data_cadastro) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND DATE(ppc.data_cadastro) <= ?';
      params.push(data_fim);
    }

    // Estatísticas gerais
    const stats = await query(`
      SELECT 
        COUNT(*) as total_produtos_per_capita,
        COUNT(CASE WHEN ppc.ativo = 1 THEN 1 END) as produtos_ativos,
        COUNT(CASE WHEN ppc.ativo = 0 THEN 1 END) as produtos_inativos,
        COUNT(CASE WHEN ppc.per_capita_lanche_manha > 0 THEN 1 END) as com_per_capita_lanche_manha,
        COUNT(CASE WHEN ppc.per_capita_almoco > 0 THEN 1 END) as com_per_capita_almoco,
        COUNT(CASE WHEN ppc.per_capita_lanche_tarde > 0 THEN 1 END) as com_per_capita_lanche_tarde,
        COUNT(CASE WHEN ppc.per_capita_parcial > 0 THEN 1 END) as com_per_capita_parcial,
        COUNT(CASE WHEN ppc.per_capita_eja > 0 THEN 1 END) as com_per_capita_eja
      FROM produtos_per_capita ppc
      INNER JOIN produtos p ON ppc.produto_id = p.id
      ${whereClause}
    `, params);

    // Estatísticas por tipo de per capita
    const statsPorTipo = await query(`
      SELECT 
        'Parcial' as tipo,
        COUNT(CASE WHEN ppc.per_capita_parcial > 0 THEN 1 END) as total_produtos,
        AVG(ppc.per_capita_parcial) as media_per_capita
      FROM produtos_per_capita ppc
      INNER JOIN produtos p ON ppc.produto_id = p.id
      ${whereClause}
      UNION ALL
      SELECT 
        'Almoço' as tipo,
        COUNT(CASE WHEN ppc.per_capita_almoco > 0 THEN 1 END) as total_produtos,
        AVG(ppc.per_capita_almoco) as media_per_capita
      FROM produtos_per_capita ppc
      INNER JOIN produtos p ON ppc.produto_id = p.id
      ${whereClause}
      UNION ALL
      SELECT 
        'Lanche' as tipo,
        COUNT(CASE WHEN ppc.per_capita_lanche > 0 THEN 1 END) as total_produtos,
        AVG(ppc.per_capita_lanche) as media_per_capita
      FROM produtos_per_capita ppc
      INNER JOIN produtos p ON ppc.produto_id = p.id
      ${whereClause}
      UNION ALL
      SELECT 
        'EJA' as tipo,
        COUNT(CASE WHEN ppc.per_capita_eja > 0 THEN 1 END) as total_produtos,
        AVG(ppc.per_capita_eja) as media_per_capita
      FROM produtos_per_capita ppc
      INNER JOIN produtos p ON ppc.produto_id = p.id
      ${whereClause}
    `, params);

    // Top 10 produtos com maior per capita total
    const topProdutos = await query(`
      SELECT 
        p.nome as produto_nome,
        p.unidade_medida,
        (ppc.per_capita_parcial + ppc.per_capita_almoco + ppc.per_capita_lanche + ppc.per_capita_eja) as per_capita_total,
        ppc.per_capita_parcial,
        ppc.per_capita_almoco,
        ppc.per_capita_lanche,
        ppc.per_capita_eja
      FROM produtos_per_capita ppc
      INNER JOIN produtos p ON ppc.produto_id = p.id
      ${whereClause}
      ORDER BY per_capita_total DESC
      LIMIT 10
    `, params);

    res.json({
      success: true,
      data: {
        gerais: stats[0] || {
          total_produtos_per_capita: 0,
          produtos_ativos: 0,
          produtos_inativos: 0,
          com_per_capita_parcial: 0,
          com_per_capita_almoco: 0,
          com_per_capita_lanche: 0,
          com_per_capita_eja: 0
        },
        porTipo: statsPorTipo,
        topProdutos: topProdutos
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
      whereClause += ' AND DATE(ppc.data_cadastro) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND DATE(ppc.data_cadastro) <= ?';
      params.push(data_fim);
    }

    // Resumo por período
    const resumo = await query(`
      SELECT 
        DATE(ppc.data_cadastro) as data,
        COUNT(*) as total_produtos,
        COUNT(CASE WHEN ppc.ativo = 1 THEN 1 END) as produtos_ativos,
        COUNT(CASE WHEN ppc.ativo = 0 THEN 1 END) as produtos_inativos
      FROM produtos_per_capita ppc
      INNER JOIN produtos p ON ppc.produto_id = p.id
      ${whereClause}
      GROUP BY DATE(ppc.data_cadastro)
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
