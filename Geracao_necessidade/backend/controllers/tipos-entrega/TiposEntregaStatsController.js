const { query } = require('../../config/database');

const obterEstatisticas = async (req, res) => {
  try {
    const { ativo, data_inicio, data_fim } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtros opcionais
    if (ativo !== undefined) {
      whereClause += ' AND te.ativo = ?';
      params.push(ativo === 'true' ? 1 : 0);
    }

    if (data_inicio) {
      whereClause += ' AND DATE(te.data_cadastro) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND DATE(te.data_cadastro) <= ?';
      params.push(data_fim);
    }

    // Estatísticas gerais
    const stats = await query(`
      SELECT 
        COUNT(*) as total_tipos_entrega,
        COUNT(CASE WHEN te.ativo = 1 THEN 1 END) as tipos_ativos,
        COUNT(CASE WHEN te.ativo = 0 THEN 1 END) as tipos_inativos
      FROM tipos_entrega te
      ${whereClause}
    `, params);

    // Estatísticas de uso por tipo de entrega
    const statsUso = await query(`
      SELECT 
        te.nome as tipo_entrega,
        te.ativo,
        COUNT(re.id) as total_recebimentos,
        COUNT(DISTINCT re.escola_id) as total_escolas,
        COUNT(DISTINCT re.usuario_id) as total_usuarios,
        SUM(CASE WHEN re.status_entrega = 'No Prazo' THEN 1 ELSE 0 END) as no_prazo,
        SUM(CASE WHEN re.status_entrega = 'Atrasado' THEN 1 ELSE 0 END) as atrasado,
        SUM(CASE WHEN re.status_entrega = 'Antecipado' THEN 1 ELSE 0 END) as antecipado
      FROM tipos_entrega te
      LEFT JOIN recebimentos_escolas re ON te.nome = re.tipo_entrega
      ${whereClause}
      GROUP BY te.id, te.nome, te.ativo
      ORDER BY total_recebimentos DESC
    `, params);

    res.json({
      success: true,
      data: {
        gerais: stats[0] || {
          total_tipos_entrega: 0,
          tipos_ativos: 0,
          tipos_inativos: 0
        },
        uso: statsUso
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
      whereClause += ' AND DATE(te.data_cadastro) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND DATE(te.data_cadastro) <= ?';
      params.push(data_fim);
    }

    // Resumo por período
    const resumo = await query(`
      SELECT 
        DATE(te.data_cadastro) as data,
        COUNT(*) as total_tipos,
        COUNT(CASE WHEN te.ativo = 1 THEN 1 END) as tipos_ativos,
        COUNT(CASE WHEN te.ativo = 0 THEN 1 END) as tipos_inativos
      FROM tipos_entrega te
      ${whereClause}
      GROUP BY DATE(te.data_cadastro)
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
