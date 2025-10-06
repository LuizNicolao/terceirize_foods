const { query } = require('../../config/database');

const listar = async (req, res) => {
  try {
    // Se for rota /me, usar o ID do usuário logado
    // Se for rota /:usuario_id, usar o ID dos parâmetros
    const usuario_id = req.params.usuario_id || req.user.id;

    // Buscar permissões do usuário
    const permissoes = await query(`
      SELECT 
        p.id,
        p.tela,
        p.pode_visualizar,
        p.pode_criar,
        p.pode_editar,
        p.pode_excluir,
        p.criado_em,
        p.atualizado_em
      FROM permissoes_usuario p
      WHERE p.usuario_id = ?
      ORDER BY p.tela ASC
    `, [usuario_id]);

    res.json({
      success: true,
      data: permissoes
    });
  } catch (error) {
    console.error('Erro ao buscar permissões:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar permissões'
    });
  }
};

const listarTodas = async (req, res) => {
  try {
    const { page = 1, limit = 10, usuario_id, tela, acao } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    if (usuario_id) {
      whereClause += ' AND p.usuario_id = ?';
      params.push(usuario_id);
    }

    if (tela) {
      whereClause += ' AND p.tela = ?';
      params.push(tela);
    }

    // Calcular paginação
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM permissoes_usuario p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      ${whereClause}
    `;
    
    const [countResult] = await query(countQuery, params);
    const totalItems = countResult && countResult[0] ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalItems / limitNum);

    // Query principal com paginação
    const permissoes = await query(`
      SELECT 
        p.id,
        p.usuario_id,
        u.nome as usuario_nome,
        u.email as usuario_email,
        u.tipo_usuario,
        p.tela,
        p.pode_visualizar,
        p.pode_criar,
        p.pode_editar,
        p.pode_excluir,
        p.criado_em,
        p.atualizado_em
      FROM permissoes_usuario p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      ${whereClause}
      ORDER BY u.nome ASC, p.tela ASC
      LIMIT ${limitNum} OFFSET ${offset}
    `, params);

    res.json({
      success: true,
      data: permissoes,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Erro ao buscar permissões:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar permissões'
    });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const permissoes = await query(`
      SELECT 
        p.id,
        p.usuario_id,
        u.nome as usuario_nome,
        u.email as usuario_email,
        u.tipo_usuario,
        p.tela,
        p.pode_visualizar,
        p.pode_criar,
        p.pode_editar,
        p.pode_excluir,
        p.criado_em,
        p.atualizado_em
      FROM permissoes_usuario p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = ?
    `, [id]);

    if (permissoes.length === 0) {
      return res.status(404).json({
        error: 'Permissão não encontrada',
        message: 'Permissão não encontrada'
      });
    }

    res.json({
      success: true,
      data: permissoes[0]
    });
  } catch (error) {
    console.error('Erro ao buscar permissão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar permissão'
    });
  }
};

const verificarPermissao = async (req, res) => {
  try {
    const { usuario_id, tela, acao } = req.params;

    const permissoes = await query(`
      SELECT pode_visualizar, pode_criar, pode_editar, pode_excluir
      FROM permissoes_usuario
      WHERE usuario_id = ? AND tela = ?
    `, [usuario_id, tela]);

    if (permissoes.length === 0) {
      return res.json({
        success: true,
        data: { temPermissao: false }
      });
    }

    const permissao = permissoes[0];
    let temPermissao = false;

    switch (acao) {
      case 'visualizar':
        temPermissao = permissao.pode_visualizar === 1;
        break;
      case 'criar':
        temPermissao = permissao.pode_criar === 1;
        break;
      case 'editar':
        temPermissao = permissao.pode_editar === 1;
        break;
      case 'excluir':
        temPermissao = permissao.pode_excluir === 1;
        break;
      default:
        temPermissao = false;
    }

    res.json({
      success: true,
      data: { temPermissao }
    });
  } catch (error) {
    console.error('Erro ao verificar permissão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao verificar permissão'
    });
  }
};

module.exports = {
  listar,
  listarTodas,
  buscarPorId,
  verificarPermissao
};
