const { query } = require('../../config/database');

const dashboardRelatorios = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { data_inicio, data_fim } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtro por usuário (supervisores só veem suas rotas)
    if (userType === 'Supervisao') {
      whereClause += ' AND re.usuario_id = ?';
      params.push(userId);
    }

    // Filtros opcionais
    if (data_inicio) {
      whereClause += ' AND re.data_recebimento >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND re.data_recebimento <= ?';
      params.push(data_fim);
    }

    // Métricas gerais
    const metricas = await query(`
      SELECT 
        COUNT(*) as total_recebimentos,
        COUNT(DISTINCT re.escola_id) as total_escolas,
        COUNT(CASE WHEN re.tipo_recebimento = 'Completo' THEN 1 END) as recebimentos_completos,
        COUNT(CASE WHEN re.tipo_recebimento = 'Parcial' THEN 1 END) as recebimentos_parciais,
        COUNT(DISTINCT CASE WHEN re.tipo_recebimento = 'Completo' THEN re.escola_id END) as escolas_completas,
        COUNT(DISTINCT CASE WHEN re.tipo_recebimento = 'Parcial' THEN re.escola_id END) as escolas_parciais
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      ${whereClause}
    `, params);

    // Métricas por tipo de entrega
    const porTipoEntrega = await query(`
      SELECT 
        re.tipo_entrega,
        COUNT(*) as total,
        COUNT(CASE WHEN re.tipo_recebimento = 'Completo' THEN 1 END) as completos,
        COUNT(CASE WHEN re.tipo_recebimento = 'Parcial' THEN 1 END) as parciais,
        COUNT(DISTINCT re.escola_id) as escolas_unicas
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      ${whereClause}
      GROUP BY re.tipo_entrega
      ORDER BY total DESC
    `, params);

    // Métricas por rota
    const porRota = await query(`
      SELECT 
        e.rota,
        COUNT(*) as total_recebimentos,
        COUNT(CASE WHEN re.tipo_recebimento = 'Completo' THEN 1 END) as completos,
        COUNT(CASE WHEN re.tipo_recebimento = 'Parcial' THEN 1 END) as parciais,
        COUNT(DISTINCT re.escola_id) as escolas_unicas
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      ${whereClause}
      GROUP BY e.rota
      ORDER BY total_recebimentos DESC
    `, params);

    res.json({
      success: true,
      data: {
        metricas: metricas[0],
        porTipoEntrega,
        porRota
      }
    });
  } catch (error) {
    console.error('Erro ao gerar dashboard:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao gerar dashboard'
    });
  }
};

const obterEstatisticas = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { data_inicio, data_fim, tipo_entrega, rota } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtro por usuário (supervisores só veem suas rotas)
    if (userType === 'Supervisao') {
      whereClause += ' AND re.usuario_id = ?';
      params.push(userId);
    }

    // Filtros opcionais
    if (data_inicio) {
      whereClause += ' AND re.data_recebimento >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND re.data_recebimento <= ?';
      params.push(data_fim);
    }

    if (tipo_entrega) {
      whereClause += ' AND re.tipo_entrega = ?';
      params.push(tipo_entrega);
    }

    if (rota) {
      whereClause += ' AND e.rota = ?';
      params.push(rota);
    }

    // Estatísticas gerais
    const [statsResult] = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN re.tipo_recebimento = 'Completo' THEN 1 END) as completos,
        COUNT(CASE WHEN re.tipo_recebimento = 'Parcial' THEN 1 END) as parciais,
        COUNT(DISTINCT re.escola_id) as escolas_unicas
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      ${whereClause}
    `, params);

    const stats = statsResult && statsResult[0] ? statsResult[0] : { 
      total: 0, 
      completos: 0, 
      parciais: 0, 
      escolas_unicas: 0 
    };

    res.json({
      success: true,
      message: 'Estatísticas carregadas com sucesso',
      data: { stats }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

const obterResumo = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtro por usuário (supervisores só veem suas rotas)
    if (userType === 'Supervisao') {
      whereClause += ' AND re.usuario_id = ?';
      params.push(userId);
    }

    // Resumo dos últimos 30 dias
    const [resumoResult] = await query(`
      SELECT 
        COUNT(*) as total_ultimos_30_dias,
        COUNT(CASE WHEN re.tipo_recebimento = 'Completo' THEN 1 END) as completos_ultimos_30_dias,
        COUNT(CASE WHEN re.tipo_recebimento = 'Parcial' THEN 1 END) as parciais_ultimos_30_dias,
        COUNT(DISTINCT re.escola_id) as escolas_unicas_ultimos_30_dias
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      ${whereClause}
      AND re.data_recebimento >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `, params);

    const resumo = resumoResult && resumoResult[0] ? resumoResult[0] : { 
      total_ultimos_30_dias: 0, 
      completos_ultimos_30_dias: 0, 
      parciais_ultimos_30_dias: 0, 
      escolas_unicas_ultimos_30_dias: 0 
    };

    res.json({
      success: true,
      message: 'Resumo carregado com sucesso',
      data: { resumo }
    });
  } catch (error) {
    console.error('Erro ao obter resumo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  dashboardRelatorios,
  obterEstatisticas,
  obterResumo
};
