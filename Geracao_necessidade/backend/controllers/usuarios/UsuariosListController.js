const { query } = require('../../config/database');

const listar = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, tipo_usuario, ativo, rota, setor } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtros opcionais
    if (search) {
      whereClause += ' AND (u.nome LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

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

    // Calcular paginação com validação
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    
    // Garantir que os valores sejam números válidos e positivos
    const validPageNum = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
    const validLimitNum = isNaN(limitNum) || limitNum < 1 ? 10 : limitNum;
    
    const offset = (validPageNum - 1) * validLimitNum;

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM usuarios u
      ${whereClause}
    `;
    
    const [countResult] = await query(countQuery, params);
    const totalItems = countResult && countResult[0] ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalItems / validLimitNum);

    // Query principal com paginação
    const usuarios = await query(`
      SELECT 
        u.id, 
        u.email, 
        u.nome, 
        u.tipo_usuario, 
        u.rota, 
        u.setor, 
        u.ativo, 
        u.data_cadastro
      FROM usuarios u
      ${whereClause}
      ORDER BY u.nome ASC
      LIMIT ${validLimitNum} OFFSET ${offset}
    `, params);

    res.json({
      success: true,
      data: usuarios,
      pagination: {
        currentPage: validPageNum,
        totalPages,
        totalItems,
        itemsPerPage: validLimitNum,
        hasNextPage: validPageNum < totalPages,
        hasPrevPage: validPageNum > 1
      },
      filters: {
        search: search || null,
        tipo_usuario: tipo_usuario || null,
        ativo: ativo !== undefined ? (ativo === 'true') : null,
        rota: rota || null,
        setor: setor || null
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar usuários',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

const listarTodas = async (req, res) => {
  try {
    const { search, tipo_usuario, ativo, rota, setor } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtros opcionais
    if (search) {
      whereClause += ' AND (u.nome LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

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

    const usuarios = await query(`
      SELECT 
        u.id, 
        u.email, 
        u.nome, 
        u.tipo_usuario, 
        u.rota, 
        u.setor, 
        u.ativo, 
        u.data_cadastro
      FROM usuarios u
      ${whereClause}
      ORDER BY u.nome ASC
    `, params);

    res.json({
      success: true,
      data: usuarios,
      total: usuarios.length,
      filters: {
        search: search || null,
        tipo_usuario: tipo_usuario || null,
        ativo: ativo !== undefined ? (ativo === 'true') : null,
        rota: rota || null,
        setor: setor || null
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar usuários',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

const buscarPorEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email || email.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        message: 'Email é obrigatório para busca',
        code: 'EMAIL_REQUIRED'
      });
    }

    const usuarios = await query(`
      SELECT 
        id, 
        email, 
        nome, 
        tipo_usuario, 
        rota, 
        setor, 
        ativo, 
        data_cadastro
      FROM usuarios 
      WHERE email LIKE ?
      ORDER BY nome ASC
    `, [`%${email}%`]);

    res.json({
      success: true,
      data: usuarios,
      total: usuarios.length,
      searchTerm: email
    });
  } catch (error) {
    console.error('Erro ao buscar usuários por email:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar usuários por email',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

module.exports = {
  listar,
  listarTodas,
  buscarPorEmail
};
