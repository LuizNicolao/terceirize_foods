const { query } = require('../../config/database');

const obterEstatisticas = async (req, res) => {
  try {
    const { tipo_usuario, ativo, rota, setor, data_inicio, data_fim } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtros opcionais
    if (tipo_usuario) {
      whereClause += ' AND u.tipo_usuario = ?';
      params.push(tipo_usuario);
    }

    if (ativo !== undefined) {
      whereClause += ' AND u.ativo = ?';
      params.push(ativo === 'true' ? 1 : 0);
    }

    if (rota) {
      whereClause += ' AND u.rota = ?';
      params.push(rota);
    }

    if (setor) {
      whereClause += ' AND u.setor = ?';
      params.push(setor);
    }

    if (data_inicio) {
      whereClause += ' AND DATE(u.data_cadastro) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND DATE(u.data_cadastro) <= ?';
      params.push(data_fim);
    }

    // Estatísticas gerais
    const stats = await query(`
      SELECT 
        COUNT(*) as total_usuarios,
        COUNT(CASE WHEN u.ativo = 1 THEN 1 END) as usuarios_ativos,
        COUNT(CASE WHEN u.ativo = 0 THEN 1 END) as usuarios_inativos,
        COUNT(DISTINCT u.tipo_usuario) as total_tipos_usuario,
        COUNT(DISTINCT u.rota) as total_rotas,
        COUNT(DISTINCT u.setor) as total_setores
      FROM usuarios u
      ${whereClause}
    `, params);

    // Estatísticas por tipo de usuário
    const statsPorTipoUsuario = await query(`
      SELECT 
        u.tipo_usuario,
        COUNT(*) as total_usuarios,
        COUNT(CASE WHEN u.ativo = 1 THEN 1 END) as usuarios_ativos,
        COUNT(CASE WHEN u.ativo = 0 THEN 1 END) as usuarios_inativos
      FROM usuarios u
      ${whereClause}
      GROUP BY u.tipo_usuario
      ORDER BY total_usuarios DESC
    `, params);

    // Estatísticas por rota
    const statsPorRota = await query(`
      SELECT 
        u.rota,
        COUNT(*) as total_usuarios,
        COUNT(CASE WHEN u.ativo = 1 THEN 1 END) as usuarios_ativos
      FROM usuarios u
      ${whereClause}
      GROUP BY u.rota
      ORDER BY total_usuarios DESC
      LIMIT 10
    `, params);

    // Estatísticas por setor
    const statsPorSetor = await query(`
      SELECT 
        u.setor,
        COUNT(*) as total_usuarios,
        COUNT(CASE WHEN u.ativo = 1 THEN 1 END) as usuarios_ativos
      FROM usuarios u
      ${whereClause}
      GROUP BY u.setor
      ORDER BY total_usuarios DESC
      LIMIT 10
    `, params);

    res.json({
      success: true,
      data: {
        gerais: stats[0] || {
          total_usuarios: 0,
          usuarios_ativos: 0,
          usuarios_inativos: 0,
          total_tipos_usuario: 0,
          total_rotas: 0,
          total_setores: 0
        },
        porTipoUsuario: statsPorTipoUsuario,
        porRota: statsPorRota,
        porSetor: statsPorSetor
      },
      filters: {
        tipo_usuario: tipo_usuario || null,
        ativo: ativo !== undefined ? (ativo === 'true') : null,
        rota: rota || null,
        setor: setor || null,
        data_inicio: data_inicio || null,
        data_fim: data_fim || null
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao obter estatísticas',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

const obterResumo = async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    if (data_inicio) {
      whereClause += ' AND DATE(u.data_cadastro) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND DATE(u.data_cadastro) <= ?';
      params.push(data_fim);
    }

    // Resumo por período
    const resumo = await query(`
      SELECT 
        DATE(u.data_cadastro) as data,
        COUNT(*) as total_usuarios,
        COUNT(CASE WHEN u.ativo = 1 THEN 1 END) as usuarios_ativos,
        COUNT(CASE WHEN u.ativo = 0 THEN 1 END) as usuarios_inativos
      FROM usuarios u
      ${whereClause}
      GROUP BY DATE(u.data_cadastro)
      ORDER BY data DESC
      LIMIT 30
    `, params);

    // Calcular totais gerais
    const totalGeral = resumo.reduce((acc, item) => ({
      total_usuarios: acc.total_usuarios + item.total_usuarios,
      usuarios_ativos: acc.usuarios_ativos + item.usuarios_ativos,
      usuarios_inativos: acc.usuarios_inativos + item.usuarios_inativos
    }), { total_usuarios: 0, usuarios_ativos: 0, usuarios_inativos: 0 });

    res.json({
      success: true,
      data: resumo,
      summary: {
        periodo: {
          data_inicio: data_inicio || null,
          data_fim: data_fim || null
        },
        total: totalGeral,
        registros: resumo.length
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter resumo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao obter resumo',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

module.exports = {
  obterEstatisticas,
  obterResumo
};
