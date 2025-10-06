const { query } = require('../../config/database');

const obterEstatisticas = async (req, res) => {
  try {
    const { usuario_id, tela, tipo_usuario, data_inicio, data_fim } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtros opcionais
    if (usuario_id) {
      whereClause += ' AND p.usuario_id = ?';
      params.push(usuario_id);
    }

    if (tela) {
      whereClause += ' AND p.tela = ?';
      params.push(tela);
    }

    if (tipo_usuario) {
      whereClause += ' AND u.tipo_usuario = ?';
      params.push(tipo_usuario);
    }

    if (data_inicio) {
      whereClause += ' AND DATE(p.criado_em) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND DATE(p.criado_em) <= ?';
      params.push(data_fim);
    }

    // Estatísticas gerais
    const stats = await query(`
      SELECT 
        COUNT(*) as total_permissoes,
        COUNT(DISTINCT p.usuario_id) as total_usuarios_com_permissoes,
        COUNT(DISTINCT p.tela) as total_telas,
        COUNT(DISTINCT u.tipo_usuario) as total_tipos_usuario,
        SUM(CASE WHEN p.pode_visualizar = 1 THEN 1 ELSE 0 END) as permissoes_visualizar,
        SUM(CASE WHEN p.pode_criar = 1 THEN 1 ELSE 0 END) as permissoes_criar,
        SUM(CASE WHEN p.pode_editar = 1 THEN 1 ELSE 0 END) as permissoes_editar,
        SUM(CASE WHEN p.pode_excluir = 1 THEN 1 ELSE 0 END) as permissoes_excluir
      FROM permissoes_usuario p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      ${whereClause}
    `, params);

    // Estatísticas por tela
    const statsPorTela = await query(`
      SELECT 
        p.tela,
        COUNT(*) as total_permissoes,
        COUNT(DISTINCT p.usuario_id) as total_usuarios,
        SUM(CASE WHEN p.pode_visualizar = 1 THEN 1 ELSE 0 END) as pode_visualizar,
        SUM(CASE WHEN p.pode_criar = 1 THEN 1 ELSE 0 END) as pode_criar,
        SUM(CASE WHEN p.pode_editar = 1 THEN 1 ELSE 0 END) as pode_editar,
        SUM(CASE WHEN p.pode_excluir = 1 THEN 1 ELSE 0 END) as pode_excluir
      FROM permissoes_usuario p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      ${whereClause}
      GROUP BY p.tela
      ORDER BY total_permissoes DESC
    `, params);

    // Estatísticas por tipo de usuário
    const statsPorTipoUsuario = await query(`
      SELECT 
        u.tipo_usuario,
        COUNT(*) as total_permissoes,
        COUNT(DISTINCT p.tela) as total_telas,
        SUM(CASE WHEN p.pode_visualizar = 1 THEN 1 ELSE 0 END) as pode_visualizar,
        SUM(CASE WHEN p.pode_criar = 1 THEN 1 ELSE 0 END) as pode_criar,
        SUM(CASE WHEN p.pode_editar = 1 THEN 1 ELSE 0 END) as pode_editar,
        SUM(CASE WHEN p.pode_excluir = 1 THEN 1 ELSE 0 END) as pode_excluir
      FROM permissoes_usuario p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      ${whereClause}
      GROUP BY u.tipo_usuario
      ORDER BY total_permissoes DESC
    `, params);

    // Estatísticas por usuário
    const statsPorUsuario = await query(`
      SELECT 
        u.nome as usuario_nome,
        u.email as usuario_email,
        u.tipo_usuario,
        COUNT(*) as total_permissoes,
        COUNT(DISTINCT p.tela) as total_telas,
        SUM(CASE WHEN p.pode_visualizar = 1 THEN 1 ELSE 0 END) as pode_visualizar,
        SUM(CASE WHEN p.pode_criar = 1 THEN 1 ELSE 0 END) as pode_criar,
        SUM(CASE WHEN p.pode_editar = 1 THEN 1 ELSE 0 END) as pode_editar,
        SUM(CASE WHEN p.pode_excluir = 1 THEN 1 ELSE 0 END) as pode_excluir
      FROM permissoes_usuario p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      ${whereClause}
      GROUP BY u.id, u.nome, u.email, u.tipo_usuario
      ORDER BY total_permissoes DESC
      LIMIT 10
    `, params);

    res.json({
      success: true,
      data: {
        gerais: stats[0] || {
          total_permissoes: 0,
          total_usuarios_com_permissoes: 0,
          total_telas: 0,
          total_tipos_usuario: 0,
          permissoes_visualizar: 0,
          permissoes_criar: 0,
          permissoes_editar: 0,
          permissoes_excluir: 0
        },
        porTela: statsPorTela,
        porTipoUsuario: statsPorTipoUsuario,
        porUsuario: statsPorUsuario
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
      whereClause += ' AND DATE(p.criado_em) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND DATE(p.criado_em) <= ?';
      params.push(data_fim);
    }

    // Resumo por período
    const resumo = await query(`
      SELECT 
        DATE(p.criado_em) as data,
        COUNT(*) as total_permissoes,
        COUNT(DISTINCT p.usuario_id) as total_usuarios,
        COUNT(DISTINCT p.tela) as total_telas
      FROM permissoes_usuario p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      ${whereClause}
      GROUP BY DATE(p.criado_em)
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

const sincronizarPermissoes = async (req, res) => {
  try {
    const { sincronizarPermissoes } = require('../../scripts/sincronizarPermissoes');
    
    await sincronizarPermissoes();

    res.json({
      success: true,
      message: 'Permissões sincronizadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao sincronizar permissões:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao sincronizar permissões'
    });
  }
};

module.exports = {
  obterEstatisticas,
  obterResumo,
  sincronizarPermissoes
};
