const { executeQuery } = require('../../config/database');

const obterEstatisticas = async (req, res) => {
  try {
    const { escola, tipo_entrega, data_inicio, data_fim } = req.query;
    
    let whereClause = 'WHERE n.usuario_email = ?';
    let params = [req.user.email];

    // Filtros opcionais
    if (escola) {
      whereClause += ' AND n.escola = ?';
      params.push(escola);
    }

    if (tipo_entrega) {
      whereClause += ' AND n.tipo_entrega = ?';
      params.push(tipo_entrega);
    }

    if (data_inicio) {
      whereClause += ' AND DATE(n.data_preenchimento) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND DATE(n.data_preenchimento) <= ?';
      params.push(data_fim);
    }

    // Estatísticas gerais
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_necessidades,
        COUNT(DISTINCT n.escola) as total_escolas,
        COUNT(DISTINCT n.produto) as total_produtos,
        COUNT(DISTINCT n.tipo_entrega) as total_tipos_entrega,
        SUM(n.quantidade) as quantidade_total
      FROM necessidades n
      ${whereClause}
    `, params);

    // Estatísticas por escola
    const statsPorEscola = await executeQuery(`
      SELECT 
        n.escola,
        COUNT(*) as total_necessidades,
        SUM(n.quantidade) as quantidade_total
      FROM necessidades n
      ${whereClause}
      GROUP BY n.escola
      ORDER BY total_necessidades DESC
      LIMIT 10
    `, params);

    // Estatísticas por tipo de entrega
    const statsPorTipoEntrega = await executeQuery(`
      SELECT 
        n.tipo_entrega,
        COUNT(*) as total_necessidades,
        SUM(n.quantidade) as quantidade_total
      FROM necessidades n
      ${whereClause}
      GROUP BY n.tipo_entrega
      ORDER BY total_necessidades DESC
    `, params);

    // Estatísticas por produto
    const statsPorProduto = await executeQuery(`
      SELECT 
        n.produto,
        COUNT(*) as total_necessidades,
        SUM(n.quantidade) as quantidade_total
      FROM necessidades n
      ${whereClause}
      GROUP BY n.produto
      ORDER BY total_necessidades DESC
      LIMIT 10
    `, params);

    res.json({
      success: true,
      data: {
        gerais: stats[0] || {
          total_necessidades: 0,
          total_escolas: 0,
          total_produtos: 0,
          total_tipos_entrega: 0,
          quantidade_total: 0
        },
        porEscola: statsPorEscola,
        porTipoEntrega: statsPorTipoEntrega,
        porProduto: statsPorProduto
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
    
    let whereClause = 'WHERE n.usuario_email = ?';
    let params = [req.user.email];

    if (data_inicio) {
      whereClause += ' AND DATE(n.data_preenchimento) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND DATE(n.data_preenchimento) <= ?';
      params.push(data_fim);
    }

    // Resumo por período
    const resumo = await executeQuery(`
      SELECT 
        DATE(n.data_preenchimento) as data,
        COUNT(*) as total_necessidades,
        COUNT(DISTINCT n.escola) as escolas_envolvidas,
        SUM(n.quantidade) as quantidade_total
      FROM necessidades n
      ${whereClause}
      GROUP BY DATE(n.data_preenchimento)
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
